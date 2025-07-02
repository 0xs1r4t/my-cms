export * from "@/utils/interfaces";

type MediaItem = {
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
};
