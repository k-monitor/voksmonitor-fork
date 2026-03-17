"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useTransition } from "react";

import { setLocale } from "../../app/actions";

const LOCALES = [
  { code: "hu", label: "HU" },
  { code: "en", label: "EN" },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSwitch = (newLocale: string) => {
    startTransition(async () => {
      await setLocale(newLocale);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-0.5 text-sm font-medium">
      {LOCALES.map(({ code, label }, i) => (
        <span key={code} className="flex items-center gap-0.5">
          {i > 0 && <span className="text-gray-300 select-none">|</span>}
          <button
            type="button"
            onClick={() => handleSwitch(code)}
            disabled={locale === code || isPending}
            className={locale === code ? "text-gray-900 font-semibold cursor-default" : "text-gray-400 hover:text-gray-600 transition-colors cursor-pointer disabled:opacity-50"}
            aria-label={`Switch to ${label}`}
            aria-current={locale === code ? "true" : undefined}
          >
            {label}
          </button>
        </span>
      ))}
    </div>
  );
}
