# Research: Shared Expense Management

## Decision summary

The implementation will target a Java 21 + Maven desktop application built with Swing for the bounded MVP described in the feature specification. The product scope preserves the customer requirement set from `UserRequirement.md`, while the Swing desktop subset is treated as an explicit evaluation scope rather than a replacement for the requested web, Android, or iOS delivery model.

## Research findings

### 1) Delivery strategy and scope gate

- Decision: Keep the feature design focused on the Swing desktop MVP while recording the full web/mobile delivery requirement as a separate customer decision gate.
- Rationale: The constitution explicitly states that Java 21, Maven, Swing, and PlantUML are implementation decisions, not customer requirements. The feature specification also calls out that web and mobile delivery are still required by the original customer request and must not be silently narrowed.
- Alternatives considered:
  - Full web + Android + iOS implementation from day one: rejected as a product-scope expansion beyond the current planning target and incompatible with the bounded description of the current feature branch.
  - Desktop-only product without formal scope note: rejected because it would contradict the constitution and the source customer requirements.

### 2) Approval model for the MVP

- Decision: Use a single-review approval flow in the MVP, with the ability to extend to multi-level approval later if the customer approves a broader approval policy.
- Rationale: The spec’s assumptions explicitly allow one designated reviewer per expense and the proposed MVP can demonstrate the workflow without assuming full multi-level review complexity.
- Alternatives considered:
  - Full multi-level approval model immediately: rejected as unnecessary complexity for the initial validation prototype.
  - No approval step: rejected because it violates the customer requirement and the feature specification’s approval workflow.

### 3) Currency and amount handling

- Decision: Treat each group or expense context as using a single currency, with amounts represented as `BigDecimal` to minor units and rounding applied by the confirmed rule: largest fractional remainder, then participant entry order for ties.
- Rationale: The feature specification mandates exact monetary arithmetic and explicit rounding behavior. The constitution requires `BigDecimal` and no `float`/`double` for money.
- Alternatives considered:
  - Floating-point arithmetic: rejected due to precision loss and auditability problems.
  - Multi-currency conversion support in the MVP: rejected because the requirement is not defined and would broaden scope before customer confirmation.

### 4) Reporting and filtering

- Decision: Standardize on date-range filters plus group/account filters, expense/balance/payment category filters, and a clear empty-state result for no matches.
- Rationale: The spec identifies date ranges as required and leaves additional report parameters open for future definition. The MVP should validate the core filtering behavior before expanding parameter richness.
- Alternatives considered:
  - Unlimited custom reporting parameters from the outset: rejected as plan creep.
  - No filter guidance: rejected because the acceptance criteria require report matching to selected parameters.

### 5) Persistence and service boundaries

- Decision: Use a repository/service layer to isolate domain rules from Swing UI code, with persistence implementation delegated to a local repository abstraction that can be backed by a file-based or embedded database solution during implementation.
- Rationale: The constitution requires GUI/business separation and the feature spec calls for persistent records for accounts, groups, expenses, balances, payments, and notifications.
- Alternatives considered:
  - Direct Swing model storage: rejected because it couples UI and business state.
  - Full enterprise database architecture in the MVP: rejected as an unnecessary complexity increase for a local desktop version.

## Consolidated outcomes

- Decision: The feature will be planned as a Java 21, Maven, Swing desktop application with domain services, JUnit 5 tests, and `BigDecimal` arithmetic.
- Rationale: This choice satisfies the constitution and the bounded MVP described in the feature specification while explicitly keeping the broader web/mobile delivery requirement as a future platform decision.
- Alternatives considered: Full cross-platform implementation immediately, no approval gate, floating-point money handling, and direct UI persistence were all rejected as incompatible with the constitution or the defined scope.
