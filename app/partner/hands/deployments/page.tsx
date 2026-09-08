import { redirect } from "next/navigation";

export default function PartnerHandsDeploymentsRedirectPage() {
  redirect("/partner/hands?tab=deployments");
}
