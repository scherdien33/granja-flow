import { useState } from "react";
import { ProfileHeader } from "@/components/ProfileHeader";
import { UrgencyBadge } from "@/components/UrgencyBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { addPedido, getPedidos, getCentrosCusto, formatDate, type Urgencia } from "@/lib/pedidos";

export default function JuarezPage() {
  const [descricao, setDescricao] = useState("");
  const [maquina, setMaquina] = useState("");
  const [urgencia, setUrgencia] = useState<Urgencia>("Normal");
  const [observacao, setObservacao] = useState("");
  const [pedidos, setPedidos] = useState(getPedidos);
  const [centros] = useState(getCentrosCusto);
  const [key, setKey] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim() || !maquina.trim()) return;
    addPedido({ descricao: descricao.trim(), maquina: maquina.trim(), urgencia, observacao: observacao.trim() });
    setDescricao("");
    setMaquina("");
    setUrgencia("Normal");
    setObservacao("");
    setPedidos(getPedidos());
    setKey((k) => k + 1);
  };

  const meusPedidos = pedidos.filter((p) => p.criadoPor === "Juarez");

  return (
    <div className="min-h-screen">
      <ProfileHeader name="Juarez" role="Manutenção" />
      <main className="mx-auto max-w-2xl space-y-8 px-4 py-6">
        {/* Form */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">Novo Pedido de Peça</h2>
          <form onSubmit={handleSubmit} className="space-y-4 rounded-md border bg-card p-4 shadow-sm" key={key}>
            <div>
              <Label htmlFor="desc">Descrição da peça *</Label>
              <Input id="desc" value={descricao} onChange={(e) => setDescricao(e.target.value)} required placeholder="Ex: Rolamento 6205" />
            </div>
            <div>
              <Label htmlFor="maq">Máquina / Equipamento *</Label>
              <select
                id="maq"
                value={maquina}
                onChange={(e) => setMaquina(e.target.value)}
                required
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione...</option>
                {centros.map((c) => (
                  <option key={c.id} value={c.nome}>{c.nome}</option>
                ))}
              </select>
              {centros.length === 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Cadastre centros de custo na página do Cristian antes de abrir um pedido.
                </p>
              )}
            </div>
            <div>
              <Label>Urgência</Label>
              <div className="mt-1 flex gap-4">
                {(["Normal", "Urgente"] as const).map((u) => (
                  <label key={u} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="urgencia" checked={urgencia === u} onChange={() => setUrgencia(u)} className="accent-primary" />
                    <span className="text-sm">{u}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="obs">Observação</Label>
              <Textarea id="obs" value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Informações adicionais..." rows={3} />
            </div>
            <Button type="submit" className="w-full">Enviar Pedido</Button>
          </form>
        </section>

        {/* List */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">Meus Pedidos</h2>
          {meusPedidos.length === 0 ? (
            <EmptyState message="Nenhum pedido cadastrado" />
          ) : (
            <div className="space-y-3">
              {meusPedidos.map((p) => (
                <div key={p.id} className="rounded-md border bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{p.descricao}</p>
                      <p className="text-sm text-muted-foreground">{p.maquina}</p>
                    </div>
                    <UrgencyBadge urgencia={p.urgencia} />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <StatusBadge status={p.status} />
                    <span className="text-xs text-muted-foreground">{formatDate(p.dataCriacao)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
