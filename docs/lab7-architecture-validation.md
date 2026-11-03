# Lab 7 documentation validation record

Date: 2026-11-03. Scope: architectural document consolidation only. No production code, build, JUnit application test, running UI, deployed client, load test or user study was created/executed by this task. No commit or push was performed.

## Checks performed

| Check | Result and limit |
|---|---|
| Original A preservation | All five archived files match SHA-256 values captured before editing active files; originals retained byte-for-byte, including unsafe/superseded statements |
| Protected inputs | Hash verification confirms UserRequirement.md, constitution, feature spec, specification checklist and all eight original B files unchanged |
| Relative links | Current review/decision/validation, selected UML index, archive index, five active documents and original B Markdown link targets checked locally; all resolve. Historical A internal links deliberately excluded from repair; exception documented below |
| Trace identifiers | All 12 FR IDs, five NFR IDs and seven SC IDs explicitly present in both review and selected quickstart; no authoritative IDs/acceptance criteria edited |
| Diagram source structure | Four selected sources each contain one start/end boundary and balanced braces; activity if/endif blocks balanced and start/stop nodes present. This is structural inspection, not PlantUML syntax parsing |
| Exact example arithmetic | Independent exact-decimal spot-checks confirm 10.00 equal three-way split = 3.34/3.33/3.33; 0.05 at 50/30/20 = 0.03/0.01/0.01; 10.00 less 7.00 = 3.00. These check document examples, not an implemented BigDecimal algorithm |
| Financial/semantic consistency | Reviewed selected plan, research, data model, contracts and UML for journal authority, exclusive sources, atomic posting, source/key uniqueness, current-debt lock, terminal reviewed states, no self-debt, deterministic remainders, historical authorization and date semantics |
| Notifications | Selected MVP consistently uses durable transactional inbox; optional future external transport uses committed outbox/retry/deduplication. Approval/payment never depend on external delivery |
| Whitespace/change scope | Git whitespace check performed; changed tracked files limited to the five requested architecture files. New review, decision, validation, archive and selected UML artifacts are documentation only |

An initial identifier check caught that the review used an SC range instead of explicitly spelling out intermediate IDs; the review was clarified and the full identifier check rerun successfully. The arithmetic and structure checks also completed successfully after that correction.

## Tooling and unverified items

No PlantUML executable or Graphviz dot command was found on PATH. No PlantUML JAR was found in the repository or the checked Codex directory tree. Default Java reports Temurin OpenJDK 1.8.0_422; Java 11 runtime directories were also visible, but Java 21 and Maven were not established as available. No downloads/installations were attempted. These observations are tooling limitations, not claims that no installation exists anywhere on this machine.

**PlantUML grammar validity and rendered layout remain unverified.** No parser command was run and no SVG/PNG render is supplied. The selected [UML index](architecture-selected/README.md) and [quickstart](../specs/001-shared-expense-management/quickstart.md) describe the sources and future checks. A human must render and review all four before adoption. Source delimiter checks cannot substitute for this.

Original A's preserved plan links to `./spec.md`, which existed relative to its original directory; that target does not exist inside the archive. Its [archive index](architecture-a/README.md) links to the authoritative spec and explains why original bytes were retained. This is a known historical-link exception, not a broken active-design link. The original A plan also sketches tasks/source paths not produced by this task.

Runtime transaction isolation, database migrations/locks, password hashing/session behavior, image validation, report correctness, notification delivery and complete client journeys remain unverified. Planned JUnit 5 scenarios and FR/NFR/SC mapping are in the quickstart; no passing tests, NFR measurements or platform compliance are claimed.

## Remaining decisions and human review

[G1–G6 in the decision](lab7-architecture-decision.md) remain open. In particular, delivery strategy/desktop subset approval is required before implementation planning is authorized; this lab's provisional consolidation does not satisfy that gate. Confirm domain/security/currency/report/notification policy, verify toolchain/adapters, review rendered UML, and implement/execute traced acceptance tests before adoption/release claims. Full primary web, Android and iOS scope is preserved and remains undelivered by these documents.

See the [review](lab7-architecture-review.md), [decision](lab7-architecture-decision.md), [active plan](../specs/001-shared-expense-management/plan.md), [original A](architecture-a/README.md), and [original B](architecture-b/README.md).
