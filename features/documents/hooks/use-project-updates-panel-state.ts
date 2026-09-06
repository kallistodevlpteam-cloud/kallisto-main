"use client";

import {
  useEffect,
  useLayoutEffect,
  useState,
  type ChangeEvent,
  type RefObject,
} from "react";
import { projectUpdatePublishingService, ProjectUpdateActor } from "@/services/project-update-publishing-service";
import { mockProjectFileStorage } from "@/services/storage/mock-project-file-storage";
import { ProjectUpdateAttachment } from "@/types/domain/project-update";

export interface AttachedDocument {
  name: string;
  size?: string;
  type?: string;
  url?: string;
}

export interface UpdatePost {
  id: string;
  authorName: string;
  avatar: string;
  role: string;
  date: string;
  tag: string;
  text: string;
  mediaImg?: string;
  mediaImages?: string[];
  attachedFilesList?: AttachedDocument[];
  mediaBadge?: string;
}

export interface UploadCategory {
  id: string;
  label: string;
  tag: string;
  accept: string;
  isAction?: boolean;
  actionType?: "mention" | "action";
  iconName: "media" | "documents" | "mentions" | "actions";
}

export interface AudienceOption {
  id: string;
  label: string;
  badge: string;
}

export interface TeamMemberMention {
  id: string;
  name: string;
  role: string;
  avatar: string;
  type: "person";
}

export interface ProjectFileMention {
  id: string;
  name: string;
  category: string;
  type: "file";
}

export type MentionOption = TeamMemberMention | ProjectFileMention;

export interface SiteActionOption {
  id: string;
  command: string;
  label: string;
  description: string;
  category: string;
  iconName: "inspection" | "boq" | "media" | "safety" | "approval";
}

export const UPLOAD_CATEGORIES: readonly UploadCategory[] = [
  {
    id: "media",
    label: "Media",
    tag: "Photos & HD Videos",
    accept: "image/*,video/*",
    iconName: "media",
  },
  {
    id: "documents",
    label: "Documents",
    tag: "Drawings, PDF & BOQ",
    accept: ".pdf,.doc,.docx,.xls,.xlsx,.dwg,.txt",
    iconName: "documents",
  },
  {
    id: "mentions",
    label: "Mentions",
    tag: "Tag Team or Files",
    accept: "*",
    isAction: true,
    actionType: "mention",
    iconName: "mentions",
  },
  {
    id: "actions",
    label: "Actions",
    tag: "Site Command Actions",
    accept: "*",
    isAction: true,
    actionType: "action",
    iconName: "actions",
  },
];

export const AUDIENCE_OPTIONS: readonly AudienceOption[] = [
  { id: "all", label: "All", badge: "Visible to Everyone" },
  { id: "team", label: "Project Team", badge: "Team Members Only" },
  { id: "client", label: "Client Only", badge: "Client Access Only" },
  { id: "internal", label: "Internal", badge: "Internal Staff" },
];

const TEAM_MEMBERS_DATA: readonly TeamMemberMention[] = [
  { id: "tm-1", name: "Arjun Menon", role: "Project Manager", avatar: "/assets/arjun-avatar.jpg", type: "person" },
  { id: "tm-2", name: "Priya Sharma", role: "Lead Architect", avatar: "/assets/priya-avatar.jpg", type: "person" },
  { id: "tm-3", name: "Rahul Nair", role: "Structural Engineer", avatar: "/assets/rahul-avatar.jpg", type: "person" },
  { id: "tm-4", name: "Arjun Nair", role: "Client Owner", avatar: "/assets/arjun-avatar.jpg", type: "person" },
];

const PROJECT_FILES_DATA: readonly ProjectFileMention[] = [
  { id: "pf-1", name: "Site_Inspection_Phase3_Report.pdf", category: "Feasibility Report", type: "file" },
  { id: "pf-2", name: "Living_Room_Elevations_V2.dwg", category: "Architectural Drawing", type: "file" },
  { id: "pf-3", name: "BOQ_Structural_Reinforcement_v4.xlsx", category: "BOQ Estimate", type: "file" },
  { id: "pf-4", name: "Soil_Testing_Feasibility_Report.pdf", category: "Feasibility Report", type: "file" },
];

