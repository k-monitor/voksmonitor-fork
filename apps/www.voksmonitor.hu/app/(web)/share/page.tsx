import type { Metadata } from "next";

import { loadCalculatorData } from "../../../calculator/lib";
import { candidateViewModel } from "../../../calculator/view-models/server/candidate";
import { organizationViewModel } from "../../../calculator/view-models/server/organization";
import { personViewModel } from "../../../calculator/view-models/server/person";
import { SharePageClient } from "./share-page-client";

function normalizeSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}

export const metadata: Metadata = {
  title: "Kiderült, mely pártok állnak hozzám a legközelebb 👀",
  description: "Töltsd ki te is a Voksmonitort!",
  openGraph: {
    title: "Kiderült, mely pártok állnak hozzám a legközelebb 👀",
    description: "Töltsd ki te is a Voksmonitort!",
    images: [
      {
        url: "/share-og.png",
        width: 1200,
        height: 630,
        alt: "Én már kitöltöttem a Voksmonitort! Nézd meg az eredményeim!",
      },
    ],
  },
};

export default async function SharePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;

  const calcParam = typeof params.calc === "string" ? params.calc : undefined;
  if (!calcParam) {
    return <SharePageClient matches={[]} calculatorKey="" />;
  }

  const slashIndex = calcParam.indexOf("/");
  const key = slashIndex === -1 ? calcParam : calcParam.slice(0, slashIndex);
  const group = slashIndex === -1 ? undefined : calcParam.slice(slashIndex + 1);

  const calculatorData = await loadCalculatorData({ key, group });
  const { candidates, persons, organizations } = calculatorData.data;
  const baseUrl = calculatorData.baseUrl;

  const personsMap = new Map(persons?.map((p) => [p.id, personViewModel(p, baseUrl)]) ?? []);
  const organizationsMap = new Map(organizations?.map((o) => [o.id, organizationViewModel(o, baseUrl)]) ?? []);

  const candidateViewModels = candidates.map((c) => candidateViewModel(c, personsMap, organizationsMap, baseUrl));

  const slugToCandidateMap = new Map<string, (typeof candidateViewModels)[number]>();
  for (const candidate of candidateViewModels) {
    if (candidate.displayName) {
      slugToCandidateMap.set(normalizeSlug(candidate.displayName), candidate);
    }
  }

  const matches: { candidateId: string; displayName: string; match: number; avatar?: (typeof candidateViewModels)[number]["avatar"]; type?: string }[] = [];

  for (const [key, value] of Object.entries(params)) {
    const slug = key.toLowerCase();
    const score = Number(typeof value === "string" ? value : undefined);
    if (Number.isNaN(score) || score < 0 || score > 100) continue;

    const candidate = slugToCandidateMap.get(slug);
    if (candidate) {
      matches.push({
        candidateId: candidate.id,
        displayName: candidate.displayName ?? slug.toUpperCase(),
        match: score,
        avatar: candidate.avatar,
        type: candidate.type,
      });
    }
  }

  matches.sort((a, b) => b.match - a.match);

  return <SharePageClient matches={matches} calculatorKey={calcParam} />;
}
