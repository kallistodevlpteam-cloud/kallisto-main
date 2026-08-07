import { ArrowRight, RotateCw, X } from "lucide-react";
import type { Invitation } from "../types/team.types";
import { TeamEmptyState } from "./team-empty-state";
import styles from "./team-page.module.css";

interface PendingInvitationsCardProps {
  invitations: Invitation[];
  onResend: (invitationId: string) => void;
  onRevoke: (invitationId: string) => void;
  onInvite: () => void;
}

export function PendingInvitationsCard({
  invitations,
  onResend,
  onRevoke,
  onInvite,
}: PendingInvitationsCardProps) {
  return (
    <section className={styles.card}>
      <header className={styles.cardHeader}>
        <div>
          <h2>Pending invitations</h2>
          <p>Invitations waiting to be accepted.</p>
        </div>
      </header>

      {invitations.length > 0 ? (
        <div className={styles.invitationList}>
          {invitations.map((invitation) => (
            <article className={styles.invitationItem} key={invitation.id}>
              <div className={styles.invitationHeading}>
                <strong>{invitation.email}</strong>
                <span>{invitation.role}</span>
              </div>
              <div className={styles.invitationMeta}>
                <span>{invitation.invitedAtLabel}</span>
                <span>{invitation.expiresLabel}</span>
              </div>
              <div className={styles.inlineActions}>
                <button
                  type="button"
                  onClick={() => onResend(invitation.id)}
                >
                  <RotateCw size={13} />
                  Resend
                </button>
                <button
                  type="button"
                  onClick={() => onRevoke(invitation.id)}
                >
                  <X size={13} />
                  Revoke
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <TeamEmptyState
          title="No pending invitations"
          description="Everyone invited to this workspace has responded."
          actionLabel="Invite a member"
          onAction={onInvite}
        />
      )}

      <footer className={styles.cardFooter}>
        <button type="button" className={styles.footerAction}>
          View all invitations
          <ArrowRight size={14} />
        </button>
      </footer>
    </section>
  );
}
