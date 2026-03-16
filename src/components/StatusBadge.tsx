import { Badge } from "@/components/ui/badge";
import type { Status } from "@/lib/pedidos";

const statusColors: Record<Status, string> = {
  "Aguardando orçamento": "bg-yellow-100 text-yellow-800",
  "Comprado": "bg-blue-100 text-blue-800",
  "Recebido no estoque": "bg-emerald-100 text-emerald-800",
  "Pago": "bg-primary/10 text-primary",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge className={`${statusColors[status]} border-0 hover:opacity-90 font-medium`}>
      {status}
    </Badge>
  );
}
