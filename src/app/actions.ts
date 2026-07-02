"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createLead } from "@/lib/leads";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { defaultDeliverySettings, type DeliveryCityRule } from "@/lib/delivery";

const settingsSchema = z.object({
  headline: z.string().min(5),
  subheadline: z.string().min(5),
  whatsapp: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  hours: z.string().optional(),
  services: z.string().optional(),
  mapQuery: z.string().optional(),
  whatsappMessage: z.string().optional(),
  products: z.string().optional(),
  gallery: z.string().optional(),
  reviews: z.string().optional(),
  faq: z.string().optional(),
});

const contentSettingsSchema = z.object({
  headline: z.string().min(5),
  subheadline: z.string().min(5),
  whatsapp: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  hours: z.string().optional(),
  services: z.string().optional(),
  mapQuery: z.string().optional(),
  whatsappMessage: z.string().optional(),
});

const deliverySettingsSchema = z.object({
  originCity: z.string().min(2),
  originState: z.string().min(2).max(2),
  localFee: z.coerce.number().min(0),
  localDeadline: z.string().min(3),
  regionalCities: z.string().optional(),
  unavailableMessage: z.string().min(5),
});

const seoSettingsSchema = z.object({
  seoTitle: z.string().min(5),
  seoDescription: z.string().min(20),
  seoKeywords: z.string().min(5),
});

export type ActionState = {
  ok: boolean;
  message: string;
};

function splitRows(value?: string) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseProducts(value?: string) {
  return splitRows(value).map((line) => {
    const [
      title = "",
      oldPrice = "",
      price = "",
      imagesOrIcon = "",
      promoValue = "",
      event = "",
      description = "",
      activeValue = "ativo",
    ] = line
      .split("|")
      .map((part) => part.trim());
    const imageValues = imagesOrIcon
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const images = imageValues.filter(
      (value) => value.startsWith("/") || value.startsWith("http"),
    );
    const icon = images.length ? undefined : imageValues[0];
    const promo = ["sim", "s", "yes", "true", "promo", "promocao", "promoção"].includes(
      promoValue.toLowerCase(),
    );
    const active = !["nao", "não", "false", "inativo", "off", "0"].includes(
      activeValue.toLowerCase(),
    );

    return {
      title,
      price,
      oldPrice,
      description,
      image: images[0],
      images,
      icon,
      promo,
      event,
      active,
    };
  });
}

function parseDeliveryRules(value?: string) {
  return splitRows(value).flatMap((line): DeliveryCityRule[] => {
    const [city = "", fee = "", deadline = ""] = line
      .split("|")
      .map((part) => part.trim());
    const parsedFee = Number(fee.replace(",", "."));

    if (!city || Number.isNaN(parsedFee)) {
      return [];
    }

    return [
      {
        city,
        fee: parsedFee,
        deadline: deadline || defaultDeliverySettings.localDeadline,
      },
    ];
  });
}

function parseGallery(value?: string) {
  return splitRows(value).map((line) => {
    const [caption = "", mediaUrl = "", permalink = ""] = line
      .split("|")
      .map((part) => part.trim());

    return { caption, mediaUrl, permalink };
  });
}

function parseReviews(value?: string) {
  return splitRows(value).map((line) => {
    const [name = "", text = ""] = line.split("|").map((part) => part.trim());
    return { name, text };
  });
}

function parseFaq(value?: string) {
  return splitRows(value).map((line) => {
    const [question = "", answer = ""] = line.split("|").map((part) => part.trim());
    return { question, answer };
  });
}

export async function submitLead(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = await createLead({
    name: String(formData.get("name") ?? ""),
    contact: String(formData.get("contact") ?? ""),
    message: String(formData.get("message") ?? ""),
    source: "site",
    metadata: {
      product: String(formData.get("product") ?? ""),
      cep: String(formData.get("cep") ?? ""),
      deliveryDate: String(formData.get("deliveryDate") ?? ""),
      recipient: String(formData.get("recipient") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      freightFee: String(formData.get("freightFee") ?? ""),
      freightDeadline: String(formData.get("freightDeadline") ?? ""),
      city: String(formData.get("city") ?? ""),
      state: String(formData.get("state") ?? ""),
    },
  });

  return { ok: result.ok, message: result.message };
}

async function getCurrentSettingsValue() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return { supabase: null, user: null, value: null };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, value: null };
  }

  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "site_content")
    .maybeSingle();

  return {
    supabase,
    user,
    value: (data?.value ?? {}) as Record<string, unknown>,
  };
}

