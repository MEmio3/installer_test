# MESH UI Polish Guide — Discord-Quality Finish

> **Purpose:** This document is the single source of truth for polishing the MESH Electron app UI to Discord-level quality. Follow every section in order. Each task has a priority, the exact file to edit, and what the result should look like.

---

## GOLDEN RULES

### DO NOT TOUCH
- `src/main/` — All backend logic, IPC handlers, database, identity, socket-client, relay-manager
- `src/server/` — Signaling server
- `src/preload/` — Preload bridge (index.ts, index.d.ts)
- `src/shared/types.ts` — Shared IPC types
- `src/renderer/src/stores/` — Do NOT change store logic, state shape, or IPC calls. You may ONLY add new UI-only state (e.g. `showDropdown: boolean`) if a component needs local toggle state — but prefer `useState` in the component instead
- `src/renderer/src/lib/webrtc.ts` — WebRTC manager
- `src/renderer/src/hooks/useSignaling.ts`
- `electron.vite.config.ts`, `tsconfig.*.json`, `package.json`
- Any file in `src/main/` or `src/server/`

### YOU MAY TOUCH
- All files in `src/renderer/src/components/`
- All files in `src/renderer/src/pages/`
- `src/renderer/src/layouts/AppShell.tsx`
- `src/renderer/src/styles/app.css` (Tailwind + custom CSS)
- `src/renderer/src/types/` (only to add UI-only display types, never remove existing)
- You may create NEW component files in `src/renderer/src/components/ui/` for reusable elements

