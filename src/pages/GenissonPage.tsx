import { useState, useRef, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensors,
  useSensor,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, NotebookPen } from "lucide-react";
import { ProfileHeader } from "@/components/ProfileHeader";
import { UrgencyBadge } from "@/components/UrgencyBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getPedidos,
  updatePedido,
  formatDate,
  formatCurrency,
  STATUS_ORDER,
  type Pedido,
  type Status,
} from "@/lib/pedidos";

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
    { key: "kanban", label: "Kanban de Acompanhamento" },
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
                        <p className="text-sm text-muted-foreground">
                          {p.maquina} · {formatDate(p.dataCriacao)}
                        </p>
                      </div>
                      <UrgencyBadge urgencia={p.urgencia} />
                    </div>
                    <AnnotationField pedido={p} onSave={refresh} />
                    {expandedId === p.id ? (
                      <div className="mt-4 space-y-3 border-t pt-4">
                        <Input
                          placeholder="Fornecedor"
                          value={fornecedor}
                          onChange={(e) => setFornecedor(e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Valor (R$)"
                          value={valor}
                          onChange={(e) => setValor(e.target.value)}
                          min="0"
                          step="0.01"
                        />
                        <Input
                          type="date"
                          value={previsao}
                          onChange={(e) => setPrevisao(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button onClick={() => handleCompra(p.id)} className="flex-1">
                            Confirmar Compra
                          </Button>
                          <Button variant="outline" onClick={() => setExpandedId(null)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => {
                          setExpandedId(p.id);
                          setFornecedor("");
                          setValor("");
                          setPrevisao("");
                        }}
                      >
                        Registrar Compra
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "kanban" && <KanbanBoard pedidos={pedidos} onRefresh={refresh} />}

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
                        <p className="text-sm text-muted-foreground">
                          {p.fornecedor} · {formatCurrency(p.valor)}
                        </p>
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

// ─── Annotation Field ────────────────────────────────────────────────────────

function AnnotationField({ pedido, onSave }: { pedido: Pedido; onSave: () => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(pedido.anotacoesGenisson ?? "");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasNote = !!(pedido.anotacoesGenisson?.trim());

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleChange = (value: string) => {
    setText(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      updatePedido(pedido.id, { anotacoesGenisson: value });
      onSave();
    }, 1000);
  };

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs transition-colors hover:bg-muted"
      >
        <NotebookPen
          size={13}
          className={hasNote ? "text-blue-500" : "text-muted-foreground"}
        />
        <span className={hasNote ? "font-medium text-blue-500" : "text-muted-foreground"}>
          {hasNote ? "Ver anotação" : "Anotar"}
        </span>
        {hasNote && <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-blue-500" />}
      </button>
      {open && (
        <textarea
          className="mt-1 w-full resize-none rounded border bg-background px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          rows={3}
          placeholder="Anotações internas..."
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          autoFocus
        />
      )}
    </div>
  );
}

// ─── Kanban Board ─────────────────────────────────────────────────────────────

function KanbanBoard({
  pedidos,
  onRefresh,
}: {
  pedidos: Pedido[];
  onRefresh: () => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const activePedido = activeId ? (pedidos.find((p) => p.id === activeId) ?? null) : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const newStatus = over.id as Status;
    const pedido = pedidos.find((p) => p.id === active.id);
    if (!pedido || pedido.status === newStatus) return;
    updatePedido(String(active.id), { status: newStatus });
    onRefresh();
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STATUS_ORDER.map((status) => {
          const cards = pedidos.filter((p) => p.status === status);
          return (
            <KanbanColumn
              key={status}
              status={status}
              cards={cards}
              onRefresh={onRefresh}
            />
          );
        })}
      </div>
      <DragOverlay>
        {activePedido && (
          <div className="rotate-1 cursor-grabbing rounded border bg-card p-3 shadow-lg opacity-95">
            <p className="text-sm font-medium">{activePedido.descricao}</p>
            <p className="text-xs text-muted-foreground">{activePedido.maquina}</p>
            <div className="mt-2">
              <UrgencyBadge urgencia={activePedido.urgencia} />
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({
  status,
  cards,
  onRefresh,
}: {
  status: Status;
  cards: Pedido[];
  onRefresh: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`min-w-[240px] flex-1 rounded-md border p-3 transition-colors ${
        isOver ? "border-primary/40 bg-accent/60" : "bg-muted/50"
      }`}
    >
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
            <DraggableCard key={p.id} pedido={p} onRefresh={onRefresh} />
          ))}
        </div>
      )}
    </div>
  );
}

function DraggableCard({
  pedido,
  onRefresh,
}: {
  pedido: Pedido;
  onRefresh: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: pedido.id,
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded border bg-card p-3 shadow-sm transition-opacity ${
        isDragging ? "opacity-40" : "opacity-100"
      }`}
    >
      <div className="flex items-start gap-1">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
          tabIndex={-1}
          aria-label="Arrastar card"
        >
          <GripVertical size={14} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{pedido.descricao}</p>
          <p className="text-xs text-muted-foreground">{pedido.maquina}</p>
          <div className="mt-2 flex items-center gap-2">
            <UrgencyBadge urgencia={pedido.urgencia} />
          </div>
          {pedido.fornecedor && (
            <p className="mt-1 text-xs text-muted-foreground">
              {pedido.fornecedor} · {formatCurrency(pedido.valor)}
            </p>
          )}
          <AnnotationField pedido={pedido} onSave={onRefresh} />
        </div>
      </div>
    </div>
  );
}
