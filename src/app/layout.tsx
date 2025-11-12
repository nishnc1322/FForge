import React from "react";
import "./globals.css";

export const metadata = {
  title: "FForge",
  description: "FounderForge — Intent Demo",
};

type Props = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <head />
      <body style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' }}>
        {children}
      </body>
    </html>
  );
}
