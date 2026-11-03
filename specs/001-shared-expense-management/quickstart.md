# Selected architecture validation guide

Status: future application acceptance guide plus documentation-verification instructions. No production application code, completed build, test results, or working clients are supplied by this lab. Actual checks are in the [validation record](../../docs/lab7-architecture-validation.md). [Decision gates](../../docs/lab7-architecture-decision.md) remain open.

## Prerequisites and execution status

Before implementation planning, resolve G1 (delivery strategy/customer scope and desktop evaluation subset). Before future builds, install/verify Java 21 and Maven, choose/verify the relational adapter, and complete policy/security choices. The feature directory name is a spec identifier, not an assertion that a matching branch exists. No branch switch, source scaffold or application test run is required for this documentation task.

Once implementation and test fixtures exist, the proposed command is `mvn test` from the root, with JUnit 5 tests tied to IDs below. It has not been run as application validation here. Embedded/server adapter integration tests need separate connections and real selected databases. UI checks need event dispatch thread discipline and a display; domain tests must not require Swing.

## Scenario-level planned evidence

| IDs and spec acceptance references | Scenario and expected evidence |
|---|---|
| FR-001; FR-011; NFR-002; US1.1–3 | Register/sign in as two accounts, invalid login, sign-out/session expiry. Own private views only; no forged actor/role authority or information leakage |
| FR-002; US2.1–4 | Creator becomes member; manager adds/removes; outsiders denied; removed user sees own prior records/settlements but no current activity; rejoin does not expose intervening records |
| FR-003; US3.1,7; edge case 1 | Require date/description/amount/payer/participants; independent payer may be nonparticipant. PENDING saved with no debt. Membership eligibility follows confirmed policy |
| FR-004; NFR-001; SC-003; US3.2,3,8 | 10.00 equal A/B/C gives 3.34/3.33/3.33; 0.05 at 50/30/20 gives 0.03/0.01/0.01. Exact sum, deterministic participant-order ties, 0–100 percentages total exactly 100. Include tiny amounts, zeros, large limits, excess precision and recurring quotient cases |
| FR-005; US3.6; receipt edge case | Valid image round-trip and authorized retrieval; corrupt/disallowed/oversized image fails clearly with no partial save. Historical receipt only for permitted expense involvement, outsider denied |
| FR-006; SC-004; US3.1,4,5; pending/rejected/cancelled edges | One designated reviewer; pending/rejected no journal effect; approval posts all nonself obligations once. No approved-to-pending or destructive correction. Future ordered levels require all levels before posting |
| FR-007; US4.1–2 | Other active submission-time members receive durable pending-at-submission notices, not submitter/outsiders. Inbox insert failure rolls back submission; removal suppresses reads. Retry cannot duplicate notices. External outbox tests apply only when that extension exists |
| FR-008; US3.7,9; US5.1–2 | Nonparticipant payer receives each participant's obligation; participating payer has no self-debt. Pairwise net opposing debts without cross-group/currency or third-party rerouting. Rebuild equals journal and source reconciliation |
| FR-009; SC-005; US5.3–4 | Partial then full settlement; reject zero/negative/no-debt/overpayment with current due. Two independent concurrent 7.00 commands against 10.00: one succeeds, other sees 3.00 and fails |
| FR-010; SC-006; US6.1–3 | Inclusive dates/categories/group filters, invalid range rejection, separate summaries and explicit no matches. ExpenseDate/paymentDate lists differ from journal posting periods; opening + movement = closing; no new activity must not hide opening debt |
| FR-011; NFR-002; privacy edges | Access matrix across UI/application adapters, receipts, notifications/reports/history. Test removed-member redaction, current permission changes, no widened query filters, reauthorization on replay |
| FR-012; SC-007 | Actual browser primary, Android and iOS complete all core journeys against shared records, or explicit customer-approved exclusions. Desktop cannot pass this requirement |
| NFR-003; all edge cases | Actionable field/action feedback, empty states, no false success, committed submission survives closing/reloading |
| NFR-004 | Confirm representative dataset/network/workload for up to 100 active users, then measure >=95% of common actions within 2 seconds excluding user-controlled image transfer; sequential desktop is not concurrent-user proof |
| NFR-005; SC-001, SC-002 | Moderated study: >=85% unaided core tasks; >=95% valid-login success with privacy; >=90% first-time group+expense completion within 3 minutes. No study performed |

JUnit 5 coverage includes domain strategies/state transitions, adapter/repository contracts, authorization matrix, presenter interactions through fake views, and transaction integration. Each implemented acceptance behavior must link to its spec IDs/scenarios in tests or a maintained catalog.

## Failure, idempotency and recovery checks

1. Interrupt final approval after status write but before posting/commit; observe rollback of status, decisions, entries and command receipt.
2. Interrupt payment between payment and journal writes; observe complete rollback. Restore a database-consistent backup and reconcile all source/posting totals.
3. Lose response after commit, retry same key/payload; observe same authorized result once. Same key/different payload conflicts. Distinct keys cannot post an approved source twice.
4. Race same-key submissions and distinct-key payment commands using independent DB connections; assert source and command constraints plus current-debt checks.
5. Race membership removal with submit/review/payment; group-first lock and rechecked authorization determine ordered permitted effects. Previously delivered notification reads must revoke immediately.
6. If external outbox extension is implemented, fail delivery after commit, restart/retry and verify one logical delivery per recipient/channel with eligible content; approval/balance visibility remains independent.
7. Test late approval and backdated payment across reporting date/timezone boundaries, including daylight-saving boundaries, exact opening/movement/closing and current balance labels.

## UML and documentation checks

Final source diagrams: [class](../../docs/architecture-selected/classes.puml), [component](../../docs/architecture-selected/components.puml), [expense activity](../../docs/architecture-selected/expense-activity.puml), [payment activity](../../docs/architecture-selected/payment-activity.puml). Each is standalone. Check local link targets and requirement IDs, preservation hashes, allocation examples, terminal states, transaction boundaries and report semantics. Structural text checks alone are not a PlantUML parser.

If a compatible PlantUML JAR/runtime and rendering dependencies are installed, run its syntax check (for versions supporting it, `java -jar <path-to-plantuml.jar> -checkonly docs/architecture-selected/*.puml`) then render `-tsvg` and review all four outputs. Confirm command support with the installed tool. Do not claim rendering succeeded without parser results and actual output review. No tool download is required merely to close a documentation task; report unavailable tooling explicitly.

Human reviewers must review financial examples, permissions, gates and diagrams before adoption under constitution principle V. Automated document checks cannot approve scope or certify a working application.
