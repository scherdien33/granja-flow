import { Inbox } from "lucide-react";

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Inbox className="mb-3 h-10 w-10" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
