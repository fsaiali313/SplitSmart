# Feature Specification: Shared Expense Management

**Feature Branch**: `001-shared-expense-management` (spec identifier; no branch hook configured)

**Created**: 2026-10-28

**Status**: Draft

**Input**: User description: "Read UserRequirement.md in this workspace as the authoritative customer requirements. Write a testable SplitSmart feature specification: actors, user scenarios, functional and non-functional requirements, acceptance criteria, requirement IDs (FR-001, etc.), and open questions. Preserve all original customer features in the requirements inventory; label the Java Swing MVP subset separately. Do not write Java code. Do not edit UserRequirement.md."

## Clarifications

### Session 2026-10-28

- Q: Should an expense record identify who paid separately from the people who share its cost? → A: Record one payer separately; the payer may or may not be a participant.
- Q: When someone is removed from a group, should they still be able to see that group's past records and settle any remaining amount they owe or are owed? → A: Removed members lose current group access but retain their own historical records and settlement details.
- Q: What validation rules should apply to expense amounts and percentage allocations? → A: Amount must be greater than zero; each percentage must be 0–100%; percentages must total exactly 100%.
- Q: When a split creates leftover cents, how should the product assign them among participants? → A: Give leftover cents to the largest fractional cent remainders; break ties by participant entry order.
- Q: What should happen if a user tries to record a payment larger than the amount they owe that payee? → A: Reject the payment and show the amount currently owed.

## Actors

- **Individual user**: A person who signs in, participates in groups, creates or reviews expenses, tracks balances, records payments, and views reports.
- **Group creator or manager**: A user who creates a group and manages its membership.
- **Expense submitter**: A group member who records an expense and identifies the payer, participants, and allocation.
- **Expense payer**: The single user recorded as having paid an expense; that user may or may not be one of its participants.
- **Expense reviewer**: A user authorized by the group to approve or reject submitted expenses. This may be the group creator or another designated member.
- **Expense participant**: A user included in an expense allocation, whether or not they submitted it.

One person may act in more than one role. The exact permissions are defined by the acceptance criteria below.

## Requirements Inventory: Customer-Requested Scope

The following inventory preserves the customer features in `UserRequirement.md`. These requirements describe the requested product scope, not a promise that every item is part of the MVP.

| Area | Customer-requested capability |
|---|---|
| Accounts | Each person has an account, can log in, and can access their own expense and balance information. |
| Groups | Users create and manage groups for shared activities and participants. |
| Expenses | Users record amount, date, description, equal or percentage-based split, involved users, and an optional receipt image. |
| Notifications | Users are notified when other group members create an expense. |
| Approval | Expenses are reviewed and approved before becoming active and changing balances; groups may use one or multiple approval levels. |
| Balances | The product tracks what each user owes every other user, considering entered expenses. |
| Payments | Users record payments that settle amounts owed and update balances. |
| Reporting | Users view summaries of expenses, balances, and payments, and can request reports with date ranges and other parameters. |
| Delivery platforms | The primary product is web-based and is also available as applications for Android and iOS. |

## Proposed Java Swing MVP Subset

This is a proposed, explicitly bounded implementation subset—not a replacement for the complete customer-requested scope. The project constitution identifies Java 21, Maven, and Swing as implementation decisions, not customer requirements.

The proposed MVP demonstrates account sign-in, group creation and membership management, expense entry with equal or percentage allocation and optional receipt, a single-review approval flow, in-app group expense notifications, per-user balances, manual payment recording, and basic expense/balance/payment summaries with date filtering. It targets a Java Swing desktop experience only. It does **not** satisfy the customer’s requested primary web, Android, or iOS delivery platforms.

The delivery strategy for the full requested platform scope, or a customer-approved scope change, is an open decision and a gate before implementation planning. Do not interpret this proposed MVP subset as approval to remove web or mobile requirements.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Access a Personal Account (Priority: P1)

As an individual, I want to sign in to my own account so that my expenses and balances are private to me.

**Why this priority**: Account identity is necessary to associate activity with people and protect personal financial information.

**Independent Test**: Create two accounts, sign in separately, and verify that each can access their own information but not the other account's private account view.

**Acceptance Scenarios**:

1. **Given** a registered account, **When** its owner provides valid sign-in credentials, **Then** the user is signed in and can view their account's expenses and balances.
2. **Given** an account, **When** a person provides invalid sign-in credentials, **Then** access is denied and no private account information is shown.
3. **Given** two separate accounts, **When** either user views their personal information, **Then** the view does not expose the other user's private account information.

### User Story 2 - Organize People into a Group (Priority: P1)

