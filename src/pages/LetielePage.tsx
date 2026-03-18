import { useState } from "react";
import { ProfileHeader } from "@/components/ProfileHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPedidos, updatePedido, formatDate, formatCurrency, type FormaPagamento } from "@/lib/pedidos";
import { FinanceiroTab } from "./cristian/FinanceiroTab";

type Tab = "lancamentos" | "financeiro";

const tabs: { key: Tab; label: string }[] = [
  { key: "lancamentos", label: "Lançamentos" },
  { key: "financeiro", label: "Financeiro" },
];

export default function LetielePage() {
  const [tab, setTab] = useState<Tab>("lancamentos");
  const [pedidos, setPedidos] = useState(getPedidos);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [nf, setNf] = useState("");
  const [vencimento, setVencimento] = useState("");
  const [forma, setForma] = useState<FormaPagamento>("Pix");

  const refresh = () => setPedidos(getPedidos());

  const pendentes = pedidos.filter((p) => p.status === "Recebido no estoque");
  const pagos = pedidos.filter((p) => p.status === "Pago");

  const handlePagamento = (id: string) => {
    if (!nf.trim()) return;
    updatePedido(id, {
      numeroNF: nf.trim(),
      dataVencimento: vencimento,
      formaPagamento: forma,
      dataPagamento: new Date().toISOString(),
      status: "Pago",
    });
    setExpandedId(null);
    refresh();
  };

  return (
    <div className="min-h-screen">
      <ProfileHeader name="Letiele" role="Financeiro" />
      <main className="mx-auto max-w-2xl space-y-6 px-4 py-6">

        <div className="flex gap-1 rounded-md border bg-muted p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 rounded px-3 py-2 text-sm font-medium transition-colors ${
                tab === t.key ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "lancamentos" && (
          <div className="space-y-8">
            <section>
              <h2 className="mb-4 text-lg font-semibold">Notas para Lançar</h2>
              {pendentes.length === 0 ? (
                <EmptyState message="Nenhuma nota pendente" />
              ) : (
                <div className="space-y-3">
                  {pendentes.map((p) => (
                    <div key={p.id} className="rounded-md border bg-card p-4 shadow-sm">
                      <p className="font-medium">{p.descricao}</p>
                      <p className="text-sm text-muted-foreground">{p.fornecedor} · {formatCurrency(p.valor)} · {p.maquina}</p>
                      {expandedId === p.id ? (
                        <div className="mt-4 space-y-3 border-t pt-4">
                          <div>
                            <Label>Número da NF</Label>
                            <Input value={nf} onChange={(e) => setNf(e.target.value)} placeholder="Ex: 12345" />
                          </div>
                          <div>
                            <Label>Data de vencimento</Label>
                            <Input type="date" value={vencimento} onChange={(e) => setVencimento(e.target.value)} />
                          </div>
                          <div>
                            <Label>Forma de pagamento</Label>
                            <select value={forma} onChange={(e) => setForma(e.target.value as FormaPagamento)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
                              <option value="Cheque">Cheque</option>
                              <option value="Pix">Pix</option>
                              <option value="Boleto">Boleto</option>
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => handlePagamento(p.id)} className="flex-1">Confirmar Lançamento</Button>
                            <Button variant="outline" onClick={() => setExpandedId(null)}>Cancelar</Button>
                          </div>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" className="mt-3" onClick={() => { setExpandedId(p.id); setNf(""); setVencimento(""); setForma("Pix"); }}>
                          Lançar Pagamento
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-4 text-lg font-semibold">Histórico de Pagamentos</h2>
              {pagos.length === 0 ? (
                <EmptyState message="Nenhum pagamento registrado" />
              ) : (
                <div className="space-y-3">
                  {pagos.map((p) => (
                    <div key={p.id} className="rounded-md border bg-card p-4 shadow-sm">
                      <p className="font-medium">{p.descricao}</p>
                      <p className="text-sm text-muted-foreground">
                        NF: {p.numeroNF} · {p.formaPagamento} · {formatCurrency(p.valor)} · {formatDate(p.dataPagamento)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {tab === "financeiro" && <FinanceiroTab pedidos={pedidos} />}

      </main>
    </div>
  );
}
