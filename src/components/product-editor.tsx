"use client";

import Image from "next/image";
import { ImagePlus, Loader2, Plus, Trash2, UploadCloud } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProductItem } from "@/lib/api-data";

type DraftProduct = {
  title: string;
  oldPrice: string;
  price: string;
  imageOrIcon: string;
  images: string[];
  promo: boolean;
  event: string;
  description: string;
  active: boolean;
};

const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function toDraft(product?: ProductItem): DraftProduct {
  return {
    title: product?.title ?? "",
    oldPrice: product?.oldPrice ?? "",
    price: product?.price ?? "",
    imageOrIcon: product?.image ?? product?.icon ?? "",
    images: product?.images?.length
      ? product.images
      : product?.image
        ? [product.image]
        : [],
    promo: Boolean(product?.promo),
    event: product?.event ?? "",
    description: product?.description ?? "",
    active: product?.active ?? true,
  };
}

function serializeProduct(product: DraftProduct) {
  return [
    product.title,
    product.oldPrice,
    product.price,
    product.images.length ? product.images.join(",") : product.imageOrIcon,
    product.promo ? "sim" : "nao",
    product.event,
    product.description,
    product.active ? "ativo" : "inativo",
  ].join(" | ");
}

function isImageValue(value: string) {
  return value.startsWith("/") || value.startsWith("http");
}

