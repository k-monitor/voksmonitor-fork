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
  title: "Megosztott eredmény — Voksmonitor",
  description: "Nézd meg az eredményeimet a Voksmonitoron!",
};

export default async function SharePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;

  const calcParam = typeof params.calc === "string" ? params.calc : undefined;
  if (!calcParam) {
    return <SharePageClient matches={[]} calculatorKey="" />;
  }

  const calcParts = calcParam.split("/");
  const key = calcParts[0];
  const group = calcParts.length > 1 ? calcParts[1] : undefined;

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
