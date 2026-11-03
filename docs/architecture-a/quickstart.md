# Quickstart: SplitSmart validation guide

This guide documents the expected validation scenarios for the feature once the application is implemented. It is intentionally focused on end-to-end workflow verification rather than source code details.

## Prerequisites

- Java 21 and Maven installed
- Project checkout with the feature branch `001-shared-expense-management`
- Accessible local test data or a test database configuration for desktop validation
- A human reviewer available to validate screenshots, business logic, and acceptance criteria

## Setup

1. Open a terminal at the repository root.
2. Ensure the Java 21 toolchain is active.
3. Run the project test command once the application is implemented, for example:

```bash
mvn test
```

## Validation scenarios

### 1) Account access and authorization

- Create two user accounts.
- Sign in as each account in turn.
- Verify that each user sees only their own private account data.
- Expected result: access to other users’ private data is denied.

### 2) Group creation and membership management

- Create a group named for an example trip or household.
- Add at least two members.
- Remove one member and verify that the member retains their own historical records while losing current group access.
- Expected result: group membership changes are reflected accurately and access is enforced.

### 3) Expense submission and approval

- Create a valid expense with amount, date, description, payer, participants, and a split method.
- Submit equal and percentage allocations in separate runs.
- Approve one expense and reject another.
- Expected result:
  - pending expenses do not affect balances
  - approved expenses affect balances
  - rejected expenses do not affect balances

### 4) Exact rounding and settlement calculations

- Use an expense that produces leftover minor currency units after splitting.
- Verify that the leftover units are assigned to the participants with the largest fractional remainders and ties are broken by participant entry order.
- Record a payment that is less than the amount owed, then one that equals the amount owed.
- Expected result: the balance ledger matches the approved obligations minus settled payments.

### 5) Notifications and access restrictions

- Submit an expense as one group member.
- Confirm that eligible group members receive an in-product notification.
- Confirm that non-members do not receive it.
- Expected result: notifications are scoped to the correct group context.

### 6) Reporting and empty-state flows

- Generate a report for a date range containing data.
- Generate a report for a date range with no matching records.
- Verify balancing, payment, and summary views separately.
- Expected result: only matching records are shown; empty ranges render a clear no-results message.

## Expected outcomes

- Validation of all acceptance scenarios in the feature specification passes.
- Balance totals reconcile exactly to approved expenses and recorded payments.
- Unauthorized users cannot see private account information, receipts, or group activities.
- Payment attempts beyond the current debt are rejected and show the current amount due.
- The desktop MVP remains bounded to the approved evaluation scope while the broader web/mobile platform requirement remains a separate product decision.