const SITE_ACTIONS_DATA: readonly SiteActionOption[] = [
  {
    id: "act-1",
    command: "/request-inspection",
    label: "Request Site Inspection",
    description: "Submit request for structural & slab inspection audit",
    category: "Inspection",
    iconName: "inspection",
  },
  {
    id: "act-2",
    command: "/log-boq-variation",
    label: "Log BOQ Variation",
    description: "Record material quantity or scope price variation",
    category: "BOQ",
    iconName: "boq",
  },
  {
    id: "act-3",
    command: "/upload-site-media",
    label: "Upload Progress Media",
    description: "Attach high resolution site photo or HD progress video",
    category: "Media",
    iconName: "media",
  },
  {
    id: "act-4",
    command: "/flag-safety-issue",
    label: "Flag Safety / Risk Issue",
    description: "Raise priority risk alert for site safety or timeline delay",
    category: "Safety",
    iconName: "safety",
  },
  {
    id: "act-5",
    command: "/request-client-approval",
    label: "Request Client Approval",
    description: "Submit drawing or milestone deliverable for client signoff",
    category: "Approval",
    iconName: "approval",
  },
];

export const INITIAL_PROJECT_UPDATES: readonly UpdatePost[] = [
  {
    id: "up-1",
    authorName: "Arjun Menon",
    avatar: "/assets/arjun-avatar.jpg",
    role: "Project Manager",
    date: "Just now",
    tag: "Milestone update",
    text: "Uploaded 1 media file.",
    mediaImg: "/assets/projectbg.webp",
    mediaImages: [
      "/assets/projectbg.webp",
      "/assets/projectbg.webp",
      "/assets/nila-thumb1.jpg",
      "/assets/nila-thumb2.jpg",
      "/assets/nila-thumb3.jpg",
      "/assets/hero-architecture-banner.webp",
    ],
    mediaBadge: "6 Media",
  },
  {
    id: "up-2",
    authorName: "Priya Sharma",
    avatar: "/assets/priya-avatar.jpg",
    role: "Lead Architect",
    date: "10 May",
    tag: "Design revision",
    text: "Updated interior living room elevations and luxury marble flooring specifications approved by client team.",
    mediaImg: "/assets/feed-coffee.jpg",
    mediaImages: [
      "/assets/feed-coffee.jpg",
      "/assets/nila-thumb2.jpg",
      "/assets/nila-thumb1.jpg",
      "/assets/nila-thumb3.jpg",
      "/assets/projectbg.webp",
    ],
    mediaBadge: "5 Renders Attached",
  },
  {
    id: "up-3",
    authorName: "Rahul Nair",
    avatar: "/assets/rahul-avatar.jpg",
    role: "Structural Engineer",
    date: "08 May",
    tag: "BOQ & Materials",
    text: "Steel reinforcement stress load testing verified for column grid C4-C8 with zero defects.",
  },
];

export const PROJECT_UPDATE_TEXTAREA_MIN_HEIGHT = 48;
export const PROJECT_UPDATE_TEXTAREA_MAX_HEIGHT = 144;

export function syncProjectUpdateTextareaHeight(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";
  const nextHeight = Math.max(
    PROJECT_UPDATE_TEXTAREA_MIN_HEIGHT,
    Math.min(textarea.scrollHeight, PROJECT_UPDATE_TEXTAREA_MAX_HEIGHT),
  );
  textarea.style.height = `${nextHeight}px`;
  textarea.style.overflowX = "hidden";
  textarea.style.overflowY =
    textarea.scrollHeight > PROJECT_UPDATE_TEXTAREA_MAX_HEIGHT ? "auto" : "hidden";
}

export interface ProjectUpdatesPanelRefs {
  fileInputRef: RefObject<HTMLInputElement | null>;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  feedRef: RefObject<HTMLDivElement | null>;
  uploadMenuRef: RefObject<HTMLDivElement | null>;
  audienceMenuRef: RefObject<HTMLDivElement | null>;
  mentionsMenuRef: RefObject<HTMLDivElement | null>;
  actionsMenuRef: RefObject<HTMLDivElement | null>;
}

