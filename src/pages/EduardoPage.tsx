import { useState, useEffect } from "react";
import { ProfileHeader } from "@/components/ProfileHeader";
import { UrgencyBadge } from "@/components/UrgencyBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { getPedidos, formatDate, formatCurrency } from "@/lib/pedidos";

export default function EduardoPage() {
  const [pedidos, setPedidos] = useState(getPedidos);

  useEffect(() => {
    const interval = setInterval(() => setPedidos(getPedidos()), 2000);
    return () => clearInterval(interval);
  }, []);

  const total = pedidos.length;
  const aguardando = pedidos.filter((p) => p.status === "Aguardando orçamento").length;
  const emAndamento = pedidos.filter((p) => p.status === "Comprado" || p.status === "Recebido no estoque").length;
  const pagos = pedidos.filter((p) => p.status === "Pago").length;

  const cards = [
    { label: "Total de pedidos", value: total, color: "bg-secondary text-secondary-foreground" },
    { label: "Aguardando orçamento", value: aguardando, color: "bg-yellow-100 text-yellow-800" },
    { label: "Em andamento", value: emAndamento, color: "bg-blue-100 text-blue-800" },
    { label: "Pagos", value: pagos, color: "bg-primary/10 text-primary" },
  ];

  return (
    <div className="min-h-screen">
      <ProfileHeader name="Eduardo" role="Gestão" />
      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className={`rounded-md p-4 ${c.color}`}>
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-sm font-medium opacity-80">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Full table */}
        {total === 0 ? (
          <EmptyState message="Nenhum pedido cadastrado" />
        ) : (
          <div className="overflow-x-auto rounded-md border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-2 text-left font-semibold">Descrição</th>
                  <th className="px-3 py-2 text-left font-semibold">Máquina</th>
                  <th className="px-3 py-2 text-left font-semibold">Urgência</th>
                  <th className="px-3 py-2 text-left font-semibold">Fornecedor</th>
                  <th className="px-3 py-2 text-right font-semibold">Valor</th>
                  <th className="px-3 py-2 text-left font-semibold">Status</th>
                  <th className="px-3 py-2 text-left font-semibold">Criação</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p.id} className={`border-b last:border-0 ${p.urgencia === "Urgente" ? "bg-urgent/5" : ""}`}>
                    <td className="px-3 py-2 font-medium">{p.descricao}</td>
                    <td className="px-3 py-2 text-muted-foreground">{p.maquina}</td>
                    <td className="px-3 py-2"><UrgencyBadge urgencia={p.urgencia} /></td>
                    <td className="px-3 py-2 text-muted-foreground">{p.fornecedor || "—"}</td>
                    <td className="px-3 py-2 text-right">{p.valor ? formatCurrency(p.valor) : "—"}</td>
                    <td className="px-3 py-2"><StatusBadge status={p.status} /></td>
                    <td className="px-3 py-2 text-muted-foreground">{formatDate(p.dataCriacao)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
