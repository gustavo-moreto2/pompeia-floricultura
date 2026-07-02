import { NextResponse } from "next/server";
import { lookupCep, onlyDigits } from "@/lib/delivery";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cep: string }> },
) {
  const { cep: rawCep } = await params;
  const cep = onlyDigits(rawCep);

  if (cep.length !== 8) {
    return NextResponse.json(
      { ok: false, message: "Informe um CEP valido com 8 numeros." },
      { status: 400 },
    );
  }

  const address = await lookupCep(cep);

  if (!address) {
    return NextResponse.json(
      { ok: false, message: "CEP nao encontrado." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, address });
}
