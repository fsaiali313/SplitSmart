# CIS 285 Lab 7 — SplitSmart architecture review

Review date: 2026-11-03. Evidence is document review, not application execution. The recommended selection is provisional and recorded in the [decision](lab7-architecture-decision.md).

## Sources and preservation

Read the [customer requirements](../UserRequirement.md), [constitution 1.0.0](../.specify/memory/constitution.md), [feature specification](../specs/001-shared-expense-management/spec.md), and [specification checklist](../specs/001-shared-expense-management/checklists/requirements.md). All five original Spec Kit files are preserved in [Architecture A](architecture-a/README.md). All eight original [Architecture B files](architecture-b/README.md) remain unchanged. The supplied ChatGPT findings were checked against those documents, rather than treated as executed verification.

The five active architecture files now express one selected design. No requirement ID, acceptance criterion, customer delivery platform, or constitutional principle is changed.

## Side-by-side assessment

| Dimension | Architecture A — Spec Kit baseline | Architecture B — independent proposal | Review and selected treatment |
|---|---|---|---|
| Organization | Single desktop project with UI, services, repositories, validation | Modular monolith with ports, commands/queries, strategies, journal | Both separate Swing/business logic. Use B's explicit interfaces, initially packages in one Maven project |
| Delivery | Phased bounded Swing evaluation and platform gate | Local/server adapters and proposed browser/Android/iOS clients | Use A's phases with B's reuse boundaries; neither supplies full-platform applications |
| Persistence | File-based or embedded backend left open | Relational transactions; H2/PostgreSQL candidates; image BLOBs | Select embedded relational storage for atomicity; products need compatibility verification |
| Financial authority | Balance record recalculated after approvals/payments; posting/recovery protocol unspecified | Immutable obligation/settlement journal and derived pairwise balances | Select B. A could recalculate correctly, but its mechanism is underspecified; avoid two writable financial authorities |
| Approval | Single reviewer; approved-to-pending correction and rejected resubmission edges | Policy snapshot, ordered levels, atomic final approval | Keep one reviewer initially; approved/rejected submissions terminal; no approved-to-pending without defined reversal rules |
| Payments/concurrency | Positive/no-overpayment rules without explicit locking or atomicity | Group lock, current-debt check, atomic payment/journal commit | Retain B's coarse lock and transaction guarantees; measure before finer locks |
| Duplicate commands | Duplicate prevention required by spec but mechanism undefined | Persistent receipts plus unique source posting keys | Select B; UI button disabling alone is insufficient |
| Notifications | Local member-scoped inbox intent; failure boundary unspecified | Durable outbox/dispatcher/inbox | MVP inserts inbox rows with submission in one transaction; defer dispatcher until external delivery requires it |
| Authorization | Account/group privacy and removed-member history at a high level | Command/query policies and restricted historical entitlements | Select B's resource checks; local OS file access remains a separate trust boundary |
| Money | BigDecimal/remainder rule; allocation table lacks percentage and participant-order fields | Exact minor-unit quotient/remainder; stored percentages/order/shares | Use B's explicit algorithm and fields; no approximated recurring quotient |
| Reports | Date/group/account/category filters; date bases unspecified | Business-date lists and posting-date balance periods | Select B's labeled current/period semantics and authorized snapshot queries |
| UML | Inline expense-state diagram | Standalone class, component, expense/payment activity diagrams | Maintain revised standalone selected sources; clarify journal source exclusivity and notification independence |
| Verification | Planned JUnit 5/manual scenarios | More detailed proposed arithmetic, race, failure, access, adapter tests | Neither demonstrates executed application behavior; selected quickstart preserves trace IDs |
| Complexity | Lower implementation and teaching cost | More entities, uniqueness, locking, recovery responsibilities | Keep integrity mechanisms now; defer server/client implementations, outbox worker, multi-level UI, caches and mandatory multi-module build |

## Strengths, weaknesses, and risks

A is simpler and suitable as a teaching-project sequence for a bounded Swing MVP. It respects the mandated toolchain and preserves customer-platform scope. Its storage and transaction choices are too open to establish safe retries, failure recovery or concurrent overpayment prevention. Calling full web/mobile delivery from day one a scope expansion is misleading: those are original customer platforms; their sequencing is a scheduling decision. A's constitutional PASS labels express intentions, not completed evidence.