As a group creator, I want to create and manage a group so that expenses and balances can be shared among the intended participants.

**Why this priority**: Groups provide the shared context for expense entry, review, notifications, and balance tracking.

**Independent Test**: Create a group, add members, view its membership, and verify group expenses are associated with that group.

**Acceptance Scenarios**:

1. **Given** a signed-in user, **When** they create a group with a name, **Then** the group exists and its creator is a member.
2. **Given** a group creator or manager, **When** they add or remove a member, **Then** the displayed membership reflects that change.
3. **Given** a user who is not a group member, **When** they attempt to view that group's expenses or balances, **Then** the group information is not disclosed.
4. **Given** a removed member, **When** they access their account, **Then** they can view their own historical group records and outstanding settlement details but cannot access current group activity.

### User Story 3 - Submit and Review a Shared Expense (Priority: P1)

As an expense submitter, I want to record who paid, who shares an expense, and how it is allocated, then have it reviewed so group members can rely on approved expense records.

**Why this priority**: Expense capture and review are the source of the shared financial records.

**Independent Test**: Submit an expense with a payer and group participants, review it as an authorized reviewer, and verify it becomes active only after approval.

**Acceptance Scenarios**:

1. **Given** a group member and an active group, **When** they submit an expense with amount, date, description, one payer, and participants, **Then** the expense is saved as pending review and does not change balances.
2. **Given** an expense with equal allocation, **When** it is submitted, **Then** all selected participants receive equal shares whose total equals the expense amount.
3. **Given** an expense with percentage allocation, **When** it is submitted with valid percentages totaling 100%, **Then** participant shares reflect those percentages and total the expense amount.
4. **Given** an authorized reviewer and a pending expense, **When** the reviewer approves it, **Then** the expense becomes approved and is included in balance calculations.
5. **Given** an authorized reviewer and a pending expense, **When** the reviewer rejects it, **Then** it is marked rejected, does not change balances, and the submitter can see its review outcome.
6. **Given** an expense submission, **When** an optional receipt image is attached, **Then** the image is associated with that expense and can be viewed by authorized group members.
7. **Given** an approved expense, **When** the payer is not one of its participants, **Then** the participants' allocated shares are recorded as owed to that payer.
8. **Given** an allocation produces leftover minor currency units, **When** the shares are rounded, **Then** those units are assigned to participants with the largest fractional remainders, with ties resolved by participant entry order.
9. **Given** an approved expense, **When** the payer is also a participant, **Then** the payer's own allocated share is not treated as an amount owed to themselves.

### User Story 4 - Receive Group Expense Notifications (Priority: P2)

As a group member, I want to know when another member creates an expense so that I can review relevant activity.

**Why this priority**: Timely awareness helps members review expenses and understand changes in their group.

**Independent Test**: Submit an expense as one member and verify other eligible group members receive an in-product notification identifying the new expense.

**Acceptance Scenarios**:

1. **Given** a group with multiple members, **When** one member submits an expense, **Then** the other group members receive an in-product notification that identifies the expense and its pending status.
2. **Given** a user who is not a member of the expense's group, **When** an expense is submitted, **Then** that user receives no notification or expense details.

### User Story 5 - Track and Settle Balances (Priority: P1)

As a group member, I want to see amounts owed between members and record payments so that balances reflect approved expenses and settlements.

**Why this priority**: Accurate balances and payments are the central value of shared expense tracking.

**Independent Test**: Approve an expense, inspect each participant's obligations, record a partial and then a final payment, and verify the remaining balances after each payment.

**Acceptance Scenarios**:

1. **Given** approved expenses in a group, **When** a member views group balances, **Then** the product displays the amount owed by each user to each other user.
2. **Given** an unapproved or rejected expense, **When** balances are calculated, **Then** that expense has no effect on balances.
3. **Given** an amount owed, **When** the payer records a payment to the payee, **Then** the payment is recorded and the remaining amount owed is reduced by the payment amount.
4. **Given** a payment greater than the amount owed to a payee, **When** a user attempts to record it, **Then** the product rejects it and shows the amount currently owed.

### User Story 6 - Review Expense and Payment Reports (Priority: P2)

As a user, I want to review summaries and filter reports so that I can understand group and personal financial activity.

**Why this priority**: Reports make recorded expenses, balances, and settlements useful for ongoing decisions.

**Independent Test**: Create approved expenses and payments across multiple dates, request summaries for a selected period, and verify only matching records are included.

**Acceptance Scenarios**:

