import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SwRegister } from "./sw-register";

export const metadata: Metadata = {
  title: "Math Adventure",
  description: "A calm maths tutor for young children",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-cream text-ink h-screen overflow-hidden select-none">
        <SwRegister />
        {children}
        <div className="portrait-overlay fixed inset-0 z-50 bg-cream flex-col items-center justify-center gap-8 text-center p-8">
          <div className="text-8xl">↻</div>
          <p className="text-3xl font-bold text-ink">
            Please turn your tablet sideways
          </p>
        </div>
      </body>
    </html>
  );
}