function uniqueImages(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function safeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function ProductEditor({ products }: { products: ProductItem[] }) {
  const [items, setItems] = useState<DraftProduct[]>(
    products.length ? products.map(toDraft) : [toDraft()],
  );
  const [uploading, setUploading] = useState<Record<number, boolean>>({});
  const [message, setMessage] = useState("");
  const fileInputs = useRef<Record<number, HTMLInputElement | null>>({});

  const serialized = useMemo(
    () =>
      items
        .filter((item) => item.title.trim())
        .map(serializeProduct)
        .join("\n"),
    [items],
  );

  function updateItem(index: number, patch: Partial<DraftProduct>) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  }

  function addItem() {
    setItems((current) => [...current, toDraft()]);
  }

  function removeItem(index: number) {
    setItems((current) =>
      current.length === 1 ? [toDraft()] : current.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  async function uploadFiles(index: number, files?: FileList | File[]) {
    const fileList = Array.from(files ?? []);
    if (!fileList.length) {
      return;
    }

    setMessage("");

    const invalidFile = fileList.find((file) => !acceptedImageTypes.includes(file.type));
    if (invalidFile) {
      setMessage("Use uma imagem JPG, PNG, WEBP ou GIF.");
      return;
    }

    if (fileList.some((file) => file.size > 5 * 1024 * 1024)) {
      setMessage("A imagem precisa ter ate 5 MB.");
      return;
    }

    setUploading((current) => ({ ...current, [index]: true }));

    try {
      const supabase = getSupabaseBrowserClient();
      const item = items[index];
      const publicUrls: string[] = [];

      for (const file of fileList) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const base = safeName(item.title || file.name.replace(/\.[^.]+$/, "")) || "produto";
        const path = `${base}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage
          .from("product-images")
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });

        if (error) {
          setMessage(`Erro no upload: ${error.message}`);
          return;
        }

        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        publicUrls.push(data.publicUrl);
      }

      const nextImages = uniqueImages([...items[index].images, ...publicUrls]);
      updateItem(index, { images: nextImages, imageOrIcon: nextImages[0] ?? "" });
      setMessage("Imagens enviadas. Clique em Salvar alteracoes para publicar.");
    } finally {
      setUploading((current) => ({ ...current, [index]: false }));
    }
  }

  function setManualImageValue(index: number, value: string) {
    const images = value
      .split(",")
      .map((item) => item.trim())
      .filter(isImageValue);
    updateItem(index, {
      imageOrIcon: value,
      images,
    });
  }

  function removeImage(index: number, image: string) {
    const nextImages = items[index].images.filter((item) => item !== image);
    updateItem(index, { images: nextImages, imageOrIcon: nextImages[0] ?? "" });
  }

  function makeMainImage(index: number, image: string) {
    const nextImages = uniqueImages([
      image,
      ...items[index].images.filter((item) => item !== image),
    ]);
    updateItem(index, { images: nextImages, imageOrIcon: nextImages[0] ?? "" });
  }

  return (
    <div className="grid gap-3">
      <input type="hidden" name="products" value={serialized} />
      <div className="flex flex-col justify-between gap-3 rounded-lg border bg-[#fbfcfa] p-4 sm:flex-row sm:items-center">
        <div>
          <Label>Produtos</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            Arraste a foto para o produto, preencha os preços e salve. Produtos sem
            nome nao sao publicados.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={addItem} className="w-fit">
          <Plus data-icon="inline-start" />
          Adicionar produto
        </Button>
      </div>

      {message ? (
        <p className="rounded-md border bg-white px-3 py-2 text-sm text-muted-foreground">
          {message}
        </p>
      ) : null}

      <div className="grid gap-4">
        {items.map((item, index) => {
          const mainImage = item.images[0] ?? (isImageValue(item.imageOrIcon) ? item.imageOrIcon : "");
          const hasImage = Boolean(mainImage);

          return (
            <div key={index} className="rounded-lg border bg-white p-3 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3 border-b pb-3">
                <div>
                  <p className="text-sm font-semibold text-primary">
                    {item.title || `Produto ${index + 1}`}
                  </p>
                  <p className="text-xs text-muted-foreground">Edicao individual</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeItem(index)}
                  className="h-8 px-2 text-xs"
                >
                  <Trash2 data-icon="inline-start" />
                  Remover
                </Button>
              </div>

              <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                <div className="grid gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputs.current[index]?.click()}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      uploadFiles(index, event.dataTransfer.files);
                    }}
                    className="relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-primary/35 bg-[#f8faf7] text-center text-xs text-muted-foreground transition hover:bg-primary/5"
                  >
                    {hasImage ? (
                      <Image
                        src={mainImage}
                        alt={item.title || "Produto"}
                        fill
                        className="object-cover"
                        unoptimized={mainImage.startsWith("http")}
                      />
                    ) : uploading[index] ? (
                      <Loader2 className="mb-2 size-7 animate-spin text-primary" />
                    ) : (
                      <>
                        <UploadCloud className="mb-2 size-8 text-primary" />
                        <span className="max-w-[150px]">
                          Arraste a foto aqui ou clique para enviar
                        </span>
                      </>
                    )}
                    {hasImage ? (
                      <span className="absolute inset-x-2 bottom-2 rounded bg-black/60 px-2 py-1 text-[11px] font-medium text-white">
                        Adicionar/trocar fotos
                      </span>
                    ) : null}
                  </button>
                  <input
                    ref={(node) => {
                      fileInputs.current[index] = node;
                    }}
                    type="file"
                    multiple
                    accept={acceptedImageTypes.join(",")}
                    className="hidden"
                    onChange={(event) => uploadFiles(index, event.target.files ?? undefined)}
                  />
                  {item.images.length ? (
                    <div className="grid grid-cols-3 gap-2">
                      {item.images.map((image) => (
                        <div key={image} className="relative aspect-square overflow-hidden rounded-md border">
                          <Image
                            src={image}
                            alt={item.title || "Produto"}
                            fill
                            className="object-cover"
                            unoptimized={image.startsWith("http")}
                          />
                          <div className="absolute inset-x-1 bottom-1 grid gap-1">
                            <button
                              type="button"
                              onClick={() => makeMainImage(index, image)}
                              className="rounded bg-white/90 px-1 py-0.5 text-[9px] font-semibold text-primary"
                            >
                              Principal
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImage(index, image)}
                              className="rounded bg-black/65 px-1 py-0.5 text-[9px] font-semibold text-white"
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <div className="grid gap-1.5">
                    <Label>URLs das imagens ou icone</Label>
                    <Input
                      value={item.images.length ? item.images.join(", ") : item.imageOrIcon}
                      onChange={(event) =>
                        setManualImageValue(index, event.target.value)
                      }
                      placeholder="URLs separadas por virgula, ou icone: flower"
                    />
                  </div>
                </div>

                <div className="grid content-start gap-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="grid gap-1.5">
                      <Label>Nome</Label>
                      <Input
                        value={item.title}
                        onChange={(event) => updateItem(index, { title: event.target.value })}
                        placeholder="Buque romantico"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Evento/campanha</Label>
                      <Input
                        value={item.event}
                        onChange={(event) => updateItem(index, { event: event.target.value })}
                        placeholder="Dia dos Namorados"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Preco antigo</Label>
                      <Input
                        value={item.oldPrice}
                        onChange={(event) =>
                          updateItem(index, { oldPrice: event.target.value })
                        }
                        placeholder="R$ 129"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Preco atual</Label>
                      <Input
                        value={item.price}
                        onChange={(event) => updateItem(index, { price: event.target.value })}
                        placeholder="R$ 89"
                      />
                    </div>
                  </div>
                  <label className="flex h-8 items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={item.promo}
                      onChange={(event) => updateItem(index, { promo: event.target.checked })}
                      className="size-4"
                    />
                    Marcar como promocao
                  </label>
                  <label className="flex h-8 items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={item.active}
                      onChange={(event) => updateItem(index, { active: event.target.checked })}
                      className="size-4"
                    />
                    Produto visivel no site
                  </label>
                  <div className="grid gap-1.5">
                    <Label>Descricao</Label>
                    <Textarea
                      value={item.description}
                      onChange={(event) =>
                        updateItem(index, { description: event.target.value })
                      }
                      rows={4}
                      placeholder="Descricao curta do produto"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border bg-white p-3 text-xs text-muted-foreground">
        <ImagePlus className="mr-1 inline size-4 text-primary" />
        Depois de enviar uma imagem, clique em <strong>Salvar alteracoes</strong> no fim
        do formulario para publicar no site.
      </div>
    </div>
  );
}
