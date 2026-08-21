import type { Metadata } from "next";
import { ApplyAccessForm } from "@/features/onboarding";

export const metadata: Metadata = {
  title: "Apply for Provider Access • Kallisto Workspace",
  description: "Apply for verified service provider access in the Kallisto ecosystem.",
};

export default function ApplyPage() {
  return <ApplyAccessForm />;
}
