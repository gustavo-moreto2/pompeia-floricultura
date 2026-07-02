import Link from "next/link";
import {
  Database,
  Lock,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import { AdminLogin } from "@/components/admin-login";
import {
  ContentSettingsForm,
  DeliverySettingsForm,
  GallerySettingsForm,
  ProductsSettingsForm,
  SeoSettingsForm,
} from "@/components/admin-forms";
import { LeadStatusControl } from "@/components/lead-status-control";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { signOutAdmin } from "@/app/actions";
import { getSiteContent } from "@/lib/api-data";
import { getSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server";

type LeadRow = {
  id: string;
  name: string;
  contact: string;
  message: string;
  metadata: Record<string, unknown> | null;
  status: string;
  created_at: string;
};

const statusLabels: Record<string, string> = {
  new: "Novo",
  contacted: "Respondido",
  closed: "Fechado",
  archived: "Arquivado",
};

const statusFilters = ["all", "new", "contacted", "closed", "archived"] as const;

async function getLeads(status?: string) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const query = supabase
    .from("leads")
    .select("id,name,contact,message,metadata,status,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const { data } = await query;

  const leads = (data ?? []) as LeadRow[];

  if (status && status !== "all") {
    return leads.filter((lead) => effectiveLeadStatus(lead) === status);
  }

  return leads;
}

function metadataText(lead: LeadRow, key: string) {
  const value = lead.metadata?.[key];
  return typeof value === "string" ? value : "";
}

function effectiveLeadStatus(lead: LeadRow) {
  const adminStatus = metadataText(lead, "adminStatus");
  return statusLabels[adminStatus] ? adminStatus : lead.status;
}

function leadWhatsAppUrl(lead: LeadRow, fallbackPhone: string) {
  const digits = (lead.contact.match(/\d/g)?.join("") || fallbackPhone.replace(/\D/g, ""));
  const normalized = digits.startsWith("55") ? digits : `55${digits}`;
  const product = metadataText(lead, "product");
  const cep = metadataText(lead, "cep");
  const date = metadataText(lead, "deliveryDate");
  const text = encodeURIComponent(
    [
      `Ola, ${lead.name}. Recebemos seu pedido pelo site da Floricultura Pompeia.`,
      product ? `Produto: ${product}.` : "",
      cep ? `CEP: ${cep}.` : "",
      date ? `Data desejada: ${date}.` : "",
      "Podemos confirmar os detalhes?",
    ]
      .filter(Boolean)
      .join(" "),
  );

  return `https://wa.me/${normalized}?text=${text}`;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; statusUpdate?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const statusFilter = statusFilters.includes(params.status as (typeof statusFilters)[number])
    ? (params.status as string)
    : "all";
  const [content, leads, allLeads] = await Promise.all([
    getSiteContent(),
    getLeads(statusFilter),
    getLeads("all"),
  ]);
  const supabase = await getSupabaseServerClient();
  const userResult = supabase ? await supabase.auth.getUser() : null;
  const user = userResult?.data.user;
  const newLeads = allLeads.filter((lead) => effectiveLeadStatus(lead) === "new").length;
  const closedLeads = allLeads.filter(
    (lead) => effectiveLeadStatus(lead) === "closed",
  ).length;

  return (
    <main className="min-h-screen bg-[#f7f8f5]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-8">
        <div className="flex flex-col justify-between gap-4 rounded-lg border bg-white p-5 md:flex-row md:items-center">
          <div>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Voltar ao site
            </Link>
            <h1 className="mt-3 font-serif text-3xl font-semibold text-primary md:text-4xl">
              Painel administrativo
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Edite conteudo, acompanhe orcamentos e publique alteracoes sem mexer em codigo.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={user ? "default" : "outline"}>
              {user ? "Autenticado" : "Protegido por Supabase Auth"}
            </Badge>
            {user ? (
              <form action={signOutAdmin}>
                <Button type="submit" variant="outline" className="h-9">
                  <LogOut data-icon="inline-start" />
                  Sair
                </Button>
              </form>
            ) : null}
          </div>
        </div>

        {!hasSupabaseEnv() ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="size-5" />
                Configuracao pendente
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.
            </CardContent>
          </Card>
        ) : user ? (
          <>
            <div className="grid gap-3 md:grid-cols-4">
              <Card>
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm text-muted-foreground">Leads</p>
                    <p className="text-3xl font-semibold">{allLeads.length}</p>
                  </div>
                  <MessageSquare className="size-5 text-primary" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm text-muted-foreground">Novos</p>
                    <p className="text-3xl font-semibold">{newLeads}</p>
                  </div>
                  <Star className="size-5 text-primary" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm text-muted-foreground">Fechados</p>
                    <p className="text-3xl font-semibold">{closedLeads}</p>
                  </div>
                  <ShieldCheck className="size-5 text-primary" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                    <p className="text-sm font-semibold">{content.whatsapp}</p>
                  </div>
                  <Settings className="size-5 text-primary" />
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="leads" className="gap-4">
              <TabsList className="h-auto w-full flex-wrap justify-start rounded-lg bg-white p-2 md:w-fit">
                <TabsTrigger value="leads" className="px-4 py-2">
                  Leads
                </TabsTrigger>
                <TabsTrigger value="products" className="px-4 py-2">
                  Produtos
                </TabsTrigger>
                <TabsTrigger value="delivery" className="px-4 py-2">
                  Frete
                </TabsTrigger>
                <TabsTrigger value="content" className="px-4 py-2">
                  Conteudo
                </TabsTrigger>
                <TabsTrigger value="gallery" className="px-4 py-2">
                  Galeria
                </TabsTrigger>
                <TabsTrigger value="seo" className="px-4 py-2">
                  SEO
                </TabsTrigger>
              </TabsList>

              <TabsContent value="leads">
                <Card>
                  <CardHeader>
                    <CardTitle>Orcamentos recebidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {params.statusUpdate === "success" ? (
                      <div className="mb-4 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
                        Status atualizado com sucesso.
                      </div>
                    ) : null}
                    {params.statusUpdate === "error" ? (
                      <div className="mb-4 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                        Nao foi possivel atualizar o status. Entre novamente no painel e tente de novo.
                      </div>
                    ) : null}
                    <div className="mb-4 flex flex-wrap gap-2">
                      {[
                        ["all", "Todos"],
                        ["new", "Novos"],
                        ["contacted", "Respondidos"],
                        ["closed", "Fechados"],
                        ["archived", "Arquivados"],
                      ].map(([value, label]) => (
                        <Button
                          key={value}
                          render={<Link href={`/admin?status=${value}`} />}
                          nativeButton={false}
                          variant={statusFilter === value ? "default" : "outline"}
                          className="h-8 px-3 text-xs"
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                    {leads.length ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Contato</TableHead>
                            <TableHead>Mensagem</TableHead>
                            <TableHead>Pedido</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Recebido</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {leads.map((lead) => (
                            <TableRow key={lead.id}>
                              <TableCell className="font-medium">{lead.name}</TableCell>
                              <TableCell>{lead.contact}</TableCell>
                              <TableCell className="max-w-[360px] whitespace-normal text-muted-foreground">
                                {lead.message}
                              </TableCell>
                              <TableCell className="min-w-[220px] text-xs text-muted-foreground">
                                <div className="grid gap-1">
                                  {metadataText(lead, "product") ? (
                                    <span>
                                      <Package className="mr-1 inline size-3" />
                                      {metadataText(lead, "product")}
                                    </span>
                                  ) : null}
                                  {metadataText(lead, "cep") ? (
                                    <span>
                                      <Truck className="mr-1 inline size-3" />
                                      {metadataText(lead, "cep")}
                                      {metadataText(lead, "city")
                                        ? ` - ${metadataText(lead, "city")}`
                                        : ""}
                                    </span>
                                  ) : null}
                                  {metadataText(lead, "deliveryDate") ? (
                                    <span>Data: {metadataText(lead, "deliveryDate")}</span>
                                  ) : null}
                                  {metadataText(lead, "recipient") ? (
                                    <span>Para: {metadataText(lead, "recipient")}</span>
                                  ) : null}
                                  {metadataText(lead, "freightFee") ? (
                                    <span>Frete: {metadataText(lead, "freightFee")}</span>
                                  ) : null}
                                  <Button
                                    render={<a href={leadWhatsAppUrl(lead, content.whatsapp)} />}
                                    nativeButton={false}
                                    className="mt-1 h-8 w-fit px-3 text-xs"
                                  >
                                    Responder
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-2">
                                  <Badge variant="outline">
                                    {statusLabels[effectiveLeadStatus(lead)] ??
                                      effectiveLeadStatus(lead)}
                                  </Badge>
                                  <LeadStatusControl
                                    leadId={lead.id}
                                    currentStatus={effectiveLeadStatus(lead)}
                                    statusFilter={statusFilter}
                                    metadata={lead.metadata ?? {}}
                                  />
                                </div>
                              </TableCell>
                              <TableCell>
                                {new Intl.DateTimeFormat("pt-BR", {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                  timeZone: "America/Sao_Paulo",
                                }).format(new Date(lead.created_at))}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                        Nenhum lead ainda. O formulario do site vai aparecer aqui.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content">
                <Card>
                  <CardHeader>
                    <CardTitle>Editar informacoes publicas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ContentSettingsForm content={content} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="products">
                <Card>
                  <CardHeader>
                    <CardTitle>Produtos e promocoes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProductsSettingsForm content={content} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="delivery">
                <Card>
                  <CardHeader>
                    <CardTitle>Regras de frete</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DeliverySettingsForm content={content} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="gallery">
                <Card>
                  <CardHeader>
                    <CardTitle>Galeria, avaliacoes e FAQ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GallerySettingsForm content={content} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="seo">
                <Card>
                  <CardHeader>
                    <CardTitle>SEO local</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SeoSettingsForm content={content} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card className="mx-auto w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="size-5" />
                Login do proprietario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AdminLogin />
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
