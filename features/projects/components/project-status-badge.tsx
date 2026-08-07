import React from "react";
import { ProjectStatus } from "../types/project.types";
import { Badge, BadgeVariant } from "@/components/ui/badge";

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
}

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  let variant: BadgeVariant = "success";
  let label = "Active";

  switch (status) {
    case "UPCOMING":
      variant = "info";
      label = "Upcoming";
      break;
    case "ACTIVE":
      variant = "success";
      label = "Active";
      break;
    case "ON_HOLD":
      variant = "warning";
      label = "Pending";
      break;
    case "COMPLETED":
      variant = "secondary";
      label = "Completed";
      break;
    case "ARCHIVED":
      variant = "outline";
      label = "Archived";
      break;
    case "CANCELLED":
      variant = "destructive";
      label = "Failed";
      break;
  }

  return <Badge variant={variant} size="sm">{label}</Badge>;
}
