# Final selected UML — provisional Lab 7 architecture

These sources describe the consolidated B target with A's phased desktop approach, not either historical alternative unchanged. See [decision](../lab7-architecture-decision.md), [active plan](../../specs/001-shared-expense-management/plan.md) and [data rules](../../specs/001-shared-expense-management/data-model.md).

- [classes.puml](classes.puml): conceptual entities, exclusive journal sources, derived balances, strategies and application ports.
- [components.puml](components.puml): bounded desktop deployment, shared core and proposed full-platform extension.
- [expense-activity.puml](expense-activity.puml): submission with atomic inbox and final review posting; no external delivery dependency.
- [payment-activity.puml](payment-activity.puml): idempotent authorized settlement with group lock and journal-derived balance.

Each is standalone PlantUML source. The desktop uses a transactional inbox; optional external delivery requires an outbox extension. Class fields show key concepts rather than every database field. Approved/rejected records are terminal; corrections are not modeled as status toggles. Future multilevel review and external transport require additional diagrams when implemented.

See [validation status](../lab7-architecture-validation.md). Source boundary/brace/link checks do not establish PlantUML grammar validity or readable layout. No rendering or human adoption approval is implied.
