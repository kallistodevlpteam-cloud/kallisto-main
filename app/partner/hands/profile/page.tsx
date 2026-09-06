import { redirect } from "next/navigation";
import {
  findServiceProvider,
  SERVICE_PROVIDER_RECORDS,
} from "@/partner-app/hands/mock/provider-profiles-mock-data";

interface PartnerProfileRouteProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PartnerProfilePage({
  searchParams,
}: PartnerProfileRouteProps) {
  const params = searchParams ? await searchParams : {};
  const providerQuery =
    getSingleValue(params.provider) ||
    getSingleValue(params.client) ||
    getSingleValue(params.name) ||
    getSingleValue(params.providerId);
  const requestId = getSingleValue(params.requestId);
  const assignmentId = getSingleValue(params.assignmentId);

  const matched = findServiceProvider({
    providerQuery,
    requestId,
    assignmentId,
  });

  const slug =
    matched?.slug ||
    (providerQuery
      ? providerQuery
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      : SERVICE_PROVIDER_RECORDS[0]?.slug || "skyline-builders");

  const view = getSingleValue(params.view);
  const targetUrl = view
    ? `/partner/hands/profile/${slug}?view=${view}`
    : `/partner/hands/profile/${slug}`;

  redirect(targetUrl);
}
