"use client";

import { Send, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { WORKSPACE_ROLES } from "../types/team.types";
import type {
  Invitation,
  InviteMemberErrors,
  InviteMemberInput,
  ProjectSummary,
  TeamMember,
} from "../types/team.types";
import { validateInviteMember } from "../utils/invite-member-validation";
import styles from "./team-page.module.css";

interface InviteMemberDrawerProps {
  members: TeamMember[];
  invitations: Invitation[];
  projects: ProjectSummary[];
  onClose: () => void;
  onSubmit: (input: InviteMemberInput) => void;
}

const INITIAL_INPUT: InviteMemberInput = {
  email: "",
  role: "",
  projectAccess: "all",
  selectedProjectIds: [],
  message: "",
};

export function InviteMemberDrawer({
  members,
  invitations,
  projects,
  onClose,
  onSubmit,
}: InviteMemberDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [input, setInput] = useState<InviteMemberInput>(INITIAL_INPUT);
  const [errors, setErrors] = useState<InviteMemberErrors>({});

  useEffect(() => {
    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    if (!dialog) return;

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }

    dialog.querySelector<HTMLInputElement>("input")?.focus();

    return () => {
      if (dialog.open && typeof dialog.close === "function") {
        dialog.close();
      }
      previouslyFocused?.focus();
    };
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateInviteMember(input, members, invitations);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    onSubmit({
      ...input,
      email: input.email.trim().toLocaleLowerCase(),
    });
  };

  const toggleSelectedProject = (projectId: string, selected: boolean) => {
    setInput((current) => ({
      ...current,
      selectedProjectIds: selected
        ? [...current.selectedProjectIds, projectId]
        : current.selectedProjectIds.filter((id) => id !== projectId),
    }));
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.inviteDialog}
      aria-labelledby="invite-member-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <form className={styles.drawerForm} onSubmit={handleSubmit} noValidate>
        <header className={styles.drawerHeader}>
          <div>
            <span>Workspace invitation</span>
            <h2 id="invite-member-title">Invite member</h2>
            <p>Add a teammate and define their starting access.</p>
          </div>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Close invite member"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </header>

        <div className={styles.drawerBody}>
          <div className={styles.formField}>
            <label htmlFor="invite-email">Email address</label>
            <input
              id="invite-email"
              type="email"
              value={input.email}
              placeholder="name@studio.in"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "invite-email-error" : undefined}
              onChange={(event) => {
                setInput((current) => ({
                  ...current,
                  email: event.target.value,
                }));
                setErrors((current) => ({ ...current, email: undefined }));
              }}
            />
            {errors.email ? (
              <small className={styles.fieldError} id="invite-email-error">
                {errors.email}
              </small>
            ) : null}
          </div>

          <div className={styles.formField}>
            <label htmlFor="invite-role">Workspace role</label>
            <select
              id="invite-role"
              value={input.role}
              aria-invalid={Boolean(errors.role)}
              aria-describedby={errors.role ? "invite-role-error" : undefined}
              onChange={(event) => {
                setInput((current) => ({
                  ...current,
                  role: event.target.value as InviteMemberInput["role"],
                }));
                setErrors((current) => ({ ...current, role: undefined }));
              }}
            >
              <option value="">Select a role</option>
              {WORKSPACE_ROLES.filter(
                (role) => role !== "Workspace Owner",
              ).map((role) => (
                <option value={role} key={role}>
                  {role}
                </option>
              ))}
            </select>
            {errors.role ? (
              <small className={styles.fieldError} id="invite-role-error">
                {errors.role}
              </small>
            ) : null}
          </div>

          <fieldset className={styles.accessFieldset}>
            <legend>Project access</legend>
            {[
              { value: "all", label: "All projects" },
              { value: "selected", label: "Selected projects" },
              { value: "none", label: "No project access yet" },
            ].map((option) => (
              <label key={option.value}>
                <input
                  type="radio"
                  name="project-access"
                  value={option.value}
                  checked={input.projectAccess === option.value}
                  onChange={() => {
                    setInput((current) => ({
                      ...current,
                      projectAccess:
                        option.value as InviteMemberInput["projectAccess"],
                    }));
                    setErrors((current) => ({
                      ...current,
                      projectAccess: undefined,
                    }));
                  }}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </fieldset>

          {input.projectAccess === "selected" ? (
            <fieldset className={styles.projectChecklist}>
              <legend>Select projects</legend>
              {projects.map((project) => (
                <label key={project.id}>
                  <input
                    type="checkbox"
                    checked={input.selectedProjectIds.includes(project.id)}
                    onChange={(event) => {
                      toggleSelectedProject(project.id, event.target.checked);
                      setErrors((current) => ({
                        ...current,
                        projectAccess: undefined,
                      }));
                    }}
                  />
                  <span>{project.name}</span>
                </label>
              ))}
              {errors.projectAccess ? (
                <small className={styles.fieldError}>
                  {errors.projectAccess}
                </small>
              ) : null}
            </fieldset>
          ) : null}

          <div className={styles.formField}>
            <label htmlFor="invite-message">
              Optional message <small>Optional</small>
            </label>
            <textarea
              id="invite-message"
              value={input.message}
              placeholder="Add context for the invitation."
              rows={4}
              onChange={(event) =>
                setInput((current) => ({
                  ...current,
                  message: event.target.value,
                }))
              }
            />
          </div>
        </div>

        <footer className={styles.drawerFooter}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="submit" className={styles.primaryButton}>
            <Send size={15} />
            Send invitation
          </button>
        </footer>
      </form>
    </dialog>
  );
}
