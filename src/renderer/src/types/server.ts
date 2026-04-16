export type ServerRole = 'host' | 'moderator' | 'member'

export interface Server {
  id: string
  name: string
  iconColor: string
  role: ServerRole
  textChannelName: string
  voiceRoomName: string
  memberCount: number
  onlineMemberCount: number
}

export interface ServerMember {
  userId: string
  username: string
  avatarColor: string | null
  role: ServerRole
  status: 'online' | 'offline' | 'idle' | 'dnd'
  isMuted: boolean
}

export interface VoiceParticipant {
  userId: string
  username: string
  avatarColor: string | null
  isMuted: boolean
  isDeafened: boolean
  isSpeaking: boolean
  isScreenSharing: boolean
  isCameraOn: boolean
}
