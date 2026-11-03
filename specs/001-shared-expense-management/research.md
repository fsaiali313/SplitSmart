# Research and design decisions — selected architecture

Status: provisional synthesis, 2026-11-03. This is repository document analysis, not empirical performance/security research or dependency verification. See [plan](plan.md), [review](../../docs/lab7-architecture-review.md), and [decision/gates](../../docs/lab7-architecture-decision.md).

| Decision | Rationale | Alternatives and cost |
|---|---|---|
| B core with A phased desktop evaluation | Financial integrity/client reuse with a bounded teaching sequence | A alone leaves atomic/retry mechanisms undefined; full B deployment adds unnecessary initial machinery |
| Java 21/Maven/Swing, one project with cohesive packages | Constitution and manageable build | Separate modules can follow demonstrated need; direct Swing business/storage logic violates separation |
| Embedded relational transaction adapter; H2 candidate | Atomic expense/inbox, approval/journal, payment/journal | A's loose-file option needs custom atomic recovery; PostgreSQL candidate deferred until server strategy approved |
| Immutable journal and synchronous balance reads | One financial authority, audit and recovery | Writable Balance creates a second authority; full event sourcing/read databases unnecessary |
| Persistent command receipts and source keys | Safe double-click/timeout retries, even distinct approval command keys | Disabled buttons alone cannot prevent duplicate committed effects |
| Group row lock before expense/financial writes | Current-debt validation and stable ordering | Pair locks add ordering complexity; no lock permits race; coarse contention must be measured |
| One reviewer, terminal reviewed submissions | Proposed subset and no undefined reversal | Ordered levels retained for confirmed full group policy; approved-to-pending excluded |
| Transactional local inbox, future external outbox | Local notification effects fit in one DB commit | Original B dispatcher unnecessary for local inserts; nontransactional send risks misses; no broker required |
| Exact BigDecimal minor-unit quotient/remainder | Conserves total without recurring-decimal approximation | Float/double prohibited; independent HALF_UP shares may create unexplained cents |
| Receipt BLOB | Atomic image association | Files/object storage need staging/cleanup; BLOB growth requires limits/tested backups |
| Application authorization and historical entitlements | Every adapter enforces current/historical boundaries | UI-only checks bypassable; permanent former-member group visibility violates removal |
| Business-date lists, posting-date balance periods | Late approval/backdated payment do not rewrite financial history | Filtered expense totals cannot be presented as current debt |
| Future Java server plus web/Android/iOS clients | Preserves FR-012 | Immediate full delivery is a sequencing choice, not scope expansion; desktop-only product requires explicit customer authorization |

## Pending policy and technology decisions

Proposed defaults: one group currency, active-member payer/participants, one designated reviewer, no self-review, immutable submitted financial fields, and historical access limited to own involvement. A sole-member group needs another eligible reviewer before submission. A manager may reassign only an outstanding review step with an audit record; completed decisions cannot change. These defaults need G2 review; they do not alter source acceptance criteria.

Confirm currency/scale and limits: proposed two-decimal money DECIMAL(19,2), percentage DECIMAL(9,6), no silent truncation/rounding. Confirm report timezone/additional parameters/export, credential/recovery/session configuration, image allowlist/size/pixel limits, historical redaction/rejoin, database versions and backup/restore. No products/libraries are claimed benchmarked or vetted.

Primary web/Android/iOS delivery strategy and desktop-subset approval remain G1 before implementation planning. Ordered multi-level approval remains available as a target extension according to confirmed group needs. Automatic local/server sync, bank processing and currency conversion are not promised.

## Security and persistence implications

Use established adaptive salted password hashing with stored algorithm parameters, never plaintext credentials; bound sign-in retries and expire/revoke sessions. Session identity determines actor; caller fields cannot confer authority. Future server requires TLS, protected session transport and cookie CSRF defenses as applicable. Local OS access can bypass a local database; strong shared-user isolation needs a server boundary. Recheck authorization on queries, images, reports, retries and transaction-time reviews/payments.

JDBC repository adapters enforce migrations, foreign keys, exact decimals, uniqueness and rollback. Index journal group/currency/pair/posting time; measure before caching. Test embedded/server parity rather than assuming identical SQL/locking. Backups must be database-consistent and restored with source/journal reconciliation. [Quickstart](quickstart.md) lists future evidence; [validation record](../../docs/lab7-architecture-validation.md) lists checks actually performed.
