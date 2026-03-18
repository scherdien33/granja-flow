import { useState } from "react";
import { ProfileHeader } from "@/components/ProfileHeader";
import { getPedidos, getSaidas, getCentrosCusto } from "@/lib/pedidos";
import { RecebimentoTab } from "./cristian/RecebimentoTab";
import { EstoqueTab } from "./cristian/EstoqueTab";
import { ConsultaTab } from "./cristian/ConsultaTab";
import { CentrosCustoTab } from "./cristian/CentrosCustoTab";
import { FinanceiroTab } from "./cristian/FinanceiroTab";

type Tab = "recebimento" | "estoque" | "consulta" | "centros" | "financeiro";

const tabs: { key: Tab; label: string }[] = [
  { key: "recebimento", label: "Recebimento" },
  { key: "estoque", label: "Estoque" },
  { key: "consulta", label: "Consulta" },
  { key: "centros", label: "Centros de Custo" },
  { key: "financeiro", label: "Financeiro" },
];

export default function CristianPage() {
  const [tab, setTab] = useState<Tab>("recebimento");
  const [pedidos, setPedidos] = useState(getPedidos);
  const [saidas, setSaidas] = useState(getSaidas);
  const [centros, setCentros] = useState(getCentrosCusto);

  const refresh = () => {
    setPedidos(getPedidos());
    setSaidas(getSaidas());
    setCentros(getCentrosCusto());
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
          <RecebimentoTab pedidos={pedidos} onRefresh={refresh} />
        )}
        {tab === "estoque" && (
          <EstoqueTab pedidos={pedidos} saidas={saidas} centros={centros} onRefresh={refresh} />
        )}
        {tab === "consulta" && (
          <ConsultaTab pedidos={pedidos} saidas={saidas} />
        )}
        {tab === "centros" && (
          <CentrosCustoTab centros={centros} onRefresh={refresh} />
        )}
        {tab === "financeiro" && (
          <FinanceiroTab pedidos={pedidos} />
        )}

      </main>
    </div>
  );
}
