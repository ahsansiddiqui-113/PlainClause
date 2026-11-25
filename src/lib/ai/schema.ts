import { z } from "zod";

export const riskLevelSchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const analysisSchema = z.object({
  isContractText: z
    .boolean()
    .optional()
    .describe(
      "true if the text is a contract, lease, policy, terms or other fine print; false if it is something else (instructions, an essay, chat, random text).",
    ),
  plainEnglishSummary: z
    .string()
    .describe("2-4 sentences explaining what the text means for the signer, in plain English."),
  riskLevel: riskLevelSchema,
  redFlags: z.array(
    z.object({
      clauseQuote: z.string().describe("Exact short quote from the text that is problematic."),
      whyItMatters: z.string().describe("Plain-English explanation of the risk to the signer."),
      severity: riskLevelSchema,
    }),
  ),
  extractedDates: z.array(
    z.object({
      label: z.string().describe("What the date is, e.g. 'Notice deadline'."),
      date: z.string().describe("ISO date (YYYY-MM-DD) if determinable, otherwise the text as written."),
      actionRequired: z.string().describe("What the signer must do by this date, or 'None'."),
    }),
  ),
  negotiationCounterScript: z
    .string()
    .describe("A polite, professional email the signer could send to push back on the worst terms."),
});

export type Analysis = z.infer<typeof analysisSchema>;
