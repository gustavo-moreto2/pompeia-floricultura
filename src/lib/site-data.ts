import type { LucideIcon } from "lucide-react";
import {
  Gift,
  Leaf,
  MapPin,
  MessageCircle,
  Phone,
  ShoppingBasket,
  Sparkles,
  Sprout,
  Truck,
} from "lucide-react";

export type Service = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const company = {
  name: "Floricultura Pompéia",
  category: "Floricultura, flores, plantas e paisagismo",
  city: "Piracicaba",
  state: "SP",
  instagram: "https://www.instagram.com/pompeia_floricultura/?hl=pt",
  googleMapsShare: "https://share.google/a6bSwTseBNR4l0OV5",
  address: "PLACEHOLDER - confirmar endereço exato no Google Maps",
  publicAddressCandidates: [
    "Av. Fortunato Ernesto Vetorazzo, 952 - citado em resultados públicos do Instagram",
    "Rua Silva Jardim, 1530 - citado em diretório comercial público",
  ],
  phone: "+55 13 95539-7013",
  whatsapp: "+55 13 95539-7013",
  hours: [
    "PLACEHOLDER - confirmar horário de segunda a sexta",
    "PLACEHOLDER - confirmar horário de sábado",
    "PLACEHOLDER - confirmar funcionamento em domingos e feriados",
  ],
  rating: "PLACEHOLDER - confirmar nota no Google Maps",
  reviewCount: "PLACEHOLDER - confirmar quantidade de avaliações",
  description:
    "Floricultura em Piracicaba com presença pública no Instagram e foco em flores, plantas, presentes e atendimento local.",
  sources: [
    "Google Maps informado pelo cliente",
    "Instagram público @pompeia_floricultura",
    "Diretórios comerciais encontrados em pesquisa pública",
  ],
};

export const services: Service[] = [
  {
    title: "Buquês",
    description: "Buquês para presentes, datas especiais e pedidos personalizados.",
    icon: Sparkles,
  },
  {
    title: "Arranjos florais",
    description: "Composições para casa, empresas, celebrações e homenagens.",
    icon: Leaf,
  },
  {
    title: "Vasos e plantas",
    description: "Opções naturais para ambientes internos, externos e decoração.",
    icon: Sprout,
  },
  {
    title: "Cestas e presentes",
    description: "Combinações para presentear com flores, mimos e itens sob consulta.",
    icon: ShoppingBasket,
  },
  {
    title: "Entrega local",
    description: "Atendimento em Piracicaba. Área, prazo e taxa devem ser confirmados.",
    icon: Truck,
  },
  {
    title: "Paisagismo",
    description: "Serviço citado em diretórios públicos. Confirmar disponibilidade.",
    icon: Gift,
  },
];

export const gallery = [
  "Buquês personalizados",
  "Orquídeas e vasos",
  "Arranjos de mesa",
  "Flores para presente",
  "Plantas ornamentais",
  "Cestas sob encomenda",
];

export const reviewPlaceholders = [
  {
    name: "Avaliação pública",
    text: "PLACEHOLDER - substituir por avaliação pública confirmada do Google Maps.",
  },
  {
    name: "Cliente local",
    text: "PLACEHOLDER - inserir depoimento autorizado ou avaliação pública validada.",
  },
  {
    name: "Pedido entregue",
    text: "PLACEHOLDER - confirmar comentário real antes de publicar.",
  },
];

export const faq = [
  {
    question: "Vocês fazem entrega em Piracicaba?",
    answer:
      "PLACEHOLDER - confirmar bairros atendidos, prazo médio e taxa de entrega com a empresa.",
  },
  {
    question: "É possível personalizar buquês e arranjos?",
    answer:
      "Sim, o site deve permitir orçamento personalizado. Detalhes, flores disponíveis e valores precisam ser confirmados no atendimento.",
  },
  {
    question: "Quais formas de pagamento são aceitas?",
    answer: "PLACEHOLDER - confirmar PIX, cartão, dinheiro e condições de pagamento.",
  },
  {
    question: "Vocês atendem datas especiais?",
    answer:
      "PLACEHOLDER - confirmar operação em Dia das Mães, Dia dos Namorados, finados, aniversários e eventos.",
  },
];

export const contactLinks = [
  { label: "Instagram", href: company.instagram, icon: MessageCircle },
  { label: "Google Maps", href: company.googleMapsShare, icon: MapPin },
  { label: "Telefone", href: "#contato", icon: Phone },
];

export const localKeywords = [
  "floricultura em Piracicaba",
  "flores em Piracicaba",
  "buquê Piracicaba",
  "arranjos florais Piracicaba",
  "entrega de flores Piracicaba",
  "orquídeas Piracicaba",
  "Floricultura Pompéia",
];
