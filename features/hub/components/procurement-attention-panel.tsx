import {
  AlertCircle,
  CircleAlert,
  Clock3,
  Info,
  PackageCheck,
} from "lucide-react";

import type {
  ProcurementAlert,
  UpcomingDelivery,
} from "../types/hub.types";
import styles from "./hub-workspace.module.css";

interface ProcurementAttentionPanelProps {
  alerts: ReadonlyArray<ProcurementAlert>;
  deliveries: ReadonlyArray<UpcomingDelivery>;
  onSelectAlert: (alert: ProcurementAlert) => void;
  onSelectDelivery: (delivery: UpcomingDelivery) => void;
}

function AlertIcon({
  severity,
}: Pick<ProcurementAlert, "severity">) {
  if (severity === "critical") {
    return <AlertCircle size={16} aria-hidden="true" />;
  }
  if (severity === "warning") {
    return <CircleAlert size={16} aria-hidden="true" />;
  }
  return <Info size={16} aria-hidden="true" />;
}

export function ProcurementAttentionPanel({
  alerts,
  deliveries,
  onSelectAlert,
  onSelectDelivery,
}: ProcurementAttentionPanelProps) {
  return (
    <aside className={styles.sidePanel} aria-label="Procurement alerts">
      <section aria-labelledby="needs-attention-title">
        <div className={styles.sidePanelHeading}>
          <span className={styles.sidePanelHeadingIcon}>
            <Clock3 size={15} aria-hidden="true" />
          </span>
          <div>
            <h3 id="needs-attention-title">Needs attention</h3>
            <span>{alerts.length} open items</span>
          </div>
        </div>
        <div className={styles.alertList}>
          {alerts.map((alert) => (
            <button
              key={alert.id}
              className={styles.alertItem}
              type="button"
              onClick={() => onSelectAlert(alert)}
            >
              <span
                className={`${styles.alertIcon} ${
                  styles[`alert_${alert.severity}`]
                }`}
              >
                <AlertIcon severity={alert.severity} />
              </span>
              <span>
                <strong>{alert.title}</strong>
                <small>{alert.metadata}</small>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section
        className={styles.deliveriesSection}
        aria-labelledby="upcoming-deliveries-title"
      >
        <div className={styles.sidePanelHeading}>
          <span className={styles.sidePanelHeadingIcon}>
            <PackageCheck size={15} aria-hidden="true" />
          </span>
          <div>
            <h3 id="upcoming-deliveries-title">Upcoming deliveries</h3>
            <span>Next 7 days</span>
          </div>
        </div>
        <div className={styles.deliveryList}>
          {deliveries.map((delivery) => (
            <button
              key={delivery.id}
              type="button"
              onClick={() => onSelectDelivery(delivery)}
            >
              <span>{delivery.material}</span>
              <strong>{delivery.dueLabel}</strong>
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}
