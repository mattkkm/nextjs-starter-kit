import { z } from "zod";

// Define the schema for industry research form validation
export const industryResearchSchema = z.object({
  industryName: z.string().min(1, "Industry name is required"),
  description: z.string().optional(),
  parameters: z.object({
    size: z.string().min(1, "Size is required"),
    geography: z.string().min(1, "Geography is required"),
  }),
  majorPlayers: z.string().min(1, "At least one major player is required"),
});

// Export the inferred TypeScript type for use in forms
export type IndustryResearchFormValues = z.infer<typeof industryResearchSchema>;
