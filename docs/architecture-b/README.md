# Architecture B — SplitSmart independent alternative

Prepared for CIS 285 Lab 7. Status: design proposal for human review, not an approved implementation plan. No application code is included.

## Documents

- [Architecture](architecture.md): scope, components, rationale, interactions, and trade-offs.
- [Data and financial rules](data-and-finance.md): relational model, persistence, allocation, and settlement invariants.
- [Quality and traceability](quality-and-traceability.md): security, validation, testing, requirements, and open decisions.
- [Component diagram](components.puml): local and full-platform deployment boundaries.
- [UML class diagram](classes.puml): conceptual object model and service ports.
- [Expense activity](expense-activity.puml): submission, notification, review, and financial posting.
- [Payment activity](payment-activity.puml): authorization, concurrent settlement, and reporting.

## Independence and comparison with Architecture A

This proposal was derived from `UserRequirement.md`, `specs/001-shared-expense-management/spec.md`, and `.specify/memory/constitution.md` (version 1.0.0). The existing Spec Kit implementation plan and architecture artifacts were not consulted or used as design inputs. Those sources and all existing architecture files are unchanged.

Architecture B's defining decisions are a command-oriented modular monolith, explicit approval state machines, an immutable obligation/payment journal, transactionally recorded notification outbox entries, and replaceable local/server adapters. Balances are derived from journal facts rather than maintained as independently editable fields. Desktop and network clients invoke the same application boundaries.

These are concrete alternative design choices to compare against Architecture A; they are **not verified claims about A's implementation**. Independence of derivation does not establish that every choice differs from A. A later side-by-side review should check A's authority for balances, transaction boundaries, approval representation, notification reliability, deployment model, and client coupling. If A uses mutable balance fields or GUI-driven workflows, B materially changes both financial authority and orchestration; if A already uses a journal and ports, those are shared choices and should not be reported as differences.

The main comparison question is whether the auditability and reusable core justify B's additional journal, outbox, and concurrency machinery for a small classroom desktop project.

## Review and rendering

Each `.puml` file is standalone PlantUML source. Render with an available PlantUML installation, for example `java -jar plantuml.jar docs/architecture-b/*.puml`, or a PlantUML editor. Rendered diagrams are review artifacts, not supplied application code. Human review must confirm the diagrams, financial examples, requirement mapping, and unresolved delivery decisions before adoption, as required by the constitution.
