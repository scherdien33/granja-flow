// FinanceiroTab.tsx — Controle financeiro com saídas automáticas e relatório por centro de custo
import { useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formatCurrency, formatDate, getSaldoInicial, setSaldoInicial, type Pedido,
} from "@/lib/pedidos";

interface Props {
  pedidos: Pedido[];
}

export function FinanceiroTab({ pedidos }: Props) {
  const [saldo, setSaldo] = useState(() => getSaldoInicial());
  const [editandoSaldo, setEditandoSaldo] = useState(false);
  const [saldoInput, setSaldoInput] = useState("");

  // Saídas automáticas: pedidos pagos com valor registrado
  const pagos = pedidos.filter((p) => p.status === "Pago" && p.valor > 0);
  const totalSaidas = pagos.reduce((acc, p) => acc + p.valor, 0);
  const saldoAtual = saldo - totalSaidas;

  // Agrupa gastos por centro de custo (campo maquina)
  const porCentro = pagos.reduce<Record<string, number>>((acc, p) => {
    const centro = p.maquina || "Sem centro";
    acc[centro] = (acc[centro] || 0) + p.valor;
    return acc;
  }, {});
  const centrosOrdenados = Object.entries(porCentro).sort((a, b) => b[1] - a[1]);

  const handleSalvarSaldo = () => {
    const valor = parseFloat(saldoInput.replace(",", "."));
    if (isNaN(valor)) return;
    setSaldoInicial(valor);
    setSaldo(valor);
    setEditandoSaldo(false);
  };

  return (
    <div className="space-y-8">

      {/* Cards de resumo */}
      <section className="grid grid-cols-3 gap-3">
        <div className="rounded-md border bg-card p-4 shadow-sm text-center">
          <p className="text-xs text-muted-foreground mb-1">Saldo Inicial</p>
          <p className="font-semibold">{formatCurrency(saldo)}</p>
        </div>
        <div className="rounded-md border bg-card p-4 shadow-sm text-center">
          <p className="text-xs text-muted-foreground mb-1">Total Saídas</p>
          <p className="font-semibold text-destructive">{formatCurrency(totalSaidas)}</p>
        </div>
        <div className="rounded-md border bg-card p-4 shadow-sm text-center">
          <p className="text-xs text-muted-foreground mb-1">Saldo Atual</p>
          <p className={`font-semibold ${saldoAtual < 0 ? "text-destructive" : "text-emerald-600"}`}>
            {formatCurrency(saldoAtual)}
          </p>
        </div>
      </section>

      {/* Configurar saldo inicial */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Saldo Inicial</h2>
        <div className="rounded-md border bg-card p-4 shadow-sm space-y-3">
          {editandoSaldo ? (
            <>
              <div>
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={saldoInput}
                  onChange={(e) => setSaldoInput(e.target.value)}
                  placeholder="0,00"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSalvarSaldo} className="flex-1">Salvar</Button>
                <Button variant="outline" onClick={() => setEditandoSaldo(false)}>Cancelar</Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm">{formatCurrency(saldo)}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSaldoInput(saldo.toString()); setEditandoSaldo(true); }}
              >
                Editar
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Saídas automáticas (pedidos pagos) */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Saídas</h2>
        {pagos.length === 0 ? (
          <EmptyState message="Nenhum pagamento registrado" />
        ) : (
          <div className="space-y-2">
            {pagos.map((p) => (
              <div
                key={p.id}
                className="rounded-md border bg-card px-4 py-3 shadow-sm flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-sm">{p.descricao}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.maquina} · {p.formaPagamento} · {formatDate(p.dataPagamento)}
                  </p>
                </div>
                <span className="font-semibold text-destructive text-sm">
                  {formatCurrency(p.valor)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Relatório por centro de custo */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Gastos por Centro de Custo</h2>
        {centrosOrdenados.length === 0 ? (
          <EmptyState message="Nenhum dado disponível" />
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Centro de Custo</th>
                  <th className="px-3 py-2 text-right font-medium">Total</th>
                  <th className="px-3 py-2 text-right font-medium">% do gasto</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {centrosOrdenados.map(([centro, total]) => (
                  <tr key={centro} className="bg-card hover:bg-muted/50 transition-colors">
                    <td className="px-3 py-2 font-medium">{centro}</td>
                    <td className="px-3 py-2 text-right text-destructive">{formatCurrency(total)}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">
                      {totalSaidas > 0 ? ((total / totalSaidas) * 100).toFixed(1) + "%" : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted font-semibold">
                  <td className="px-3 py-2">Total</td>
                  <td className="px-3 py-2 text-right text-destructive">{formatCurrency(totalSaidas)}</td>
                  <td className="px-3 py-2 text-right">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}
