# SplitSmart Lab 9 prototype

Create a group, add members, and record USD expenses. The payer and everyone sharing the expense must belong to the selected group. The payer can also share the expense. Group balances show the net amount each member owes or should receive.

## Run locally

From the repository root:

```sh
cd prototype
# If dependencies are missing, run npm ci first.
test -f .env || printf '%s\n' 'DATABASE_URL="file:./dev.db"' > .env
npx prisma db push
npm run dev
```

Open http://localhost:3000 or use the forwarded port 3000 in Codespaces. With the default configuration, records are stored in `prisma/dev.db` and persist across refreshes and server restarts.

Each expense is stored in integer cents. Select participants in the order they should receive leftover cents. For a $10 split three ways, the first selected person gets a $3.34 share and the other two get $3.33 each. Each member's balance is the total they paid minus the total of their shares.

Run `npm run lint` for lint checks and `npm run build` for a production build.
