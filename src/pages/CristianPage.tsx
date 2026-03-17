import { useState } from "react";
import { ProfileHeader } from "@/components/ProfileHeader";
import { UrgencyBadge } from "@/components/UrgencyBadge";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  getPedidos, updatePedido, formatDate, formatDateTime,
  getSaidas, addSaida,
  type Condicao,
} from "@/lib/pedidos";

type Tab = "recebimento" | "estoque";

const tabs: { key: Tab; label: string }[] = [
  { key: "recebimento", label: "Recebimento" },
  { key: "estoque", label: "Estoque" },
];

export default function CristianPage() {
  const [tab, setTab] = useState<Tab>("recebimento");
  const [pedidos, setPedidos] = useState(getPedidos);
  const [saidas, setSaidas] = useState(getSaidas);

  // Recebimento
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [quantidade, setQuantidade] = useState("");
  const [condicao, setCondicao] = useState<Condicao>("OK");
  const [obs, setObs] = useState("");

  // Saída
  const [saidaPedidoId, setSaidaPedidoId] = useState("");
  const [saidaQtd, setSaidaQtd] = useState("");
  const [saidaPessoa, setSaidaPessoa] = useState("");
  const [saidaCentro, setSaidaCentro] = useState("");

  const refresh = () => {
    setPedidos(getPedidos());
    setSaidas(getSaidas());
  };

  const aguardando = pedidos.filter((p) => p.status === "Comprado");
  const recebidos = pedidos.filter(
    (p) => p.status === "Recebido no estoque" || p.status === "Pago"
  );

  const handleEntrada = (id: string) => {
    if (!quantidade) return;
    updatePedido(id, {
      quantidadeRecebida: parseInt(quantidade),
      condicao,
      observacaoEstoque: obs.trim(),
      dataRecebimento: new Date().toISOString(),
      status: "Recebido no estoque",
    });
    setExpandedId(null);
    refresh();
  };

  const handleSaida = () => {
    if (!saidaPedidoId || !saidaQtd || !saidaPessoa || !saidaCentro) return;
    const pedido = pedidos.find((p) => p.id === saidaPedidoId);
    if (!pedido) return;
    addSaida({
      pedidoId: saidaPedidoId,
      descricao: pedido.descricao,
      quantidade: parseInt(saidaQtd),
      pessoa: saidaPessoa.trim(),
      centroDeCusto: saidaCentro.trim(),
    });
    setSaidaPedidoId("");
    setSaidaQtd("");
    setSaidaPessoa("");
    setSaidaCentro("");
    refresh();
  };

  return (
    <div className="min-h-screen">
      <ProfileHeader name="Cristian" role="Estoque" />
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

        {tab === "recebimento" && (
          <>
            <section>
              <h2 className="mb-4 text-lg font-semibold">Aguardando Recebimento</h2>
              {aguardando.length === 0 ? (
                <EmptyState message="Nenhum item aguardando recebimento" />
              ) : (
                <div className="space-y-3">
                  {aguardando.map((p) => (
                    <div key={p.id} className="rounded-md border bg-card p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{p.descricao}</p>
                          <p className="text-sm text-muted-foreground">{p.maquina} · {p.fornecedor}</p>
                          {p.previsaoEntrega && (
                            <p className="text-xs text-muted-foreground">Previsão: {p.previsaoEntrega}</p>
                          )}
                        </div>
                        <UrgencyBadge urgencia={p.urgencia} />
                      </div>
                      {expandedId === p.id ? (
                        <div className="mt-4 space-y-3 border-t pt-4">
                          <div>
                            <Label>Quantidade recebida</Label>
                            <Input type="number" min="1" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
                          </div>
                          <div>
                            <Label>Condição</Label>
                            <select
                              value={condicao}
                              onChange={(e) => setCondicao(e.target.value as Condicao)}
                              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                            >
                              <option value="OK">OK</option>
                              <option value="Com avaria">Com avaria</option>
                            </select>
                          </div>
                          <div>
                            <Label>Observação</Label>
                            <Textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={2} />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => handleEntrada(p.id)} className="flex-1">Dar Entrada</Button>
                            <Button variant="outline" onClick={() => setExpandedId(null)}>Cancelar</Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => { setExpandedId(p.id); setQuantidade(""); setCondicao("OK"); setObs(""); }}
                        >
                          Confirmar Recebimento
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-4 text-lg font-semibold">Histórico de Recebimentos</h2>
              {recebidos.length === 0 ? (
                <EmptyState message="Nenhum recebimento registrado" />
              ) : (
                <div className="space-y-3">
                  {recebidos.map((p) => (
                    <div key={p.id} className="rounded-md border bg-card p-4 shadow-sm">
                      <p className="font-medium">{p.descricao}</p>
                      <p className="text-sm text-muted-foreground">
                        Qtd: {p.quantidadeRecebida} · {p.condicao} · {formatDate(p.dataRecebimento)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {tab === "estoque" && (
          <>
            <section>
              <h2 className="mb-4 text-lg font-semibold">Entradas</h2>
              {recebidos.length === 0 ? (
                <EmptyState message="Nenhuma entrada registrada" />
              ) : (
                <div className="space-y-3">
                  {recebidos.map((p) => (
                    <div key={p.id} className="rounded-md border bg-card p-4 shadow-sm">
                      <p className="font-medium">{p.descricao}</p>
                      <p className="text-sm text-muted-foreground">{p.maquina} · {p.fornecedor}</p>
                      <p className="text-sm text-muted-foreground">
                        Qtd: {p.quantidadeRecebida} · {p.condicao} · {formatDate(p.dataRecebimento)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-4 text-lg font-semibold">Registrar Saída</h2>
              <div className="rounded-md border bg-card p-4 shadow-sm space-y-3">
                <div>
                  <Label>Item</Label>
                  <select
                    value={saidaPedidoId}
                    onChange={(e) => setSaidaPedidoId(e.target.value)}
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Selecione um item...</option>
                    {recebidos.map((p) => (
                      <option key={p.id} value={p.id}>{p.descricao} · {p.maquina}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Quantidade</Label>
                  <Input type="number" min="1" value={saidaQtd} onChange={(e) => setSaidaQtd(e.target.value)} />
                </div>
                <div>
                  <Label>Quem recebeu</Label>
                  <Input value={saidaPessoa} onChange={(e) => setSaidaPessoa(e.target.value)} placeholder="Nome da pessoa" />
                </div>
                <div>
                  <Label>Centro de custo</Label>
                  <Input value={saidaCentro} onChange={(e) => setSaidaCentro(e.target.value)} placeholder="Ex: Manutenção, Produção..." />
                </div>
                <Button
                  onClick={handleSaida}
                  disabled={!saidaPedidoId || !saidaQtd || !saidaPessoa || !saidaCentro}
                  className="w-full"
                >
                  Registrar Saída
                </Button>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-lg font-semibold">Histórico de Saídas</h2>
              {saidas.length === 0 ? (
                <EmptyState message="Nenhuma saída registrada" />
              ) : (
                <div className="space-y-3">
                  {saidas.map((s) => (
                    <div key={s.id} className="rounded-md border bg-card p-4 shadow-sm">
                      <p className="font-medium">{s.descricao}</p>
                      <p className="text-sm text-muted-foreground">
                        Qtd: {s.quantidade} · {s.pessoa} · {s.centroDeCusto}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(s.dataSaida)}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

      </main>
    </div>
  );
}
