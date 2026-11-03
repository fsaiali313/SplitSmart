# Selected data model and financial rules

Status: provisional design; [plan](plan.md) and [decision gates](../../docs/lab7-architecture-decision.md) apply. The [class diagram](../../docs/architecture-selected/classes.puml) is conceptual, not application code or completed SQL schema. Opaque IDs, foreign keys and audit instants preserve references/history.

## Persisted entities and constraints

| Entity | Fields and invariants |
|---|---|
| UserAccount | id, displayName, unique normalized login, passwordHash/algorithm parameters, status; never plaintext credentials |
| Session | tokenHash, userId, expiry, revokedAt; raw token not persisted |
| Group | id, name, creatorId, currencyCode, minorUnitScale, ledgerVersion, createdAt; required name, creator membership |
| Membership | id, groupId, userId, role, joinedAt, removedAt; at most one active interval per user/group; closed intervals retained |
| Expense | id, groupId, submitterId, payerId, description, amount, currency, expenseDate, splitKind, status, version, submittedAt, approvedAt; positive exact-scale amount, one payer, distinct nonempty participants |
| Allocation | expenseId, participantId, entryOrder, percentage when percentage split, finalShare; unique participant/order in expense, nonnegative share; total shares equal expense amount |
| ApprovalPolicySnapshot / ApprovalStep | expenseId, policyVersion, ordered level, designatedReviewerId; MVP one step/reviewer, one effective decision per required step |
| ReviewDecision | id, expenseId, stepId, reviewerId, decision, reason, decidedAt; completed decisions append-only |
| ReviewAssignmentAudit | expenseId, stepId, oldReviewerId, newReviewerId, managerId, reassignedAt, reason; only outstanding steps reassigned |
| Receipt | id, unique expenseId, verified mediaType, byteCount, digest, imageBytes, createdAt; optional one per expense, decoded allowed image |
| HistoricalEntitlement | userId, resourceType, resourceId, involvementAt, allowedViewScope; own historical access, not permanent group membership |
| JournalEntry | id, groupId, debtorId, creditorId, currency, signedAmount, kind, expenseId/allocationParticipantId OR paymentId, postedAt; distinct endpoints, nonzero amount, exclusive source |
| Payment | id, groupId, fromUserId, toUserId, amount, currency, paymentDate, recordedAt; positive exact-scale amount, distinct parties, authenticated debtor only |
| CommandReceipt | actorId, commandType, idempotencyKey, payloadDigest, resultReference; unique actor/type/key, saved with committed effects |
| Notification | id, submissionEventId, recipientId, expenseId, statusAtSubmission=PENDING, createdAt, readAt; unique submissionEventId/recipientId; same commit as submission |
| OutboxEvent / OutboxRecipient (deferred) | eventId, expenseId, createdAt, recipientId, deliveryState, attempts; unique event/recipient; only when dispatch leaves DB transaction |

PairwiseBalance, ReportFilter and reports are value objects/read models. No authoritative writable Balance table. ReportFilter holds optional group, inclusive start/end dates, categories, detail choice, current/period balance mode and timezone. Actor comes from session, never a trusted userId filter. Group/account/category/date filters form the proposed MVP; richer participant/status filters and export need confirmation. Authorization may reduce any requested view.

All money, shares, percentages and financial arithmetic use BigDecimal, never float/double. SQL exact decimal values map to BigDecimal. Proposed two-decimal storage is DECIMAL(19,2) money and DECIMAL(9,6) percentage; confirm before implementation. Other currency scales require compatible schema configuration. Reject overflow/excess precision with clear field errors, never silently truncate/round input. No conversion or cross-currency totals. Non-monetary counts/order remain integers.

## Lifecycle and atomic persistence

Draft is unsaved presentation state. Submission creates PENDING; designated authorized reviewer changes it to APPROVED or REJECTED. Future ordered-level policy remains PENDING until all required levels approve. Reviewed records are terminal; no approved-to-pending or in-place rejected resubmission. Rejected work may be copied as a new expense ID with optional predecessor link. Approved corrections/payment reversals are deferred until compensating-entry and settlement-impact rules are approved.

Submission commits expense, final shares/order/percentages, receipt, approval snapshot, entitlements, command receipt and eligible inbox notices together. Receipt failure is explicit: do not silently discard the image and claim complete success. User may remove/replace the attachment and resubmit. Cancel before commit persists nothing; closing a screen after commit does not cancel saved data.

Review commits decision, final status, command receipt and obligation entries together. Only final approval posts. Payment commits payment, negative entry, entitlements and command receipt together. Any failure rolls back all effects. Obligation source uniqueness is (kind, expenseId, allocationParticipantId); settlement uniqueness is (kind, paymentId), with a check enforcing exactly one source kind. An approved allocation has zero or one journal entry (zero for payer/self or zero share); a recorded payment has exactly one negative entry. Each journal entry references exactly one source, never both.

All group-mutating commands lock group row first, then expense when needed; state/debt/membership/roles are read or rechecked under that lock. This orders approval, settlement, membership changes and submission recipient snapshots. Expected expense versions reject stale decisions. Concurrent same-key requests serialize on unique CommandReceipt creation; a loser rolls back and, after fresh authorization, returns the committed matching result or retryable conflict. Same key/different payload digest is rejected. Different keys cannot bypass lifecycle/source uniqueness. Any dispatcher reads committed records only.