B's journal explains each debt and supports reconciliation. Atomic final approval/payment prevents partially updated financial truth when implemented correctly. Idempotency and source keys cover different duplicate paths. Its ports allow future clients to reuse rules. The original conceptual class associations need clarification: a journal entry has either an allocation source or a payment source, not both. Its original expense activity joins notification and review branches, potentially implying review waits for delivery. Selected diagrams remove that implication.

B costs more to maintain. Group locks may bottleneck busy groups; journal queries grow with history; receipt BLOBs enlarge backups; embedded/server SQL behavior may differ. Measure indexed queries before caching, and contract-test adapters before migration. A sequential desktop UI does not eliminate retry or transaction hazards. A local account system cannot defeat an OS user editing its database. These are design risks, not measured defects in running software.

A's approved-to-pending transition can invalidate the source of already-settled debt. Selected reviewed states are terminal. Future corrections must append authorized compensating entries with settlement-impact, audit, and report semantics; neither toggling a status nor deleting the original is an acceptable reversal design. Such corrections are not silently added as new customer scope in this lab.

## Requirements coverage

“Designed” means documentation coverage, never implemented/tested coverage.

| IDs | A coverage | B coverage | Selected treatment and remaining evidence |
|---|---|---|---|
| FR-001, FR-011 | Accounts/privacy boundaries | Sessions, resource checks, historical scopes | Every application port authorizes; credential/session/recovery parameters and negative access tests pending |
| FR-002 | Membership and retained history | Membership intervals/entitlements | Revoke current access, preserve own records/settlements; removal/rejoin tests pending |
| FR-003, FR-005 | Expense fields, separate payer, image pointer | Aggregate, independent payer, transactional image | Persist required fields/validated optional image; no silent attachment loss |
| FR-004 | Equal/percentage/remainder intent | Exact algorithm and persisted participant order | BigDecimal, exact 100%, largest remainder then entry order; currency/precision approval pending |
| FR-006 | One reviewer plus unsafe correction edge | Final atomic posting and extensible levels | One reviewer initially, terminal reviewed state, full approval policy needs confirmation |
| FR-007 | Member-only notification intent | Durable outbox/inbox | Transactional inbox for MVP; outbox when transport leaves DB transaction |
| FR-008, FR-009 | Recomputed balances/payment validation | Journal and locked atomic settlement | No self-debt; pairwise netting; reject overpayment with due amount; race/failure evidence pending |
| FR-010 | Category summaries and filters | Explicit business/posting-date semantics | Inclusive dates, empty results, labeled balances; custom parameters/export unresolved |
| FR-012 | Explicitly unmet by desktop | Future server/clients proposal | Web primary, Android/iOS required; delivery/customer gate open |
| NFR-001 | Exact-money intent | Conservation/journal reconciliation | JUnit 5 arithmetic, settlement, restore and failure tests planned, not executed |
| NFR-002, NFR-003 | Access and feedback intent | Layered validation/access matrix | Authorize before disclosure, field/action errors and rollback; runtime evidence pending |
| NFR-004 | Approximate local 100-user target | Indexed queries/workers/coarse lock | Retain proposed 95% within 2 seconds at 100 active users; workload/deployment baseline needs confirmation |
| NFR-005 | Workflow validation intent | Moderated study proposal | Retain proposed 85% unaided core-task completion; study not performed |

SC-001 and SC-002 require measured login success and timed first-use journeys. SC-003 requires allocation conservation; SC-004 requires approval/rejection posting evidence; SC-005 requires payment reconciliation; SC-006 requires exact report filtering. SC-007 requires actual web/Android/iOS journeys or an explicit customer-approved scope change. None is certified by document review. The [selected quickstart](../specs/001-shared-expense-management/quickstart.md) carries scenario-level traceability.

## Recommendation and remaining decisions

Prefer B with A's phased desktop approach, subject to the [provisional decision/gates](lab7-architecture-decision.md). Phases sequence the complete proposed desktop subset; they do not remove features. Full platforms and group-dependent multi-level policy remain visible delivery work.

Resolve delivery-strategy and desktop-subset approval before implementation planning is authorized. Confirm reviewer/self-review/reassignment, payer/participant eligibility, currencies/limits, historical redaction, receipt limits, sign-in/recovery, report parameters/timezone and notification channels. Human adoption review remains mandatory. Actual document and UML verification status is in the [validation record](lab7-architecture-validation.md).
