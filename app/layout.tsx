import type { Metadata } from "next";
import { OdinProvider } from "@/contexts/odin-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kallisto",
  description: "The Kallisto workspace for professional service providers.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <OdinProvider>{children}</OdinProvider>
      </body>
    </html>
  );
}
