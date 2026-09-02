export type Role = "USER" | "MODERATOR" | "ADMIN" | "SUPERADMIN";

export type UserStatus = "ACTIVE" | "BLOCKED" | "SUSPENDED";

export interface User {
  id: string;
  email: string;
  username: string;
  phone?: string;
  role: Role;
  status: UserStatus;
  isProfileComplete: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategorySuggestion {
  id: string;
  name: string;
  normalizedName: string;
  occurrenceCount: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | string;
  firstSeenAt: string;
  lastSeenAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PopularPlace {
  id: string;
  name: string;
  location: string;
  description: string;
  latitude: number;
  longitude: number;
  image: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePopularPlacePayload {
  name: string;
  location: string;
  description: string;
  latitude: number;
  longitude: number;
  image: string;
}

export interface UpdatePopularPlacePayload {
  name?: string;
  location?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  image?: string;
}

export interface UpdatePopularPlaceStatusPayload {
  isActive: boolean;
}

export interface VideoRequest {
  id: string;
  title: string;
  description: string;
  requesterId: string;
  requester?: User;
  categoryId: string;
  category?: Category | { id: string; name: string };
  rewardAmount: number;
  payoutType: string;
  status: "PENDING" | "OPEN" | "ACCEPTED" | "ONGOING" | "IN_PROGRESS" | "COMPLETED" | "EXPIRED" | "CANCELLED" | "REJECTED";
  createdAt: string;
  isRestrictedArea?: boolean;
  restrictedAreaType?: string;
  rejectionReason?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  actor?: User;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: any;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  message: string;
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  errors?: any[];
}

export type ChatRoomState = "PRE_ACCEPTANCE" | "ACCEPTED" | "CANCELLED" | "COMPLETED";

export interface ChatRoom {
  id: string;
  videoRequestId: string;
  requesterId: string;
  fulfillerId: string;
  state: ChatRoomState;
  fulfillerMessageCount: number;
  preAcceptanceMessageLimit: number;
  fulfillerMessagesRemaining: number;
  videoRequest?: {
    id: string;
    title: string;
    status: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  chatId?: string;
  chatRoomId?: string;
  senderId: string;
  senderName?: string;
  sender?: {
    id: string;
    displayName?: string;
    username?: string;
    avatarUrl?: string;
  };
  content: string;
  type?: "TEXT" | "IMAGE" | "SYSTEM" | string;
  createdAt: string;
}

export type MarketplaceStatus = "DRAFT" | "PUBLISHED" | "ENDED" | "EXPIRED" | "CANCELLED";

export interface MarketplaceStream {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  thumbnailUrl?: string | null;
  durationSeconds?: number | null;
  expiresAt?: string | null;
  status: MarketplaceStatus;
  creator?: {
    id: string;
    username: string;
    fullName?: string | null;
    profilePhotoUrl?: string | null;
  };
  customLocation?: {
    address: string;
    latitude: number;
    longitude: number;
  } | null;
  category?: {
    id: string | null;
    name: string;
  } | null;
  isOwner?: boolean;
  isPurchased?: boolean;
  purchaseCount?: number;
  createdAt: string;
}

export interface MarketplacePurchase {
  id: string;
  amount: number;
  purchasedAt: string;
  isAccessible?: boolean;
  listing?: MarketplaceStream;
}

export interface Idea {
  id: string;
  title: string;
  content: string;
  imageKey: string;
  imageUrl?: string;
  placeName: string;
  city: string;
  state: string;
  categoryId: string;
  category?: Category | { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateIdeaPayload {
  title: string;
  content: string;
  imageKey: string;
  placeName: string;
  city: string;
  state: string;
  categoryId: string;
}

export interface UpdateIdeaPayload {
  title?: string;
  content?: string;
  imageKey?: string;
  placeName?: string;
  city?: string;
  state?: string;
  categoryId?: string;
}

export interface GetIdeasParams {
  categoryId?: string;
  search?: string;
}


