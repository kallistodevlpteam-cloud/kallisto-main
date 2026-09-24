import { WorkerTrade } from "./worker-domain";

export type AttendanceStatus =
  | "Present"
  | "Late"
  | "Shift Completed"
  | "Absent"
  | "Overtime";

export type VerificationMethod =
  | "Biometric Geotag"
  | "FaceID + GPS"
  | "Supervisor Approval"
  | "Manual Entry";

export type ComplianceStatus =
  | "Compliant"
  | "Overtime Approved"
  | "Late Flagged"
  | "Geotag Discrepancy"
  | "Pending Approval";

export interface AttendanceRecord {
  id: string;
  workerId: string;
  workerName: string;
  trade: WorkerTrade;
  level: string;
  avatarUrl?: string;
  phone: string;
  siteId: string;
  siteName: string;
  location: string;
  supervisorName: string;
  supervisorPhone: string;
  checkInTime: string;
  checkOutTime?: string;
  hoursLogged: number;
  overtimeHours: number;
  status: AttendanceStatus;
  verificationMethod: VerificationMethod;
  gpsCoordinates: string;
  faceMatchConfidence: number;
  complianceStatus: ComplianceStatus;
  shiftDate: string;
  geotagPhotoUrl?: string;
  notes?: string;
}

export interface SiteAttendanceSummary {
  siteId: string;
  siteName: string;
  location: string;
  supervisorName: string;
  totalAssigned: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  shiftCompletionPercent: number;
  status: "On Track" | "Minor Deficit" | "Action Required";
}

export interface AttendanceSummaryMetrics {
  activeDeployments: number;
  sitesCovered: number;
  deployedCrew: number;
  shiftCompletionPercent: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  overtimeTotalHours: number;
}
