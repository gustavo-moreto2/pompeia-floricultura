import { NextResponse } from "next/server";
import { getSiteContent } from "@/lib/api-data";
import { calculateDelivery, lookupCep, onlyDigits } from "@/lib/delivery";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const cep = onlyDigits(String(body?.cep ?? ""));

  if (cep.length !== 8) {
    return NextResponse.json(
      { ok: false, message: "Informe um CEP valido com 8 numeros." },
      { status: 400 },
    );
  }

  const [address, content] = await Promise.all([lookupCep(cep), getSiteContent()]);

  if (!address) {
    return NextResponse.json(
      { ok: false, message: "CEP nao encontrado." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    cep: address.cep,
    address,
    delivery: calculateDelivery(address, content.delivery),
  });
}
