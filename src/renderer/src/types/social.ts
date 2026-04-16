export type UserStatus = 'online' | 'offline' | 'idle' | 'dnd'

export interface Friend {
  userId: string
  username: string
  avatarColor: string | null
  status: UserStatus
  lastSeen?: number
}

export interface FriendRequest {
  id: string
  fromUserId: string
  fromUsername: string
  fromAvatarColor: string | null
  toUserId: string
  toUsername: string
  toAvatarColor: string | null
  timestamp: number
  direction: 'incoming' | 'outgoing'
}

export interface MessageRequest {
  id: string
  fromUserId: string
  fromUsername: string
  fromAvatarColor: string | null
  toUserId: string
  toUsername: string
  toAvatarColor: string | null
  messagePreview: string
  timestamp: number
  direction: 'incoming' | 'outgoing'
  status: 'pending' | 'replied' | 'ignored'
}

export interface MessageRequestThreadMessage {
  id: string
  otherUserId: string
  senderId: string
  senderName: string
  content: string
  timestamp: number
  status: string
}

export interface BlockedUser {
  userId: string
  username: string
  blockedAt: number
}
