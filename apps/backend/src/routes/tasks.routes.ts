import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { TaskCreateSchema, TaskUpdateSchema } from "../lib/validate.js";

export const tasksRouter = Router();

// Listagem com paginação e filtros
tasksRouter.get("/", async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const pageSize = Math.min(Number(req.query.pageSize ?? 10), 100);
    const search = String(req.query.search ?? "").trim();
    const status = String(req.query.status ?? "").trim();

    const where: any = {};
    if (search) where.title = { contains: search, mode: "insensitive" };
    if (["TODO", "IN_PROGRESS", "DONE"].includes(status)) where.status = status;

    const [items, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.task.count({ where })
    ]);

    res.json({ items, page, pageSize, total });
  } catch (err) { next(err); }
});

// Obter uma tarefa
tasksRouter.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) { next(err); }
});

// Criar
tasksRouter.post("/", async (req, res, next) => {
  try {
    const data = TaskCreateSchema.parse(req.body);
    const created = await prisma.task.create({ data });
    res.status(201).json(created);
  } catch (err) { next(err); }
});

// Atualizar
tasksRouter.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = TaskUpdateSchema.parse(req.body);
    const updated = await prisma.task.update({ where: { id }, data });
    res.json(updated);
  } catch (err) { next(err); }
});

// Excluir
tasksRouter.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.task.delete({ where: { id } });
    res.status(204).send();
  } catch (err) { next(err); }
});
