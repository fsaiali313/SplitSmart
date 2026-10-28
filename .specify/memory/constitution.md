<!--
Sync Impact Report
Version change: unratified template → 1.0.0
Modified principles: empty template placeholders → Java 21 and Maven; Object-Oriented
  Design and GUI/Business Separation; Exact Financial Arithmetic; JUnit 5 and
  Requirement Traceability; PlantUML and Human Review of AI Output
Added sections: Customer Requirements and Implementation Decisions; Engineering Workflow
Removed sections: none
Follow-up TODOs: Confirm the original ratification date.
-->

# SplitSmart Constitution

## Core Principles

### I. Java 21 and Maven
The application MUST use Java 21 and Maven as its implementation and build
platform. The desktop user interface MUST use Java Swing unless an approved
constitution amendment changes that implementation decision. These choices
standardize the project toolchain; they do not redefine the customer’s requested
product or supported delivery platforms.

### II. Object-Oriented Design and GUI/Business Separation
The design MUST use cohesive object-oriented components with explicit
responsibilities. Business rules, expense calculations, approvals, and balance
updates MUST reside outside Swing components and event handlers. GUI code MUST
delegate to business logic through clear interfaces so the rules can be tested
without launching the interface.

### III. Exact Financial Arithmetic
All monetary amounts and calculations MUST use `BigDecimal`; `float` and
`double` MUST NOT be used for money. Splitting, percentage allocation, rounding,
and payment settlement MUST follow explicit, documented rules. Allocated shares
MUST reconcile exactly to the source expense, including any rounding remainder,
so recorded balances remain consistent.

### IV. JUnit 5 and Requirement Traceability
Automated tests MUST use JUnit 5. Each implemented behavior MUST trace to a
customer requirement or an explicitly approved implementation requirement, and
its acceptance criteria MUST be linked to relevant tests. Changes to a
requirement MUST update affected specifications, trace links, and tests.
Business logic MUST be tested independently of Swing; interface behavior
MUST receive focused tests where practical.

### V. PlantUML and Human Review of AI Output
UML diagrams used to communicate architecture, domain relationships, or
important workflows MUST be maintained as PlantUML source and kept consistent
with the implementation. AI-generated code, tests, diagrams, and documentation
MUST be reviewed and validated by a human before adoption. The reviewer remains
accountable for correctness, requirement alignment, and compatibility with
these principles.

## Customer Requirements and Implementation Decisions

`UserRequirement.md` is the source for the customer’s requested outcomes:
individual accounts; groups; expenses with amount, date, description, split
method, optional receipt, and involved users; notifications; expense approval;
balances between users; payment tracking; and expense, balance, and payment
reports, including customizable date ranges and parameters. The customer also
requests a primarily web-based product with Android and iOS applications.
Specifications MUST preserve these outcomes unless the customer explicitly
approves a change.

Java 21, Maven, Swing, JUnit 5, and PlantUML are implementation decisions, not
customer requirements. They MUST NOT be represented as customer-requested
features or used to silently narrow the requested product. In particular, a
Swing desktop application alone does not meet the requested web, Android, and
iOS platforms. Before implementation is planned, the relevant feature
specification MUST identify an approved delivery strategy that addresses those
platforms or record an explicit, customer-approved scope change.

## Engineering Workflow

Feature specifications MUST distinguish customer outcomes from implementation
decisions and state acceptance criteria in verifiable terms. Design changes
affecting architecture, domain relationships, or major workflows MUST update
their PlantUML sources. Reviewers MUST verify traceability, relevant JUnit 5
coverage, exact monetary arithmetic, and human validation of any AI-assisted
output before accepting a change.

## Governance

This constitution governs project specifications, design, implementation, and
review. Amendments MUST be proposed with their rationale and impact on existing
requirements and work; the project owner MUST approve them. Approved amendments
MUST update this document and its version and amendment date. Conflicts between
this constitution and a customer requirement MUST be resolved explicitly rather
than by silently changing either.

Constitution versions use `MAJOR.MINOR.PATCH`: MAJOR for incompatible changes
to principles or governance, MINOR for added principles or materially expanded
guidance, and PATCH for non-semantic clarifications and corrections. Every
feature review and release-readiness review MUST assess compliance with the
constitution and record any approved exception, its rationale, and its scope.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): original adoption date not provided | **Last Amended**: 2026-10-28
