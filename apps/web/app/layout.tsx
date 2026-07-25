import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GatherCraft — Virtual Office Workspace",
  description:
    "A spatial virtual office with real-time multiplayer, spatial audio, and private meeting rooms. Walk, talk, and collaborate like you're in the same room.",
  keywords: [
    "virtual office",
    "spatial audio",
    "remote work",
    "multiplayer",
    "workspace",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
