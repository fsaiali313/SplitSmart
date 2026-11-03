# Data, persistence, and financial accuracy

## Relational model

IDs are stable opaque identifiers; foreign keys preserve history. Dates of expenses/payments are business dates; audit and posting times are server-generated instants. Version fields support stale-edit detection.

| Entity | Principal fields and constraints |
|---|---|
| UserAccount | id, unique normalized login, salted password hash and algorithm parameters, account status; never plaintext passwords |
| Session | token hash, userId, expiry, revocation; raw token is not stored |
| Group | id, name, creatorId, currencyCode, minorUnitScale, ledgerVersion |
| Membership | id, groupId, userId, role, joinedAt, removedAt; at most one active membership per user/group; removal closes an interval |
| Expense | id, groupId, submitterId, payerId, amount, currency, expenseDate, description, splitKind, status, version, submittedAt, approvedAt; positive amount; one payer |
| Allocation | expenseId, participantId, entryOrder, optional percentage, share; unique participant and order within expense; nonnegative share |
| ApprovalPolicySnapshot / ApprovalStep | expenseId, ordered levels and designated reviewers, policy version; MVP exactly one level/reviewer |
| ReviewDecision | expenseId, level, reviewerId, decision, decidedAt; one effective decision per required step |
| Receipt | id, expenseId, verified mediaType, byteCount, digest, imageBytes; at most one receipt per expense in this proposal |
| HistoricalEntitlement | userId, resourceType, resourceId, permitted view scope; snapshot of a user's own involvement, not perpetual group access |
| JournalEntry | id, groupId, debtorId, creditorId, currency, signedAmount, kind, sourceId, sourceLine, postedAt; distinct endpoints; unique kind/sourceId/sourceLine |
| Payment | id, groupId, fromUserId, toUserId, amount, currency, paymentDate, recordedAt; positive amount and distinct parties |
| CommandReceipt | actorId, commandType, idempotencyKey, payloadDigest, resultReference; unique actor/type/key |
| OutboxEvent / OutboxRecipient | eventId, expenseId, createdAt, recipientId, deliveryState, retry metadata; unique event/recipient |
| Notification | id, eventId, recipientId, expenseId, pending-status-at-submission, readAt; unique event/recipient |

Balances and reports are query results, not authoritative tables. Store monetary values as exact decimal SQL values mapped to BigDecimal, and reject values exceeding the documented precision rather than truncating. Proposed MVP limits are DECIMAL(19,2) money and DECIMAL(9,6) percentages for a confirmed two-minor-unit currency. Other currency scales require explicit schema/domain configuration before use; no implicit conversion or addition across currencies. Precision limits must be documented in the eventual UI and acceptance tests.

## Transaction boundaries and recovery

Use JDBC repositories behind ports with database migrations and transactions. Embedded H2 is a candidate for the single-machine MVP; PostgreSQL is a candidate for full deployment. Validate both adapters against the same contract suite rather than assuming SQL/locking parity. Receipt BLOBs keep expense association and image storage atomic; object storage is a future optimization requiring staged upload/cleanup semantics.

Submission commits expense, shares, policy snapshot, entitlement records, command result, and outbox together. Approval commits review state and obligation entries together. Payment commits payment and settlement entries together. On any failure roll back everything and show an unsuccessful action. Dispatcher failure leaves committed financial data intact and delivery retryable. Idempotency keys persist across retries; reusing a key with a different payload is rejected. Unique journal source keys also prevent duplicate effects from a second command key approving the same expense.

All group financial writers lock the same group row before expense or journal changes. Payment reads the current debt after acquiring this lock; two payments of 7 against debt of 10 cannot both succeed. Removed members may settle only their own preserved obligation through the restricted settlement endpoint. Review also rechecks current reviewer membership. Back up database files through a database-consistent mechanism; test restore and journal reconciliation. Never copy an active database file and assume consistency.

## Allocation using BigDecimal

All money, percentages, shares, remainders, and financial arithmetic use BigDecimal; never float/double. Construct decimals from strings. Require positive expense totals representable at the configured currency scale without rounding user input. Require distinct nonempty participants and a separately identified active group payer; payer need not participate. Payer/participant active-membership eligibility is a proposed policy consistent with group use, subject to review.

For scale `s`, convert the amount to an exact whole-minor-unit BigDecimal `U = amount * 10^s`. For equal allocation the ideal share is `U/n`. To avoid recurring-decimal approximation, compute floor quotient and exact division remainder against `n` using BigDecimal integral division/remainder. For percentage allocation use exact numerator `U * percentage` and denominator `100`. Each percentage is 0 through 100 inclusive and their BigDecimal sum must equal exactly 100. A zero percentage may yield a zero share.

Assign each floor quotient first. Let `L = U - sum(floor shares)`. Distribute one minor unit to the `L` largest fractional remainders, using stored participant entry order to break ties. Within each allocation the denominator is common, so remainder numerators can be compared exactly without division approximations. Persist final shares and entry order; do not recalculate history using changed rules. Assert sum(shares) equals the source amount exactly.

Examples: 10.00 equally among A, B, C yields 3.34, 3.33, 3.33 in that entry order. 0.05 split 50%, 30%, 20% yields ideals 2.5, 1.5, 1 minor units, then final shares 0.03, 0.01, 0.01 because A wins the tied remainder. If A paid the 10.00 and participates, only B-to-A 3.33 and C-to-A 3.33 obligations post. If nonparticipant D paid, A/B/C each owe D their full shares.

## Journal semantics and balances

An obligation entry records a positive amount from participant debtor to expense payer creditor. Do not post self-debts or zero shares. A settlement entry records a negative amount in the same debtor-to-creditor direction. Each entry conceptually has equal debit/credit effects on the two users; summed user positions within one group/currency equal zero. Entries are immutable and always reference an approved expense allocation or a recorded payment.

For users A and B in one group/currency, signed net due from A to B is the sum of A-to-B signed entries minus B-to-A signed entries. A positive value is owed by A; a negative value is owed by B; display only the owing direction. Thus opposing obligations net within the pair without silently rerouting debts through a third party. Never net across groups or currencies in a settlement; account-wide reports retain those partitions.

Payment must be positive, exactly representable, from the authenticated debtor to the selected creditor, and no greater than current positive pairwise net debt in that group/currency. Otherwise reject and display the current amount owed. Payment tracking records an asserted real-world settlement; it does not transfer money or verify banking activity. Payment date is the user-entered business date; recordedAt controls when it affects the operational journal.

## Report time semantics

Date filters are inclusive and reject end-before-start. Expense lists filter expenseDate and may show status; payment lists filter paymentDate. Balance summaries always label the basis: current balance uses all committed journal entries; a period report shows opening balance, posted journal movement during the range, and closing balance by posting date in the configured reporting timezone. A late approval is included on its posting date even when its expense date is earlier. These separately labeled dates avoid presenting a filtered expense total as a current debt. Further filters proposed for full scope are group, participant (within authorized visibility), expense status, and record category. Export format and additional custom parameters remain open.
