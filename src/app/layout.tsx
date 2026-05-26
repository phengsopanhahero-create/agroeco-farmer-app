import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import RootProviders from "./RootProviders";

export const metadata: Metadata = {
  title: "Agro Eco Farmer App",
  description: "Agricultural platform for Cambodian farmers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head> */}
      <body>
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
