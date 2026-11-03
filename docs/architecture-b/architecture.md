# Architecture B: command-oriented modular monolith with a financial journal

## Architectural overview

SplitSmart has one object-oriented Java 21 application core built with Maven. Cohesive modules expose application interfaces for account access, membership, expense submission, review, settlement, and queries. Swing presenters call these interfaces; Swing widgets and event handlers contain no allocation, permission, approval, or financial rules. Here “presenter” is a presentation role, while “MVP” elsewhere means minimum viable product.

Commands change state through a transaction coordinator. Queries return authorized immutable view models. Both paths use the same relational database; this is command/query separation inside one process, not a distributed system or separate eventually consistent financial database. An append-only financial journal is the authority for obligations and settlements. Expenses and review records remain normal relational aggregates: this is not full event sourcing.

Approval posts obligations exactly once. Payment recording posts settlements exactly once. A balance is a projection over those entries, never a separately editable source of truth. Notifications are durable inbox records produced through an outbox; delayed notification delivery cannot delay or change financial truth.

## Scope and deployment boundaries

| Concern | Bounded Swing desktop MVP | Full customer platform proposal |
|---|---|---|
| Delivery | One Java 21 Swing installation, local relational database, sequential signed-in users | Primary browser application plus Android and iOS applications calling an authenticated server API |
| Rules | Java application/domain modules, local adapters | The same Java 21/Maven core hosted by one application server; HTTP adapter replaces direct local invocation |
| Identity | Local accounts, password sign-in, session switching | Centrally managed accounts and server sessions, with recovery method to be confirmed |
| Approval | One designated authorized reviewer per expense | Ordered approval levels configured per group; approval at every level required |
| Notifications | Persistent in-app inbox visible at next sign-in/refresh | Persistent in-product inbox available across web and both mobile apps; push/email optional decisions |
| Reports | Expenses, payments, pairwise balances, inclusive date filter | Same journeys plus configurable authorized filters; export and further parameters need confirmation |
| Storage | Embedded relational adapter (proposed H2), receipt image BLOBs | Server relational adapter (proposed PostgreSQL), initially transactional image BLOBs |

The local MVP is an evaluation subset and does not satisfy FR-012. A local-only database is not a secure shared service for mutually untrusted people with access to the same operating-system account. There is no offline synchronization promise and no automatic merge of desktop and server records. A separately validated import would be needed if desktop data must migrate.

The proposed full delivery strategy keeps Swing for the desktop UI and Java 21/Maven for the business core and server. Browser, Android, and iOS presentation adapters supply the requested delivery surfaces without moving authoritative rules into clients. Their frameworks remain undecided. They must support accounts, groups, expense/receipt entry, review, notifications, balances, manual payments, and reports against the same records. This proposal is not customer approval: the specification and constitution require approval of the delivery strategy or an explicit scope change before implementation planning. Desktop subset approval, currencies, and report parameters remain open too.

## Components and responsibilities

| Component | Responsibility and collaborators |
|---|---|
| Swing views and presenters | Gather input, show field errors/empty states, invoke application interfaces on background workers, update widgets on the Swing event dispatch thread |
| Client/API adapters | Translate local calls or authenticated network requests to commands and queries; never accept client-supplied roles or computed financial shares as authority |
| Identity and access | Verify credentials, issue/revoke sessions, authorize resource operations using active membership or narrowly scoped historical entitlements |
| Membership service | Create groups, maintain membership intervals and roles, designate reviewers; removal revokes current access without deleting history |
| Expense service | Validate input and membership, allocate shares through a strategy, save pending expense and ordered participants, snapshot approval policy, enqueue notification work |
| Review service | Enforce legal state transitions and reviewer permissions, record decisions, post journal obligations atomically on final approval |
| Allocation policies | `EqualAllocation` and `PercentageAllocation` implement one allocation interface using BigDecimal and deterministic remainder distribution |
| Settlement service | Verify debt and actor, serialize changes to the group ledger, reject overpayment, save payment and settlement entries atomically |
| Ledger service | Append obligation/settlement entries, enforce unique posting keys and conservation, calculate net pairwise balances |
| Query/report service | Read consistent authorized expenses, balances, payments, and history; apply inclusive date ranges and supported filters |
| Notification dispatcher | Turn committed outbox recipients into durable inbox records; retry idempotently and suppress access after removal |
| Persistence ports and transaction coordinator | Repository interfaces, atomic database transactions, locking/version checks, storage constraints; adapters hide database-specific details |

Domain objects depend on value objects and domain interfaces. Application services depend on repository, authentication, and transaction ports. Persistence and presentation adapters depend inward on these interfaces. Maven module boundaries may express `domain`, `application`, `desktop`, and `persistence`; a future `server` adapter can be added. These are proposed packaging boundaries, not generated modules.

## Component interactions

1. Sign-in validates credentials and returns an opaque session context. Each later command/query resolves identity again and checks the target resource; a selected group ID alone confers no access.
2. Submission validates the group, payer, participants, receipt, and split. One transaction persists the pending expense, immutable allocation, review-policy snapshot, historical entitlements, and notification outbox recipients (other active members at submission). No journal posting occurs.
3. A reviewer submits a decision with an expected expense version. The review service locks the group ledger and expense in a consistent order, rechecks permissions and pending state, and records the decision. Rejection closes review without posting. Intermediate approvals advance the review level. Final approval and journal postings commit together.
4. Dispatcher retries committed outbox records until the inbox insert succeeds. A unique recipient/event key prevents duplicates. Recipient eligibility is checked again before delivery and when reading; removal suppresses current-activity notification details.
5. A payment command authorizes the debtor and locks the group ledger before reading the current net obligation. Validation and journal/payment inserts occur within that same transaction. Concurrent attempts cannot both spend the same debt.
6. Reports read a database snapshot after authorization. Immediate financial queries use committed journal entries directly, so they never depend on the dispatcher or a stale asynchronous cache.

## Rationale and trade-offs

The monolith gives the classroom project one process and one transaction boundary. Ports permit an embedded demo and later server hosting without rewriting financial policies. Strategy objects isolate the two split algorithms; the approval state machine avoids conditional logic spread across screens. Journal entries support reconciliation and explain why a displayed balance exists.

Costs include more entities and transaction discipline than a basic CRUD application, migration differences between embedded and server databases, and contention from a coarse per-group ledger lock. The lock is deliberately simple for the proposed 100-active-user baseline; measurement can justify finer pair locks later. No microservices, message broker, payment processor, or independent balance database is necessary.

Derived balance queries become more expensive as history grows. Index group/currency/pair/posting time and measure before adding caches. Any later cache is disposable and must reconcile to journal totals. Outbox delivery is eventually visible and needs retry monitoring, while financial writes remain immediately consistent. Rejected and approved submissions are immutable; corrections/voids require a separately specified authorized workflow rather than silent edits. This limits flexibility but preserves audit meaning.
