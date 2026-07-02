"use client";

import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Flower2,
  Gift,
  Leaf,
  Mail,
  MessageCircle,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ProductItem, SiteContent } from "@/lib/api-data";

const iconMap = {
  truck: Truck,
  mail: Mail,
  gift: Gift,
  leaf: Leaf,
  flower: Flower2,
  basket: ShoppingBag,
};

function buildWhatsAppUrl(content: SiteContent, product: ProductItem) {
  const digits = content.whatsapp.replace(/\D/g, "");
  const normalized = digits.startsWith("55") ? digits : `55${digits}`;
  const text = encodeURIComponent(
    [
      "Ola, vim pelo site e quero pedir este produto:",
      product.title,
      product.price ? `Preco: ${product.price}` : "",
      product.oldPrice ? `Preco anterior: ${product.oldPrice}` : "",
      product.promo ? "Produto em promocao" : "",
      product.event ? `Campanha: ${product.event}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return `https://wa.me/${normalized}?text=${text}`;
}

function PriceBlock({ product }: { product: ProductItem }) {
  if (!product.oldPrice && !product.price) {
    return null;
  }

  return (
    <div className="mt-1 flex flex-wrap items-baseline justify-center gap-1.5">
      {product.oldPrice ? (
        <span className="text-[11px] text-muted-foreground line-through">
          {product.oldPrice}
        </span>
      ) : null}
      {product.price ? (
        <span className="text-[14px] font-semibold leading-tight text-primary">
          {product.price}
        </span>
      ) : null}
    </div>
  );
}

export function ProductCatalog({ content }: { content: SiteContent }) {
  const [selected, setSelected] = useState<ProductItem | null>(null);
  const [imageIndex, setImageIndex] = useState(0);

  function openProduct(product: ProductItem) {
    setSelected(product);
    setImageIndex(0);
  }

  const selectedImages = selected
    ? selected.images?.length
      ? selected.images
      : selected.image
        ? [selected.image]
        : []
    : [];
  const selectedImage = selectedImages[imageIndex] ?? selected?.image;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {content.products.filter((item) => item.active !== false).map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap];
          const whatsappUrl = buildWhatsAppUrl(content, item);

          return (
            <div
              key={item.title}
              className="group flex min-h-[305px] flex-col overflow-hidden rounded-[7px] border bg-white shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(20,63,41,0.12)]"
            >
              <div className="relative flex h-[150px] items-center justify-center bg-white md:h-[168px]">
                {item.promo || item.event ? (
                  <div className="absolute left-2 top-2 z-10 flex max-w-[150px] flex-col gap-1">
                    {item.promo ? (
                      <span className="rounded-full bg-[#e58c8e] px-2 py-0.5 text-[10px] font-semibold text-white">
                        Promocao
                      </span>
                    ) : null}
                    {item.event ? (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">
                        {item.event}
                      </span>
                    ) : null}
                  </div>
                ) : null}
                {item.image ? (
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                ) : Icon ? (
                  <Icon className="size-16 stroke-[1.45] text-primary" />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col border-t p-3 text-center text-[13px] text-[#2d302e]">
                <p className="font-medium">{item.title}</p>
                <PriceBlock product={item} />
                <p className="mx-auto mt-2 max-w-[170px] flex-1 text-[11px] leading-snug text-muted-foreground">
                  {item.description}
                </p>
                <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => openProduct(item)}
                    className="h-9 rounded-[3px] border border-primary/25 px-2 text-[11px] font-semibold text-primary transition hover:bg-primary/5"
                  >
                    Ver produto
                  </button>
                  <a
                    href={whatsappUrl}
                    className="inline-flex h-9 items-center justify-center rounded-[3px] bg-primary px-2 text-[11px] font-semibold text-white transition hover:bg-primary/90"
                  >
                    Pedir
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/45 p-3 md:items-center md:justify-center">
          <div className="max-h-[92vh] w-full overflow-auto rounded-lg bg-white shadow-2xl md:max-w-[820px]">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#e58c8e]">
                  Produto
                </p>
                <h3 className="font-serif text-2xl text-primary">{selected.title}</h3>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setSelected(null)}
                aria-label="Fechar detalhes do produto"
              >
                <X />
              </Button>
            </div>
            <div className="grid gap-4 p-4 md:grid-cols-[0.9fr_1.1fr]">
              <div className="grid gap-2">
                <div className="relative aspect-square overflow-hidden rounded-md border bg-muted">
                  {selectedImage ? (
                  <Image
                    src={selectedImage}
                    alt={selected.title}
                    fill
                    className="object-cover"
                    unoptimized={selectedImage.startsWith("http")}
                  />
                ) : (
                  <Flower2 className="absolute left-1/2 top-1/2 size-20 -translate-x-1/2 -translate-y-1/2 text-primary" />
                )}
                  {selectedImages.length > 1 ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setImageIndex((current) =>
                            current === 0 ? selectedImages.length - 1 : current - 1,
                          )
                        }
                        className="absolute left-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-primary shadow"
                        aria-label="Foto anterior"
                      >
                        <ChevronLeft className="size-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setImageIndex((current) =>
                            current === selectedImages.length - 1 ? 0 : current + 1,
                          )
                        }
                        className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-primary shadow"
                        aria-label="Proxima foto"
                      >
                        <ChevronRight className="size-5" />
                      </button>
                    </>
                  ) : null}
                </div>
                {selectedImages.length > 1 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {selectedImages.map((image, index) => (
                      <button
                        type="button"
                        key={image}
                        onClick={() => setImageIndex(index)}
                        className={`relative aspect-square overflow-hidden rounded border ${
                          index === imageIndex ? "ring-2 ring-primary" : ""
                        }`}
                        aria-label={`Ver foto ${index + 1}`}
                      >
                        <Image
                          src={image}
                          alt={`${selected.title} foto ${index + 1}`}
                          fill
                          className="object-cover"
                          unoptimized={image.startsWith("http")}
                        />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="flex flex-col">
                <div className="flex flex-wrap gap-2">
                  {selected.promo ? (
                    <span className="rounded-full bg-[#e58c8e] px-2.5 py-1 text-xs font-semibold text-white">
                      Promocao
                    </span>
                  ) : null}
                  {selected.event ? (
                    <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-white">
                      {selected.event}
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  {selected.oldPrice ? (
                    <span className="text-sm text-muted-foreground line-through">
                      {selected.oldPrice}
                    </span>
                  ) : null}
                  {selected.price ? (
                    <span className="text-2xl font-semibold text-primary">
                      {selected.price}
                    </span>
                  ) : null}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[#4f5551]">
                  {selected.description}
                </p>
                <div className="mt-6 grid gap-2">
                  <a
                    href={buildWhatsAppUrl(content, selected)}
                    className="inline-flex h-10 items-center justify-center rounded-[3px] bg-primary text-sm font-semibold text-white"
                  >
                    <MessageCircle className="mr-2 size-4" />
                    Pedir este produto
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
