import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must have at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Password must have at most ${PASSWORD_MAX_LENGTH} characters`);

export const loginSchema = z.object({
  login: z.string().trim().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm the new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    message: "New password must be different from the current one",
    path: ["newPassword"],
  });
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
