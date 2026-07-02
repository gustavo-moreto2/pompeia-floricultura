"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import {
  saveContentSettings,
  saveDeliverySettings,
  saveGallerySettings,
  saveProductSettings,
  saveSeoSettings,
  type ActionState,
} from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductEditor } from "@/components/product-editor";
import { Textarea } from "@/components/ui/textarea";
import type { SiteContent } from "@/lib/api-data";

const initialState: ActionState = { ok: false, message: "" };

function SubmitRow({
  isPending,
  state,
  label = "Salvar alteracoes",
}: {
  isPending: boolean;
  state: ActionState;
  label?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Button type="submit" disabled={isPending} className="w-fit">
        <Save data-icon="inline-start" />
        {isPending ? "Salvando..." : label}
      </Button>
      {state.message ? (
        <p className={state.ok ? "text-sm text-primary" : "text-sm text-destructive"}>
          {state.message}
        </p>
      ) : null}
    </div>
  );
}

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

function deliveryToText(content: SiteContent) {
  return content.delivery.regionalCities
    .map((item) => `${item.city} | ${item.fee} | ${item.deadline}`)
    .join("\n");
}

export function ContentSettingsForm({ content }: { content: SiteContent }) {
  const [state, action, isPending] = useActionState(saveContentSettings, initialState);

  return (
    <form action={action} className="grid gap-5">
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
      <SubmitRow isPending={isPending} state={state} />
    </form>
  );
}

export function ProductsSettingsForm({ content }: { content: SiteContent }) {
  const [state, action, isPending] = useActionState(saveProductSettings, initialState);

  return (
    <form action={action} className="grid gap-5">
      <ProductEditor products={content.products} />
      <SubmitRow isPending={isPending} state={state} label="Salvar produtos" />
    </form>
  );
}

export function DeliverySettingsForm({ content }: { content: SiteContent }) {
  const [state, action, isPending] = useActionState(saveDeliverySettings, initialState);

  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="originCity">Cidade base</Label>
          <Input
            id="originCity"
            name="originCity"
            defaultValue={content.delivery.originCity}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="originState">UF</Label>
          <Input
            id="originState"
            name="originState"
            maxLength={2}
            defaultValue={content.delivery.originState}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="localFee">Taxa local</Label>
          <Input
            id="localFee"
            name="localFee"
            type="number"
            min="0"
            step="0.01"
            defaultValue={content.delivery.localFee}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="localDeadline">Prazo local</Label>
        <Input
          id="localDeadline"
          name="localDeadline"
          defaultValue={content.delivery.localDeadline}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="regionalCities">Cidades proximas</Label>
        <Textarea
          id="regionalCities"
          name="regionalCities"
          rows={7}
          defaultValue={deliveryToText(content)}
        />
        <p className="text-xs text-muted-foreground">
          Uma linha por cidade: Cidade | taxa | prazo.
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="unavailableMessage">Mensagem fora da area</Label>
        <Textarea
          id="unavailableMessage"
          name="unavailableMessage"
          rows={3}
          defaultValue={content.delivery.unavailableMessage}
        />
      </div>
      <SubmitRow isPending={isPending} state={state} label="Salvar frete" />
    </form>
  );
}

export function GallerySettingsForm({ content }: { content: SiteContent }) {
  const [state, action, isPending] = useActionState(saveGallerySettings, initialState);

  return (
    <form action={action} className="grid gap-5">
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
      <SubmitRow isPending={isPending} state={state} />
    </form>
  );
}

export function SeoSettingsForm({ content }: { content: SiteContent }) {
  const [state, action, isPending] = useActionState(saveSeoSettings, initialState);

  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="seoTitle">Título SEO</Label>
        <Input id="seoTitle" name="seoTitle" defaultValue={content.seo.title} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="seoDescription">Descrição meta</Label>
        <Textarea
          id="seoDescription"
          name="seoDescription"
          rows={3}
          defaultValue={content.seo.description}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="seoKeywords">Palavras-chave locais</Label>
        <Textarea
          id="seoKeywords"
          name="seoKeywords"
          rows={4}
          defaultValue={content.seo.keywords}
        />
        <p className="text-xs text-muted-foreground">
          Separe termos por virgula. Ex: floricultura em Piracicaba, buque Piracicaba.
        </p>
      </div>
      <SubmitRow isPending={isPending} state={state} label="Salvar SEO" />
    </form>
  );
}