1. **Given** recorded expenses, balances, and payments, **When** a user opens a summary, **Then** each category is presented separately and reflects the underlying records.
2. **Given** a valid date range and report parameters, **When** a user requests a report, **Then** the report includes records matching the selected range and parameters and excludes non-matching records.
3. **Given** a user requests a report, **When** the selected range contains no matching records, **Then** the report clearly indicates that there are no matching results.

### Edge Cases

- An expense amount must be greater than zero; missing required amount, date, description, payer, or participants prevents submission and identifies the invalid fields.
- Percentage allocations must each be between 0% and 100% and must total exactly 100%; any other total is rejected with a clear validation message.
- Equal or percentage splits that produce fractional minor currency units must reconcile to the original amount; leftover units go to participants with the largest fractional remainders, with ties resolved by participant entry order.
- Duplicate submission attempts must not create duplicate active expenses or duplicate balance changes.
- A rejected expense, a pending expense, or a cancelled submission does not affect balances.
- A payment of zero or a negative amount is rejected; a payment cannot silently over-settle a debt.
- Removing a member must not erase that member's historical expenses, approvals, or payments; it revokes current group access while preserving their own historical records and outstanding settlement details.
- Users with no groups, no expenses, or no payments receive an empty state rather than a misleading zero-activity report.
- A receipt that cannot be opened or is not an allowed image is not attached; the user receives a clear explanation.
- A date range with an end date earlier than its start date is rejected.
- Notifications and reports must not disclose activity to people outside the relevant group or account.

## Requirements *(mandatory)*

### Functional Requirements

| ID | Requirement | Acceptance criteria | Coverage |
|---|---|---|---|
| FR-001 | The product MUST provide an individual account for each user and require sign-in before displaying private user information. | User Story 1, scenarios 1-3. | Full scope; Swing MVP |
| FR-002 | The product MUST allow an authorized user to create a group and manage its membership, including revoking current access when a member is removed while preserving that member's own historical records and outstanding settlements. | User Story 2, scenarios 1-4; edge case 7. | Full scope; Swing MVP |
| FR-003 | The product MUST allow a group member to submit an expense with amount, date, description, one separately identified payer, selected participants, and their allocation. | User Story 3, scenarios 1-3 and 7; edge case 1. | Full scope; Swing MVP |
| FR-004 | The product MUST support equal and percentage-based expense allocations; each percentage must be from 0% through 100%, percentages must total exactly 100%, and rounding leftovers must be assigned by largest fractional remainder with ties broken by participant entry order. | User Story 3, scenarios 2-3 and 8; edge cases 2-3. | Full scope; Swing MVP |
| FR-005 | The product MUST allow an optional receipt image to be attached to an expense and viewed by authorized group members. | User Story 3, scenario 6; edge case 9. | Full scope; Swing MVP |
| FR-006 | The product MUST support review and approval or rejection of submitted expenses before they affect balances. | User Story 3, scenarios 1, 4-5; edge case 5. | Full scope; Swing MVP |
| FR-007 | The product MUST notify other members of the relevant group when a member submits an expense. | User Story 4, scenarios 1-2. | Full scope; Swing MVP |
| FR-008 | The product MUST calculate and display amounts owed by each user to every other user based on approved expenses; a payer's own allocated share MUST NOT be treated as owed to themselves. | User Story 3, scenarios 7 and 9; User Story 5, scenarios 1-2. | Full scope; Swing MVP |
| FR-009 | The product MUST allow users to record payments toward amounts owed and update remaining balances; a payment greater than the amount owed to the selected payee MUST be rejected with the current amount due shown. | User Story 5, scenarios 3-4; edge case 6. | Full scope; Swing MVP |
| FR-010 | The product MUST provide expense, balance, and payment summaries and reports filterable by date range and other report parameters. | User Story 6, scenarios 1-3; edge case 10. | Full scope; basic summaries and date filtering in Swing MVP |
| FR-011 | The product MUST enforce account and group access boundaries for private information, group records, receipts, and notifications. | User Stories 1, 2, and 4; edge cases 11. | Full scope; Swing MVP |
| FR-012 | The product MUST be primarily web-based and also be available as applications for Android and iOS. | Each supported platform allows its users to complete the account, group, expense, review, balance, payment, and reporting journeys without loss of core records. | Full scope; **not covered by the proposed Swing MVP** |

### Non-Functional Requirements

