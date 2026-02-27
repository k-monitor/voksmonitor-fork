"use client";

import { Button } from "@kalkulacka-one/design-system/client";
import { useTranslations } from "next-intl";

import { NavigationCard } from "./navigation-card";

const HEIGHT = "h-22";

export type ResultNavigationCard = {
  onNextClick: () => void;
  onShareClick: () => void;
};

export function ResultNavigationCard({ onNextClick, onShareClick }: ResultNavigationCard) {
  const t = useTranslations("calculator.result");
  return (
    <NavigationCard>
      <div className="flex gap-2 w-full">
        <div className="flex-1">
          <Button color="neutral" variant="outline" onClick={onNextClick}>
            {t("comparison-button")}
          </Button>
        </div>
        <div className="flex-1">
          <Button color="neutral" variant="fill" onClick={onShareClick}>
            {t("share-button")}
          </Button>
        </div>
      </div>
    </NavigationCard>
  );
}

ResultNavigationCard.heightClassNames = HEIGHT;
