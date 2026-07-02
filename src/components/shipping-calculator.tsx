"use client";

import { useMemo, useState } from "react";
import { Loader2, MapPin, MessageCircle, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ShippingResponse = {
  ok: boolean;
  message?: string;
  cep?: string;
  address?: {
    street?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  };
  delivery?: {
    available: boolean;
    formattedFee: string | null;
    deadline: string;
    message: string;
  };
};

function formatCep(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 5) {
    return digits;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function ShippingCalculator({ whatsappUrl }: { whatsappUrl: string }) {
  const [cep, setCep] = useState("");
  const [result, setResult] = useState<ShippingResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");

  const quoteUrl = useMemo(() => {
    if (!result?.address) {
      return whatsappUrl;
    }

    const city = [result.address.city, result.address.state].filter(Boolean).join("/");
    const fee = result.delivery?.formattedFee ?? "sob consulta";
    const message = encodeURIComponent(
      [
        `Ola, vim pelo site e quero confirmar entrega para o CEP ${result.cep} (${city}).`,
        `Frete: ${fee}.`,
        deliveryDate ? `Data desejada: ${deliveryDate}.` : "",
      ]
        .filter(Boolean)
        .join(" "),
    );

    return `/api/whatsapp?message=${message}`;
  }, [deliveryDate, result, whatsappUrl]);

  async function calculate() {
    const digits = cep.replace(/\D/g, "");

    setError("");
    setResult(null);

    if (digits.length !== 8) {
      setError("Digite um CEP com 8 numeros.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/frete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cep: digits }),
      });
      const data = (await response.json()) as ShippingResponse;

      if (!response.ok || !data.ok) {
        setError(data.message ?? "Nao foi possivel calcular o frete.");
        return;
      }

      setResult(data);
    } catch {
      setError("Nao foi possivel consultar o frete agora.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-[7px] border bg-[#fbfcfa] p-4 shadow-[0_1px_8px_rgba(0,0,0,0.035)]">
      <div className="flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/8 text-primary">
          <Truck className="size-5" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-[#2d302e]">
            Calcule a entrega
          </p>
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
            Informe o CEP para ver uma taxa estimada. O valor final e confirmado no atendimento.
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-1.5">
          <Label htmlFor="shipping-cep" className="sr-only">
            CEP de entrega
          </Label>
          <Input
            id="shipping-cep"
            inputMode="numeric"
            placeholder="Digite seu CEP"
            value={cep}
            onChange={(event) => setCep(formatCep(event.target.value))}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                calculate();
              }
            }}
          />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="shipping-date" className="sr-only">
              Data desejada
            </Label>
            <Input
              id="shipping-date"
              type="date"
              value={deliveryDate}
              onChange={(event) => setDeliveryDate(event.target.value)}
            />
          </div>
        </div>
        <Button
          type="button"
          onClick={calculate}
          disabled={isLoading}
          className="h-10 rounded-[3px] text-[12px]"
        >
          {isLoading ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <MapPin data-icon="inline-start" />
          )}
          Calcular
        </Button>
      </div>

      {error ? (
        <p className="mt-2 rounded-[4px] border border-destructive/20 bg-white px-3 py-2 text-[12px] text-destructive">
          {error}
        </p>
      ) : null}

      {result?.address && result.delivery ? (
        <div className="mt-3 rounded-[5px] border bg-white p-3">
          <p className="text-[12px] font-medium text-[#2d302e]">
            {result.address.neighborhood ? `${result.address.neighborhood} - ` : ""}
            {result.address.city}/{result.address.state}
          </p>
          <div className="mt-2 grid gap-2 text-[12px] text-[#4f5551] sm:grid-cols-2">
            <div>
              <span className="block text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Taxa estimada
              </span>
              <strong className="text-[16px] text-primary">
                {result.delivery.formattedFee ?? "Sob consulta"}
              </strong>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Prazo
              </span>
              <strong className="text-[13px] text-[#2d302e]">
                {result.delivery.deadline}
              </strong>
            </div>
          </div>
          <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
            {result.delivery.message}
          </p>
          <Button
            render={<a href={quoteUrl} />}
            nativeButton={false}
            className="mt-3 h-9 w-full rounded-[3px] text-[12px]"
          >
            <MessageCircle data-icon="inline-start" />
            Confirmar pelo WhatsApp
          </Button>
        </div>
      ) : null}
    </div>
  );
}
