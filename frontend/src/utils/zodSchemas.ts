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

// POSTS
export const PostCreateSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  type: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  content_media_id: z.string().uuid().optional(),
  meta_data: z.record(z.any()).optional(),
});

export const PostResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  tags: z.array(z.string()),
  type: z.string().nullable(),
  status: z.string(),
  content_media_id: z.string().nullable(),
  content_url: z.string().nullable(),
  created_by: z.object({
    id: z.string(),
    username: z.string(),
    avatar_url: z.string().nullable(),
  }),
  published_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  meta_data: z.record(z.any()).nullable(),
});

export const MediaResponseSchema = z.object({
  id: z.string().uuid("Invalid media ID"),
  filename: z.string(),
  original_name: z.string().nullable(),
  public_url: z.string().url("Invalid public URL"),
  asset_type: z.string(),
  file_size: z.number().int().positive("File size must be positive"),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  created_by: z.object({
    id: z.string().uuid("Invalid user ID"),
    username: z.string(),
    avatar_url: z.string().url().nullable(),
  }),
  created_at: z.string(),
  updated_at: z.string(),
});

export const MediaUploadSchema = z.object({
  file: z.instanceof(File, { message: "Please select a file" }),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});
