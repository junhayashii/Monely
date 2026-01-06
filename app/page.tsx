"use client";

import LandingPage from "@/components/landing-page/LandingPage";

export default function Home() {
  return (
    <LandingPage
      onGetStarted={() => console.log("Get Started!")}
      onLogin={() => console.log("Login!")}
      isDarkMode={false}
    />
  );
}