export function useProjectUpdatesPanelState(
  refs: ProjectUpdatesPanelRefs,
  initialUpdates: readonly UpdatePost[] = INITIAL_PROJECT_UPDATES,
  projectId = "proj-001",
  actor: ProjectUpdateActor = {
    userId: "usr-arjun",
    workspaceId: "ws-default",
    role: "Project Manager",
    name: "Arjun Menon",
    avatarUrl: "/assets/arjun-avatar.jpg",
  },
) {
  const {
    fileInputRef,
    textareaRef,
    feedRef,
    uploadMenuRef,
    audienceMenuRef,
    mentionsMenuRef,
    actionsMenuRef,
  } = refs;
  const [updatesList, setUpdatesList] = useState<UpdatePost[]>(() => [...initialUpdates]);
  const [updateText, setUpdateText] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [activeCategory, setActiveCategory] = useState<UploadCategory>(UPLOAD_CATEGORIES[0]);
  const [selectedAudience, setSelectedAudience] = useState<AudienceOption>(AUDIENCE_OPTIONS[0]);
  const [selectedAction, setSelectedAction] = useState<SiteActionOption | null>(null);
  const [selectedMentions, setSelectedMentions] = useState<MentionOption[]>([]);
  const [uploadMenuOpen, setUploadMenuOpen] = useState(false);
  const [audienceMenuOpen, setAudienceMenuOpen] = useState(false);
  const [mentionsMenuOpen, setMentionsMenuOpen] = useState(false);
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");

  useLayoutEffect(() => {
    if (textareaRef.current) {
      syncProjectUpdateTextareaHeight(textareaRef.current);
    }
  }, [textareaRef, updateText]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (uploadMenuRef.current && !uploadMenuRef.current.contains(target)) setUploadMenuOpen(false);
      if (audienceMenuRef.current && !audienceMenuRef.current.contains(target)) setAudienceMenuOpen(false);
      if (mentionsMenuRef.current && !mentionsMenuRef.current.contains(target)) setMentionsMenuOpen(false);
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(target)) setActionsMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [actionsMenuRef, audienceMenuRef, mentionsMenuRef, uploadMenuRef]);

  const handleTextareaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setUpdateText(value);
    syncProjectUpdateTextareaHeight(event.target);

    const lastAtIndex = value.lastIndexOf("@");
    const lastSlashIndex = value.lastIndexOf("/");

    if (lastAtIndex !== -1 && lastAtIndex >= value.length - 15 && !value.substring(lastAtIndex).includes(" ")) {
      setFilterQuery(value.substring(lastAtIndex + 1).toLowerCase());
      setMentionsMenuOpen(true);
      setActionsMenuOpen(false);
      setUploadMenuOpen(false);
      setAudienceMenuOpen(false);
    } else if (lastSlashIndex !== -1 && lastSlashIndex >= value.length - 15 && !value.substring(lastSlashIndex).includes(" ")) {
      setFilterQuery(value.substring(lastSlashIndex + 1).toLowerCase());
      setActionsMenuOpen(true);
      setMentionsMenuOpen(false);
      setUploadMenuOpen(false);
      setAudienceMenuOpen(false);
    } else {
      setMentionsMenuOpen(false);
      setActionsMenuOpen(false);
    }
  };

  const handleCategorySelect = (category: UploadCategory) => {
    setActiveCategory(category);
    setUploadMenuOpen(false);

    if (category.isAction) {
      setFilterQuery("");
      setMentionsMenuOpen(category.actionType === "mention");
      setActionsMenuOpen(category.actionType === "action");
      setAudienceMenuOpen(false);
      window.setTimeout(() => textareaRef.current?.focus(), 50);
    } else if (fileInputRef.current) {
      fileInputRef.current.accept = category.accept;
      fileInputRef.current.click();
    }
  };

  const handleSelectMention = (item: MentionOption) => {
    if (!selectedMentions.some((mention) => mention.id === item.id)) {
      setSelectedMentions((current) => [...current, item]);
    }
    const lastAtIndex = updateText.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      const cleanText = updateText.substring(0, lastAtIndex).trim();
      setUpdateText(cleanText ? `${cleanText} ` : "");
    }
    setMentionsMenuOpen(false);
    setFilterQuery("");
    textareaRef.current?.focus();
  };

  const handleSelectAction = (action: SiteActionOption) => {
    setSelectedAction(action);
    const lastSlashIndex = updateText.lastIndexOf("/");
    if (lastSlashIndex !== -1) {
      const cleanText = updateText.substring(0, lastSlashIndex).trim();
      setUpdateText(cleanText ? `${cleanText} ` : "");
    }
    setActionsMenuOpen(false);
    setFilterQuery("");
    textareaRef.current?.focus();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setAttachedFiles((current) => [...current, ...Array.from(event.target.files ?? [])]);
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setAttachedFiles((current) => current.filter((_, index) => index !== indexToRemove));
  };

  const handleSendUpdate = async () => {
    if (!updateText.trim() && attachedFiles.length === 0 && !selectedAction && selectedMentions.length === 0) return;

    const currentText = updateText.trim();
    const currentFiles = [...attachedFiles];
    const currentAction = selectedAction;
    const currentMentions = [...selectedMentions];
    const currentAudience = selectedAudience;
    const currentCategory = activeCategory;

    setUpdateText("");
    setAttachedFiles([]);
    setSelectedAction(null);
    setSelectedMentions([]);
    if (textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.style.height = `${PROJECT_UPDATE_TEXTAREA_MIN_HEIGHT}px`;
      textareaRef.current.style.overflowX = "hidden";
      textareaRef.current.style.overflowY = "hidden";
    }

    const imageFiles = currentFiles.filter((file) => file.type.startsWith("image/"));
    const createdMediaImages = imageFiles.map((file) => URL.createObjectURL(file));
    const firstImageFile = imageFiles[0];
    const previewUrl = firstImageFile ? URL.createObjectURL(firstImageFile) : (createdMediaImages[0] ?? undefined);

    const nonImageFiles = currentFiles.filter((file) => !file.type.startsWith("image/"));
    const attachedFilesList: AttachedDocument[] = nonImageFiles.map((f) => ({
      name: f.name,
      size: `${(f.size / 1024).toFixed(0)} KB`,
      type: f.name.split(".").pop()?.toUpperCase() ?? "FILE",
      url: URL.createObjectURL(f),
    }));

    let tagText = currentCategory.tag || "Site Update";
    if (currentAction) tagText = `Action: ${currentAction.label}`;
    else if (currentMentions.length > 0) tagText = `Mention (${currentMentions.length})`;
    else if (currentAudience.id !== "all") tagText = `${currentAudience.label} • ${currentCategory.tag}`;

    // Upload files to durable mock file storage and prepare attachments for publishing
    const preparedAttachments: ProjectUpdateAttachment[] = [];
    for (let i = 0; i < currentFiles.length; i++) {
      const f = currentFiles[i];
      const storageRes = await mockProjectFileStorage.uploadFile(projectId, f);
      preparedAttachments.push({
        id: `att-dash-${Date.now()}-${i}`,
        type: f.type.startsWith("image/") ? "image" : "document",
        name: f.name,
        sizeBytes: f.size,
        mimeType: f.type || "application/octet-stream",
        storageObjectId: storageRes.storageObjectId,
        downloadUrl: storageRes.downloadUrl,
        url: storageRes.downloadUrl,
        documentCategory: currentCategory.id,
      });
    }

    // Publish to Drive via projectUpdatePublishingService orchestration
    try {
      await projectUpdatePublishingService.createAndPublish({
        update: {
          projectId,
          authorId: actor.userId,
          authorName: actor.name,
          authorRole: actor.role,
          authorAvatar: actor.avatarUrl,
          type: currentFiles.length > 0 ? "document_uploaded" : "general",
          title: tagText,
          body: currentText || undefined,
          visibility: currentAudience.id === "internal" ? "internal" : currentAudience.id === "client" ? "client_visible" : "project_team",
          attachments: preparedAttachments,
        },
        actor,
      });
    } catch (err) {
      console.error("Dashboard update publication failed:", err);
    }

    setUpdatesList((current) => [{
      id: `up-${Date.now()}`,
      authorName: actor.name,
      avatar: actor.avatarUrl || "/assets/arjun-avatar.jpg",
      role: actor.role,
      date: "Just now",
      tag: tagText,
      text: currentText || (currentAction
        ? `Initiated action: ${currentAction.label}`
        : `Uploaded ${currentFiles.length} ${currentCategory.label.toLowerCase()} file${currentFiles.length > 1 ? "s" : ""}.`),
      mediaImg: previewUrl,
      mediaImages: createdMediaImages.length > 0 ? createdMediaImages : undefined,
      attachedFilesList: attachedFilesList.length > 0 ? attachedFilesList : undefined,
      mediaBadge: currentFiles.length > 0 ? `${currentFiles.length} ${currentCategory.label}` : undefined,
    }, ...current]);

    const reducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (typeof feedRef.current?.scrollTo === "function") {
      feedRef.current.scrollTo({
        top: 0,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    }
  };

  return {
    state: {
      updatesList,
      updateText,
      attachedFiles,
      selectedAudience,
      selectedAction,
      selectedMentions,
      uploadMenuOpen,
      audienceMenuOpen,
      mentionsMenuOpen,
      actionsMenuOpen,
      filteredTeamMembers: TEAM_MEMBERS_DATA.filter((member) =>
        member.name.toLowerCase().includes(filterQuery) || member.role.toLowerCase().includes(filterQuery)),
      filteredProjectFiles: PROJECT_FILES_DATA.filter((file) =>
        file.name.toLowerCase().includes(filterQuery) || file.category.toLowerCase().includes(filterQuery)),
      filteredActions: SITE_ACTIONS_DATA.filter((action) =>
        action.label.toLowerCase().includes(filterQuery) ||
        action.command.toLowerCase().includes(filterQuery) ||
        action.description.toLowerCase().includes(filterQuery)),
      hasPillItems: attachedFiles.length > 0 || selectedAction !== null || selectedMentions.length > 0,
      setSelectedAudience,
      setSelectedAction,
      setSelectedMentions,
      setUploadMenuOpen,
      setAudienceMenuOpen,
      setMentionsMenuOpen,
      setActionsMenuOpen,
      handleTextareaChange,
      handleCategorySelect,
      handleSelectMention,
      handleSelectAction,
      handleFileChange,
      handleRemoveFile,
      handleSendUpdate,
    },
  };
}
