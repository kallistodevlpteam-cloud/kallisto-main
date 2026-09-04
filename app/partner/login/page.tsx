import { Suspense } from "react";
import { PartnerAuthProvider } from "@/partner-app/auth/context/partner-auth-context";
import { PartnerSignInCard } from "@/partner-app/auth/components/partner-sign-in-card";

export default function PartnerLoginPage() {
  return (
    <PartnerAuthProvider>
      <Suspense fallback={<div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#64748b" }}>Loading Partner Login...</div>}>
        <PartnerSignInCard />
      </Suspense>
    </PartnerAuthProvider>
  );
}
