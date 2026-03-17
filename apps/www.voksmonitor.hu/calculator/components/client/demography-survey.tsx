"use client";

import { Button, Icon } from "@kalkulacka-one/design-system/client";
import { Card } from "@kalkulacka-one/design-system/server";

import { mdiArrowRight, mdiClose } from "@mdi/js";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

/**
 * Each question uses a translation key prefix under "calculator.demography-survey".
 * The `optionKeys` are the sub-keys whose translated values are shown as buttons,
 * while the key itself is stored in the database (language-independent).
 *
 * Categories are deliberately broad to prevent re-identification.
 */
type DemographyQuestion = {
  id: string;
  translationKey: string;
  optionKeys: string[];
};

const DEMOGRAPHY_QUESTIONS: DemographyQuestion[] = [
  {
    id: "gender",
    translationKey: "gender",
    optionKeys: ["male", "female", "other", "no-answer"],
  },
  {
    id: "age",
    translationKey: "age",
    optionKeys: ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"],
  },
  {
    id: "residence",
    translationKey: "residence",
    optionKeys: ["budapest", "county-seat", "other-city", "village"],
  },
  {
    id: "education",
    translationKey: "education",
    optionKeys: ["primary", "secondary-no-matura", "secondary-matura", "bachelor", "master-or-higher"],
  },
  {
    id: "voted_2022",
    translationKey: "voted-2022",
    optionKeys: ["fidesz-kdnp", "opposition-2022", "mi-hazank", "mkkp", "other-party", "did-not-vote", "no-answer"],
  },
  {
    id: "would_vote",
    translationKey: "would-vote",
    optionKeys: ["fidesz-kdnp", "tisza", "dk", "mi-hazank", "mkkp", "other-party", "would-not-vote", "dont-know"],
  },
];

/** Probability (0–1) that a user sees the survey */
const SURVEY_SHOW_PROBABILITY = 1.0;

const STORAGE_KEY = "voksmonitor-demography-shown";

function shouldShowSurvey(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === "yes") return true;
    if (stored === "no") return false;

    // First check – roll the dice
    const show = Math.random() < SURVEY_SHOW_PROBABILITY;
    sessionStorage.setItem(STORAGE_KEY, show ? "yes" : "no");
    return show;
  } catch {
    return false;
  }
}

/**
 * Returns the demography answers as a plain object for inclusion
 * in the anonymous submission payload. No server call is made here —
 * the data will be submitted together with the calculator answers.
 */
export function collectDemographyAnswers(answers: Record<string, string>): Record<string, string | undefined> {
  return {
    gender: answers.gender,
    age: answers.age,
    residence: answers.residence,
    education: answers.education,
    voted2022: answers.voted_2022,
    wouldVote: answers.would_vote,
  };
}

export type DemographySurveyProps = {
  calculatorId: string;
  calculatorKey: string;
  /** Called when the user finishes or skips the survey, with optional demography data */
  onComplete: (demography?: Record<string, string | undefined>) => void;
};

export function DemographySurvey({ calculatorId, calculatorKey, onComplete }: DemographySurveyProps) {
  const t = useTranslations("calculator.demography-survey");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSelect = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const answeredCount = Object.keys(answers).length;
  const totalCount = DEMOGRAPHY_QUESTIONS.length;

  const handleSubmit = useCallback(async () => {
    if (answeredCount === 0) {
      onComplete();
      return;
    }

    onComplete(collectDemographyAnswers(answers));
  }, [answers, answeredCount, onComplete]);

  const handleSkip = useCallback(() => {
    onComplete();
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm p-4 sm:p-8">
      <Card corner="bottomRight" className="relative w-full max-w-xl bg-white shadow-xl rounded-2xl my-8">
        {/* Close / skip button */}
        <div className="absolute top-3 right-3 z-10">
          <Button variant="link" color="neutral" size="small" aria-label={t("close-aria-label")} onClick={handleSkip}>
            <Icon icon={mdiClose} size="medium" decorative />
          </Button>
        </div>

        <div className="p-5 sm:p-6 grid gap-5">
          {/* Header */}
          <div>
            <h2 className="font-display font-semibold text-xl sm:text-2xl tracking-tight text-gray-800">{t("heading")}</h2>
            <p className="text-sm text-gray-500 mt-1">{t("description")}</p>
          </div>

          {/* Questions */}
          <div className="grid gap-5">
            {DEMOGRAPHY_QUESTIONS.map((q) => (
              <fieldset key={q.id} className="grid gap-2">
                <legend className="font-medium text-sm text-gray-700">{t(`${q.translationKey}.label`)}</legend>
                <div className="flex flex-wrap gap-2">
                  {q.optionKeys.map((optionKey) => {
                    const isSelected = answers[q.id] === optionKey;
                    return (
                      <button
                        key={optionKey}
                        type="button"
                        onClick={() => handleSelect(q.id, optionKey)}
                        className={`
                          inline-flex items-center px-3 py-1.5 text-sm rounded-full border transition-all cursor-pointer
                          ${isSelected ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}
                        `}
                      >
                        {t(`${q.translationKey}.${optionKey}`)}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-400">{t("answered-count", { count: answeredCount, total: totalCount })}</span>
            <div className="flex gap-2">
              <Button variant="link" color="neutral" size="small" onClick={handleSkip}>
                {t("skip-button")}
              </Button>
              <Button color="primary" size="small" onClick={handleSubmit}>
                {t("submit-button")}
                <Icon icon={mdiArrowRight} size="small" decorative />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

/**
 * Hook that determines whether the demography survey should be shown
 * to the current user. Returns a stable boolean per session.
 */
export function useShouldShowDemographySurvey(): boolean {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(shouldShowSurvey());
  }, []);

  return show;
}
