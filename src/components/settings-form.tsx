"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { saveSettings, type ActionState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductEditor } from "@/components/product-editor";
import { Textarea } from "@/components/ui/textarea";
import type { SiteContent } from "@/lib/api-data";

const initialState: ActionState = { ok: false, message: "" };

function galleryToText(content: SiteContent) {
  return content.gallery
    .map((item) => `${item.caption} | ${item.mediaUrl} | ${item.permalink}`)
    .join("\n");
}

function reviewsToText(content: SiteContent) {
  return content.reviews.map((item) => `${item.name} | ${item.text}`).join("\n");
}

function faqToText(content: SiteContent) {
  return content.faq.map((item) => `${item.question} | ${item.answer}`).join("\n");
}

export function SettingsForm({ content }: { content: SiteContent }) {
  const [state, action, isPending] = useActionState(saveSettings, initialState);

  return (
    <form action={action} className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="headline">Texto principal</Label>
        <Input id="headline" name="headline" defaultValue={content.headline} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="subheadline">Texto de apoio</Label>
        <Textarea
          id="subheadline"
          name="subheadline"
          rows={3}
          defaultValue={content.subheadline}
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" name="whatsapp" defaultValue={content.whatsapp} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" name="phone" defaultValue={content.phone} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="address">Endereco</Label>
        <Input id="address" name="address" defaultValue={content.address} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="mapQuery">Busca do Google Maps</Label>
        <Input
          id="mapQuery"
          name="mapQuery"
          defaultValue={content.mapQuery}
          placeholder="Floricultura Pompeia Piracicaba SP"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="hours">Horarios</Label>
        <Textarea id="hours" name="hours" rows={4} defaultValue={content.hours} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="services">Servicos e produtos</Label>
        <Textarea id="services" name="services" rows={4} defaultValue={content.services} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="whatsappMessage">Mensagem padrao do WhatsApp</Label>
        <Textarea
          id="whatsappMessage"
          name="whatsappMessage"
          rows={3}
          defaultValue={content.whatsappMessage}
        />
      </div>
      <ProductEditor products={content.products} />
      <div className="grid gap-2">
        <Label htmlFor="gallery">Galeria</Label>
        <Textarea id="gallery" name="gallery" rows={6} defaultValue={galleryToText(content)} />
        <p className="text-xs text-muted-foreground">
          Uma linha por imagem: Legenda | URL da imagem | link ao clicar.
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="reviews">Avaliacoes</Label>
        <Textarea id="reviews" name="reviews" rows={5} defaultValue={reviewsToText(content)} />
        <p className="text-xs text-muted-foreground">Uma linha por avaliacao: Nome | Texto.</p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="faq">FAQ</Label>
        <Textarea id="faq" name="faq" rows={6} defaultValue={faqToText(content)} />
        <p className="text-xs text-muted-foreground">Uma linha por pergunta: Pergunta | Resposta.</p>
      </div>
      <Button type="submit" disabled={isPending} className="w-fit">
        <Save data-icon="inline-start" />
        {isPending ? "Salvando..." : "Salvar alteracoes"}
      </Button>
      {state.message ? (
        <p className={state.ok ? "text-sm text-primary" : "text-sm text-destructive"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
