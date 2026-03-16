import { Badge } from "@/components/ui/badge";
import type { Urgencia } from "@/lib/pedidos";

export function UrgencyBadge({ urgencia }: { urgencia: Urgencia }) {
  if (urgencia === "Urgente") {
    return <Badge className="bg-urgent text-urgent-foreground hover:bg-urgent/90 border-0">Urgente</Badge>;
  }
  return <Badge variant="secondary" className="border-0">Normal</Badge>;
}
