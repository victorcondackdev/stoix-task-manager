import { z } from "zod";

export const TaskCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(10_000).optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  dueDate: z.coerce.date().optional().nullable()
});

export const TaskUpdateSchema = TaskCreateSchema.partial();

export type TaskCreateDTO = z.infer<typeof TaskCreateSchema>;
export type TaskUpdateDTO = z.infer<typeof TaskUpdateSchema>;
