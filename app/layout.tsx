import type { Metadata } from "next";
import { OdinProvider } from "@/contexts/odin-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kallisto",
  description: "The Kallisto workspace for professional service providers.",
};

const THEME_INITIALIZER_SCRIPT = `
(function() {
  try {
    var theme = localStorage.getItem('kallisto_theme') || 'light';
    var density = localStorage.getItem('kallisto_density') || 'comfortable';
    var effectiveTheme = theme;
    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', effectiveTheme);
    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.setAttribute('data-density', density);
  } catch(e) {}
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INITIALIZER_SCRIPT }} />
      </head>
      <body>
        <OdinProvider>{children}</OdinProvider>
      </body>
    </html>
  );
}
