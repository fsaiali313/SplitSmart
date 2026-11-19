"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent, type ReactNode } from "react";

type Props = {
  save: (data: FormData) => Promise<{ error: string } | { groupId?: string }>;
  button: string;
  children: ReactNode;
};

export default function EntryForm({ save, button, children }: Props) {
  const router = useRouter();
  const participantOrder = useRef<string[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const selected = data.getAll("participant");
    if (selected.length) {
      data.delete("participant");
      const ordered = new Set([...participantOrder.current, ...selected]);
      for (const id of ordered) {
        if (selected.includes(id)) data.append("participant", id);
      }
    }

    setPending(true);
    setError("");
    try {
      const result = await save(data);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      form.reset();
      participantOrder.current = [];
      if (result.groupId) router.push(`/?group=${result.groupId}`);
    } catch {
      setError("Could not submit your changes. Refresh the page and check whether they were saved before retrying.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      onInput={(event) => {
        const input = event.target;
        if (!(input instanceof HTMLInputElement) || input.name !== "participant") return;
        participantOrder.current = input.checked
          ? [...participantOrder.current, input.value]
          : participantOrder.current.filter((id) => id !== input.value);
      }}
      noValidate
    >
      <fieldset disabled={pending} className="grid gap-3">
        {children}
        <button type="submit">{pending ? "Saving…" : button}</button>
      </fieldset>
      {error && <p role="alert" className="mt-3 text-sm font-medium text-red-700">{error}</p>}
    </form>
  );
}
