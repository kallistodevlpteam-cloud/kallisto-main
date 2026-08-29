export type ProductCategory =
  | "Cement & Aggregates"
  | "Steel & TMT"
  | "Plumbing & Electrical"
  | "Finishes & Tiles"
  | "Masonry & Blocks"
  | "Paints & Waterproofing"
  | "Structural Hardware";

export type ProductStockStatus = "In Stock" | "Low Stock" | "Not Available" | "Available";

export interface ProductSKU {
  id: string;
  skuCode: string;
  name: string;
  category: ProductCategory;
  subcategory: string;
  brand: string;
  specification: string;
  unit: string;
  contractorPrice: number;
  mrpPrice: number;
  stockQty: number;
  reorderLevel: number;
  moq: number;
  leadTime: string;
  depotBay: string;
  verified: boolean;
  status: ProductStockStatus | string;
  createdAt: string;
  imageUrl?: string;
}

export interface NewSKUFormData {
  name: string;
  skuCode: string;
  category: ProductCategory;
  subcategory: string;
  brand: string;
  specification: string;
  unit: string;
  contractorPrice: number;
  mrpPrice: number;
  stockQty: number;
  reorderLevel: number;
  moq: number;
  leadTime: string;
  depotBay: string;
}
