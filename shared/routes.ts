import { z } from 'zod';
import { 
  insertUserSchema, 
  insertTaskSchema, 
  insertSubmissionSchema, 
  insertAttendanceSchema,
  userSchema,
  taskSchema,
  submissionSchema,
  attendanceSchema
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login',
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: userSchema, // Returns the full user object including role
        401: errorSchemas.unauthorized,
      },
    },
    register: {
      method: 'POST' as const,
      path: '/api/auth/register',
      input: insertUserSchema,
      responses: {
        201: userSchema,
        400: errorSchemas.validation,
      },
    }
  },
  tasks: {
    list: {
      method: 'GET' as const,
      path: '/api/tasks',
      input: z.object({
        candidateId: z.string().optional(), // If admin wants to filter, or candidate sees their own
      }).optional(),
      responses: {
        200: z.array(taskSchema),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/tasks',
      input: insertTaskSchema,
      responses: {
        201: taskSchema,
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/tasks/:id',
      input: z.object({
        status: z.enum(["pending", "submitted", "completed"]),
        deadline: z.string().optional(),
      }),
      responses: {
        200: taskSchema,
        404: errorSchemas.notFound,
      },
    }
  },
  submissions: {
    create: {
      method: 'POST' as const,
      path: '/api/submissions',
      input: insertSubmissionSchema,
      responses: {
        201: submissionSchema,
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/submissions',
      input: z.object({
        taskId: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(submissionSchema),
      },
    }
  },
  attendance: {
    mark: {
      method: 'POST' as const,
      path: '/api/attendance',
      input: insertAttendanceSchema,
      responses: {
        201: attendanceSchema,
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/attendance',
      input: z.object({
        candidateId: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(attendanceSchema),
      },
    }
  },
  candidates: {
    list: {
      method: 'GET' as const,
      path: '/api/candidates',
      responses: {
        200: z.array(userSchema),
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
