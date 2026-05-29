import type { Metadata } from "next";
import { Toaster } from "sonner";

import "./globals.css";

export const metadata: Metadata = {
  title: "Pulse Chat",
  description:
    "Pulse Chat is a premium real-time room-based chat app for teams, creators, and small communities.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#050816] text-slate-50 antialiased">
        {children}
        <Toaster
          position="top-right"
          theme="dark"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast:
                "border border-slate-800 bg-slate-950 text-slate-50 shadow-2xl",
              title: "font-semibold",
              description: "text-slate-400",
            },
          }}
        />
      </body>
    </html>
  );
}
