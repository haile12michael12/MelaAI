import { z } from "zod";

export const MelaChatRequestSchema = z.object({
  message: z.string().min(1),
  context: z.record(z.string(), z.unknown()).optional(),
});
