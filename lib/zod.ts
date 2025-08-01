import {z} from "zod"

export const signInSchema = z.object({
    email: z.string().email("Invalid Email"),
    password: z.string().min(4, "Password must be more than 4 characters").max(32, "Password must be less than 32 characters"),
})
export const signUpSchema = z.object({
    email: z.string().email("Invalid Email"),
    password: z.string().min(4, "Password must be more than 4 characters").max(32, "Password must be less than 32 characters"),
    name: z.string().min(1, "Name is required"),
    confirmPassword: z.string().min(4, "Password must be more than 4 characters").max(32, "Password must be less than 32 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});