"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

const statuses = ["new", "contacted", "closed", "archived"] as const;

type LeadStatus = (typeof statuses)[number];

const labels: Record<LeadStatus, string> = {
  new: "Novo",
  contacted: "Respondido",
  closed: "Fechado",
  archived: "Arquivado",
};

function isLeadStatus(value: string): value is LeadStatus {
  return statuses.includes(value as LeadStatus);
}

export function LeadStatusControl({
  leadId,
  currentStatus,
  statusFilter,
  metadata,
}: {
  leadId: string;
  currentStatus: string;
  statusFilter: string;
  metadata: Record<string, unknown>;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<LeadStatus>(
    isLeadStatus(currentStatus) ? currentStatus : "new",
  );
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  async function saveStatus() {
    setMessage("");
    const supabase = getSupabaseBrowserClient();
    const databaseStatus = status === "new" ? "new" : "contacted";
    const { error } = await supabase
      .from("leads")
      .update({
        status: databaseStatus,
        metadata: {
          ...metadata,
          adminStatus: status,
        },
      })
      .eq("id", leadId);

    if (error) {
      console.error("Erro ao salvar status do lead:", error);
      setMessage(`Nao foi possivel salvar: ${error.message}`);
      return;
    }

    startTransition(() => {
      const nextStatus = statusFilter === "all" ? "all" : status;
      router.replace(`/admin?status=${nextStatus}&statusUpdate=success`);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-1">
      <div className="flex min-w-[150px] items-center gap-2">
        <select
          value={status}
          onChange={(event) => {
            const value = event.target.value;
            if (isLeadStatus(value)) {
              setStatus(value);
            }
          }}
          className="h-8 rounded-md border bg-background px-2 text-xs"
        >
          {statuses.map((value) => (
            <option key={value} value={value}>
              {labels[value]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={saveStatus}
          disabled={isPending}
          className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2 text-xs font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
        >
          {isPending ? "Salvando" : "Salvar"}
        </button>
      </div>
      {message ? <p className="text-xs text-destructive">{message}</p> : null}
    </div>
  );
}
