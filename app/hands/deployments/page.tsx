import { redirect } from "next/navigation";

export default function HandsDeploymentsRedirectPage() {
  redirect("/hands?tab=deployments");
}