## Allocation algorithm (FR-003, FR-004, NFR-001)

Require positive amount, date, nonblank description, one payer, distinct ordered participants and supported currency/scale. Proposed eligibility is active group membership at submission for payer and participants; payer need not participate. Percentages each range 0–100 inclusive and their exact BigDecimal sum compares numerically equal to 100. Zero shares are valid.

At scale s, obtain exact whole-minor-unit BigDecimal U = amount * 10^s. Equal split uses numerator U and denominator participant count n; percentage split uses numerator U * percentage_i and denominator 100. Compute floor quotient and exact remainder using integral division/remainder, never approximate repeating quotients. Denominators within a split are common. Assign floors, compute integer leftover L = U - sum(floors), rank exact remainder numerators descending then entryOrder ascending for ties, and add one minor unit to the first L shares. Convert to major units and assert exact total equals amount. Persist results/order; do not recalculate posted history under later algorithms.

| Two-decimal example | Ordered shares | Consequence |
|---|---|---|
| 10.00 equal A/B/C | A 3.34, B 3.33, C 3.33 | If A paid, B-to-A 3.33 and C-to-A 3.33; no self-debt |
| 0.05 at A 50%, B 30%, C 20% | A 0.03, B 0.01, C 0.01 | A wins the tied 0.5-minor-unit remainder against B |
| 10.00 equal A/B/C, nonparticipant D paid | A 3.34, B 3.33, C 3.33 | All three owe their full shares to D |

## Journal and settlement (FR-006, FR-008, FR-009)

Obligations are positive signed amounts from participant debtor to expense payer creditor; skip self/zero-share entries. Settlements are negative signed amounts in paying debtor-to-creditor direction. Each entry has equal opposite effects on the two user positions; group/currency user positions sum to zero. This is an obligation journal, not a full general-accounting ledger or full event-sourced application.

For fixed group/currency, netDue(A,B) = sum(signed A-to-B entries) - sum(signed B-to-A entries). Show positive debt only in the owing direction; a negative result reverses debtor/creditor. No third-party rerouting or cross-group/currency settlement. Derive current balances synchronously from committed entries; any future cache is disposable and must reconcile.

Payment requires amount > 0, exact scale, different parties, authenticated debtor, authorized group or own historical settlement, and amount <= current positive netDue. Read due under group lock, then atomically append payment/negative entry. Against 10.00 due, two concurrent 7.00 payments cannot both succeed: the second sees 3.00 and is rejected showing 3.00. Manual recording asserts a real-world transfer; it does not move bank funds. paymentDate affects list placement; recordedAt/postedAt controls operational financial change.

## Authorization and notifications (FR-001, FR-002, FR-005, FR-007, FR-011)

Resolve identity from a valid session for every command/query. Managers manage membership/reviewer assignment, active members submit, designated active reviewers decide. Proposed no-self-review default requires another eligible reviewer before submission. Reviewer removal pauses review for an audited manager reassignment of the outstanding step. G2 must confirm these policies.

Submission snapshots other active members under group lock and inserts inbox rows atomically; exclude submitter and outsiders. Notices identify PENDING at submission; current authorized status is queried separately. Removing membership suppresses current group feeds/notifications and unrelated records, including previously delivered notices.

Historical routes expose own pre-removal submitter/payer/participant records, own review decisions, own payments and outstanding settlements with necessary details only. Historical receipt access follows the user's permitted expense involvement; reviewer-only history exposes their decision rather than granting full receipt access. No unrelated group records. Rejoining must not widen historical access to intervening private activity; detailed redaction/rejoin policy needs review.

External delivery extension commits outbox recipients with submission, dispatches after commit, rechecks eligibility, deduplicates event/recipient/channel and retries failures. Review/balances never wait. Local inbox insertion needs no worker; email/push channels remain undecided.

## Report semantics (FR-010)

Date ranges are inclusive and reject end-before-start. Expense lists use expenseDate and status labels; payment lists use paymentDate. Current balance uses all committed entries and is labeled unbounded by a list's business-date filter. Period balance uses postedAt in selected reporting timezone: opening before start-day, movement within the period, closing = opening + movement. Implement instant boundaries as start-inclusive and next-day-start-exclusive for timezone/DST correctness.

Late approval appears in the expenseDate list but changes debt at approval postedAt. Backdated payment appears in paymentDate lists but changes debt when recorded. Category/status/participant list filters cannot remove selected journal entries and masquerade as a true balance; true balances use full authorized group/currency journal or the user's permitted historical settlement scope. Distinguish current, period and filtered activity summaries. An empty activity period with opening debt still shows opening/closing debt, not misleading zero.

## Persistence and recovery

JDBC ports/adapters, relational transactions, migrations, foreign keys, decimal/source checks, source/idempotency uniqueness and group/currency/pair/posting-time indexes support integrity. BLOBs trade simple atomicity for database growth. Use database-consistent backups and test restores with allocation/payment-to-journal reconciliation. Local files need OS protection; application checks cannot stop OS-level database replacement. Server adapter/database parity needs contract tests before migration.

See [contracts](contracts/README.md), [planned validation](quickstart.md), [expense activity](../../docs/architecture-selected/expense-activity.puml) and [payment activity](../../docs/architecture-selected/payment-activity.puml). No runtime validation is claimed.
