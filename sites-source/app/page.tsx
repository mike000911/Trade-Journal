import type { Metadata } from "next";
import { chatGPTSignInPath, getChatGPTUser } from "./chatgpt-auth";
import { Landing } from "./tradebook-landing";
import "./tradebook-landing.css";

export const metadata: Metadata = {
  title: "Tradebook | A Futures Trading Journal",
  description: "Journal your trade decisions, review your performance, and build a trading process you can repeat.",
};

type PageProps = {
  searchParams: Promise<{ checkout?: string; billing?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const [user, params] = await Promise.all([getChatGPTUser(), searchParams]);

  return (
    <Landing
      signedIn={Boolean(user)}
      signIn={chatGPTSignInPath("/journal")}
      checkoutUnavailable={params.checkout === "unavailable"}
      initialCycle={params.billing === "yearly" ? "yearly" : "monthly"}
    />
  );
}
