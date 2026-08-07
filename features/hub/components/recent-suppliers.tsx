import { ArrowUpRight, BadgeCheck } from "lucide-react";

import type { RecentSupplier } from "../types/hub.types";
import styles from "./hub-workspace.module.css";

interface RecentSuppliersProps {
  suppliers: ReadonlyArray<RecentSupplier>;
  onSelectSupplier: (supplier: RecentSupplier) => void;
}

export function RecentSuppliers({
  suppliers,
  onSelectSupplier,
}: RecentSuppliersProps) {
  return (
    <section
      className={styles.suppliersSection}
      id="recent-suppliers"
      aria-labelledby="recent-suppliers-title"
    >
      <div className={styles.sectionHeading}>
        <h2 id="recent-suppliers-title">Recently used suppliers</h2>
        <p>Verified suppliers used across recent project orders.</p>
      </div>
      <div className={styles.suppliersTableWrap}>
        <table className={styles.suppliersTable}>
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Verified state</th>
              <th>Location</th>
              <th>Categories</th>
              <th>Completed orders</th>
              <th>Average fulfilment</th>
              <th aria-label="Action" />
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td>
                  <strong>{supplier.name}</strong>
                </td>
                <td>
                  <span className={styles.verifiedState}>
                    <BadgeCheck size={15} aria-hidden="true" />
                    {supplier.verified ? "Verified" : "Not verified"}
                  </span>
                </td>
                <td>{supplier.location}</td>
                <td>{supplier.categories}</td>
                <td>{supplier.completedOrders}</td>
                <td>{supplier.averageFulfilment}</td>
                <td>
                  <button
                    className={styles.supplierAction}
                    type="button"
                    aria-label={`Open ${supplier.name}`}
                    onClick={() => onSelectSupplier(supplier)}
                  >
                    Open
                    <ArrowUpRight size={13} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
