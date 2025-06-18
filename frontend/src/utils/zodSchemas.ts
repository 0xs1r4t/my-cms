import { z } from "zod";

export const AuthResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.literal("bearer"),
  user: z.object({
    id: z.string().uuid("Invalid user ID"),
    username: z.string(),
    email: z.string().email(),
    avatar_url: z.string().url(),
    created_at: z.string(),
  }),
});

export const UserResponseSchema = z.object({
  id: z.string().uuid("Invalid user ID"),
  username: z.string(),
  email: z.string().email(),
  avatar_url: z.string().url(),
  created_at: z.string(),
});

export const CallbackQuerySchema = z.object({
  access_token: z.string().min(1, "Missing access token"),
  //   user_id: z.string().uuid("Invalid user ID"),
});
