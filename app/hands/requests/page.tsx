import { redirect } from "next/navigation";

export default function HandsRequestsRedirectPage() {
  redirect("/hands?tab=requests");
}
