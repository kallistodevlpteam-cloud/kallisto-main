import { ChevronRight } from "lucide-react";
import type { RoleSummary } from "../types/team.types";
import styles from "./team-page.module.css";

interface RolesPermissionsCardProps {
  roles: RoleSummary[];
  onManageRoles: () => void;
}

export function RolesPermissionsCard({
  roles,
  onManageRoles,
}: RolesPermissionsCardProps) {
  return (
    <section className={styles.card}>
      <header className={styles.cardHeader}>
        <div>
          <h2>Roles and permissions</h2>
          <p>Control what each workspace role can access.</p>
        </div>
      </header>

      <div className={styles.rolesList}>
        {roles.map((role) => (
          <button
            type="button"
            className={styles.roleRow}
            key={role.role}
            onClick={onManageRoles}
          >
            <span>
              <strong>{role.role}</strong>
              <small>
                {role.memberCount} {role.memberCount === 1 ? "member" : "members"}
              </small>
            </span>
            <ChevronRight size={15} aria-hidden="true" />
          </button>
        ))}
      </div>

      <footer className={styles.cardFooter}>
        <button
          type="button"
          className={styles.footerAction}
          onClick={onManageRoles}
        >
          Manage roles
          <ChevronRight size={14} />
        </button>
      </footer>
    </section>
  );
}
