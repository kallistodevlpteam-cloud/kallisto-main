"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import type { ClientNotificationPreferences } from "../../types/client-settings.types";
import styles from "../../styles/client-settings.module.css";

const INITIAL_NOTIFICATIONS: ClientNotificationPreferences = {
  project: {
    projectUpdates: true,
    taskUpdates: true,
    approvalRequests: true,
    documentUpdates: true,
  },
  enquiries: {
    providerResponses: true,
    newQuotations: true,
    enquiryStatusChanges: true,
  },
  payments: {
    paymentReminders: true,
    paymentConfirmations: true,
    paymentFailures: true,
  },
  schedule: {
    meetings: true,
    siteVisits: true,
    upcomingDeadlines: true,
  },
  channels: {
    inApp: true,
    email: true,
    whatsapp: true,
    sms: false,
  },
};

export function NotificationsSection() {
  const [notifications, setNotifications] = useState<ClientNotificationPreferences>(INITIAL_NOTIFICATIONS);
  const [isSaved, setIsSaved] = useState(false);

  const triggerSave = (updated: ClientNotificationPreferences) => {
    setNotifications(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Delivery Channels */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardHeaderTitle}>Delivery Channels</h2>
            <p className={styles.cardHeaderSubtitle}>
              Select where you wish to receive urgent alerts, drawing updates, and milestone reminders.
            </p>
          </div>
          {isSaved && (
            <div className={styles.toastSaved}>
              <Check size={14} />
              <span>Saved</span>
            </div>
          )}
        </div>

        <div className={styles.cardBody}>
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>In-App Notifications</span>
              <span className={styles.settingDesc}>Real-time alerts inside the Kallisto top bar and notification bell.</span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={notifications.channels.inApp}
                onChange={(e) =>
                  triggerSave({
                    ...notifications,
                    channels: { ...notifications.channels, inApp: e.target.checked },
                  })
                }
              />
              <span className={styles.slider} />
            </label>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>WhatsApp Notifications</span>
              <span className={styles.settingDesc}>Instant milestone approvals and critical site visit confirmations.</span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={notifications.channels.whatsapp}
                onChange={(e) =>
                  triggerSave({
                    ...notifications,
                    channels: { ...notifications.channels, whatsapp: e.target.checked },
                  })
                }
              />
              <span className={styles.slider} />
            </label>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Email Summaries</span>
              <span className={styles.settingDesc}>Daily project digest, invoices, and comprehensive milestone reports.</span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={notifications.channels.email}
                onChange={(e) =>
                  triggerSave({
                    ...notifications,
                    channels: { ...notifications.channels, email: e.target.checked },
                  })
                }
              />
              <span className={styles.slider} />
            </label>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>SMS Alerts</span>
              <span className={styles.settingDesc}>Security OTPs and urgent payment deadline alerts via text message.</span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={notifications.channels.sms}
                onChange={(e) =>
                  triggerSave({
                    ...notifications,
                    channels: { ...notifications.channels, sms: e.target.checked },
                  })
                }
              />
              <span className={styles.slider} />
            </label>
          </div>
        </div>
      </div>

      {/* Project Notifications */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardHeaderTitle}>Project Alerts</h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Project Updates</span>
              <span className={styles.settingDesc}>Daily log entries and site progress milestones.</span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={notifications.project.projectUpdates}
                onChange={(e) =>
                  triggerSave({
                    ...notifications,
                    project: { ...notifications.project, projectUpdates: e.target.checked },
                  })
                }
              />
              <span className={styles.slider} />
            </label>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Task Updates</span>
              <span className={styles.settingDesc}>Phase progress changes and trade crew task completions.</span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={notifications.project.taskUpdates}
                onChange={(e) =>
                  triggerSave({
                    ...notifications,
                    project: { ...notifications.project, taskUpdates: e.target.checked },
                  })
                }
              />
              <span className={styles.slider} />
            </label>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Approval Requests</span>
              <span className={styles.settingDesc}>When an architect or specialist requests your review on a drawing or BOQ.</span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={notifications.project.approvalRequests}
                onChange={(e) =>
                  triggerSave({
                    ...notifications,
                    project: { ...notifications.project, approvalRequests: e.target.checked },
                  })
                }
              />
              <span className={styles.slider} />
            </label>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Document Updates</span>
              <span className={styles.settingDesc}>New CAD revisions, 3D renders, and engineering structural calculations.</span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={notifications.project.documentUpdates}
                onChange={(e) =>
                  triggerSave({
                    ...notifications,
                    project: { ...notifications.project, documentUpdates: e.target.checked },
                  })
                }
              />
              <span className={styles.slider} />
            </label>
          </div>
        </div>
      </div>

      {/* Enquiries & Proposals */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardHeaderTitle}>Enquiries & Proposals</h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Provider Responses</span>
              <span className={styles.settingDesc}>When an architect replies to your project inquiry.</span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={notifications.enquiries.providerResponses}
                onChange={(e) =>
                  triggerSave({
                    ...notifications,
                    enquiries: { ...notifications.enquiries, providerResponses: e.target.checked },
                  })
                }
              />
              <span className={styles.slider} />
            </label>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>New Quotations & Estimates</span>
              <span className={styles.settingDesc}>When verified service providers submit detailed commercial bids.</span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={notifications.enquiries.newQuotations}
                onChange={(e) =>
                  triggerSave({
                    ...notifications,
                    enquiries: { ...notifications.enquiries, newQuotations: e.target.checked },
                  })
                }
              />
              <span className={styles.slider} />
            </label>
          </div>
        </div>
      </div>

      {/* Payments */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardHeaderTitle}>Payments & Escrow</h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Payment Reminders</span>
              <span className={styles.settingDesc}>Upcoming milestone release reminders.</span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={notifications.payments.paymentReminders}
                onChange={(e) =>
                  triggerSave({
                    ...notifications,
                    payments: { ...notifications.payments, paymentReminders: e.target.checked },
                  })
                }
              />
              <span className={styles.slider} />
            </label>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Payment Confirmations</span>
              <span className={styles.settingDesc}>Instant receipt and milestone settlement notifications.</span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={notifications.payments.paymentConfirmations}
                onChange={(e) =>
                  triggerSave({
                    ...notifications,
                    payments: { ...notifications.payments, paymentConfirmations: e.target.checked },
                  })
                }
              />
              <span className={styles.slider} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
