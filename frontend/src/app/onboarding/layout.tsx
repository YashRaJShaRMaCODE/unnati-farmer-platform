import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create a farmer account",
  description: "Start a private farmer profile with your name, phone number, and village.",
  alternates: { canonical: "/onboarding" },
  openGraph: { title: "Join UNNATI", description: "Start a private farmer profile in a few steps." },
};

export default function OnboardingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
