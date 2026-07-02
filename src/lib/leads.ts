import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const leadSchema = z.object({
  name: z.string().min(2),
  contact: z.string().min(5),
  message: z.string().min(8),
  source: z.string().default("site"),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

export async function createLead(input: LeadInput) {
  const parsed = leadSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      configured: false,
      message: "Preencha nome, contato e mensagem com detalhes suficientes.",
    };
  }

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return {
      ok: true,
      configured: false,
      message: "Lead validado localmente. Configure o Supabase para salvar no banco.",
    };
  }

  const { error } = await supabase.from("leads").insert(parsed.data);

  if (error) {
    return {
      ok: false,
      configured: true,
      message: "Não foi possível salvar o lead. Verifique Supabase/RLS.",
    };
  }

  return {
    ok: true,
    configured: true,
    message: "Mensagem enviada. A equipe retornará em breve.",
  };
}
