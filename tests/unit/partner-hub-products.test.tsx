import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { HubProductsWorkspace } from "@/partner-app/hub/components/hub-products-workspace";
import { PartnerAuthProvider } from "@/partner-app/auth/context/partner-auth-context";
import { PartnerAuthService } from "@/partner-app/auth/services/partner-auth-service";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/partner/hub/products",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("Hub Products Catalog & Odin SKU Intake Workspace", () => {
  beforeEach(async () => {
    cleanup();
    PartnerAuthService.clearSession();
    await PartnerAuthService.authenticate({
      emailOrPhone: "ananya@kallisto-hub.com",
      partnerType: "HUB",
    });
  });

  afterEach(cleanup);

  it("renders catalog with Add Product CTA and toggles Odin panel on demand", () => {
    render(
      <PartnerAuthProvider>
        <HubProductsWorkspace />
      </PartnerAuthProvider>
    );

    // Left Catalog section
    expect(screen.getByRole("heading", { name: "Products" })).toBeDefined();
    expect(screen.getByText(/Your Kallisto Hub catalog/i)).toBeDefined();
    expect(screen.getByText(/Materials you offer through Kallisto Hub/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Add Product/i })).toBeDefined();
    expect(screen.getByText("Active Products")).toBeDefined();
    expect(screen.getAllByText("In Stock").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Low Stock").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Not Available").length).toBeGreaterThan(0);
    expect(screen.getByText(/Catalog Value/i)).toBeDefined();
    expect(screen.getByText(/Price Accuracy/i)).toBeDefined();
    expect(screen.getByText(/Avg. Fulfilment/i)).toBeDefined();
    expect(screen.getByText("UltraTech Weather Plus 53 Grade Cement")).toBeDefined();
    expect(screen.getByText("Tata Tiscon 550D Super Ductile TMT Rebar 12mm")).toBeDefined();

    // Odin panel is hidden by default
    expect(screen.queryByText("Onboard to Hub Catalog")).toBeNull();

    // Click "Add Product" CTA
    const addProductBtn = screen.getByRole("button", { name: /Add Product/i });
    fireEvent.click(addProductBtn);

    // Right Odin section (Material adding agent) is now rendered
    expect(screen.getByText("Onboard to Hub Catalog")).toBeDefined();
    expect(screen.getByText("ODIN AI")).toBeDefined();
    expect(screen.getByText("Add materials to your Hub catalog")).toBeDefined();
    expect(screen.getByText("Upload Supplier Price List")).toBeDefined();
    expect(screen.getByText("Add Single Product Manually")).toBeDefined();
  });

  it("filters product catalog by category dropdown", () => {
    render(
      <PartnerAuthProvider>
        <HubProductsWorkspace />
      </PartnerAuthProvider>
    );

    const categoryDropdownTrigger = screen.getByRole("button", { name: /Filter by Material Category/i });
    fireEvent.click(categoryDropdownTrigger);

    const steelOptions = screen.getAllByRole("button", { name: /Steel & TMT/i });
    fireEvent.click(steelOptions[0]);

    expect(screen.getByText("Tata Tiscon 550D Super Ductile TMT Rebar 12mm")).toBeDefined();
    expect(screen.queryByText("UltraTech Weather Plus 53 Grade Cement")).toBeNull();
  });

  it("filters product catalog by search input", () => {
    render(
      <PartnerAuthProvider>
        <HubProductsWorkspace />
      </PartnerAuthProvider>
    );

    const searchInput = screen.getByPlaceholderText(/Search by SKU, product name/i);
    fireEvent.change(searchInput, { target: { value: "Finolex" } });

    expect(screen.getByText("Finolex FlowGuard Plus CPVC Pipes 1-inch (25mm)")).toBeDefined();
    expect(screen.queryByText("Tata Tiscon 550D Super Ductile TMT Rebar 12mm")).toBeNull();
  });

  it("completes intelligent single material onboarding and publishes SKU to the catalog", async () => {
    render(
      <PartnerAuthProvider>
        <HubProductsWorkspace />
      </PartnerAuthProvider>
    );

    // Open Odin panel via CTA
    const addProductBtn = screen.getByRole("button", { name: /Add Product/i });
    fireEvent.click(addProductBtn);

    // Step 1: Click Add Single Product Manually & select Cement & Aggregates
    const addSingleBtn = screen.getByRole("button", { name: /Add Single Product Manually/i });
    fireEvent.click(addSingleBtn);

    const dropdownTrigger = screen.getByText(/Select a material category/i);
    fireEvent.click(dropdownTrigger);

    const cementOptions = screen.getAllByRole("button", { name: /Cement & Aggregates/i });
    fireEvent.click(cementOptions[cementOptions.length - 1]);

    // Step 2: Intelligent Spec Card with 1-click Publish
    const publishBtn = screen.getByRole("button", { name: /Publish SKU to Hub Catalog/i });
    fireEvent.click(publishBtn);

    // Step 3: Confirmation Receipt
    expect(screen.getByText(/Published to Hub Catalog/i)).toBeDefined();
    expect(screen.getAllByText(/UltraTech Weather Plus 53 Grade Cement/i).length).toBeGreaterThan(0);
  });

  it("handles intelligent batch spreadsheet import of multiple SKUs", async () => {
    render(
      <PartnerAuthProvider>
        <HubProductsWorkspace />
      </PartnerAuthProvider>
    );

    // Open Odin panel via CTA
    const addProductBtn = screen.getByRole("button", { name: /Add Product/i });
    fireEvent.click(addProductBtn);

    // Click sample excel spreadsheet intake
    const excelBtn = screen.getByRole("button", { name: /Upload Supplier Price List/i });
    fireEvent.click(excelBtn);

    await waitFor(() => {
      expect(screen.getByText(/5 SKUs Identified/i)).toBeDefined();
    });

    const batchImportBtn = screen.getByRole("button", { name: /Publish 5 SKUs to Hub Catalog/i });
    fireEvent.click(batchImportBtn);

    expect(screen.getByText(/5 SKUs are now live for contractor orders/i)).toBeDefined();
  });

  it("opens SKU action dropdown, shows full specifications, and allows changing unit price", () => {
    render(
      <PartnerAuthProvider>
        <HubProductsWorkspace />
      </PartnerAuthProvider>
    );

    // Open options dropdown for first SKU (UltraTech)
    const optionsButton = screen.getByLabelText(/Options for UltraTech/i);
    expect(optionsButton).toBeDefined();
    fireEvent.click(optionsButton);

    // Verify secondary action menu items
    expect(screen.getByRole("button", { name: /View Product/i })).toBeDefined();
    expect(screen.getByRole("button", { name: "Edit" })).toBeDefined();
    expect(screen.getByRole("button", { name: /Update Price/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Update Inventory/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Change Supplier/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Archive/i })).toBeDefined();

    // Click Update Price
    const updatePriceBtn = screen.getByRole("button", { name: /Update Price/i });
    fireEvent.click(updatePriceBtn);

    // Modal opens
    expect(screen.getByText("Update Contractor Price")).toBeDefined();
    const priceInput = screen.getByRole("spinbutton");
    fireEvent.change(priceInput, { target: { value: "450" } });

    const saveBtn = screen.getByRole("button", { name: /Save Price/i });
    fireEvent.click(saveBtn);

    // Price updated to ₹450
    expect(screen.getByText("₹450")).toBeDefined();
  });

  it("opens Product Details modal popup when clicking View Product option", () => {
    render(
      <PartnerAuthProvider>
        <HubProductsWorkspace />
      </PartnerAuthProvider>
    );

    // Open options dropdown for first SKU (UltraTech)
    const optionsButton = screen.getByLabelText(/Options for UltraTech/i);
    fireEvent.click(optionsButton);

    // Click View Product
    const viewProductBtn = screen.getByRole("button", { name: /View Product/i });
    fireEvent.click(viewProductBtn);

    // Product Details modal popup is visible
    expect(screen.getByRole("heading", { name: "Product Details" })).toBeDefined();
    expect(screen.getAllByText("HUB-CEM-UT53-01").length).toBeGreaterThan(0);
    expect(screen.getByText("Commercials")).toBeDefined();
    expect(screen.getByText("Depot Logistics")).toBeDefined();
    expect(screen.getByText(/Technical Specification & Quality Compliance/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Ask Odin/i })).toBeDefined();
    expect(screen.getByRole("button", { name: "Edit SKU" })).toBeDefined();

    // Close modal
    const closeBtn = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole("heading", { name: "Product Details" })).toBeNull();
  });

  it("displays Live Depot Inventory & Pricing Telemetry strip", () => {
    render(
      <PartnerAuthProvider>
        <HubProductsWorkspace />
      </PartnerAuthProvider>
    );

    expect(screen.getByText(/₹18.4L/i)).toBeDefined();
    expect(screen.getByText(/Catalog Value/i)).toBeDefined();
    expect(screen.getByText(/96%/i)).toBeDefined();
    expect(screen.getByText(/Price Accuracy/i)).toBeDefined();
    expect(screen.getByText(/4.2h/i)).toBeDefined();
    expect(screen.getByText(/Avg. Fulfilment/i)).toBeDefined();
    expect(screen.getByText(/Live Depot Inventory & Pricing Telemetry/i)).toBeDefined();
  });

  it("shifts Odin into Product Intelligence mode when clicking a product and enables contextual actions", () => {
    render(
      <PartnerAuthProvider>
        <HubProductsWorkspace />
      </PartnerAuthProvider>
    );

    // Click on UltraTech product row
    const ultratechText = screen.getByText("UltraTech Weather Plus 53 Grade Cement");
    fireEvent.click(ultratechText);

    // Odin panel shifts to Product Intelligence
    expect(screen.getAllByText(/Odin · Product Intelligence/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText("UltraTech Weather Plus 53 Grade Cement").length).toBeGreaterThan(0);
    expect(screen.getByText("Current price:")).toBeDefined();
    expect(screen.getByText("Stock:")).toBeDefined();
    expect(screen.getByText("Supplier:")).toBeDefined();
    expect(screen.getByText("Delivery:")).toBeDefined();

    // Verify Action Intent Buttons
    expect(screen.getByText("What would you like to do?")).toBeDefined();
    const compareBtn = screen.getByRole("button", { name: /Compare prices/i });
    const updatePriceBtn = screen.getByRole("button", { name: /Update price/i });
    const checkSupplierBtn = screen.getByRole("button", { name: /Check supplier/i });
    const viewSalesBtn = screen.getByRole("button", { name: /View sales/i });
    const addToProjectBtn = screen.getByRole("button", { name: /Add to project/i });

    expect(compareBtn).toBeDefined();
    expect(updatePriceBtn).toBeDefined();
    expect(checkSupplierBtn).toBeDefined();
    expect(viewSalesBtn).toBeDefined();
    expect(addToProjectBtn).toBeDefined();

    // Click "Compare prices"
    fireEvent.click(compareBtn);
    expect(screen.getByText(/Regional Price Comparison/i)).toBeDefined();
    expect(screen.getByText(/Regional Index \(North Kerala\):/i)).toBeDefined();

    // Click "Update price"
    fireEvent.click(updatePriceBtn);
    expect(screen.getByText(/Quick Rate Revision/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Save & Apply Price/i })).toBeDefined();

    // Click "View sales"
    fireEvent.click(viewSalesBtn);
    expect(screen.getByText("Sales & Demand")).toBeDefined();
    expect(screen.getByText("Demand trending upward")).toBeDefined();
    expect(screen.getByText(/Odin recommendation:/i)).toBeDefined();

    // Verify input placeholder
    expect(screen.getByPlaceholderText("Ask Odin about this product...")).toBeDefined();

    // Verify suggested action prompt chips
    expect(screen.getByRole("button", { name: "Why did the price increase?" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Should I reorder?" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Find a cheaper supplier" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Compare this with ACC" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Add 500 bags to next PO" })).toBeDefined();
  });
});
