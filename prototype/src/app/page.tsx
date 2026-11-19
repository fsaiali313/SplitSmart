import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { addMember, createGroup, recordExpense } from "./actions";
import EntryForm from "./entry-form";

export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

export default async function Home({ searchParams }: { searchParams: Promise<{ group?: string | string[] }> }) {
  const { group: groupParam } = await searchParams;
  const selectedId = Array.isArray(groupParam) ? groupParam[0] : groupParam;
  const groups = await db.group.findMany({
    select: { id: true, name: true },
    orderBy: [{ name: "asc" }, { id: "asc" }],
  });
  const activeId = selectedId ?? groups[0]?.id;
  const group = activeId ? await db.group.findUnique({
    where: { id: activeId },
    include: {
      members: { orderBy: [{ joinedAt: "asc" }, { id: "asc" }] },
      expenses: {
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        include: { payer: true, shares: { orderBy: { position: "asc" }, include: { member: true } } },
      },
    },
  }) : null;

  const balances = new Map(group?.members.map(({ id }) => [id, BigInt(0)]));
  if (group) {
    for (const expense of group.expenses) {
      balances.set(expense.payerId, (balances.get(expense.payerId) ?? BigInt(0)) + BigInt(expense.amountCents));
      for (const share of expense.shares) {
        balances.set(share.memberId, (balances.get(share.memberId) ?? BigInt(0)) - BigInt(share.cents));
      }
    }
  }

  return (
    <>
      <header className="border-b border-teal-900 bg-teal-950 text-white">
        <div className="mx-auto max-w-6xl px-5 py-5">
          <Link href="/" className="text-xl font-bold tracking-tight">SplitSmart</Link>
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl gap-6 px-5 py-8 md:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="panel self-start">
          <h2>Your groups</h2>
          <nav aria-label="Groups" className="my-4">
            {groups.length ? (
              <ul className="grid gap-1">
                {groups.map(({ id, name }) => (
                  <li key={id}>
                    <Link href={`/?group=${id}`} aria-current={id === group?.id ? "page" : undefined}
                      className="block break-words rounded-lg px-3 py-2 hover:bg-teal-50 aria-[current=page]:bg-teal-100 aria-[current=page]:font-semibold">
                      {name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : <p className="muted">No groups yet.</p>}
          </nav>
          <EntryForm save={createGroup} button="Create group">
            <label>Group name<input name="name" placeholder="e.g. Weekend trip" maxLength={80} required /></label>
          </EntryForm>
        </aside>

        {group ? (
          <div key={group.id} className="grid min-w-0 gap-6">
            <h1 className="break-words text-3xl font-bold tracking-tight">{group.name}</h1>
            <div className="grid items-start gap-6 lg:grid-cols-2">
              <section className="panel" aria-labelledby="members-heading">
                <h2 id="members-heading">Members</h2>
                {group.members.length ? (
                  <ul className="my-4 divide-y divide-slate-100">
                    {group.members.map(({ id, name }) => (
                      <li key={id} className="break-words py-2">{name}</li>
                    ))}
                  </ul>
                ) : <p className="muted my-4">Add members to start recording expenses.</p>}
                <EntryForm save={addMember.bind(null, group.id)} button="Add member">
                  <label>Member name<input name="name" maxLength={80} required /></label>
                </EntryForm>
              </section>

              <section className="panel" aria-labelledby="expense-heading">
                <h2 id="expense-heading">Record an expense</h2>
                {group.members.length ? (
                  <div className="mt-4">
                    <EntryForm save={recordExpense.bind(null, group.id)} button="Record expense">
                      <label>Description<input name="description" maxLength={200} required /></label>
                      <label>Amount (USD)<input name="amount" inputMode="decimal" placeholder="0.00" required /></label>
                      <label>Paid by
                        <select name="payer" defaultValue="" required>
                          <option value="" disabled>Choose a payer</option>
                          {group.members.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
                        </select>
                      </label>
                      <fieldset className="grid gap-2">
                        <legend className="mb-2 text-sm font-semibold">Split equally among</legend>
                        {group.members.map(({ id, name }) => (
                          <label key={id} className="flex items-start gap-2 break-all">
                            <input type="checkbox" name="participant" value={id} />
                            {name}
                          </label>
                        ))}
                      </fieldset>
                    </EntryForm>
                  </div>
                ) : <p className="muted mt-4">An expense needs at least one group member.</p>}
              </section>
            </div>

            <section className="panel" aria-labelledby="balances-heading">
              <h2 id="balances-heading">Balances</h2>
              {group.members.length ? (
                <ul className="mt-3 divide-y divide-slate-100">
                  {group.members.map(({ id, name }) => {
                    const cents = balances.get(id) ?? BigInt(0);
                    return (
                      <li key={id} className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-3">
                        <span className="min-w-0 break-words font-medium">{name}</span>
                        <span className={cents > 0 ? "font-semibold text-teal-800" : "text-slate-700"}>
                          {cents > 0 ? `Should receive ${formatMoney(cents)}`
                            : cents < 0 ? `Owes ${formatMoney(-cents)}` : "Settled · $0.00"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : <p className="muted mt-3">Balances appear when you add members.</p>}
            </section>

            <section className="panel" aria-labelledby="history-heading">
              <h2 id="history-heading">Expense history</h2>
              {group.expenses.length ? (
                <ul className="mt-3 divide-y divide-slate-100">
                  {group.expenses.map((expense) => (
                    <li key={expense.id} className="py-4">
                      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                        <h3 className="min-w-0 break-words font-semibold">{expense.description}</h3>
                        <strong className="tabular-nums">{formatMoney(expense.amountCents)}</strong>
                      </div>
                      <p className="muted mt-1 break-words">
                        Paid by {expense.payer.name} · <time dateTime={expense.createdAt.toISOString()}>{dateFormat.format(expense.createdAt)}</time>
                      </p>
                      <ul aria-label="Participant shares" className="mt-2 flex flex-wrap gap-2">
                        {expense.shares.map(({ memberId, member, cents }) => (
                          <li key={memberId} className="max-w-full break-words rounded-md bg-slate-100 px-2 py-1 text-sm">
                            {member.name} · {formatMoney(cents)}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              ) : <p className="muted mt-3">No expenses recorded yet.</p>}
            </section>
          </div>
        ) : (
          <section className="panel self-start">
            <h1 className="text-2xl font-bold">{selectedId ? "Group not found" : "Create your first group"}</h1>
            <p className="muted mt-2">{selectedId ? "Choose an existing group or create one." : "Add members and record the expenses you share."}</p>
          </section>
        )}
      </main>
    </>
  );
}
