# Security, validation, testing, and traceability

## Security and privacy boundaries

Authorize every application command and query, including receipt and report queries, outside Swing. The session supplies the actor; clients cannot select an acting user or grant themselves reviewer roles. Group managers manage membership and designated reviewers; active members may submit; designated active reviewers decide. Whether self-review is permitted is unresolved: proposed MVP defaults to no self-review, so a sole-member group must add another reviewer before submission. Explain this configuration error before accepting the expense. Snapshot review steps on submission; if a reviewer leaves, pause review until a manager explicitly reassigns the outstanding step with an audit record. Reassignment cannot silently change a completed decision.

Use salted adaptive password hashing through an established library with stored algorithm parameters, generic failed-login messages, bounded login retries, and expiring revocable sessions. Exact library, work factors, recovery flow, and session duration require security review before implementation. Clear private screens/caches on sign-out. Server deployment adds TLS, secure session transport, CSRF defenses for cookie authentication, request limits, and no financial secrets in logs. These are architectural requirements, not claims of implemented protection.

Removing membership denies current group lists, feeds, notifications, and receipts. Historical queries expose only records in which the removed user was a submitter, payer, participant, reviewer (their decision), or payment party before removal, plus necessary settlement details. Historical expense views reveal only fields needed to explain their own obligation; unrelated member transactions and current activity are excluded. A historical receipt is served only if it belongs to that user's permitted historical expense. Existing preserved debt may still change through authorized settlement; the user sees their own settlement details. Entitlements must be checked at read time, including after a notification was previously delivered. A report request cannot widen this scope.

Local file access remains an OS trust boundary: an attacker who can replace the local database or application can bypass desktop checks. Restrict OS file permissions, avoid secrets in the repository, and use protected backups. Strong multiuser isolation requires the full server deployment. Receipt imports enforce proposed byte/pixel limits, decode actual image content, accept a configured image allowlist, reject corrupt/non-image data with a reason, and never execute filenames or image metadata. Limits and accepted types must be confirmed before implementation.

## Validation layers

Presenters offer immediate field feedback; application/domain rules remain authoritative for every adapter. Validate required date, nonblank description, positive amount, payer, distinct participants, percentage bounds/total, supported currency/scale, allowed receipt, date range, membership, session, reviewer permissions, and legal state. Database constraints reinforce uniqueness, positive source amounts, references, and source posting keys. Aggregate sums and access decisions require domain checks within a transaction, not just column constraints.

Pending and rejected expenses never post. Failed/cancelled submissions commit no partial expense, outbox, or receipt. Once committed, closing a UI window is not cancellation: show the saved pending result on reload. Versions reject stale review decisions. Idempotency handles double-clicks and network retries, including an uncertain response after commit. Validation messages identify the field/action and remedy without leaking another account's existence or data.

## Requirement coverage and planned evidence

Tests below are proposed acceptance/contract cases, not generated or executed tests. All automated tests must use JUnit 5; domain tests run without Swing. Each eventual test must carry the relevant IDs and acceptance scenario references in its test name or trace catalog.

| Requirement | Responsible design | Planned verification |
|---|---|---|
| FR-001 accounts | Identity/access, session port | Valid/invalid login, separate private views, session expiry/sign-out |
| FR-002 groups | Membership intervals and historical entitlements | Creator membership, authorized add/remove, outsider denial, removed user history and settlement access |
| FR-003 expense entry | Expense aggregate and submission command | Missing fields, one payer separate from participants, active membership checks |
| FR-004 allocation | Equal/percentage strategies | Exact 100% sum, bounds, entry-order ties, payer inclusion/exclusion, persisted share conservation |
| FR-005 receipt | Receipt repository and access policy | Allowed image round-trip, corrupt/oversized rejection, active/historical/outsider permissions |
| FR-006 review | State machine and transactional posting | Pending/rejected no journal changes, authorized final approval once, stale/duplicate decisions, ordered multi-level path in full scope |
| FR-007 notifications | Transactional outbox and durable inbox | Other submission-time members notified with pending status, no submitter/outsider notification, retry deduplication, removal suppression |
| FR-008 balances | Journal and pairwise projection | No self-debt, nonparticipant payer, opposing debt netting, rebuild matches displayed totals |
| FR-009 payments | Locked settlement command | Partial/final payment, zero/negative/overpayment rejection with due amount, two concurrent payments, removed user's restricted settlement |
| FR-010 reports | Authorized snapshot queries | Separate categories, inclusive boundary dates, no matches, invalid range, group/status filters, posting-date balance semantics |
| FR-011 access | Application authorization on all ports | Account/group/receipt/report/inbox denial matrix, role changes, historical redaction |
| FR-012 web/Android/iOS | Future server plus three client adapters | Same complete journeys on actual browser/Android/iOS clients and shared records; desktop cannot pass this test |
| NFR-001 accuracy | BigDecimal and conserved journal | Deterministic generated JUnit 5 split cases, large limits, tiny amounts, decimal inputs, sum invariants, payment reconciliation |
| NFR-002 privacy | Resource-scoped authorization | Cross-user, nonmember, revoked-member and forged-actor negative cases |
| NFR-003 feedback | Structured validation results | Every spec edge case produces actionable feedback and no false success |
| NFR-004 responsiveness | Background UI work, indexed journal, bounded transactions | Measure proposed 95% within 2 seconds at 100 active users; exclude user-controlled image transfer and confirm dataset/client/network baseline |
| NFR-005 usability | Thin presenters and consistent journeys | Moderated nontechnical-user study: proposed 85% complete core tasks unaided |

JUnit 5 domain tests exercise allocation and state transitions directly. Repository/transaction integration tests run against each chosen database and use independent connections for payment races. Failure-injection tests interrupt approval before commit, lose a response after commit, and fail notification delivery; assert rollback or safe replay with no duplicate postings. Receipt persistence and database restore tests verify that financial references survive recovery. Focused presenter tests use fake views and application ports; practical Swing interaction checks run on the event dispatch thread. Full-platform acceptance eventually uses deployed clients and authorized API calls, not only service mocks.

Success criteria map to this evidence: SC-001 login/privacy acceptance measures 95% success; SC-002 timed first-use group/expense tasks measure 90% within three minutes; SC-003 split conservation; SC-004 review posting invariants; SC-005 payment reconciliation; SC-006 exact report filters; SC-007 actual platform journey completion or recorded customer-approved exclusions. Performance and usability targets are proposed baselines, not new customer commitments. No such results are claimed by this document.

## Decisions required before implementation/adoption

Confirm the platform delivery proposal and desktop evaluation subset; decide multi-level group policy and self-review rules; choose currencies and precision/display limits; confirm report parameters, notification channels, receipt limits, authentication/recovery, and historical privacy details. None of these open choices deletes a customer feature. Human review of this independent proposal and rendered PlantUML is mandatory under constitution principle V. No requirements, constitution amendments, existing plans, or application code are changed by this submission.
