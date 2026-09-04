"use client";

import React, { useState } from "react";
import { INITIAL_HUB_PRODUCTS } from "../mock/products-mock-data";
import { ProductSKU } from "../types/product-sku";
import { HubProductsCatalogView } from "./hub-products-catalog-view";
import { HubSkuOdinPanel } from "./hub-sku-odin-panel";
import styles from "./hub-products.module.css";

export function HubProductsWorkspace() {
  const [products, setProducts] = useState<ProductSKU[]>(INITIAL_HUB_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<ProductSKU | null>(null);
  const [isOdinOpen, setIsOdinOpen] = useState(false);

  const handleAddProductSKU = (newSKU: ProductSKU) => {
    setProducts((prev) => [newSKU, ...prev]);
  };

  const handleAddBatchProducts = (newSKUs: ProductSKU[]) => {
    setProducts((prev) => [...newSKUs, ...prev]);
  };

  const handleUpdateProduct = (updatedSKU: ProductSKU) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedSKU.id ? updatedSKU : p)));
    if (selectedProduct?.id === updatedSKU.id) {
      setSelectedProduct(updatedSKU);
    }
  };

  const handleRemoveProduct = (skuId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== skuId));
    if (selectedProduct?.id === skuId) {
      setSelectedProduct(null);
    }
  };

  const handleSelectProduct = (sku: ProductSKU) => {
    setSelectedProduct(sku);
    setIsOdinOpen(true);
  };

  const handleOpenAddMaterials = () => {
    setSelectedProduct(null);
    setIsOdinOpen(true);
  };

  const handleCloseOdin = () => {
    setIsOdinOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div
      className={styles.workspace}
      style={{
        gridTemplateColumns: isOdinOpen ? "minmax(0, 1fr) 390px" : "1fr",
      }}
    >
      {/* Left Column: Independently scrollable Master Material & SKU Catalog */}
      <main className={styles.leftCatalogSection}>
        <HubProductsCatalogView
          products={products}
          selectedProductId={selectedProduct?.id}
          onSelectProduct={handleSelectProduct}
          onOpenAddMaterials={handleOpenAddMaterials}
          isAddMaterialsOpen={isOdinOpen && !selectedProduct}
          onUpdateProduct={handleUpdateProduct}
          onRemoveProduct={handleRemoveProduct}
        />
      </main>

      {/* Right Column: Pinned Sticky Intelligent AI Material Onboarding & Product Intelligence Panel */}
      {isOdinOpen && (
        <div className={styles.rightPanelSection}>
          <HubSkuOdinPanel
            selectedProduct={selectedProduct}
            onDeselectProduct={() => setSelectedProduct(null)}
            onAddProductSKU={handleAddProductSKU}
            onAddBatchProducts={handleAddBatchProducts}
            onUpdateProduct={handleUpdateProduct}
            onClose={handleCloseOdin}
          />
        </div>
      )}
    </div>
  );
}
