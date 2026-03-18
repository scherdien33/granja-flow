// EstoqueTab.tsx — Registro de entradas e saídas de estoque
import { useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addSaida, formatDate, formatDateTime,
  type Pedido, type SaidaEstoque, type CentroCusto,
} from "@/lib/pedidos";

interface Props {
  pedidos: Pedido[];
  saidas: SaidaEstoque[];
  centros: CentroCusto[];
  onRefresh: () => void;
}

export function EstoqueTab({ pedidos, saidas, centros, onRefresh }: Props) {
  const [saidaPedidoId, setSaidaPedidoId] = useState("");
  const [saidaQtd, setSaidaQtd] = useState("");
  const [saidaPessoa, setSaidaPessoa] = useState("");
  const [saidaCentro, setSaidaCentro] = useState("");

  const recebidos = pedidos.filter(
    (p) => p.status === "Recebido no estoque" || p.status === "Pago"
  );

  // Quantidade disponível = recebida menos total de saídas registradas
  const qtdDisponivel = (pedidoId: string, recebida: number) => {
    const totalSaidas = saidas
      .filter((s) => s.pedidoId === pedidoId)
      .reduce((acc, s) => acc + s.quantidade, 0);
    return Math.max(0, recebida - totalSaidas);
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
      centroDeCusto: saidaCentro,
    });
    setSaidaPedidoId("");
    setSaidaQtd("");
    setSaidaPessoa("");
    setSaidaCentro("");
    onRefresh();
  };

  return (
    <div className="space-y-8">
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
                  Qtd disponível: {qtdDisponivel(p.id, p.quantidadeRecebida)} · {p.condicao} · {formatDate(p.dataRecebimento)}
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
            <select
              value={saidaCentro}
              onChange={(e) => setSaidaCentro(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">Selecione um centro de custo...</option>
              {centros.map((c) => (
                <option key={c.id} value={c.nome}>{c.nome}</option>
              ))}
            </select>
            {centros.length === 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                Cadastre centros de custo na aba "Centros de Custo".
              </p>
            )}
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
    </div>
  );
}
