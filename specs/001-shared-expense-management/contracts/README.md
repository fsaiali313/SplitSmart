# Selected application contracts

Status: provisional design, not Java interfaces, generated code or finalized public API. See [plan](../plan.md), [data model](../data-model.md) and [decision gates](../../../docs/lab7-architecture-decision.md). Swing calls these application ports locally; future authenticated HTTP adapters translate requests into the same operations. No endpoint URLs, wire schema or compatibility/version policy is finalized.

## Common guarantees

- Resolve actor from verified session; caller-supplied actor/role/group identifiers do not confer authority. Authorize every operation, retry and returned record.
- Commands carry idempotencyKey; expense decisions also carry expectedVersion. Receipt uniqueness is actor/commandType/key. Same key and same payload returns the authorized committed result; changed payload returns conflict. Concurrent attempts cannot create duplicate effects. New command keys cannot bypass source uniqueness or terminal states.
- State changes return saved identifiers/status/version only after commit. Validation/authorization/stale-version/storage failures never return success and leave no partial effects. If commit response is lost, retry the same key. Errors identify field/action/remedy without exposing private data.
- All money/percentages enter as exact decimal representations with currency context; the core validates and recomputes shares. No client-supplied computed balance or allocation becomes financial authority.
- Group mutations lock group before expense; review/payment recheck state/debt/permissions in that transaction. Queries use consistent authorized snapshots. Domain services contain rules outside Swing.
- All operations require JUnit 5 contract tests with spec IDs; no such application tests were executed for this documentation work.

## Operations and transaction boundaries

| Port/operation | Input and authorization | Committed output/effects and invariant |
|---|---|---|
| Account/register, signIn, signOut | Valid account fields or credentials; signOut acts on owned session | Individual account, protected hash, opaque session or revocation; generic login failure; account creation/recovery details need G2/G3 review |
| Group/create | Signed-in user, nonblank name, supported currency | Group plus creator membership in one transaction |
| Membership/add, remove, designateReviewer | Group manager; registered target, legal membership/role | Membership intervals/assignment audit; removal retains records/entitlements and revokes current access |
| Expense/submit | Active member; date/description/positive amount; one active payer; ordered distinct active participants; equal or valid exact percentages; optional validated receipt; eligible reviewer | PENDING expense, reconciled shares, receipt, review snapshot, entitlements, command receipt and other active members' durable inbox rows in one commit; no journal posting |
| Review/decide | Designated active reviewer, proposed no-self-review, PENDING expense, expected version, approve/reject | Decision/status/command receipt plus obligation entries atomically on final approval; rejection has no entries; reviewed records terminal |
| Review/reassignOutstanding | Manager; pending outstanding step, eligible replacement, reason | Assignment change plus audit in one transaction; completed decisions unchanged; policy confirmation pending |
| Settlement/recordPayment | Authenticated debtor; active membership or restricted own historical debt; payee/group/currency/date/positive amount | Under group lock read current net due; reject overpayment showing due, otherwise payment/negative entry/entitlements/command receipt commit together |
| Query/balances | Active member for group view; own historical scope for removed user | Derived pairwise amounts, partitioned by group/currency, no self-debt or writable Balance record |
| Query/history, receipt | Own account or active group permissions; historical entitlement as applicable | Redacted own history or permitted image only; reviewer-only historical access does not imply full image access |
| Notification/list, markRead | Owned inbox row plus current relevant membership | Pending-at-submission notice and read state; suppress current details after removal, no outsider disclosure |
| Report/query | Valid inclusive range, permitted group/category/detail filters, current/period balance mode, timezone | Separate expense/business-date, payment/business-date and labeled balance results; no-match state; category filters cannot fabricate a balance |

## Authorization matrix

| Resource/action | Active ordinary member | Manager | Designated active reviewer | Removed member | Outsider |
|---|---|---|---|---|---|
| Submit/group activity | Yes, own commands | Yes | Yes | No | No |
| Membership/reviewer management | No | Yes | Only if manager | No | No |
| Decide pending expense | No unless designated | Only if designated | Yes subject to configured policy | No | No |
| Current group balances/receipt/reports | Authorized group scope | Same group scope | Same group scope | No | No |
| Own historical records/settlements | Own scope | Own scope | Own scope, own decisions | Restricted own history/settlements | No group data; own account remains private |
| Record payment | Own debtor obligation | Own debtor obligation, no special override | Own debtor obligation | Own preserved debtor obligation only | No |
| Inbox | Own eligible notices | Own eligible notices | Own eligible notices | No current-activity notices | No |

Active membership does not grant another account's unrelated private view. Removed users who are creditors may see their own incoming settlement details, but cannot record a debtor's payment on their behalf. History/redaction and rejoin behavior need explicit human policy review.

## Notification extension and date semantics

MVP inbox insertion shares submission's transaction. Duplicate keys/recipient constraints prevent repeated notices; failed insertion rolls back submission. Future external channels enqueue an outbox in that same transaction, dispatch after commit, retry/deduplicate by event/recipient/channel, and recheck eligibility. No financial operation waits for transport. No broker/push/email service is selected now.

Business dates select expenses/payments. Journal postedAt controls current balances and period opening/movement/closing in a configured timezone. A current balance is not bounded by filtered activity dates. Period closing includes all journal entries through end-day, even if their business dates differ; label that distinction. See exact rules in [data model](../data-model.md).

## Planned evidence

Contract tests must include unauthorized read/write denial, removal/history, stale decisions, duplicate/conflicting keys, source exclusivity, transaction rollback, concurrent overpayment, receipt failure, notification retry/eligibility, late approval, backdated payment and no-match reports. [Quickstart](../quickstart.md) maps acceptance criteria; [final diagrams](../../../docs/architecture-selected/README.md) show the selected interactions.
