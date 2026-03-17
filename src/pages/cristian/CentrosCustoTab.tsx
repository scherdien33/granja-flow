// CentrosCustoTab.tsx — Cadastro e remoção de centros de custo
import { useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addCentroCusto, removeCentroCusto, type CentroCusto } from "@/lib/pedidos";

interface Props {
  centros: CentroCusto[];
  onRefresh: () => void;
}

export function CentrosCustoTab({ centros, onRefresh }: Props) {
  const [nome, setNome] = useState("");

  const handleAdd = () => {
    const nomeFormatado = nome.trim();
    if (!nomeFormatado) return;
    const duplicado = centros.some(
      (c) => c.nome.toLowerCase() === nomeFormatado.toLowerCase()
    );
    if (duplicado) return;
    addCentroCusto(nomeFormatado);
    setNome("");
    onRefresh();
  };

  const handleRemove = (id: string) => {
    removeCentroCusto(id);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-4 text-lg font-semibold">Novo Centro de Custo</h2>
        <div className="rounded-md border bg-card p-4 shadow-sm space-y-3">
          <div>
            <Label>Nome</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Manutenção, Produção, Administrativo..."
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>
          <Button onClick={handleAdd} disabled={!nome.trim()} className="w-full">
            Cadastrar
          </Button>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Centros Cadastrados</h2>
        {centros.length === 0 ? (
          <EmptyState message="Nenhum centro de custo cadastrado" />
        ) : (
          <div className="space-y-2">
            {centros.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-md border bg-card px-4 py-3 shadow-sm"
              >
                <span className="font-medium">{c.nome}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleRemove(c.id)}
                >
                  Remover
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
