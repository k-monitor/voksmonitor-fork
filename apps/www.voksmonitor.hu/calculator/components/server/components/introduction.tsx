"use client";

import { useTranslations } from "next-intl";

import type { CalculatorViewModel } from "../../../view-models";

export type Introduction = {
  calculator: CalculatorViewModel;
};

export function Introduction({ calculator }: Introduction) {
  const t = useTranslations("calculator.introduction");
  return (
    <div className="grid gap-2 max-w-prose text-slate-600">
      <p className="font-bold">{t("para1")}</p>
      <p>{t("para2")}</p>
      <p>
        {t.rich("para3", {
          kmonitor: (chunks) => (
            <a href="https://k-monitor.hu/" className="font-bold">
              {chunks}
            </a>
          ),
          website: (chunks) => (
            <a href="https://k-monitor.hu/" className="font-bold">
              {chunks}
            </a>
          ),
          kohopolit: (chunks) => (
            <a href="https://kohovolit.eu/" className="font-bold">
              {chunks}
            </a>
          ),
          koho: (chunks) => ( <a href="https://kohovolit.eu/" target="_blank" rel="noopener noreferrer">{chunks}</a> ),
          vox: (chunks) => ( <a href="https://kozvelemeny.org/" target="_blank" rel="noopener noreferrer">{chunks}</a> ),
        })}
      </p>
    </div>
  );
}
