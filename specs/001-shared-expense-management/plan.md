# Selected architecture plan: SplitSmart shared expense management

Date: 2026-11-03. Status: provisional design consolidation for CIS 285 Lab 7; implementation planning is not authorized until the delivery-strategy gate is resolved. See [decision](../../docs/lab7-architecture-decision.md) and [review](../../docs/lab7-architecture-review.md).

## Authority and scope

[Customer requirements](../../UserRequirement.md), [constitution](../../.specify/memory/constitution.md), and [spec.md](spec.md) remain authoritative and unchanged. FR-001 through FR-012, NFR-001 through NFR-005, all acceptance scenarios and SC-001 through SC-007 remain intact. Original [A](../../docs/architecture-a/README.md) and [B](../../docs/architecture-b/README.md) are preserved; this plan and its four companion documents describe the selected design.

The bounded desktop evaluation demonstrates accounts, groups, expenses with equal/percentage allocation and optional receipt, one-reviewer approval, persistent in-app notifications, pairwise balances, manual settlement records, and basic expense/balance/payment reports with date filtering. Swing does not fulfill primary web/Android/iOS delivery. Full delivery proposes a Java server hosting the same core, a primary browser client and Android/iOS apps sharing central records; frameworks and delivery strategy need approval. No customer-authorized exclusions or final approval are recorded.

## Technical context and components

Java 21 and Maven govern the application; Swing governs the desktop interface; BigDecimal governs all money/percentage arithmetic; JUnit 5 governs automated tests. Begin with one Maven project and cohesive domain, application, desktop/presentation and persistence packages. These are proposed boundaries, not generated folders. Business logic remains testable without Swing.

| Component | Responsibility and interaction |
|---|---|
| Swing views/presenters | Input, errors and empty states; invoke application ports on background workers, update widgets on event dispatch thread |
| Identity/access | Sign-in, sessions, resource authorization from verified actor; no trusted client roles |
| Membership service | Group creation/creator membership, membership intervals, reviewer designation, current-access revocation with preserved own history |
| Expense service/allocation policies | Validate and allocate; save pending expense, immutable shares, approval snapshot and eligible inbox notices in one transaction |
| Review service | Legal state/version checks; authorized final approval and obligation postings in one transaction |
| Settlement/ledger services | Serialize group changes; reject overpayment; commit payment and negative entry together; derive pairwise balances |
| Query/report service | Authorized snapshot reads with explicit business-date versus posting-date semantics |
| Repository/transaction ports | Exact decimal storage, foreign keys, uniqueness, locks, migrations and rollback; database-specific adapters |
| Future network adapters | Authenticated Java server plus web/Android/iOS clients using the same core ports; not implemented by desktop work |

Embedded relational storage (candidate H2) supports the MVP; server relational storage (candidate PostgreSQL) is a later adapter choice. Loose-file aggregate persistence is not selected because multi-record commits require a reliable transaction boundary. Receipt BLOBs make image association atomic. Versions, decimal limits and SQL/locking behavior need verification before adoption.

## Invariants and interactions

Submission commits pending expense, shares, receipt, approval snapshot, entitlements, command receipt and durable inbox notices together, with no journal entries. Final approval commits decision/status and positive nonself obligation entries together. Rejection has no financial effect. Approved/rejected expenses are terminal; the unsafe A approved-to-pending edge is removed. Rejected work may be copied into a new submission. Approved corrections/payment reversals need separately specified compensating-entry rules.

Payment resolves debtor from session, locks group ledger row, reads current positive pairwise due, rejects zero/negative/over-limit input with current due, and commits payment plus negative entry atomically. All group-mutating commands lock group before expense; membership/roles and versions are rechecked inside the transaction. Persistent command receipts deduplicate actor/type/key and reject changed payloads; source uniqueness prevents duplicate postings across different command keys. Retrying never skips current authorization.

Balances are projections of immutable entries partitioned by group/currency, with no writable Balance authority. Opposing pair debts net; no self-debt, third-party rerouting or cross-currency/group settlement. Exact rules are in [data-model.md](data-model.md) and [contracts](contracts/README.md).

Desktop notifications are inbox rows inserted with submission for other active members. No worker/outbox is needed to insert those rows. Failed inbox insertion rolls back submission. Removal suppresses current notification access. If delivery leaves the database transaction, enqueue a durable outbox with submission and dispatch after commit with retries and event/recipient/channel deduplication. Approval and financial reads never wait for external delivery.

## Provisional phases and scope controls

These are dependency stages for discussion, not an approved task schedule. G1 must close before implementation planning proceeds.

1. Establish Java 21/Maven, domain/application ports, exact allocation tests, relational transactions, accounts and membership/access rules.
2. Deliver expense/receipt submission, transactional inbox, one-reviewer decisions, immutable journal, idempotency and authorized balances.
3. Deliver locked manual payments, reports/date semantics, removed-member history/settlement views, focused Swing journeys and recovery/failure checks. This completes the proposed desktop subset, not the product.
4. Under approved full-platform strategy, host the core behind an authenticated Java server, validate adapter/migration behavior, and deliver web primary plus Android/iOS journeys. Add ordered approval levels as confirmed group needs require; use outbox for selected external channels.

Do not add a broker, microservices, asynchronous balance cache, full event sourcing, automatic desktop/server synchronization or mandatory multi-module build without demonstrated need. Retain atomicity/idempotency from the first financial increment.

## Constitution and validation status

| Principle | Design alignment | Evidence/gate |
|---|---|---|
| I Java 21/Maven/Swing | Required toolchain and desktop retained | Toolchain verification pending; default Java is not proof of Java 21 |
| II OO separation | Policies/aggregates/services/ports; thin presenters | Domain/presenter tests planned; no generated application code |
| III money accuracy | BigDecimal, exact remainder, immutable posting | Conservation/race/recovery tests not run |
| IV traceability | IDs retained; scenario matrix in quickstart | Acceptance remains open |
| V UML/human review | Four standalone selected diagrams | Actual status in validation record; human adoption review pending |
| Platform gate | FR-012 retained, server/client strategy proposed | Open; no implicit desktop-only approval |

NFR-004 remains a proposed 95% of common actions within two seconds at up to 100 active users, excluding user-controlled image transfer; workload/dataset/network baseline need confirmation. A sequential local desktop does not prove 100 simultaneous users. NFR-005 remains proposed 85% unaided workflow completion. Neither is measured.

## Companion documents and final UML

- [Research](research.md), [data model](data-model.md), [validation quickstart](quickstart.md), [application contracts](contracts/README.md).
- [Selected UML index](../../docs/architecture-selected/README.md), [class](../../docs/architecture-selected/classes.puml), [component](../../docs/architecture-selected/components.puml), [expense activity](../../docs/architecture-selected/expense-activity.puml), [payment activity](../../docs/architecture-selected/payment-activity.puml).
- [Validation record](../../docs/lab7-architecture-validation.md) separates document checks from unperformed application tests and rendering limitations.
