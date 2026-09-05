import { z } from "zod";

export const ExpenseSchema = z.object({
  amount: z.number().positive(),
  category: z.string().min(1),
  date: z.string(),
  description: z.string().optional(),
});
