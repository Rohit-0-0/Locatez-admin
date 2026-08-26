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

export interface VideoRequest {
  id: string;
  title: string;
  description: string;
  requesterId: string;
  requester?: User;
  categoryId: string;
  category?: { id: string; name: string };
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

