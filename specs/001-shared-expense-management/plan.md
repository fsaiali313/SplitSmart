# Implementation Plan: Shared Expense Management

**Branch**: `001-shared-expense-management` | **Date**: 2026-11-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-shared-expense-management/spec.md`

## Summary

The feature addresses the core shared-expense workflows described in `UserRequirement.md`: account access, group membership, expense capture and allocation, approval, balance calculation, payment settlement, and reports. The implementation plan resolves the design around a Java 21 + Maven + Swing desktop MVP that preserves the customer requirement set while explicitly tracking the broader web/mobile delivery requirement as a separate scope decision gate.

## Technical Context

**Language/Version**: Java 21

**Primary Dependencies**: Maven, Java Swing, JUnit 5, `BigDecimal`, and a local repository/service layer for persistence and validation

**Storage**: Local persistence for accounts, groups, members, expenses, approvals, notifications, balances, and payments; implementation will use a repository abstraction with a desktop-friendly storage backend (for example, file-based or embedded database) and is expected to remain local to the desktop app unless customer-authorized scope changes occur

**Testing**: JUnit 5 with unit and integration tests centered on money arithmetic, approval flows, balance calculations, and permission boundaries

**Target Platform**: Java Swing desktop application as the bounded MVP; full web and mobile delivery remains a required product outcome outside the current implementation scope unless a customer-approved scope change is recorded

**Project Type**: desktop-app

**Performance Goals**: Support the core use cases for small-to-medium shared groups with up to approximately 100 active users in a local desktop deployment; common operations such as sign-in, expense entry, approval, balance recomputation, and report generation should complete within the target response budget for a desktop application

**Constraints**: Use `BigDecimal` for all money values; enforce authorization boundaries for private user and group data; maintain exact rounding rules for allocations and settlement amounts; keep Swing UI code thin and delegate business logic to domain services and repositories

**Scale/Scope**: Small-group shared-expense management with single-user local operation for the MVP; report filtering and approval flows are intentionally bounded to the defined flow rather than full enterprise scale

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- PASS: Java 21 and Maven are the mandated implementation baseline.
- PASS: GUI/business separation is preserved by treating Swing as the UI layer and domain logic as separate service/model components.
- PASS: Exact monetary rules require `BigDecimal` and explicit rounding logic for splits and settlement calculation.
- PASS: Test strategy uses JUnit 5 and traces to the feature specification’s user stories and acceptance criteria.
- PASS: PlantUML and human review are used for architecture/domain diagrams and implementation validation.
- PENDING APPROVAL GATE: The customer requirement still requires a primarily web-based product with Android and iOS applications, but the current feature branch intentionally confines the implementation plan to a Java 21 + Swing desktop MVP. This is not a claim that the full customer platform requirement has been satisfied; it is a pending approval decision that must be explicitly accepted before implementation proceeds beyond the desktop MVP.

## Project Structure

### Documentation (this feature)

```text
specs/001-shared-expense-management/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (desktop-local contract note)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── app/
│   └── Swing entry points and application bootstrap
├── domain/
│   ├── model/
│   ├── services/
│   ├── validation/
│   └── rules/
├── persistence/
│   ├── repositories/
│   └── data-access/
├── ui/
│   ├── panels/
│   ├── dialogs/
│   └── viewmodels/
└── util/
    └── money and formatting helpers

tests/
├── unit/
│   ├── domain/
│   └── validation/
├── integration/
│   └── workflows/
└── ui/
    └── focused Swing interaction checks
```

**Structure Decision**: Single-project desktop application with domain logic isolated from Swing. UI screens and dialogs are separated from business services, repositories, and validation rules to preserve the constitution’s GUI/business separation mandate.

## Complexity Tracking

No constitutional violations require broader justification in the current plan. The one explicit scope note is preserved as a customer-facing decision gate rather than a violation of the constitution.
