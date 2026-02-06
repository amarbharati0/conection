import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We are defining these schemas for Zod validation and type sharing.
// Even though the backend might use Firebase, these types define the shape of our data.

export const userRole = z.enum(["admin", "candidate"]);
export type UserRole = z.infer<typeof userRole>;

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  password: z.string(), // Only for initial auth check or if we store it (not recommended for Firebase)
  role: userRole,
  name: z.string(),
  details: z.object({
    age: z.number().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
  }).optional(),
});

export const taskStatus = z.enum(["pending", "completed"]);
export type TaskStatus = z.infer<typeof taskStatus>;

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  assignedTo: z.string(), // candidateId
  status: taskStatus,
  createdAt: z.string().or(z.date()),
});

export const submissionSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  candidateId: z.string(),
  photoUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  timestamp: z.string().or(z.date()),
});

export const attendanceSchema = z.object({
  id: z.string(),
  candidateId: z.string(),
  livePhotoUrl: z.string(),
  timestamp: z.string().or(z.date()),
  location: z.string().optional(),
});

// Create Types
export type User = z.infer<typeof userSchema>;
export type Task = z.infer<typeof taskSchema>;
export type Submission = z.infer<typeof submissionSchema>;
export type Attendance = z.infer<typeof attendanceSchema>;

// Insert Schemas (for API requests)
export const insertUserSchema = userSchema.omit({ id: true });
export const insertTaskSchema = taskSchema.omit({ id: true, createdAt: true, status: true });
export const insertSubmissionSchema = submissionSchema.omit({ id: true, timestamp: true });
export const insertAttendanceSchema = attendanceSchema.omit({ id: true, timestamp: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
