import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import huMessages from "@/messages/hu.json";
import { calculatorViewModel } from "../../../view-models";
import { Guide } from ".";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NextIntlClientProvider locale="hu" messages={huMessages}>
    {children}
  </NextIntlClientProvider>
);

describe("Guide", () => {
  it("renders", () => {
    const mockCalculator = calculatorViewModel({
      id: "test",
      createdAt: new Date().toISOString(),
      key: "test",
      shortTitle: "Test",
      title: "Test Calculator",
      intro: "Test intro",
      methodology: "Test methodology",
    });

    render(<Guide calculator={mockCalculator} />, { wrapper });
    expect(screen.getByText("Egyetért")).toBeInTheDocument();
  });
});
