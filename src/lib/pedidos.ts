export type Urgencia = "Normal" | "Urgente";
export type Status = "Aguardando orçamento" | "Comprado" | "Recebido no estoque" | "Pago";
export type FormaPagamento = "Cheque" | "Pix" | "Boleto";
export type Condicao = "OK" | "Com avaria";

export interface Pedido {
  id: string;
  descricao: string;
  maquina: string;
  urgencia: Urgencia;
  observacao: string;
  status: Status;
  criadoPor: string;
  dataCriacao: string;
  fornecedor: string;
  valor: number;
  previsaoEntrega: string;
  dataCompra: string;
  quantidadeRecebida: number;
  condicao: Condicao | "";
  observacaoEstoque: string;
  dataRecebimento: string;
  numeroNF: string;
  dataVencimento: string;
  formaPagamento: FormaPagamento | "";
  dataPagamento: string;
  anotacoesGenisson?: string;
}

const STORAGE_KEY = "pedidos";

export function getPedidos(): Pedido[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function savePedidos(pedidos: Pedido[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pedidos));
}

export function addPedido(pedido: Omit<Pedido, "id" | "dataCriacao" | "status" | "criadoPor" | "fornecedor" | "valor" | "previsaoEntrega" | "dataCompra" | "quantidadeRecebida" | "condicao" | "observacaoEstoque" | "dataRecebimento" | "numeroNF" | "dataVencimento" | "formaPagamento" | "dataPagamento">): Pedido {
  const newPedido: Pedido = {
    id: crypto.randomUUID(),
    dataCriacao: new Date().toISOString(),
    status: "Aguardando orçamento",
    criadoPor: "Juarez",
    fornecedor: "",
    valor: 0,
    previsaoEntrega: "",
    dataCompra: "",
    quantidadeRecebida: 0,
    condicao: "",
    observacaoEstoque: "",
    dataRecebimento: "",
    numeroNF: "",
    dataVencimento: "",
    formaPagamento: "",
    dataPagamento: "",
    anotacoesGenisson: "",
    ...pedido,
  };
  const pedidos = getPedidos();
  pedidos.unshift(newPedido);
  savePedidos(pedidos);
  return newPedido;
}

export function updatePedido(id: string, updates: Partial<Pedido>) {
  const pedidos = getPedidos();
  const idx = pedidos.findIndex((p) => p.id === id);
  if (idx !== -1) {
    pedidos[idx] = { ...pedidos[idx], ...updates };
    savePedidos(pedidos);
  }
}

const SAIDAS_KEY = "saidas_estoque";

export interface SaidaEstoque {
  id: string;
  pedidoId: string;
  descricao: string;
  quantidade: number;
  pessoa: string;
  centroDeCusto: string;
  dataSaida: string;
}

export function getSaidas(): SaidaEstoque[] {
  try {
    const data = localStorage.getItem(SAIDAS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveSaidas(saidas: SaidaEstoque[]) {
  localStorage.setItem(SAIDAS_KEY, JSON.stringify(saidas));
}

export function addSaida(saida: Omit<SaidaEstoque, "id" | "dataSaida">): SaidaEstoque {
  const nova: SaidaEstoque = {
    id: crypto.randomUUID(),
    dataSaida: new Date().toISOString(),
    ...saida,
  };
  const saidas = getSaidas();
  saidas.unshift(nova);
  saveSaidas(saidas);
  return nova;
}

export const STATUS_ORDER: Status[] = [
  "Aguardando orçamento",
  "Comprado",
  "Recebido no estoque",
  "Pago",
];

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function formatDate(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function formatDateTime(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR");
}
