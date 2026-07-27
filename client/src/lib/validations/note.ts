import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const createNoteSchema = z.object({
  title: z.string().max(200).optional(),
  collectionId: z.string().optional(),
});

export const createCollectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  icon: z.string().optional(),
  color: z.string().optional(),
  parentId: z.string().nullable().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
