import type { Product } from "@/lib/products/types";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-001",
    name: "BPC-157 Research Peptide",
    sku: "FR-BPC157-5MG",
    category: "Peptides",
    type: "research",
    status: "active",
    stock: 142,
    lowStockThreshold: 25,
    price: 89,
    clinicPrice: 72,
    shortDescription: "Laboratory-grade BPC-157 for verified research protocols.",
    description:
      "<p>High-purity BPC-157 supplied with full COA documentation. Intended for licensed research use only.</p>",
    images: [
      "/brand/product-vial-2x-blend-hero.png",
      "/brand/product-vial-2x-blend-glass.png",
      "/brand/biological-peptide-membrane-macro.png",
    ],
    coaFileName: "BPC-157-COA-2026.pdf",
    variants: [
      { id: "v1", size: "5 mg", strength: "99.2%", price: 89, imageUrl: "/brand/product-vial-2x-blend-hero.png" },
      { id: "v2", size: "10 mg", strength: "99.1%", price: 149, imageUrl: "/brand/product-vial-2x-blend-glass.png" },
    ],
    pricingTiers: [
      { id: "t1", minQty: 1, maxQty: 9, unitPrice: 89 },
      { id: "t2", minQty: 10, maxQty: 49, unitPrice: 79 },
      { id: "t3", minQty: 50, maxQty: null, unitPrice: 69 },
    ],
    form: "Lyophilized powder",
    strength: "5 mg / 10 mg",
    bestUseWithin: "24 months unopened",
    deaSchedule: "Not scheduled (research)",
    productTypeLabel: "Research peptide",
    directions: "For research use only. Not for human consumption.",
    stockHistory: [
      { id: "h1", date: "2026-03-01", change: -12, quantity: 142, note: "Clinic order #8821" },
      { id: "h2", date: "2026-02-18", change: 50, quantity: 154, note: "Inbound lot verification" },
    ],
  },
  {
    id: "prod-002",
    name: "Semaglutide Pharmacy Grade",
    sku: "FR-SEMA-2.5MG",
    category: "GLP-1",
    type: "pharmacy",
    status: "active",
    stock: 18,
    lowStockThreshold: 20,
    price: 210,
    clinicPrice: 185,
    shortDescription: "Cold-chain GLP-1 with verified lot release documentation.",
    description:
      "<p>Pharmacy-grade semaglutide with temperature-controlled fulfillment and COA on every lot.</p>",
    images: [
      "/brand/industry-ozempic-injection-pens.png",
      "/brand/packaging-vial-drawer-box.png",
    ],
    coaFileName: "Semaglutide-COA-2026.pdf",
    variants: [
      { id: "v1", size: "2.5 mg", strength: "Pharmacy grade", price: 210, imageUrl: "/brand/industry-ozempic-injection-pens.png" },
      { id: "v2", size: "5 mg", strength: "Pharmacy grade", price: 380, imageUrl: "/brand/packaging-vial-drawer-box.png" },
    ],
    pricingTiers: [
      { id: "t1", minQty: 1, maxQty: 4, unitPrice: 210 },
      { id: "t2", minQty: 5, maxQty: null, unitPrice: 195 },
    ],
    form: "Injectable solution",
    strength: "2.5 mg / 5 mg",
    bestUseWithin: "36 months refrigerated",
    deaSchedule: "Schedule IV (state-dependent)",
    productTypeLabel: "Pharmacy GLP-1",
    directions: "Dispense per prescriber protocol. Maintain cold chain.",
    stockHistory: [
      { id: "h1", date: "2026-03-04", change: -6, quantity: 18, note: "Pharmacy reorder" },
    ],
  },
  {
    id: "prod-003",
    name: "TB-500 Research Blend",
    sku: "FR-TB500-2MG",
    category: "Peptides",
    type: "research",
    status: "draft",
    stock: 0,
    lowStockThreshold: 15,
    price: 95,
    clinicPrice: 78,
    shortDescription: "Research peptide blend with third-party verification.",
    description: "<p>TB-500 research material with batch-level traceability.</p>",
    images: ["/brand/biological-glass-structure.png"],
    variants: [
      { id: "v1", size: "2 mg", strength: "98.8%", price: 95, imageUrl: "/brand/biological-glass-structure.png" },
    ],
    pricingTiers: [{ id: "t1", minQty: 1, maxQty: null, unitPrice: 95 }],
    form: "Lyophilized powder",
    strength: "2 mg",
    bestUseWithin: "24 months unopened",
    deaSchedule: "Not scheduled (research)",
    productTypeLabel: "Research peptide",
    directions: "Research use only.",
    stockHistory: [],
  },
  {
    id: "prod-004",
    name: "Cold Chain Shipping Kit",
    sku: "FR-COLD-KIT",
    category: "Supplies",
    type: "pharmacy",
    status: "active",
    stock: 320,
    lowStockThreshold: 40,
    price: 24,
    clinicPrice: 19,
    shortDescription: "Insulated shipper with validated cold packs.",
    description: "<p>Validated cold-chain packaging for peptide fulfillment.</p>",
    images: ["/brand/packaging-cold-chain-shipping.png"],
    variants: [
      { id: "v1", size: "Standard", strength: "N/A", price: 24, imageUrl: "/brand/packaging-cold-chain-shipping.png" },
    ],
    pricingTiers: [{ id: "t1", minQty: 1, maxQty: null, unitPrice: 24 }],
    form: "Packaging kit",
    strength: "N/A",
    bestUseWithin: "Single use",
    deaSchedule: "N/A",
    productTypeLabel: "Fulfillment supply",
    directions: "Use for temperature-sensitive shipments.",
    stockHistory: [
      { id: "h1", date: "2026-02-28", change: 100, quantity: 320, note: "Restock" },
    ],
  },
];

export function getProductById(id: string) {
  return MOCK_PRODUCTS.find((product) => product.id === id);
}

export function productsToCsv(products: Product[]) {
  const header = "SKU,Name,Category,Type,Stock,Status,Clinic Price";
  const rows = products.map(
    (p) =>
      `${p.sku},"${p.name}",${p.category},${p.type},${p.stock},${p.status},${p.clinicPrice}`,
  );
  return [header, ...rows].join("\n");
}

import type { CsvImportRow, ProductType } from "@/lib/products/types";

export function parseMockCsv(text: string): CsvImportRow[] {
  const lines = text.trim().split("\n").slice(1);
  return lines.map((line, index) => {
    const parts = line.split(",");
    const row = index + 2;
    if (parts.length < 6) {
      return {
        row,
        sku: "",
        name: "",
        category: "",
        type: "research" as const,
        price: 0,
        stock: 0,
        error: "Invalid column count",
      };
    }
    const [sku, name, category, type, price, stock] = parts;
    const parsedType: ProductType = type?.trim() === "pharmacy" ? "pharmacy" : "research";
    const parsedPrice = Number(price);
    const parsedStock = Number(stock);
    if (Number.isNaN(parsedPrice) || Number.isNaN(parsedStock)) {
      return {
        row,
        sku: sku?.trim() ?? "",
        name: name?.trim() ?? "",
        category: category?.trim() ?? "",
        type: parsedType,
        price: 0,
        stock: 0,
        error: "Price and stock must be numbers",
      };
    }
    return {
      row,
      sku: sku?.trim() ?? "",
      name: name?.trim() ?? "",
      category: category?.trim() ?? "",
      type: parsedType,
      price: parsedPrice,
      stock: parsedStock,
    };
  });
}
