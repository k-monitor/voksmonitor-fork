import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { ResultPage as AppResultPage } from "../../../../calculator/components/server";
import { useAnswersStore } from "../../../../calculator/stores/answers";
import { useCalculatedMatches, useCalculator, useResult } from "../../../../calculator/view-models";
import { submitAnonymously } from "../../../../lib/api/submit";
import { markCalculatorCompleted, setAnswersExpiry } from "../../../../lib/local-storage";
import { reportError } from "../../../../lib/monitoring";
import { type RouteSegments, routes } from "../../../../lib/routing/route-builders";
import { useEmbed } from "../../embed-context-provider";

const TOP_TWO_CALCULATOR_ID = "d16c04e9-b0b5-4c76-ad3e-f03689303a29";
const TOP_TWO_PARTY_IDS = [
  "3fa89d65-4380-488b-808d-581e6b3d1837",
  "f3d6e7f9-5b59-441f-86fd-254e9039b405",
];

export function ResultPageWithRouting({ segments }: { segments: RouteSegments }) {
  const [showOnlyNested, setShowOnlyNested] = useState(false);
  const [showAllParties, setShowAllParties] = useState(false);
  const router = useRouter();
  const calculator = useCalculator();
  const embed = useEmbed();
  const answersStore = useAnswersStore((state) => state.answers);
  const submittedRef = useRef(false);

  const algorithmMatches = useCalculatedMatches();
  const result = useResult(algorithmMatches, { showOnlyNested });

  const isTopTwoMode = calculator.id === TOP_TWO_CALCULATOR_ID;
  const filteredResult = useMemo(() => {
    if (!isTopTwoMode || showAllParties) return result;
    const topTwoMatches = result.matches.filter((match) =>
      TOP_TWO_PARTY_IDS.includes(match.candidate.id),
    );
    return { ...result, matches: topTwoMatches };
  }, [result, isTopTwoMode, showAllParties]);

  // Submit answers anonymously once when the result page is reached
  useEffect(() => {
    if (submittedRef.current) return;
    const hasValidMatches = algorithmMatches?.some((match) => match.match !== undefined);

    if (answersStore.length > 0 && hasValidMatches) {
      submittedRef.current = true;

      const calculatorKey = segments.second ?? segments.first;
      const calculatorGroup = segments.second ? segments.first : undefined;

      // Read optional demography data from sessionStorage (set by the review page)
      let demography: Record<string, string | undefined> | undefined;
      try {
        const stored = sessionStorage.getItem(`voksmonitor-demography-${calculator.id}`);
        if (stored) {
          demography = JSON.parse(stored);
          sessionStorage.removeItem(`voksmonitor-demography-${calculator.id}`);
        }
      } catch {
        // silently ignore
      }

      submitAnonymously({
        calculatorId: calculator.id,
        calculatorKey,
        calculatorGroup,
        calculatorVersion: calculator.version,
        answers: answersStore,
        matches: algorithmMatches,
        demography,
      })
        .then(() => {
          setAnswersExpiry(calculator.id);
          markCalculatorCompleted(calculator.id);
        })
        .catch(reportError);
    }
  }, [algorithmMatches, answersStore, calculator.id, calculator.version, segments]);

  const handlePreviousClick = () => {
    router.push(routes.review(segments));
  };

  const handleNextClick = () => {
    router.push(routes.comparison(segments));
  };

  const handleCloseClick = () => {
    router.push("/");
  };

  const donateCardPosition = embed.isEmbed ? (embed.config?.donateCard ?? 1) : 5;

  return (
    <AppResultPage
      embedContext={embed}
      calculator={calculator}
      result={filteredResult}
      onNextClick={handleNextClick}
      onPreviousClick={handlePreviousClick}
      onCloseClick={handleCloseClick}
      showOnlyNested={showOnlyNested}
      onFilterChange={setShowOnlyNested}
      donateCardPosition={donateCardPosition}
      showAllParties={showAllParties}
      onShowAllPartiesChange={isTopTwoMode ? setShowAllParties : undefined}
    />
  );
}
