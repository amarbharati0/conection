import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // === Auth Routes ===
  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { username, password } = api.auth.login.input.parse(req.body);

      // Special Admin Check
      if (username === "admin" && password === "admin@123") {
        return res.status(200).json({
          id: "admin-id",
          username: "admin",
          password: "", // don't return
          role: "admin",
          name: "Administrator",
          details: {}
        });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json(user);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      
      const existing = await storage.getUserByUsername(input.username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser(input);
      res.status(201).json(user);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // === Candidates ===
  app.get(api.candidates.list.path, async (req, res) => {
    const candidates = await storage.getAllCandidates();
    res.json(candidates);
  });

  // === Tasks ===
  app.get(api.tasks.list.path, async (req, res) => {
    const candidateId = req.query.candidateId as string;
    const tasks = await storage.getTasks(candidateId);
    res.json(tasks);
  });

  app.post(api.tasks.create.path, async (req, res) => {
    try {
      const input = api.tasks.create.input.parse(req.body);
      const task = await storage.createTask(input);
      res.status(201).json(task);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.patch(api.tasks.update.path.replace(":id", ":id"), async (req, res) => {
    const id = req.params.id;
    const status = req.body.status;
    if (status !== "pending" && status !== "completed") {
      return res.status(400).json({ message: "Invalid status" });
    }
    const task = await storage.updateTaskStatus(id as string, status);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  });

  // === Submissions ===
  app.post(api.submissions.create.path, async (req, res) => {
    try {
      const input = api.submissions.create.input.parse(req.body);
      const submission = await storage.createSubmission(input);
      
      // Auto-complete task?
      await storage.updateTaskStatus(input.taskId, "completed");
      
      res.status(201).json(submission);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get(api.submissions.list.path, async (req, res) => {
    const taskId = req.query.taskId as string;
    const submissions = await storage.getSubmissions(taskId);
    res.json(submissions);
  });

  // === Attendance ===
  app.post(api.attendance.mark.path, async (req, res) => {
    try {
      const input = api.attendance.mark.input.parse(req.body);
      const attendance = await storage.markAttendance(input);
      res.status(201).json(attendance);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get(api.attendance.list.path, async (req, res) => {
    const candidateId = req.query.candidateId as string;
    const list = await storage.getAttendance(candidateId);
    res.json(list);
  });

  return httpServer;
}
