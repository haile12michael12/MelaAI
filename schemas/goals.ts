import { z } from "zod";

export const GoalSchema = z.object({
  title: z.string().min(1),
  targetAmount: z.number().positive(),
  currentAmount: z.number().nonnegative().default(0),
  deadline: z.string().optional(),
});
