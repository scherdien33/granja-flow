import { useNavigate } from "react-router-dom";
import { Wrench, ShoppingCart, Package, DollarSign, BarChart3 } from "lucide-react";

const profiles = [
  { name: "Juarez", role: "Manutenção", path: "/juarez", icon: Wrench },
  { name: "Gênisson", role: "Compras", path: "/genisson", icon: ShoppingCart },
  { name: "Cristian", role: "Estoque", path: "/cristian", icon: Package },
  { name: "Letiele", role: "Financeiro", path: "/letiele", icon: DollarSign },
  { name: "Eduardo", role: "Gestão", path: "/eduardo", icon: BarChart3 },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="mb-10 text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Granja Darci Zanetti</h1>
        <p className="mt-1 text-muted-foreground">Controle de Compras</p>
      </div>
      <div className="grid w-full max-w-lg grid-cols-2 gap-3 sm:grid-cols-3">
        {profiles.map((p) => (
          <button
            key={p.path}
            onClick={() => navigate(p.path)}
            className="flex flex-col items-center gap-2 rounded-md border bg-card p-6 shadow-sm transition-colors hover:border-primary hover:bg-primary/5 active:scale-[0.98]"
          >
            <p.icon className="h-8 w-8 text-primary" />
            <span className="text-base font-semibold">{p.name}</span>
            <span className="text-xs text-muted-foreground">{p.role}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Index;
