import { 
  User, InsertUser, Task, InsertTask, Submission, InsertSubmission, Attendance, InsertAttendance,
  userSchema
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllCandidates(): Promise<User[]>;

  // Tasks
  getTasks(candidateId?: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTaskStatus(id: string, status: "pending" | "completed"): Promise<Task | undefined>;

  // Submissions
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getSubmissions(taskId?: string): Promise<Submission[]>;

  // Attendance
  markAttendance(attendance: InsertAttendance): Promise<Attendance>;
  getAttendance(candidateId?: string): Promise<Attendance[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tasks: Map<string, Task>;
  private submissions: Map<string, Submission>;
  private attendance: Map<string, Attendance>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.submissions = new Map();
    this.attendance = new Map();
    this.currentId = 1;

    // Seed Data
    this.seed();
  }

  private seed() {
    // Seed Candidates
    const candidates = [
      { username: "candidate1", password: "password", name: "John Doe", role: "candidate" as const, details: { age: 20, address: "NYC" } },
      { username: "candidate2", password: "password", name: "Jane Smith", role: "candidate" as const, details: { age: 22, address: "LA" } },
      { username: "candidate3", password: "password", name: "Bob Johnson", role: "candidate" as const, details: { age: 21, address: "Chicago" } },
    ];

    candidates.forEach(c => this.createUser(c));

    // Seed Tasks
    const task = { title: "Morning Drill", description: "Complete the 5km run and submit photo.", assignedTo: "1" }; 
    // "1" is likely the first ID generated
    this.createTask(task);
  }

  private getId(): string {
    return String(this.currentId++);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.getId();
    const user: User = { ...insertUser, id, details: insertUser.details || {} };
    this.users.set(id, user);
    return user;
  }

  async getAllCandidates(): Promise<User[]> {
    return Array.from(this.users.values()).filter(u => u.role === 'candidate');
  }

  async getTasks(candidateId?: string): Promise<Task[]> {
    const allTasks = Array.from(this.tasks.values());
    if (candidateId) {
      return allTasks.filter(t => t.assignedTo === candidateId);
    }
    return allTasks;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.getId();
    const task: Task = { 
      ...insertTask, 
      id, 
      status: "pending",
      createdAt: new Date().toISOString()
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTaskStatus(id: string, status: "pending" | "completed"): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    const updatedTask = { ...task, status };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const id = this.getId();
    const submission: Submission = {
      ...insertSubmission,
      id,
      timestamp: new Date().toISOString()
    };
    this.submissions.set(id, submission);
    return submission;
  }

  async getSubmissions(taskId?: string): Promise<Submission[]> {
    const all = Array.from(this.submissions.values());
    if (taskId) {
      return all.filter(s => s.taskId === taskId);
    }
    return all;
  }

  async markAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const id = this.getId();
    const attendance: Attendance = {
      ...insertAttendance,
      id,
      timestamp: new Date().toISOString()
    };
    this.attendance.set(id, attendance);
    return attendance;
  }

  async getAttendance(candidateId?: string): Promise<Attendance[]> {
    const all = Array.from(this.attendance.values());
    if (candidateId) {
      return all.filter(a => a.candidateId === candidateId);
    }
    return all;
  }
}

export const storage = new MemStorage();
