export type CepAddress = {
  cep: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
};

export type DeliveryCityRule = {
  city: string;
  fee: number;
  deadline: string;
};

export type DeliverySettings = {
  originCity: string;
  originState: string;
  localFee: number;
  localDeadline: string;
  regionalCities: DeliveryCityRule[];
  unavailableMessage: string;
};

export const defaultDeliverySettings: DeliverySettings = {
  originCity: "Piracicaba",
  originState: "SP",
  localFee: 12,
  localDeadline: "Entrega local no mesmo dia, conforme horario do pedido",
  regionalCities: [
    { city: "Rio das Pedras", fee: 24, deadline: "Entrega em ate 1 dia util" },
    { city: "Saltinho", fee: 24, deadline: "Entrega em ate 1 dia util" },
    { city: "Charqueada", fee: 32, deadline: "Entrega em ate 1 dia util" },
    { city: "Limeira", fee: 38, deadline: "Entrega em ate 1 dia util" },
    { city: "Santa Barbara d'Oeste", fee: 38, deadline: "Entrega em ate 1 dia util" },
    { city: "Americana", fee: 45, deadline: "Entrega em ate 1 dia util" },
    { city: "Sao Pedro", fee: 45, deadline: "Entrega em ate 1 dia util" },
  ],
  unavailableMessage: "Cidade fora da area automatica. Consulte a taxa pelo WhatsApp.",
};

export function normalizeText(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function onlyDigits(value = "") {
  return value.replace(/\D/g, "");
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function mergeDeliverySettings(value?: Partial<DeliverySettings> | null) {
  return {
    ...defaultDeliverySettings,
    ...(value ?? {}),
    regionalCities: value?.regionalCities?.length
      ? value.regionalCities
      : defaultDeliverySettings.regionalCities,
  };
}

export async function lookupCep(rawCep: string): Promise<CepAddress | null> {
  const cep = onlyDigits(rawCep);

  if (cep.length !== 8) {
    return null;
  }

  const viaCep = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  })
    .then(async (response) => {
      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as {
        cep?: string;
        logradouro?: string;
        bairro?: string;
        localidade?: string;
        uf?: string;
        erro?: boolean;
      };

      if (data.erro) {
        return null;
      }

      return {
        cep: data.cep ?? cep,
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
      };
    })
    .catch(() => null);

  if (viaCep) {
    return viaCep;
  }

  return fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  })
    .then(async (response) => {
      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as {
        cep?: string;
        street?: string;
        neighborhood?: string;
        city?: string;
        state?: string;
      };

      return {
        cep: data.cep ?? cep,
        street: data.street,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
      };
    })
    .catch(() => null);
}

export function calculateDelivery(address: CepAddress, settings: DeliverySettings) {
  const city = normalizeText(address.city);
  const state = normalizeText(address.state);
  const originCity = normalizeText(settings.originCity);
  const originState = normalizeText(settings.originState);

  if (!city || !state) {
    return {
      available: false,
      fee: null,
      formattedFee: null,
      deadline: "Sob consulta",
      message: "Nao foi possivel identificar a cidade do CEP.",
    };
  }

  if (state !== originState) {
    return {
      available: false,
      fee: null,
      formattedFee: null,
      deadline: "Sob consulta",
      message: settings.unavailableMessage,
    };
  }

  if (city === originCity) {
    return {
      available: true,
      fee: settings.localFee,
      formattedFee: formatCurrency(settings.localFee),
      deadline: settings.localDeadline,
      message: `Entrega disponivel em ${settings.originCity}.`,
    };
  }

  const regional = settings.regionalCities.find(
    (rule) => normalizeText(rule.city) === city,
  );

  if (regional) {
    return {
      available: true,
      fee: regional.fee,
      formattedFee: formatCurrency(regional.fee),
      deadline: regional.deadline,
      message: "Entrega regional disponivel sob confirmacao.",
    };
  }

  return {
    available: false,
    fee: null,
    formattedFee: null,
    deadline: "Sob consulta",
    message: settings.unavailableMessage,
  };
}
