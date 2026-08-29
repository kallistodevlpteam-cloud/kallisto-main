"use client";

import React, { useState } from "react";
import { X, Plus, Trash2, PackagePlus, Check } from "lucide-react";
import { HubOrder, HubOrderItem } from "../types/hub-order";

interface HubOrderCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateOrder: (newOrder: HubOrder) => void;
}

export function HubOrderCreateModal({
  isOpen,
  onClose,
  onCreateOrder,
}: HubOrderCreateModalProps) {
  const [project, setProject] = useState("");
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [requiredBy, setRequiredBy] = useState("Aug 31, 2026");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<Array<{ name: string; category: string; quantity: number; unit: string; estimatedRate: number }>>([
    { name: "UltraTech Super Cement (50kg)", category: "Cement & Aggregates", quantity: 100, unit: "Bags", estimatedRate: 425 },
  ]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { name: "", category: "Cement & Aggregates", quantity: 10, unit: "Units", estimatedRate: 500 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * (item.estimatedRate || 0)), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project.trim() || !customer.trim()) return;

    const generatedId = `ORD-${Math.floor(1025 + Math.random() * 900)}`;

    const formattedItems: HubOrderItem[] = items.map((it, idx) => ({
      id: `item-${generatedId}-${idx + 1}`,
      name: it.name || "Material Item",
      category: it.category,
      quantity: Number(it.quantity) || 1,
      unit: it.unit || "Units",
      estimatedRate: Number(it.estimatedRate) || 100,
      inStock: true,
      availableQty: 200,
      bayLocation: "Bay A-01",
      status: "ready",
    }));

    const newOrder: HubOrder = {
      id: generatedId,
      project,
      customer,
      phone: phone || "+91 98470 00000",
      deliveryLocation: deliveryLocation || "Project Site, Kerala",
      items: formattedItems,
      estimatedValue: calculateTotal(),
      requiredBy,
      status: "REQUEST",
      paymentStatus: "pending",
      createdAt: new Date().toISOString(),
      notes,
    };

    onCreateOrder(newOrder);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "600px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                backgroundColor: "#f1f5f9",
                display: "grid",
                placeItems: "center",
                color: "#0f172a",
              }}
            >
              <PackagePlus size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                Create Material Order
              </h3>
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                Draft an incoming material requisition for quotation and staging.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#64748b",
              padding: "4px",
              borderRadius: "50%",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} style={{ overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Row 1: Project & Customer */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                Project Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Greenwood Villa Phase 2"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                style={{
                  width: "100%",
                  height: "36px",
                  padding: "0 10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                Customer / Contractor *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Arun Kumar (Lead Contractor)"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                style={{
                  width: "100%",
                  height: "36px",
                  padding: "0 10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Row 2: Phone & Delivery Location */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                Contact Phone
              </label>
              <input
                type="tel"
                placeholder="+91 98471 23456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: "100%",
                  height: "36px",
                  padding: "0 10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                Required By Date
              </label>
              <input
                type="text"
                value={requiredBy}
                onChange={(e) => setRequiredBy(e.target.value)}
                style={{
                  width: "100%",
                  height: "36px",
                  padding: "0 10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
              Site Delivery Location
            </label>
            <input
              type="text"
              placeholder="e.g. Kazhakkoottam, Trivandrum, Kerala 695582"
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
              style={{
                width: "100%",
                height: "36px",
                padding: "0 10px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Material Items List */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Material Requisition Items
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "11.5px",
                  fontWeight: 600,
                  color: "#2563eb",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Plus size={13} />
                <span>Add Item</span>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
                    gap: "6px",
                    alignItems: "center",
                    background: "#f8fafc",
                    padding: "8px 10px",
                    borderRadius: "8px",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Material name"
                    value={item.name}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[idx].name = e.target.value;
                      setItems(updated);
                    }}
                    style={{
                      height: "32px",
                      padding: "0 8px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "12px",
                      outline: "none",
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[idx].quantity = Number(e.target.value);
                      setItems(updated);
                    }}
                    style={{
                      height: "32px",
                      padding: "0 8px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "12px",
                      outline: "none",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    value={item.unit}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[idx].unit = e.target.value;
                      setItems(updated);
                    }}
                    style={{
                      height: "32px",
                      padding: "0 8px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "12px",
                      outline: "none",
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Rate ₹"
                    value={item.estimatedRate}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[idx].estimatedRate = Number(e.target.value);
                      setItems(updated);
                    }}
                    style={{
                      height: "32px",
                      padding: "0 8px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "12px",
                      outline: "none",
                    }}
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        padding: "4px",
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Summary Banner */}
          <div
            style={{
              padding: "10px 14px",
              background: "#f1f5f9",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: "12.5px", color: "#64748b", fontWeight: 550 }}>
              Estimated Total ({items.length} materials):
            </span>
            <span style={{ fontSize: "16px", fontWeight: 750, color: "#0f172a" }}>
              ₹{calculateTotal().toLocaleString("en-IN")}
            </span>
          </div>

          {/* Footer Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "4px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#475569",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "8px 18px",
                borderRadius: "8px",
                border: "none",
                background: "#0f172a",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Check size={14} />
              <span>Create Order Requisition</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