| ID | Requirement | Acceptance criteria |
|---|---|---|
| NFR-001 | Financial allocations and payments MUST remain accurate and reconcile to their source amounts. | For equal and percentage splits, including values requiring rounding, the sum of participant allocations equals the expense amount exactly; leftover minor units go to the largest fractional remainders, with ties broken by participant entry order; after payments, the remaining obligation equals the approved obligation less recorded payments. |
| NFR-002 | Private account and group information MUST be protected from unauthorized access. | In access-control tests, a signed-in user cannot view another account's private information or a non-member group's expenses, receipts, balances, reports, or notifications. |
| NFR-003 | The product MUST give clear, actionable feedback for invalid input and unsuccessful actions. | For every validation case in Edge Cases, the user sees which action failed and what correction is needed; no failed submission is presented as successful. |
| NFR-004 | Common user actions MUST provide responsive feedback under the proposed normal-use target. | In a representative test with up to 100 active users, at least 95% of account, group, expense, balance, payment, and report actions complete or show a result within 2 seconds, excluding user-controlled image transfer time. This is a proposed target to confirm during planning. |
| NFR-005 | Core expense and settlement workflows MUST be usable by representative non-technical users. | At least 85% of test participants complete account sign-in, group expense submission, expense review, and payment recording without assistance in moderated usability testing. |

### Key Entities

- **User account**: An individual identity with sign-in credentials and access to that user's personal information.
- **Group**: A named set of users whose shared expenses, review activity, notifications, balances, and payments are tracked together.
- **Membership**: A user's participation and permissions within a group, including whether access is current or removed.
- **Expense**: A proposed or reviewed charge with an amount, date, description, submitter, one payer, group, participants, allocation method, participant shares, optional receipt, and review status.
- **Allocation**: The share of an expense assigned to a participant, calculated equally or by percentage.
- **Review decision**: An approval or rejection of a submitted expense by an authorized reviewer.
- **Notification**: An activity notice sent to an eligible group member about a submitted expense.
- **Balance**: The current net amount one user owes another, derived from approved expenses (including the payer and participants' allocations) and recorded payments.
- **Payment**: A recorded amount transferred toward settling an obligation, with payer, payee, date, and amount.
- **Report**: A summary or filtered view of expenses, balances, and payments for a user or group.
- **Receipt image**: An optional image associated with an expense.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In acceptance testing, 95% of users with valid credentials can reach their own expense and balance information without exposing another account's private information.
- **SC-002**: In acceptance testing, 90% of first-time users complete group creation and expense submission with participants and an allocation in 3 minutes or less.
- **SC-003**: Across tested equal and percentage splits, the participant allocations reconcile to the expense amount with zero unexplained remainder.
- **SC-004**: Across tested approval and rejection paths, 100% of pending and rejected expenses leave balances unchanged, and 100% of approved expenses are reflected in balances.
- **SC-005**: Across tested settlement cases, 100% of recorded payments are reflected in the remaining balances and payment summaries.
- **SC-006**: In report verification tests, 100% of returned records match the selected date range and parameters.
- **SC-007**: Before release of the complete product, account, group, expense, approval, balance, payment, and reporting journeys are available on the requested web, Android, and iOS platforms, or an explicitly approved scope change records the platforms excluded.

## Assumptions

- A user account is individually owned; group membership does not grant access to unrelated personal records.
- A group creator is initially authorized to manage membership and designate expense reviewers.
- The proposed MVP uses one designated reviewer per expense; the complete product may support more than one approval level as groups require.
- Expense notifications are in-product notifications for the proposed MVP; other delivery channels are not required by the source customer request.
- Payments are records of settlements entered by users; direct bank transfers and payment processing are not specified.
- The currency is selected for each group or expense context and remains consistent within a single expense. The customer has not specified multiple-currency conversion.
- When the payer also participates, the payer's allocated share offsets their own paid amount and creates no debt owed to themselves.
- Expense allocations are rounded to the currency's minor unit using the confirmed largest-fractional-remainder rule and participant entry order for ties.
- The proposed Swing MVP provides a functional desktop subset for evaluation and does not claim to satisfy the requested web, Android, or iOS delivery platforms.
- The 100-active-user response target and 85% usability target are proposed planning baselines, not customer-specified commitments.
- The constitution's Java 21, Maven, Swing, JUnit 5, and PlantUML choices are implementation decisions. This specification describes user outcomes and does not define code, APIs, or internal architecture.

## Open Questions

1. What delivery strategy will satisfy the requested primarily web-based product and Android/iOS applications, given the separately proposed Swing desktop MVP? This decision, or an explicit customer-approved scope change, is required before implementation planning.
2. Does the customer approve the proposed Swing MVP subset and its single-reviewer approval flow, or should the MVP include additional requirements or multiple approval levels?
3. Which currencies and currency-display rules are required, and should expenses in different currencies be supported?
4. What report parameters beyond date range are required, and should reports be exportable?
5. Should expense notifications be delivered only in-product, or also through email, push notifications, or other channels?
6. What sign-in method and account recovery options should users have?
