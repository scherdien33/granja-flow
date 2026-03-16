import { useState } from "react";
import { ProfileHeader } from "@/components/ProfileHeader";
import { UrgencyBadge } from "@/components/UrgencyBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPedidos, updatePedido, formatDate, formatCurrency, STATUS_ORDER, type Pedido } from "@/lib/pedidos";

type Tab = "pendentes" | "kanban" | "historico";

export default function GenissonPage() {
  const [pedidos, setPedidos] = useState(getPedidos);
  const [tab, setTab] = useState<Tab>("pendentes");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [fornecedor, setFornecedor] = useState("");
  const [valor, setValor] = useState("");
  const [previsao, setPrevisao] = useState("");

  const refresh = () => setPedidos(getPedidos());

  const pendentes = pedidos.filter((p) => p.status === "Aguardando orçamento");
  const historico = pedidos.filter((p) => p.status !== "Aguardando orçamento");

  const handleCompra = (id: string) => {
    if (!fornecedor.trim() || !valor) return;
    updatePedido(id, {
      fornecedor: fornecedor.trim(),
      valor: parseFloat(valor),
      previsaoEntrega: previsao,
      dataCompra: new Date().toISOString(),
      status: "Comprado",
    });
    setExpandedId(null);
    setFornecedor("");
    setValor("");
    setPrevisao("");
    refresh();
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "pendentes", label: "Pedidos Pendentes" },
    { key: "kanban", label: "Kanban" },
    { key: "historico", label: "Histórico" },
  ];

  return (
    <div className="min-h-screen">
      <ProfileHeader name="Gênisson" role="Compras" />
      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-md border bg-muted p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 rounded px-3 py-2 text-sm font-medium transition-colors ${tab === t.key ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "pendentes" && (
          <div>
            {pendentes.length === 0 ? (
              <EmptyState message="Nenhum pedido pendente" />
            ) : (
              <div className="space-y-3">
                {pendentes.map((p) => (
                  <div key={p.id} className="rounded-md border bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{p.descricao}</p>
                        <p className="text-sm text-muted-foreground">{p.maquina} · {formatDate(p.dataCriacao)}</p>
                      </div>
                      <UrgencyBadge urgencia={p.urgencia} />
                    </div>
                    {expandedId === p.id ? (
                      <div className="mt-4 space-y-3 border-t pt-4">
                        <Input placeholder="Fornecedor" value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} />
                        <Input type="number" placeholder="Valor (R$)" value={valor} onChange={(e) => setValor(e.target.value)} min="0" step="0.01" />
                        <Input type="date" value={previsao} onChange={(e) => setPrevisao(e.target.value)} />
                        <div className="flex gap-2">
                          <Button onClick={() => handleCompra(p.id)} className="flex-1">Confirmar Compra</Button>
                          <Button variant="outline" onClick={() => setExpandedId(null)}>Cancelar</Button>
                        </div>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => { setExpandedId(p.id); setFornecedor(""); setValor(""); setPrevisao(""); }}>
                        Registrar Compra
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "kanban" && <KanbanBoard pedidos={pedidos} />}

        {tab === "historico" && (
          <div>
            {historico.length === 0 ? (
              <EmptyState message="Nenhum registro no histórico" />
            ) : (
              <div className="space-y-3">
                {historico.map((p) => (
                  <div key={p.id} className="rounded-md border bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{p.descricao}</p>
                        <p className="text-sm text-muted-foreground">{p.fornecedor} · {formatCurrency(p.valor)}</p>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function KanbanBoard({ pedidos }: { pedidos: Pedido[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {STATUS_ORDER.map((status) => {
        const cards = pedidos.filter((p) => p.status === status);
        return (
          <div key={status} className="min-w-[240px] flex-1 rounded-md border bg-muted/50 p-3">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">{status}</h3>
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-secondary px-1.5 text-xs font-medium text-secondary-foreground">
                {cards.length}
              </span>
            </div>
            {cards.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">Vazio</p>
            ) : (
              <div className="space-y-2">
                {cards.map((p) => (
                  <div key={p.id} className="rounded border bg-card p-3 shadow-sm">
                    <p className="text-sm font-medium">{p.descricao}</p>
                    <p className="text-xs text-muted-foreground">{p.maquina}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <UrgencyBadge urgencia={p.urgencia} />
                    </div>
                    {p.fornecedor && <p className="mt-1 text-xs text-muted-foreground">{p.fornecedor} · {formatCurrency(p.valor)}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
