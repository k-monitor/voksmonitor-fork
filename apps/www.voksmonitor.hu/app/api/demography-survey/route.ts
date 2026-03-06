import { prisma } from "@kalkulacka-one/database";

import type { NextRequest } from "next/server";
import { z } from "zod";

import { HttpError, JsonParseError, UnauthorizedError, ValidationError } from "../../../lib/errors";
import { getSessionCookie, getSessionFromRequest } from "../../../lib/session";
import { getEmbedNameFromRequest } from "../../../lib/session/get-embed-name-from-request";

const postRequestSchema = z.object({
  calculatorId: z.string().uuid(),
  calculatorKey: z.string(),
  gender: z.string().optional(),
  age: z.string().optional(),
  residence: z.string().optional(),
  education: z.string().optional(),
  resultMatch: z.string().optional(),
  voted2022: z.string().optional(),
  wouldVote: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const embedName = getEmbedNameFromRequest(request);
    const cookieData = await getSessionCookie({ embedName });
    const sessionId = cookieData?.id || getSessionFromRequest(request);
    if (!sessionId) {
      return new UnauthorizedError("Session required").toResponse();
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new JsonParseError().toResponse();
    }

    const result = postRequestSchema.safeParse(body);
    if (!result.success) {
      return new ValidationError(result.error).toResponse();
    }
    const parsed = result.data;

    await prisma.demographySurveyResponse.create({
      data: {
        sessionId,
        calculatorId: parsed.calculatorId,
        calculatorKey: parsed.calculatorKey,
        gender: parsed.gender ?? null,
        age: parsed.age ?? null,
        residence: parsed.residence ?? null,
        education: parsed.education ?? null,
        resultMatch: parsed.resultMatch ?? null,
        voted2022: parsed.voted2022 ?? null,
        wouldVote: parsed.wouldVote ?? null,
      },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof HttpError) {
      return error.toResponse();
    }

    throw error;
  }
}
