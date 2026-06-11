import type { CsvImportRow, ProductType } from "@/lib/products/types";

export function parseProductCsv(text: string): CsvImportRow[] {
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
