# Lab 7 architecture decision — provisional B target with phased desktop delivery

Date: 2026-11-03. Status: **provisional project-owner selection for Lab 7 documentation**, recorded at the user's direction. This is not final architecture approval, implementation authorization, a constitution amendment, or customer authorization to reduce scope. No approval signature/date is asserted.

## Decision and rationale

The [review](lab7-architecture-review.md) compared original [A](architecture-a/README.md) and [B](architecture-b/README.md) against unchanged source requirements, specification and constitution. Prefer B's Java 21 command-oriented modular monolith with journal-derived balances and replaceable presentation/persistence adapters. Retain A's phased bounded Swing evaluation approach. The [active plan](../specs/001-shared-expense-management/plan.md) and four companions now describe this one selected architecture; historical alternatives remain intact.

Keep immutable obligation/settlement entries, atomic approval/payment posting, persistent idempotency receipts, resource authorization, exact allocation and Swing-independent application ports. Start with one Maven project and cohesive packages. Use durable inbox rows in submission's DB transaction for the desktop; defer durable outbox/dispatcher until a selected channel leaves that transaction. Do not defer financial atomicity, source uniqueness, idempotency or overpayment protection.

Use one designated reviewer in the MVP. Approved/rejected records are terminal. Rejected work may be copied to a new submission; approved corrections/payment reversals need separately specified compensating-entry and settlement-impact rules. No approved-to-pending transition or destructive edit replaces reversal.

B specifies integrity and reuse more clearly than A, while A offers a manageable teaching sequence. Single-process relational transactions avoid distributed infrastructure. Costs include more invariants, journal queries, coarse locks, schema migrations and restore/reconciliation duties. The desktop inbox simplification preserves durability without an unnecessary worker.

## Outstanding approval and evidence gates

| Gate | Required decision/evidence | Status |
|---|---|---|
| G1 delivery/scope | Approve strategy for primary web plus Android/iOS or explicit customer-approved scope change; confirm desktop evaluation subset | Open. FR-012/SC-007 unchanged; constitution/spec gate blocks treating implementation planning, including desktop planning, as authorized |
| G2 domain policy | Reviewer/self-review/reassignment, payer/participant eligibility, historical redaction/rejoin, currency/limits, reports/timezone, notification channels | Open. Selected defaults are proposals |
| G3 technology/security | Java 21/Maven, DB versions/locking, password/session/recovery, image limits, backup/restore | Open. Product candidates not empirically verified |
| G4 adoption | Human review of consolidated documents, rendered UML, traceability and constitutional compliance | Open. Generated documentation is not self-approval |
| G5 behavior | JUnit 5 domain/adapter/workflow/race/failure tests, focused UI checks, performance/usability evidence | Not run; no production code created by this work |
| G6 full release | Shared-record journeys on web/Android/iOS or explicitly authorized exclusions; migration/security evidence | Open; desktop demonstration cannot close it |

The phased plan is a provisional design sequence until G1 closes. Choosing B does not implement multi-level approval, server hosting, web/mobile clients, external notification transport or optimized caching. Automatic offline sync and bank processing are not specified customer requirements. Constitution ratification date remains unknown and unchanged.

## Preservation and validation

Original A copies and hashes are in [architecture-a](architecture-a/README.md); all eight original B files remain in [architecture-b](architecture-b/README.md). [Final selected UML](architecture-selected/README.md) supersedes neither historical source in place. See the [validation record](lab7-architecture-validation.md) for actual checks and limitations. No commit or push is part of this selection.
