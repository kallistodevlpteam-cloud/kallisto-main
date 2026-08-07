import type { CalendarActivity } from "@/types/domain/calendar";

export interface UserContext {
  userId: string;
  userRole: string;
  projectMemberships: string[]; // List of project IDs user is member of
}

export class CalendarPermissionsService {
  /**
   * Service-level permission enforcement and masking
   */
  static applyPermissionsAndMasking(
    activities: CalendarActivity[],
    userContext: UserContext
  ): CalendarActivity[] {
    const result: CalendarActivity[] = [];

    for (const act of activities) {
      // 1. Private visibility check
      if (act.visibility === "private") {
        if (act.ownerId === userContext.userId || act.assigneeIds.includes(userContext.userId)) {
          result.push({ ...act });
        } else {
          // Mask private event details for unauthorized team members
          let formattedTimeLabel = "";
          if (act.time.allDay) {
            formattedTimeLabel = "All Day";
          } else {
            const start = new Date(act.time.startAt);
            const end = new Date(act.time.endAt);
            formattedTimeLabel = `${start.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })} – ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
          }

          result.push({
            ...act,
            title: "Busy",
            notes: undefined,
            location: undefined,
            meetingUrl: undefined,
            projectId: undefined,
            assigneeIds: [],
          });
        }
        continue;
      }

      // 2. Project visibility check
      if (act.visibility === "project") {
        if (
          !act.projectId ||
          userContext.projectMemberships.includes(act.projectId) ||
          userContext.userRole === "admin"
        ) {
          result.push({ ...act });
        }
        // If user is not in project, hide event completely
        continue;
      }

      // 3. Workspace visibility
      result.push({ ...act });
    }

    return result;
  }
}
