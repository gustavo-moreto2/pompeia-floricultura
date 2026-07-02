"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { submitLead, type ActionState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProductItem } from "@/lib/api-data";

const initialState: ActionState = { ok: false, message: "" };

export function LeadForm({ products = [] }: { products?: ProductItem[] }) {
  const [state, action, isPending] = useActionState(submitLead, initialState);
  const visibleProducts = products.filter((product) => product.active !== false);

  return (
    <form action={action} className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name" className="sr-only">Nome</Label>
        <Input id="name" name="name" placeholder="Nome" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact" className="sr-only">WhatsApp ou e-mail</Label>
        <Input
          id="contact"
          name="contact"
          placeholder="Como podemos retornar?"
          required
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="product" className="sr-only">Produto desejado</Label>
          <select
            id="product"
            name="product"
            className="h-10 rounded-md border bg-background px-3 text-sm"
            defaultValue=""
          >
            <option value="">Produto desejado</option>
            {visibleProducts.map((product) => (
              <option key={product.title} value={product.title}>
                {product.title}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cep" className="sr-only">CEP</Label>
          <Input id="cep" name="cep" inputMode="numeric" placeholder="CEP de entrega" />
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="deliveryDate" className="sr-only">Data desejada</Label>
          <Input id="deliveryDate" name="deliveryDate" type="date" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="recipient" className="sr-only">Destinatario</Label>
          <Input id="recipient" name="recipient" placeholder="Nome do destinatario" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="message" className="sr-only">Mensagem</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Conte o que você procura"
          rows={4}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes" className="sr-only">Observacoes</Label>
        <Input id="notes" name="notes" placeholder="Observacao: horario, cartao, cores..." />
      </div>
      <Button type="submit" disabled={isPending} className="h-10 rounded-[3px] text-[12px]">
        <Send data-icon="inline-start" />
        {isPending ? "Enviando..." : "Enviar orçamento"}
      </Button>
      {state.message ? (
        <p className={state.ok ? "text-sm text-primary" : "text-sm text-destructive"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
