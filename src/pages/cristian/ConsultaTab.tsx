// ConsultaTab.tsx — Consulta de estoque com busca e tabela
import { useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/ui/input";
import { formatDate, type Pedido, type SaidaEstoque } from "@/lib/pedidos";

interface Props {
  pedidos: Pedido[];
  saidas: SaidaEstoque[];
}

export function ConsultaTab({ pedidos, saidas }: Props) {
  const [busca, setBusca] = useState("");

  const recebidos = pedidos.filter(
    (p) => p.status === "Recebido no estoque" || p.status === "Pago"
  );

  const qtdDisponivel = (pedidoId: string, recebida: number) => {
    const totalSaidas = saidas
      .filter((s) => s.pedidoId === pedidoId)
      .reduce((acc, s) => acc + s.quantidade, 0);
    return Math.max(0, recebida - totalSaidas);
  };

  const termo = busca.toLowerCase().trim();
  const filtrados = termo
    ? recebidos.filter(
        (p) =>
          p.descricao.toLowerCase().includes(termo) ||
          p.maquina.toLowerCase().includes(termo) ||
          p.fornecedor.toLowerCase().includes(termo)
      )
    : recebidos;

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar por descrição, máquina ou fornecedor..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      {filtrados.length === 0 ? (
        <EmptyState message={termo ? "Nenhum item encontrado" : "Nenhum item em estoque"} />
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Descrição</th>
                <th className="px-3 py-2 text-left font-medium">Máquina</th>
                <th className="px-3 py-2 text-left font-medium">Fornecedor</th>
                <th className="px-3 py-2 text-right font-medium">Qtd</th>
                <th className="px-3 py-2 text-left font-medium">Condição</th>
                <th className="px-3 py-2 text-left font-medium">Data entrada</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtrados.map((p) => (
                <tr key={p.id} className="bg-card hover:bg-muted/50 transition-colors">
                  <td className="px-3 py-2 font-medium">{p.descricao}</td>
                  <td className="px-3 py-2 text-muted-foreground">{p.maquina}</td>
                  <td className="px-3 py-2 text-muted-foreground">{p.fornecedor || "—"}</td>
                  <td className="px-3 py-2 text-right">{qtdDisponivel(p.id, p.quantidadeRecebida)}</td>
                  <td className="px-3 py-2">
                    <span className={p.condicao === "Com avaria" ? "text-destructive" : "text-emerald-600"}>
                      {p.condicao || "—"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{formatDate(p.dataRecebimento)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-right">
        {filtrados.length} {filtrados.length === 1 ? "item" : "itens"}
      </p>
    </div>
  );
}
