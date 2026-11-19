"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { parseCents, splitEqually } from "@/lib/money";

type Result = { error: string } | { groupId?: string };

function readText(data: FormData, field: string) {
  const value = data.get(field);
  return typeof value === "string" ? value.trim() : "";
}

export async function createGroup(data: FormData): Promise<Result> {
  const name = readText(data, "name");
  if (!name || name.length > 80) return { error: "Enter a group name of 1–80 characters." };

  const group = await db.group.create({ data: { name } });
  revalidatePath("/");
  return { groupId: group.id };
}

export async function addMember(groupId: string, data: FormData): Promise<Result> {
  const name = readText(data, "name");
  if (!name || name.length > 80) return { error: "Enter a member name of 1–80 characters." };

  const group = await db.group.findUnique({ where: { id: groupId }, select: { id: true } });
  if (!group) return { error: "This group no longer exists. Choose another group." };

  await db.member.create({ data: { groupId, name } });
  revalidatePath("/");
  return {};
}

export async function recordExpense(groupId: string, data: FormData): Promise<Result> {
  const description = readText(data, "description");
  if (!description || description.length > 200) {
    return { error: "Enter an expense description of 1–200 characters." };
  }

  const amountCents = parseCents(readText(data, "amount"));
  if (amountCents === null) {
    return { error: "Enter an amount from $0.01 to $21,474,836.47 with up to two decimal places." };
  }

  const payerId = readText(data, "payer");
  if (!payerId) return { error: "Choose who paid." };

  const participants = data.getAll("participant");
  const participantIds = participants.filter((id): id is string => typeof id === "string" && id !== "");
  if (!participantIds.length) return { error: "Select at least one participant." };
  if (participantIds.length !== participants.length || new Set(participantIds).size !== participantIds.length) {
    return { error: "Select each participant only once." };
  }

  const members = await db.member.findMany({ where: { groupId }, select: { id: true } });
  const memberIds = new Set(members.map(({ id }) => id));
  if (!memberIds.has(payerId)) return { error: "The payer must belong to this group." };
  if (participantIds.some((id) => !memberIds.has(id))) {
    return { error: "Every participant must belong to this group." };
  }

  await db.expense.create({
    data: {
      groupId,
      payerId,
      description,
      amountCents,
      shares: { createMany: { data: splitEqually(amountCents, participantIds) } },
    },
  });
  revalidatePath("/");
  return {};
}