async function saveSettingsPatch(patch: Record<string, unknown>) {
  const { supabase, user, value } = await getCurrentSettingsValue();

  if (!supabase) {
    return {
      ok: false,
      message: "Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  if (!user) {
    return { ok: false, message: "Faça login para alterar o site." };
  }

  const { error } = await supabase.from("settings").upsert(
    {
      key: "site_content",
      value: { ...(value ?? {}), ...patch },
      updated_by: user.id,
    },
    { onConflict: "key" },
  );

  if (error) {
    return { ok: false, message: "Erro ao salvar configurações." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true, message: "Conteúdo salvo e publicado no site." };
}

export async function saveContentSettings(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = contentSettingsSchema.safeParse({
    headline: formData.get("headline"),
    subheadline: formData.get("subheadline"),
    whatsapp: formData.get("whatsapp"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    hours: formData.get("hours"),
    services: formData.get("services"),
    mapQuery: formData.get("mapQuery"),
    whatsappMessage: formData.get("whatsappMessage"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Revise os campos obrigatórios." };
  }

  return saveSettingsPatch(parsed.data);
}

export async function saveProductSettings(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return saveSettingsPatch({
    products: parseProducts(String(formData.get("products") ?? "")),
  });
}

export async function saveGallerySettings(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return saveSettingsPatch({
    gallery: parseGallery(String(formData.get("gallery") ?? "")),
    reviews: parseReviews(String(formData.get("reviews") ?? "")),
    faq: parseFaq(String(formData.get("faq") ?? "")),
  });
}

export async function saveDeliverySettings(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = deliverySettingsSchema.safeParse({
    originCity: formData.get("originCity"),
    originState: formData.get("originState"),
    localFee: formData.get("localFee"),
    localDeadline: formData.get("localDeadline"),
    regionalCities: formData.get("regionalCities"),
    unavailableMessage: formData.get("unavailableMessage"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Revise as regras de frete." };
  }

  return saveSettingsPatch({
    delivery: {
      originCity: parsed.data.originCity,
      originState: parsed.data.originState.toUpperCase(),
      localFee: parsed.data.localFee,
      localDeadline: parsed.data.localDeadline,
      regionalCities: parseDeliveryRules(parsed.data.regionalCities),
      unavailableMessage: parsed.data.unavailableMessage,
    },
  });
}

export async function saveSeoSettings(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = seoSettingsSchema.safeParse({
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
    seoKeywords: formData.get("seoKeywords"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Revise os campos de SEO." };
  }

  return saveSettingsPatch({
    seo: {
      title: parsed.data.seoTitle,
      description: parsed.data.seoDescription,
      keywords: parsed.data.seoKeywords,
    },
  });
}

export async function saveSettings(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = settingsSchema.safeParse({
    headline: formData.get("headline"),
    subheadline: formData.get("subheadline"),
    whatsapp: formData.get("whatsapp"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    hours: formData.get("hours"),
    services: formData.get("services"),
    mapQuery: formData.get("mapQuery"),
    whatsappMessage: formData.get("whatsappMessage"),
    products: formData.get("products"),
    gallery: formData.get("gallery"),
    reviews: formData.get("reviews"),
    faq: formData.get("faq"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Revise os campos obrigatórios." };
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return {
      ok: false,
      message: "Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Faça login para alterar o site." };
  }

  const value = {
    headline: parsed.data.headline,
    subheadline: parsed.data.subheadline,
    whatsapp: parsed.data.whatsapp,
    phone: parsed.data.phone,
    address: parsed.data.address,
    hours: parsed.data.hours,
    services: parsed.data.services,
    mapQuery: parsed.data.mapQuery,
    whatsappMessage: parsed.data.whatsappMessage,
    products: parseProducts(parsed.data.products),
    gallery: parseGallery(parsed.data.gallery),
    reviews: parseReviews(parsed.data.reviews),
    faq: parseFaq(parsed.data.faq),
  };

  const { error } = await supabase.from("settings").upsert(
    {
      key: "site_content",
      value,
      updated_by: user.id,
    },
    { onConflict: "key" },
  );

  if (error) {
    return { ok: false, message: "Erro ao salvar configurações." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true, message: "Conteúdo salvo e publicado no site." };
}

export async function signOutAdmin() {
  const supabase = await getSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/admin");
}
