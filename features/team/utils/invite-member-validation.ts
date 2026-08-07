import type {
  Invitation,
  InviteMemberErrors,
  InviteMemberInput,
  TeamMember,
} from "../types/team.types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email: string): string {
  return email.trim().toLocaleLowerCase();
}

export function validateInviteMember(
  input: InviteMemberInput,
  members: TeamMember[],
  invitations: Invitation[],
): InviteMemberErrors {
  const errors: InviteMemberErrors = {};
  const email = normalizeEmail(input.email);

  if (!email) {
    errors.email = "Enter an email address.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address.";
  } else if (members.some((member) => normalizeEmail(member.email) === email)) {
    errors.email = "This person is already a workspace member.";
  } else if (
    invitations.some((invitation) => normalizeEmail(invitation.email) === email)
  ) {
    errors.email = "An invitation has already been sent to this email.";
  }

  if (!input.role) {
    errors.role = "Select a workspace role.";
  }

  if (
    input.projectAccess === "selected" &&
    input.selectedProjectIds.length === 0
  ) {
    errors.projectAccess = "Select at least one project.";
  }

  return errors;
}
