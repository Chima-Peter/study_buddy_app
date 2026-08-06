import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/providers";
import { env } from "@/config/env";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const siteName = "StudyBuddy";
const title = "StudyBuddy — AI tutor from your lecture notes";
const description =
  "Personalise learning with an AI tutor grounded in your materials, plus chapter notes and quizzes.";

export const metadata: Metadata = {
  metadataBase: new URL(env.appUrl),
  title: {
    default: title,
    template: `%s · ${siteName}`,
  },
  description,
  applicationName: siteName,
  keywords: [
    "StudyBuddy",
    "AI tutor",
    "study notes",
    "lecture notes",
    "quizzes",
    "flashcards",
    "personalized learning",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName,
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    title: siteName,
    statusBarStyle: "default",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0f766e" },
    { media: "(prefers-color-scheme: dark)", color: "#081614" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