### STYLE SYSTEM
- Tailwind CSS with custom `mesh-*` color tokens defined in `tailwind.config.js`
- Dark theme only (Xbox-inspired). Never add light mode
- Key colors: `mesh-green` (#107C10), `mesh-bg-primary`, `mesh-bg-secondary`, `mesh-bg-tertiary`, `mesh-bg-elevated`, `mesh-border`, `mesh-text-primary`, `mesh-text-secondary`, `mesh-text-muted`
- Icons: `lucide-react` only. Do not install new icon packages

### BEFORE YOU START
1. Run `npx electron-vite build` to confirm current build passes
2. After every major section, run build again to verify no breakage
3. Never remove existing functionality. Only enhance visuals and add missing UI pieces

---

## SECTION 1 — CRITICAL FIXES (Non-functional elements)

### 1.1 Remove non-functional server header chevron dropdown
**File:** `src/renderer/src/components/navigation/panels/ServerSidePanel.tsx`
**Problem:** There is a `<ChevronDown>` icon in the server header (around line 36) that has no `onClick` handler. It looks clickable but does nothing.
**Fix:** Either:
- (A) Remove the ChevronDown icon entirely, OR
- (B) Make it functional: add a dropdown menu with items like "Copy Server ID", "Leave Server". Use local `useState` for open/close. When "Copy Server ID" is clicked, copy `server.id` to clipboard. When "Leave Server" is clicked, call the existing `leaveServer` from the servers store.

Prefer option (B). Model it after Discord's server dropdown.

### 1.2 Remove or wire non-functional attachment button in chat input
**File:** `src/renderer/src/components/chat/MessageInput.tsx`
**Problem:** Plus (+) button around line 42-46 has no onClick and does nothing.
**Fix:** Remove the Plus button entirely. We don't support file attachments. Keep the input area clean — just the textarea and send button.

### 1.3 Remove or wire non-functional "New DM" plus button
**File:** `src/renderer/src/components/dm/DmList.tsx`
**Problem:** Plus (+) button next to "Direct Messages" header has no onClick.
**Fix:** Remove the button. DMs are started from the Friends page (Add Friend tab or by clicking a friend). The button is misleading.

---

## SECTION 2 — SERVER SIDEBAR (Channel List)

### 2.1 Collapsible channel categories
**File:** `src/renderer/src/components/navigation/panels/ServerSidePanel.tsx`
**Current:** Text channels and voice rooms are listed flat with hardcoded section headers.
**Target (Discord-like):**
- Section headers should have a small chevron icon on the LEFT that rotates when collapsed
- Clicking the header text OR chevron toggles collapse
- Use `useState` for collapse state (default: expanded)
- The chevron should be `ChevronRight` when collapsed, `ChevronDown` when expanded (or rotate with CSS transform)
- Section header text should be uppercase, `text-[11px]`, `font-semibold`, `text-mesh-text-muted`, `tracking-wide`
- Add `cursor-pointer` and subtle `hover:text-mesh-text-secondary` to section headers

### 2.2 Channel item styling
**Same file**
- Text channel items: prefix with `#` icon (Hash from lucide), show channel name
- Voice room items: prefix with Volume2 icon (from lucide)
- Active channel: `bg-mesh-bg-tertiary`, `text-mesh-text-primary`, slightly rounded
- Inactive hover: `hover:bg-mesh-bg-tertiary/50`, `text-mesh-text-secondary`
- Left padding should be `pl-6` (indented under category header)
- Each channel item height: `h-8` with `flex items-center`

### 2.3 Voice participants under voice channel
**Same file**
- When users are in a voice room, show them indented under the voice channel item
- Each participant: small avatar (16px) + username in `text-xs text-mesh-text-muted`
- Show mute icon (MicOff, 12px) next to name if muted
- Indent level: `pl-10` (further indented under voice channel)

### 2.4 Server footer with member counts
**Same file**
- Bottom of server sidebar: subtle footer bar
- Show online member count / total member count
- Small green dot + "X Online" in `text-xs text-mesh-text-muted`
- Background: `bg-mesh-bg-primary` to differentiate from sidebar

---

## SECTION 3 — USER PANEL (Bottom Bar)

### 3.1 Voice Connected banner
**File:** `src/renderer/src/components/navigation/UserPanel.tsx`
**Current:** VoiceConnectionBar exists but needs polish.
**Target:**
- Background: `bg-mesh-bg-primary` with a thin green top border (`border-t-2 border-mesh-green`)
- "Voice Connected" text in `text-mesh-green text-xs font-semibold`
- Below that: server/room name in `text-[11px] text-mesh-text-muted`
- Right side: disconnect button (PhoneOff icon) with `hover:bg-red-500/20` and red icon color
- Add a subtle signal/connection quality icon (Wifi from lucide) on the left, static green

### 3.2 User info section
**Same file**
- Avatar should be 32px with online status dot (green dot at bottom-right of avatar)
- Username: `text-sm font-medium text-mesh-text-primary`, truncate with `max-w-[90px]`
- Below username: show status text in `text-[11px] text-mesh-text-muted` (e.g. "Online", "Idle", etc.)
- Click on the avatar/name area should NOT copy to clipboard (that's unexpected). Instead show a small user card popup or do nothing.

### 3.3 Control buttons (Mic, Deafen, Settings)
**Same file**
- Three icon buttons in a row, each `w-8 h-8 rounded`
- Normal state: `text-mesh-text-secondary`, `hover:bg-mesh-bg-tertiary`
- Active/muted state: icon should have a diagonal red strikethrough line (CSS or use `MicOff`/`VolumeX` icons)
- When muted: background should be `bg-red-500/10` with `text-red-400`
- Settings gear icon: always `text-mesh-text-secondary`, `hover:bg-mesh-bg-tertiary`
- Tooltips on all three: "Mute", "Deafen", "User Settings"

---

## SECTION 4 — CHAT AREA

### 4.1 Message input improvements
**File:** `src/renderer/src/components/chat/MessageInput.tsx`
**Target:**
- Input container: `bg-mesh-bg-tertiary` with `rounded-lg`, NO visible border by default, `focus-within:ring-1 focus-within:ring-mesh-border`
- Textarea: transparent background, no border, placeholder text like "Message #general" or "Message @Username"
- Send button: only show when there is text (hide when empty for cleaner look)
- Remove the keyboard shortcut hint text below the input (the `<kbd>` section). It's visual clutter. Discord doesn't show this.
- Input should have `px-4 py-2.5` padding inside the container

### 4.2 Message bubble / message row styling
**File:** `src/renderer/src/components/chat/MessageBubble.tsx`
**Target (Discord-style messages, NOT chat bubbles):**
- Messages should NOT look like chat bubbles. Discord uses flat rows.
- Full message row: `hover:bg-mesh-bg-tertiary/30` on the ENTIRE row (full width)
- Avatar (40px) on the left, message content on the right
- Sender name: colored (use avatar color if available, fallback to white). `text-sm font-medium`
- Timestamp next to sender name: `text-[11px] text-mesh-text-muted ml-2`
- Message content below sender name: `text-sm text-mesh-text-primary` with `leading-relaxed`
- Grouped messages (same sender within threshold): NO avatar, NO name, only content with left padding matching the content column (so text aligns). Show timestamp on hover in the gutter area where the avatar would be.
- Status ticks (sent/delivered/read): remove these for server messages. Only show in DMs.

### 4.3 Message feed improvements
**File:** `src/renderer/src/components/chat/MessageFeed.tsx`
**Target:**
- Date dividers: horizontal line across full width with date text centered in a small pill/badge. Style: `text-[11px] text-mesh-text-muted font-semibold` inside a `bg-mesh-bg-secondary px-2` pill, with `border-t border-mesh-border` lines extending to each side
- "New messages" scroll-to-bottom button: position it as a floating pill above the input, centered horizontally. Icon: `ChevronDown`. Text: "New messages" if there are new ones, otherwise just the arrow
- Empty state: Add a large icon (MessageCircle from lucide, 48px, `text-mesh-text-muted`), title text "No messages yet", subtitle "Send a message to start the conversation", all centered vertically

### 4.4 Message hover actions
**File:** `src/renderer/src/components/chat/MessageBubble.tsx`
**Add:** When hovering a message row, show a small floating action bar at the top-right corner of the message row. The bar should contain icon buttons:
- For own messages: Delete (Trash2 icon)
- For all messages: Reply (Reply icon) — this can be a no-op for now, just show the button
- Bar styling: `bg-mesh-bg-elevated border border-mesh-border rounded shadow-lg` with small icon buttons (`w-7 h-7`)
- Bar appears on hover, disappears on mouse leave
- Use CSS `group` and `group-hover:opacity-100 opacity-0` pattern

---

## SECTION 5 — SERVER TEXT CHANNEL PAGE

### 5.1 Channel header bar
**File:** `src/renderer/src/pages/server/ServerTextChannel.tsx`
**Target:**
- Height: `h-12` with `border-b border-mesh-border`
- Left side: Hash icon + channel name in `font-semibold text-mesh-text-primary`
- Optional: thin vertical divider, then channel topic/description in `text-sm text-mesh-text-muted truncate` (can be empty for now)
- Right side: icon buttons row — Members toggle (Users icon), Search (Search icon, no-op is fine), Inbox (Bell icon, no-op)
- Members toggle: when active, icon should be `text-mesh-text-primary`, inactive `text-mesh-text-muted`
- All header buttons: `w-8 h-8 rounded hover:bg-mesh-bg-tertiary` with tooltips

---

## SECTION 6 — SERVER VOICE ROOM

### 6.1 Join prompt
**File:** `src/renderer/src/pages/server/ServerVoiceRoom.tsx`
**Current:** Shows icon + text + join button.
**Target:**
- Center vertically and horizontally
- Large Volume2 icon (64px) in `text-mesh-text-muted`
- Room name as title: `text-xl font-bold text-mesh-text-primary`
- Subtitle: "Click to join voice" in `text-sm text-mesh-text-muted`
- Join button: large green button with Phone icon, text "Join Voice"
- Button style: `bg-mesh-green hover:bg-mesh-green/90 text-white px-6 py-2.5 rounded-lg font-medium`

### 6.2 Connected state header
**Same file**
- Top bar: room name + participant count badge (e.g. "Voice Lounge" with a small "3" badge)
- Over-capacity warning: yellow/amber alert bar with AlertTriangle icon + text
- Style: `bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs px-3 py-1.5 rounded`

### 6.3 Participant grid
**Same file**
- Grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3`
- Each tile: `bg-mesh-bg-tertiary rounded-xl p-4` with avatar centered
- Speaking indicator: green glowing border (`ring-2 ring-mesh-green`) with subtle pulse animation
- Muted indicator: small MicOff icon badge overlaying bottom-right of avatar
- Screen sharing: small Monitor icon badge
- Username below avatar: `text-sm text-mesh-text-primary text-center truncate`

### 6.4 Voice control bar
**File:** `src/renderer/src/components/server/VoiceControlBar.tsx`
**Target:**
- Fixed at bottom of voice room area (not overlapping content)
- Background: `bg-mesh-bg-primary border-t border-mesh-border`
- Centered row of circular icon buttons: Mic, Headphones (deafen), Monitor (screen share), Camera, PhoneOff (disconnect)
- Normal: `bg-mesh-bg-tertiary hover:bg-mesh-bg-elevated rounded-full w-10 h-10`
- Active toggle (muted/deafened): `bg-red-500/20 text-red-400`
- Disconnect button: `bg-red-500 hover:bg-red-600 text-white rounded-full`
- Tooltips on everything

---

## SECTION 7 — DM LIST SIDEBAR

### 7.1 Search bar
**File:** `src/renderer/src/components/dm/DmList.tsx`
**Target:**
- Full width, `h-8`, `rounded`, `bg-mesh-bg-tertiary`, `text-xs`
- Placeholder: "Find or start a conversation"
- No visible border, subtle focus ring: `focus:ring-1 focus:ring-mesh-border`
- Search icon (Search from lucide, 14px) inside on the left as visual hint

### 7.2 Section header
**Same file**
- "DIRECT MESSAGES" in uppercase `text-[11px] font-semibold text-mesh-text-muted tracking-wide`
- No plus button (removed in Section 1.3)
- Small padding: `px-3 py-2 mt-2`

### 7.3 DM list items
**File:** `src/renderer/src/components/dm/DmListItem.tsx`
**Target:**
- Height: `h-11`, `rounded-md mx-1.5`
- Active: `bg-mesh-bg-tertiary`
- Hover: `hover:bg-mesh-bg-tertiary/60`
- Avatar (32px) with online status dot
- Username: `text-sm text-mesh-text-primary` (active) or `text-mesh-text-secondary` (inactive)
- Last message preview: `text-xs text-mesh-text-muted truncate` below username
- Unread badge: small green circle with count, `bg-mesh-green text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center`
- Close/remove button (X icon): show on hover only, right side, `opacity-0 group-hover:opacity-100`

---

## SECTION 8 — ACTIVITY BAR (Left Icon Strip)

### 8.1 Home button
**File:** `src/renderer/src/components/navigation/ActivityBar.tsx`
**Target:**
- MESH logo or Home icon, 48px container, centered
- Active: `bg-mesh-green rounded-2xl` (fully rounded square)
- Inactive: `bg-mesh-bg-tertiary rounded-[24px]` transitioning to `hover:rounded-2xl hover:bg-mesh-green`
- Transition: `transition-all duration-200`
- Active indicator: thin green pill on the left edge (3px wide, 36px tall, `bg-white rounded-r-full`), animated slide-in

### 8.2 Server icons
**File:** `src/renderer/src/components/navigation/ServerList.tsx`
**Target:**
- Each server: 48px square, showing first letter of server name or colored circle
- Same hover/active transition as home button (round→less round on hover)
- Active pill indicator on left (same as home)
- Unread indicator: small white dot on left when server has unread messages (smaller than active pill)
- Tooltip on hover (right side): server name

### 8.3 Add server button
**Same file**
- Green "+" icon, `text-mesh-green`
- `bg-mesh-bg-tertiary rounded-[24px]` → `hover:bg-mesh-green hover:text-white hover:rounded-2xl`
- Same size as server icons (48px)

### 8.4 Separators
**File:** `src/renderer/src/components/navigation/ActivityBar.tsx`
- Between home and server list: thin horizontal line, `w-8 h-[2px] bg-mesh-border rounded-full mx-auto`
- Between server list and settings: same separator

---

## SECTION 9 — FRIENDS PAGE TABS

### 9.1 Tab bar styling
**File:** `src/renderer/src/pages/friends/FriendsPage.tsx`
**Target:**
- Horizontal tab bar at top, inside a header bar matching Discord
- Header: `h-12 border-b border-mesh-border flex items-center px-4 gap-4`
- "Friends" title with Users icon on the left
- Tab buttons: `text-sm font-medium px-2 py-1 rounded`
- Active tab: `bg-mesh-bg-tertiary text-mesh-text-primary`
- Inactive tab: `text-mesh-text-secondary hover:text-mesh-text-primary hover:bg-mesh-bg-tertiary/50`
- Tabs: Online, All, Pending, Blocked, Nearby
- "Add Friend" button: separate green button on the right side of header, `bg-mesh-green text-white text-xs font-medium px-3 py-1.5 rounded`

### 9.2 Friend list items
**Relevant files in** `src/renderer/src/pages/friends/tabs/`
**Target:**
- Each friend row: `h-14 px-4 flex items-center hover:bg-mesh-bg-tertiary/50 rounded-lg mx-2`
- Avatar (36px) with status dot
- Username + status text column
- Right side action buttons (show on hover): Message (MessageCircle), Call (Phone), More (MoreVertical)
- Action buttons: `w-8 h-8 rounded-full bg-mesh-bg-tertiary hover:bg-mesh-bg-elevated text-mesh-text-secondary`
- Thin separator line between items: `border-b border-mesh-border/30`

### 9.3 Add Friend tab
**File:** `src/renderer/src/pages/friends/tabs/AddFriendTab.tsx`
**Target:**
- "ADD FRIEND" header with description text
- Input field: large, prominent, `h-12 bg-mesh-bg-tertiary rounded-lg border border-mesh-border focus-within:border-mesh-green`
- "Send Friend Request" button inside the input on the right: `bg-mesh-green text-white text-xs font-medium px-4 py-1.5 rounded`
- Input placeholder: "You can add friends with their User ID"
- Success/error messages below input with appropriate colors

---

## SECTION 10 — EMPTY STATES

For every empty state in the app, follow this pattern:

```
[Large muted icon, 48-64px]
[Title text, text-lg font-semibold text-mesh-text-primary]
[Subtitle text, text-sm text-mesh-text-muted, max-w-xs text-center]
```

### Files to update:
1. **MessageFeed.tsx** — Empty conversation: MessageCircle icon, "No messages yet", "Send a message to get started"
2. **DmList.tsx** — No DMs: MessageSquare icon, "No conversations", "Your direct messages will appear here"
3. **PendingTab.tsx** — No pending requests: UserPlus icon, "No pending requests", "Friend requests you send or receive will show up here"
4. **AllFriendsTab.tsx** — No friends: Users icon, "No friends yet", "Add friends to start chatting"
5. **OnlineFriendsTab.tsx** — No online friends: Circle icon, "No friends online", "When friends are online they'll appear here"
6. **BlockedTab.tsx** — No blocked users: ShieldOff icon, "No blocked users", "Users you block will appear here"
7. **Server not found** in ServerPage.tsx — Server icon, "Server not found", "This server doesn't exist or you were removed"

---

## SECTION 11 — SCROLLBAR & MICRO POLISH

### 11.1 Scrollbar styling
**File:** `src/renderer/src/styles/app.css`
```css
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; margin: 4px 0; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
```

### 11.2 Selection color
**Same file** — Add:
```css
::selection { background: rgba(16, 124, 16, 0.3); }
```

### 11.3 Focus-visible rings
All interactive elements should use `focus-visible:ring-2 focus-visible:ring-mesh-green focus-visible:ring-offset-0` instead of `focus:ring`. This prevents rings from showing on mouse click.

### 11.4 Transition consistency
All buttons and interactive elements: `transition-colors duration-150` minimum. Backgrounds that change shape: `transition-all duration-200`.

---

## SECTION 12 — MODAL POLISH

### 12.1 Modal backdrop
**File:** `src/renderer/src/components/ui/Modal.tsx`
- Backdrop: `bg-black/60 backdrop-blur-sm`
- Modal container: `bg-mesh-bg-secondary rounded-xl shadow-2xl border border-mesh-border/50`
- Max width: keep `max-w-md` but add `max-h-[85vh] overflow-y-auto`
- Header: add bottom border `border-b border-mesh-border/50 pb-4 mb-4`
- Close button (X): `hover:bg-mesh-bg-tertiary rounded-full w-8 h-8`

### 12.2 Create Server modal
**File:** `src/renderer/src/components/modals/CreateServerModal.tsx`
- Tab switcher: rounded pill style, `bg-mesh-bg-primary p-1 rounded-lg` container with `rounded-md` buttons inside
- Active tab: `bg-mesh-green text-white`
- Form inputs: consistent with Section 4.1 input styling
- Error text: `text-red-400 text-xs mt-2` with AlertCircle icon

---

## SECTION 13 — TOOLTIP CONSISTENCY

**File:** `src/renderer/src/components/ui/Tooltip.tsx`
- Background: `bg-mesh-bg-elevated`
- Border: add `border border-mesh-border/50`
- Text: `text-xs text-mesh-text-primary font-medium`
- Padding: `px-2.5 py-1.5`
- Border radius: `rounded-md`
- Shadow: `shadow-lg`
- Arrow/pointer: small CSS triangle pointing toward the trigger (optional, skip if complex)
- Delay: 300ms (keep current)
- Animation: `animate-in fade-in-0 zoom-in-95 duration-100`

---

## SECTION 14 — CONTEXT MENU POLISH

**File:** `src/renderer/src/components/ui/ContextMenu.tsx` (if exists) and `MemberListPanel.tsx`
- Background: `bg-mesh-bg-elevated border border-mesh-border/50 rounded-lg shadow-xl`
- Menu items: `px-2.5 py-1.5 text-sm rounded-sm mx-1`
- Hover: `hover:bg-mesh-green hover:text-white` (Discord uses blurple, we use green)
- Danger items: `hover:bg-red-500 hover:text-white text-red-400`
- Separator: `h-px bg-mesh-border/50 my-1 mx-2`
- Animation: `animate-in fade-in-0 zoom-in-95 duration-100`
- Min width: `min-w-[180px]`

---

## SECTION 15 — TITLE BAR

**File:** `src/renderer/src/components/navigation/TitleBar.tsx`
- Height: `h-8` (keep compact)
- Background: `bg-mesh-bg-primary`
- Window control buttons (min/max/close): right-aligned, each `w-11 h-8`
- Close button: `hover:bg-red-500 hover:text-white`
- Min/Max buttons: `hover:bg-mesh-bg-tertiary`
- Draggable area: `-webkit-app-region: drag` on the title bar, `-webkit-app-region: no-drag` on buttons
- Optional: show "MESH" text or icon centered, `text-xs text-mesh-text-muted font-medium`

---

## VERIFICATION CHECKLIST

After completing all sections, verify:

- [ ] `npx electron-vite build` passes with zero errors
- [ ] No console warnings about missing keys, refs, or effects
- [ ] All existing IPC functionality still works (don't test manually, just ensure no store/preload changes)
- [ ] Every button either does something or has been removed
- [ ] No orphan chevrons, arrows, or icons that suggest interactivity but do nothing
- [ ] Consistent spacing: 4/8/12/16px increments only (Tailwind's 1/2/3/4 scale)
- [ ] Consistent text sizes: `text-[11px]` for labels, `text-xs` (12px) for secondary, `text-sm` (14px) for body, `text-base` (16px) for headings
- [ ] All hover states have `transition-colors duration-150`
- [ ] All tooltips use the same Tooltip component with consistent styling
- [ ] No hardcoded colors — use `mesh-*` tokens only
- [ ] Empty states follow the pattern from Section 10
- [ ] Scrollbars are styled consistently

---

## FILE REFERENCE (Quick lookup)

| Component | Path |
|---|---|
| AppShell | `src/renderer/src/layouts/AppShell.tsx` |
| TitleBar | `src/renderer/src/components/navigation/TitleBar.tsx` |
| ActivityBar | `src/renderer/src/components/navigation/ActivityBar.tsx` |
| ServerList | `src/renderer/src/components/navigation/ServerList.tsx` |
| SidePanel | `src/renderer/src/components/navigation/SidePanel.tsx` |
| ServerSidePanel | `src/renderer/src/components/navigation/panels/ServerSidePanel.tsx` |
| UserPanel | `src/renderer/src/components/navigation/UserPanel.tsx` |
| DmList | `src/renderer/src/components/dm/DmList.tsx` |
| DmListItem | `src/renderer/src/components/dm/DmListItem.tsx` |
| MessageInput | `src/renderer/src/components/chat/MessageInput.tsx` |
| MessageBubble | `src/renderer/src/components/chat/MessageBubble.tsx` |
| MessageFeed | `src/renderer/src/components/chat/MessageFeed.tsx` |
| ChatHeader | `src/renderer/src/components/chat/ChatHeader.tsx` |
| ServerTextChannel | `src/renderer/src/pages/server/ServerTextChannel.tsx` |
| ServerVoiceRoom | `src/renderer/src/pages/server/ServerVoiceRoom.tsx` |
| VoiceControlBar | `src/renderer/src/components/server/VoiceControlBar.tsx` |
| VoiceParticipantTile | `src/renderer/src/components/server/VoiceParticipantTile.tsx` |
| MemberListPanel | `src/renderer/src/components/server/MemberListPanel.tsx` |
| CreateServerModal | `src/renderer/src/components/modals/CreateServerModal.tsx` |
| Modal | `src/renderer/src/components/ui/Modal.tsx` |
| Tooltip | `src/renderer/src/components/ui/Tooltip.tsx` |
| Button | `src/renderer/src/components/ui/Button.tsx` |
| ContextMenu | `src/renderer/src/components/ui/ContextMenu.tsx` |
| Avatar | `src/renderer/src/components/ui/Avatar.tsx` |
| FriendsPage | `src/renderer/src/pages/friends/FriendsPage.tsx` |
| AddFriendTab | `src/renderer/src/pages/friends/tabs/AddFriendTab.tsx` |
| AllFriendsTab | `src/renderer/src/pages/friends/tabs/AllFriendsTab.tsx` |
| OnlineFriendsTab | `src/renderer/src/pages/friends/tabs/OnlineFriendsTab.tsx` |
| PendingTab | `src/renderer/src/pages/friends/tabs/PendingTab.tsx` |
| BlockedTab | `src/renderer/src/pages/friends/tabs/BlockedTab.tsx` |
| NearbyTab | `src/renderer/src/pages/friends/tabs/NearbyTab.tsx` |
| ServerPage | `src/renderer/src/pages/server/ServerPage.tsx` |
| DmConversationPage | `src/renderer/src/pages/dm/DmConversationPage.tsx` |
| SettingsPage | `src/renderer/src/pages/settings/SettingsPage.tsx` |
| Global CSS | `src/renderer/src/styles/app.css` |
