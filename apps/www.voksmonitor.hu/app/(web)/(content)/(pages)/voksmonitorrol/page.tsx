import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { DonateCard } from "../../../../../calculator/components/client";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.voksmonitorrol");
  return { title: t("meta-title") };
}

export default async function Page() {
  const t = await getTranslations("pages.voksmonitorrol");

  return (
    <div className="ko:max-w-4xl ko:mx-auto ko:p-6">
      <h2 className="font-display ko:font-display font-bold tracking-tight text-gray-800 text-2xl md:text-xl mb-2 mt-8">{t("heading")}</h2>

      <h3 className="font-display ko:font-display font-bold tracking-tight text-gray-800 text-xl md:text-lg mb-2 mt-8">{t("what-heading")}</h3>

      {t("what").split("\n").map((para, i) => (
        <p key={i} className="text-lg text-gray-700 leading-relaxed mb-0">{para}</p>
      ))}

      <h3 className="font-display ko:font-display font-bold tracking-tight text-gray-800 text-xl md:text-lg mb-2 mt-8">{t("who-heading")}</h3>

      {t("who").split("\n").map((para, i) => (
        <p key={i} className="text-lg text-gray-700 leading-relaxed mb-0">{para}</p>
      ))}

      <h3 className="font-display ko:font-display font-bold tracking-tight text-gray-800 text-xl md:text-lg mb-2 mt-8">{t("how-heading")}</h3>

      {t("how").split("\n").map((para, i) => (
        <p key={i} className="text-lg text-gray-700 leading-relaxed mb-0">{para}</p>
      ))}
    </div>
  );
}
