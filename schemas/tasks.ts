import { z } from "zod";

export const TaskSchema = z.object({
  title: z.string().min(1),
  completed: z.boolean().default(false),
  dueDate: z.string().optional(),
});
