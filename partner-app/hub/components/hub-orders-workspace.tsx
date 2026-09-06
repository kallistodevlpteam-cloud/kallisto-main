"use client";

import React, { useState, useEffect } from "react";
import { HubOrder, HubOrderTab, HubOrderStatus } from "../types/hub-order";
import { INITIAL_HUB_ORDERS } from "../mock/hub-orders-mock-data";
import { HubOrdersListView } from "./hub-orders-list-view";
import { HubOrderDetailView } from "./hub-order-detail-view";
import { HubOrderOdinPanel } from "./hub-order-odin-panel";
import { HubOrderCreateModal } from "./hub-order-create-modal";
import styles from "./hub-orders.module.css";

export function HubOrdersWorkspace() {
  const [orders, setOrders] = useState<HubOrder[]>(INITIAL_HUB_ORDERS);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<HubOrderTab>("requests");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // Sync selectedOrderId from URL query params on mount & popstate
  useEffect(() => {
    const syncFromUrl = () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const orderIdParam = params.get("orderId");
        if (orderIdParam) {
          setSelectedOrderId(orderIdParam);
        } else {
          setSelectedOrderId(null);
        }
      }
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || null;

  const handleSelectOrder = (order: HubOrder) => {
    setSelectedOrderId(order.id);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("orderId", order.id);
      window.history.pushState({}, "", url.toString());
      window.dispatchEvent(new Event("popstate"));
    }
  };

  const handleBackToList = () => {
    setSelectedOrderId(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("orderId");
      window.history.pushState({}, "", url.pathname);
      window.dispatchEvent(new Event("popstate"));
    }
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: HubOrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;

        const updated: HubOrder = {
          ...ord,
          status: newStatus,
        };

        if (newStatus === "CONFIRMED") {
          updated.paymentStatus = "partially_paid";
        } else if (newStatus === "DISPATCHED") {
          updated.dispatchedAt = new Date().toISOString();
          if (!updated.deliveryTracking) {
            updated.deliveryTracking = {
              driverName: "Biju Mathew",
              vehicleNo: "KL-07-CD-4421 (Tata Ace)",
              dispatchedTime: "02:15 PM",
              eta: "04:30 PM",
              deliveryNotes: "Material loaded and secured. Driver in transit.",
            };
          }
        } else if (newStatus === "COMPLETED") {
          updated.completedAt = new Date().toISOString();
          updated.paymentStatus = "paid";
          updated.needsAttention = false;
        }

        return updated;
      })
    );
  };

  const handleCreateOrder = (newOrder: HubOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    setSelectedTab("requests");
    setSelectedOrderId(newOrder.id);
  };

  return (
    <div className={styles.workspace} style={{ gridTemplateColumns: "1fr" }}>
      {/* MAIN CONTENT: LIST VIEW OR DEDICATED ORDER DETAIL WORKSPACE */}
      <section className={styles.leftSection}>
        {selectedOrder ? (
          <HubOrderDetailView
            order={selectedOrder}
            onBack={handleBackToList}
            onUpdateStatus={(newStatus) => handleUpdateOrderStatus(selectedOrder.id, newStatus)}
          />
        ) : (
          <HubOrdersListView
            orders={orders}
            selectedOrderId={selectedOrderId || undefined}
            onSelectOrder={handleSelectOrder}
            onOpenCreateOrder={() => setIsCreateModalOpen(true)}
            isCreateOrderOpen={isCreateModalOpen}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onRemoveOrder={(id) => setOrders((prev) => prev.filter((o) => o.id !== id))}
          />
        )}
      </section>

      {/* CREATE ORDER MODAL */}
      <HubOrderCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateOrder={handleCreateOrder}
      />
    </div>
  );
}
