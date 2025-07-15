"use client";

import React, { useState, useEffect } from "react";
import {
  HiRss,
  HiX,
  HiPlus,
  HiMinus,
  HiOutlinePlusCircle,
  HiOutlinePhotograph,
  HiOutlineDocumentText,
} from "react-icons/hi";
import {
  createPost,
  ContentBlock,
  createMarkdownBlock,
  createMediaBlock,
  getMediaForSelector,
} from "@/lib/actions/posts/create";
import type { MediaItem } from "@/utils/interfaces";
import Image from "next/image";

interface PostFormData {
  title: string;
  slug: string;
  description: string;
  content_blocks: ContentBlock[];
  tags: string[];
  type: string;
  status: "draft" | "published" | "archived";
}

const CreatePost = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    slug: "",
    description: "",
    content_blocks: [createMarkdownBlock("", 0)],
    tags: [],
    type: "",
    status: "draft",
  });
  const [newTag, setNewTag] = useState("");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number | null>(
    null
  );

  // Fetch media items when the component mounts
  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  const fetchMedia = async () => {
    const media = await getMediaForSelector(50);
    if (media) {
      setMediaItems(media);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset form data when closing
    setFormData({
      title: "",
      slug: "",
      description: "",
      content_blocks: [createMarkdownBlock("", 0)],
      tags: [],
      type: "",
      status: "draft",
    });
    setNewTag("");
    setSubmitMessage(null);
  };

  const handleInputChange = (
    field: keyof Omit<PostFormData, "content_blocks">,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleContentBlockChange = (index: number, content: string) => {
    setFormData((prev) => {
      const newBlocks = [...prev.content_blocks];
      newBlocks[index] = { ...newBlocks[index], block_content: content };
      return { ...prev, content_blocks: newBlocks };
    });
  };

  const addContentBlock = (blockType: "markdown" | "media" = "markdown") => {
    if (blockType === "markdown") {
      setFormData((prev) => {
        const newBlocks = [...prev.content_blocks];
        newBlocks.push(createMarkdownBlock("", newBlocks.length));
        return { ...prev, content_blocks: newBlocks };
      });
    } else if (blockType === "media") {
      setCurrentBlockIndex(formData.content_blocks.length);
      setIsMediaSelectorOpen(true);
    }
  };

  const addMediaBlock = (mediaId: string) => {
    if (currentBlockIndex !== null) {
      // Adding to existing block
      setFormData((prev) => {
        const newBlocks = [...prev.content_blocks];
        newBlocks[currentBlockIndex] = createMediaBlock(
          mediaId,
          currentBlockIndex
        );
        return { ...prev, content_blocks: newBlocks };
      });
    } else {
      // Adding as new block
      setFormData((prev) => {
        const newBlocks = [...prev.content_blocks];
        newBlocks.push(createMediaBlock(mediaId, newBlocks.length));
        return { ...prev, content_blocks: newBlocks };
      });
    }
    setIsMediaSelectorOpen(false);
    setCurrentBlockIndex(null);
  };

  const removeContentBlock = (index: number) => {
    setFormData((prev) => {
      if (prev.content_blocks.length <= 1) return prev; // Keep at least one block

      const newBlocks = [...prev.content_blocks];
      newBlocks.splice(index, 1);

      // Update order values
      const updatedBlocks = newBlocks.map((block, idx) => ({
        ...block,
        block_order: idx,
      }));

      return { ...prev, content_blocks: updatedBlocks };
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (title: string) => {
    handleInputChange("title", title);
    // Auto-generate slug from title
    if (title && !formData.slug) {
      handleInputChange("slug", generateSlug(title));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const result = await createPost(formData);

      if (result.message?.includes("successfully")) {
        setSubmitMessage({ type: "success", text: result.message });
        setTimeout(() => {
          handleClose();
        }, 1500);
        // You might want to trigger a refresh of posts list here
      } else {
        setSubmitMessage({
          type: "error",
          text: result.message || "Failed to create post",
        });
      }
    } catch (error) {
      setSubmitMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render a block based on its type
  const renderBlock = (block: ContentBlock, index: number) => {
    if (block.block_type === "markdown") {
      return (
        <textarea
          value={block.block_content}
          onChange={(e) => handleContentBlockChange(index, e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter markdown content"
          disabled={isSubmitting}
        />
      );
    } else if (block.block_type === "media") {
      const media = mediaItems.find((item) => item.id === block.block_content);
      return (
        <div className="relative border border-gray-300 rounded-md p-2 bg-gray-50">
          <div className="flex items-center">
            <HiOutlinePhotograph className="text-2xl text-gray-500 mr-2" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">
                {media?.filename || "Media"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {block.block_content}
              </p>
            </div>
            <button
              type="button"
              className="text-blue-600 hover:text-blue-800 text-sm"
              onClick={() => {
                setCurrentBlockIndex(index);
                setIsMediaSelectorOpen(true);
              }}
              disabled={isSubmitting}
            >
              Change
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <HiRss
        className="text-4xl cursor-pointer hover:text-blue-600 transition-colors"
        onClick={isOpen ? handleClose : handleOpen}
      />

      {isOpen && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                Create New Post
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <HiX className="text-2xl" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Submit Message */}
              {submitMessage && (
                <div
                  className={`p-3 rounded-md ${
                    submitMessage.type === "success"
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}
                >
                  {submitMessage.text}
                </div>
              )}

              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter post title"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Slug */}
              <div>
                <label
                  htmlFor="slug"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Slug *
                </label>
                <input
                  type="text"
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="post-url-slug"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter post description"
                  disabled={isSubmitting}
                />
              </div>

              {/* Content Blocks */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Content Blocks *
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => addContentBlock("markdown")}
                      disabled={isSubmitting}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 px-2 py-1 border border-blue-200 rounded"
                    >
                      <HiOutlineDocumentText className="mr-1" /> Add Text
                    </button>
                    <button
                      type="button"
                      onClick={() => addContentBlock("media")}
                      disabled={isSubmitting}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 px-2 py-1 border border-blue-200 rounded"
                    >
                      <HiOutlinePhotograph className="mr-1" /> Add Media
                    </button>
                  </div>
                </div>

                {formData.content_blocks.map((block, index) => (
                  <div key={index} className="mb-4 relative">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">
                        Block {index + 1} ({block.block_type})
                      </span>
                      {formData.content_blocks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeContentBlock(index)}
                          disabled={isSubmitting}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {renderBlock(block, index)}
                  </div>
                ))}
              </div>

              {/* Type */}
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Type
                </label>
                <input
                  type="text"
                  id="type"
                  value={formData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., article, tutorial, news"
                  disabled={isSubmitting}
                />
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    handleInputChange(
                      "status",
                      e.target.value as PostFormData["status"]
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), handleAddTag())
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a tag"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <HiPlus className="text-lg" />
                  </button>
                </div>

                {/* Display tags */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          disabled={isSubmitting}
                          className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                        >
                          <HiMinus className="text-sm" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Creating..." : "Create Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Selector Modal */}
      {isMediaSelectorOpen && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">Select Media</h3>
              <button
                onClick={() => setIsMediaSelectorOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiX className="text-xl" />
              </button>
            </div>

            <div className="p-4">
              {mediaItems.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No media items found
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {mediaItems.map((media) => (
                    <div
                      key={media.id}
                      onClick={() => addMediaBlock(media.id)}
                      className="cursor-pointer border border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 transition-colors"
                    >
                      {media.asset_type === "image" ? (
                        <div className="aspect-w-1 aspect-h-1 bg-gray-100">
                          <Image
                            src={media.public_url}
                            alt={media.filename}
                            className="object-cover w-full h-full"
                            width={512}
                            height={512}
                          />
                        </div>
                      ) : (
                        <div className="aspect-w-1 aspect-h-1 bg-gray-100 flex items-center justify-center">
                          <HiOutlineDocumentText className="text-4xl text-gray-400" />
                        </div>
                      )}
                      <div className="p-2">
                        <p className="text-xs truncate">{media.filename}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end p-4 border-t">
              <button
                type="button"
                onClick={() => setIsMediaSelectorOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreatePost;
