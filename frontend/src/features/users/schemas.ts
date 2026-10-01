import { z } from "zod";
import { passwordSchema } from "@/features/auth/schemas";

export const USER_ROLES = ["ADMIN", "MANAGEMENT", "SELLER"] as const;

/** Same rule as the API: 3-30 chars, lowercase letters, digits, "." or "_". */
const USERNAME_PATTERN = /^[a-z0-9._]{3,30}$/;

const roleSchema = z.enum(USER_ROLES, { error: "Select a role" });

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(USERNAME_PATTERN, 'Username must have 3-30 characters: letters, numbers, "." or "_"'),
  email: z.string().trim().toLowerCase().email("Email is invalid"),
  password: passwordSchema,
  role: roleSchema,
});
export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema.pick({ name: true, email: true, role: true });
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

export const resetPasswordSchema = z.object({
  temporaryPassword: passwordSchema,
});
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
