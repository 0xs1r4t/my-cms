// ===== USER INTERFACES =====
export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  created_at: string;
}

// ===== MEDIA INTERFACES =====
export interface MediaItem {
  id: string;
  filename: string;
  original_name: string | null;
  public_url: string;
  asset_type: string;
  file_size: number;
  status: string;
  created_by: {
    id: string;
    username: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
}

// ===== STORE INTERFACES =====
export interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export interface MediaState {
  refreshTrigger: number;
  mediaItems: MediaItem[];
  triggerRefresh: () => void;
  setMediaItems: (items: MediaItem[]) => void;
  addMediaItem: (item: MediaItem) => void;
  addMediaItems: (items: MediaItem[]) => void;
}

// ===== COMPONENT PROPS INTERFACES =====
export interface ThreeGalleryProps {
  mediaItems: MediaItem[];
}

// ===== API RESPONSE INTERFACES =====
export interface ApiResponse<T = unknown> {
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface MediaUploadResponse {
  message?: string;
  mediaItems?: MediaItem[];
  errors?: {
    file?: string[];
  };
}

// ===== FORM INTERFACES =====
export interface UploadStatus {
  status: "idle" | "uploading" | "success" | "error";
  message?: string | null;
  errors?: string[];
}

// ===== UTILITY TYPES =====
export type AllowedFileType =
  typeof import("./global").ALLOWED_FILE_TYPES[number];

export type ComponentProps<T> = T extends React.ComponentType<infer P>
  ? P
  : never;
