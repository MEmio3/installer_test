# MESH — Feature Handoff

This document tells the next AI/dev exactly where things stand and how to finish the remaining features **without breaking the architecture**. Read the **Architectural Constraints** section first. Skipping it will cause silent bugs that look superficial but corrupt state across machines.

---

## Current State (2026-04-16)

| Feature | Status |
|---|---|
| 1. File Sharing | **DONE** |
| 2. Message Edit / Delete | **DONE** |
| 3. Emoji Reactions | **~60% — backend + plumbing done, UI + store actions missing** |
| 4. Voice Messages | not started |
| 5. Server Discovery | not started |
| 6. Message Search (FTS5) | not started |
| 7. Multi-Signaling Fallback | not started |
| (Bonus) Discord-style Streaming | **DONE** — see `StreamPickerModal.tsx`, voice store `streamingUsers`, `ServerVoiceRoom.tsx` |

---

## Architectural Constraints (READ THIS OR YOU WILL FUCK IT UP)

1. **Socket.io client lives in the main process**, not the renderer. The renderer talks to it via IPC (`window.api.signaling.emit`, `window.api.signaling.onXxx`). Do **not** import `socket.io-client` in the renderer.

2. **Every cross-machine sync has two paths**: WebRTC data channel (primary) and signaling relay (fallback for offline recipients). Every new peer JSON payload must be handled in BOTH paths. Pattern:
   - Send: try `webrtcManager.sendDataMessage(userId, JSON.stringify({...}))`; if `false`, call the signaling IPC fallback.
   - Receive: add a branch in `handleIncomingPeerMessage` (in `messages.store.ts`) AND subscribe to the matching `signaling:...` event in `App.tsx`. Both branches must call the same `applyRemoteX` store action.
   - The signaling server (`src/server/signaling.ts`) routes DM events via `deliverOrQueue(targetUserId, event, ...args)` which auto-queues for offline users and flushes on `register-user`. Never emit directly with `io.to(socketId).emit` for DMs.

3. **IPC payloads must be plain JSON**. No `Buffer`, no `MediaImage`, no DB row objects with symbols. Convert to base64 / data URLs / plain objects before crossing the boundary.

4. **Database schema uses additive migrations**: check with `PRAGMA table_info(...)`, then `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`. **Never** drop tables — existing users will lose data. Look at how `reactions` column was added to `messages` and `server_messages` in `src/main/database.ts` for the pattern.

5. **Message / reaction / request IDs are generated in the main process** (via `nanoid` or `uuid`), never in the renderer. The renderer passes intent, the main returns the ID.

6. **Zustand stores initialize in App.tsx** via `initialize()` after identity loads. Subscriptions are set up as `subscribeToXxx()` returning an unsubscribe function, called in an effect.

7. **Server (community server) messages flow through socket.io rooms `server:{serverId}`**. Join/leave via `socket.emit('join-room', \`server:${id}\`)`. The signaling server broadcasts with `io.to(roomName(serverId)).emit(...)`.

8. **React 19 + emoji-mart peer-dep conflict**: use `npm install --legacy-peer-deps` for any install that involves emoji-mart.

9. **electron-vite 2.3 requires vite@^5** (installed explicitly in package.json). Do not upgrade to vite@6+ without also upgrading electron-vite.

10. **Don't touch these files casually**: `src/server/signaling.ts`, `src/renderer/src/lib/webrtc.ts` core, `src/main/relay-manager.ts`, `src/main/database.ts` (additive only). They are load-bearing for every feature.

11. **Moderator / host checks happen on BOTH sides**: client-side (UI gating) and server-side (signaling enforces). Never trust the client alone.

12. **Paths are Windows + POSIX**: always use `path.join`, never string concat. `userData` lives at `%APPDATA%/mesh` on Windows, `~/Library/Application Support/mesh` on macOS.

---

## Feature 3 — Emoji Reactions (finish this first)

### Already done
- `npm install emoji-mart @emoji-mart/react @emoji-mart/data --legacy-peer-deps` — committed to `package.json`.
- DB column `reactions TEXT NOT NULL DEFAULT '{}'` on `messages` and `server_messages`, plus helpers in `src/main/database.ts`:
  - `setMessageReaction(messageId, emojiId, userId, add)` → returns new JSON string
  - `setServerMessageReaction(messageId, emojiId, userId, add)`
  - `replaceMessageReactions(messageId, json)`, `replaceServerMessageReactions(messageId, json)`
  - Internal `mutateReactions(existingJson, emojiId, userId, add)`
- `reactions: string` field on `MessageRow` / `ServerMessageRow` in `src/shared/types.ts`.
- `ReactionMap = Record<string, string[]>` + optional `reactions` on `Message` in `src/renderer/src/types/messages.ts`.
- Signaling server (`src/server/signaling.ts`):
  - `dm-reaction` — routed via `deliverOrQueue`
  - `server:message-reaction` — broadcast to `server:{serverId}` room
- Main socket-client (`src/main/socket-client.ts`):
  - Forwards `dm-reaction` → `signaling:dm-reaction`
  - Includes `server:message-reaction` in `serverEvents` array
- IPC handlers in `src/main/ipc-handlers.ts`:
  - `reaction:toggle-dm`, `reaction:toggle-server`, `reaction:apply-dm`, `reaction:apply-server`
- Preload (`src/preload/index.ts`):
  - `reaction` namespace with `toggleDm`, `toggleServer`, `applyDm`, `applyServer`
  - `onDmReaction` subscription on `signaling`
- Preload types (`src/preload/index.d.ts`):
  - `ReactionAPI` interface defined
  - `onDmReaction` on `SignalingAPI`

### Still to do

**1. Wire `reaction: ReactionAPI` into `MeshAPI` in `src/preload/index.d.ts`.**
Verify the `MeshAPI` interface exposes it. Without this, `window.api.reaction.*` has no TypeScript type.

**2. `src/renderer/src/stores/messages.store.ts`:**
- Add `toggleReaction(conversationId, messageId, emojiId)` action:
  1. Read current reactions from message, figure out `add` boolean (add if user not in list, else remove).
  2. Optimistically update local state.
  3. Call `window.api.reaction.toggleDm({ conversationId, messageId, emojiId, userId: selfId, otherUserId, add })` — this writes to DB and relays to peer.
- Add `applyRemoteReaction(messageId, emojiId, userId, add)` action: update local message reactions, don't re-emit.
- In `handleIncomingPeerMessage`, add a branch:
  ```ts
  if (parsed.type === 'dm-reaction' && typeof parsed.messageId === 'string') {
    useMessagesStore.getState().applyRemoteReaction(
      parsed.messageId, parsed.emojiId, parsed.userId, parsed.add
    )
    // Also persist via IPC so it survives restarts:
    window.api.reaction.applyDm({
      messageId: parsed.messageId,
      emojiId: parsed.emojiId,
      userId: parsed.userId,
      add: parsed.add
    })
    return
  }
  ```

**3. `src/renderer/src/stores/servers.store.ts`:**
- Add `toggleServerReaction(serverId, messageId, emojiId)` — same pattern, uses `reaction.toggleServer`.
- In `subscribeToServerEvents()`, add `message-reaction` subscription calling `applyRemoteServerReaction`.
- Add `applyRemoteServerReaction(serverId, messageId, emojiId, userId, add)`.

**4. `src/renderer/src/App.tsx`:**
Add signaling fallback subscription for DM reactions:
```ts
const offRx = window.api.signaling.onDmReaction((_fromUserId, payload) => {
  useMessagesStore.getState().applyRemoteReaction(
    payload.messageId, payload.emojiId, payload.userId, payload.add
  )
  window.api.reaction.applyDm({ ...payload })
})
// cleanup: offRx()
```

**5. New component `src/renderer/src/components/chat/ReactionPicker.tsx`:**
Wraps `@emoji-mart/react`'s `<Picker>` in a floating popover. Exposes `onSelect(emojiId: string)`. Use dark theme: `<Picker data={data} theme="dark" onEmojiSelect={(e) => onSelect(e.id)} />`.

**6. New component `src/renderer/src/components/chat/ReactionBar.tsx`:**
Given `reactions: ReactionMap` + `selfId`, renders pill chips — one per emoji key. Each pill shows `emoji count`; highlight (green background) if `selfId` is in `reactions[emojiId]`. Click pill → calls `onToggle(emojiId)`.

**7. `src/renderer/src/components/chat/MessageBubble.tsx`:**
- Add `+` button to the hover action bar (next to Edit/Delete).
- Clicking `+` opens `ReactionPicker`.
- Add `<ReactionBar>` below the message content when `message.reactions` has any keys.
- Both `onAddReaction(emojiId)` and `onToggleReaction(emojiId)` props.

**8. `MessageFeed.tsx`:**
Forward a single `onToggleReaction(messageId, emojiId)` prop to `MessageBubble`.

**9. `DmConversationPage.tsx`:**
```ts
const toggleReaction = useMessagesStore((s) => s.toggleReaction)
// <MessageFeed onToggleReaction={(mid, eid) => toggleReaction(conversationId, mid, eid)} />
```

**10. `ServerTextChannel.tsx`:**
```ts
const toggleServerReaction = useServersStore((s) => s.toggleServerReaction)
// <MessageFeed onToggleReaction={(mid, eid) => toggleServerReaction(serverId, mid, eid)} />
```

**11. Build** (`npm run build`) — must pass.

### Gotchas
- The DM `toggleDm` IPC handler must compute the `add` boolean on the **main-process side** (by checking if userId is already in the existing reactions JSON) to avoid race conditions when two clients click at once. The renderer's `add` is only a hint.
- Emoji keys: use `emoji.id` from emoji-mart (e.g. `"+1"`, `"heart"`), **not** the unicode glyph, so the same emoji renders consistently across platforms.

---

## Feature 4 — Voice Messages

### Approach
Record via `MediaRecorder` (`audio/webm;codecs=opus`), send as file over the existing WebRTC file-transfer path (same chunking as `sendFile`).

### Files to touch

**New component `src/renderer/src/components/chat/VoiceMessageRecorder.tsx`:**
- Hold-to-record button. Pointer-down starts `MediaRecorder`; pointer-up stops and sends.
- Max 60 seconds — auto-stop via `setTimeout(stop, 60000)`.
- Cancel if pointer-leaves the button before release.
- On stop: get the blob, convert to base64, call `window.api.file.saveReceived` locally (for sender playback), then send through the same path as a file message with `fileType: 'audio/webm'` and a `duration` field.

**`src/renderer/src/components/chat/MessageInput.tsx` (existing):**
- Add the mic button next to the send button.
- When user holds it, render a red "recording" banner with a live seconds counter.

**New component `src/renderer/src/components/chat/VoiceMessageBubble.tsx`:**
- Rendered from `MessageBubble` when `message.fileType?.startsWith('audio/')`.
- Shows play/pause, duration, and a static waveform derived from the blob's `AudioBuffer` samples (downsample to ~40 bars). Keep it simple — no live waveform during playback, just a static visualization.

**`MessageBubble.tsx`:**
- Detect audio file → render `VoiceMessageBubble` instead of the normal file card.

**DB:**
- Audio files go through the **existing messages table** with `fileType` set. No new columns needed.
- Optional: add `duration` column later if you want to show length without loading the file.

### Gotchas
- `MediaRecorder` doesn't work without a prior `getUserMedia` audio permission. Request at first hold.
- Base64 encoding of large audio = ~33% size overhead. Keep clips ≤ 60s to stay well under the 50 MB cap.
- Waveform: use `AudioContext.decodeAudioData(arrayBuffer)` then downsample `channelData[0]` by taking RMS of each chunk. See any "whatsapp voice note waveform" CodePen for a ~20-line reference.

---

## Feature 5 — Server Discovery

### Approach
Public servers register themselves on the signaling server via REST. A new Browse page fetches the list. Joining goes through the existing `server:join` IPC.

### Files to touch

**DB schema (`src/main/database.ts`):**
- Add `is_public INTEGER NOT NULL DEFAULT 0` to `servers` table (additive migration).
- Add to `ServerRow` type in `src/shared/types.ts`.

**Signaling server (`src/server/signaling.ts`):**
- In-memory `Map<serverId, { name, iconColor, memberCount, onlineCount, hostUserId, lastSeen }>`.
- REST routes:
  - `POST /public-servers/register` — body: `{ serverId, name, iconColor, memberCount, hostUserId }`
  - `POST /public-servers/heartbeat` — `{ serverId, memberCount, onlineCount }`
  - `POST /public-servers/deregister` — `{ serverId }`
  - `GET /public-servers` — returns all entries with `lastSeen` within 60s
- Entries auto-expire after 60s silence (same pattern as relays).

**New IPC handlers (new section in `ipc-handlers.ts`):**
- `discovery:list` → GETs `/public-servers`
- `discovery:register` → POSTs register (called when host marks server public)
- `discovery:deregister` → called on server delete or unmark
- Heartbeat loop: 30s interval while any owned server is public.

**Preload:** add `discovery` namespace.

**Create Server modal (existing):**
- Add "Make this server publicly discoverable" toggle.

**New page `src/renderer/src/pages/discovery/BrowseServersPage.tsx`:**
- Accessible from the `+` button at the bottom of the server sidebar (already exists as create-server; add a second option "Browse Public Servers").
- Grid of cards: icon, name, "N members · M online", Join button.
- Join button calls `useServersStore.getState().joinServer({ serverId, ...identity })`.

### Gotchas
- The signaling server's public-server list is **ephemeral** (in-memory). If the signaling server restarts, hosts will re-register on next heartbeat. Don't persist this list.
- Heartbeat must stop cleanly on app quit (register a `app.on('will-quit')` cleanup in main).
- When a user leaves a public server they host, deregister before leave completes.

---

## Feature 6 — Message Search (FTS5)

### Approach
Use SQLite's FTS5 virtual tables synced to `messages` and `server_messages` via triggers. Search only the current conversation or server channel.

### Files to touch

**DB (`src/main/database.ts`):**
```sql
CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(
  content, content=messages, content_rowid=rowid
);
CREATE TRIGGER IF NOT EXISTS messages_ai AFTER INSERT ON messages BEGIN
  INSERT INTO messages_fts(rowid, content) VALUES (new.rowid, new.content);
END;
CREATE TRIGGER IF NOT EXISTS messages_ad AFTER DELETE ON messages BEGIN
  INSERT INTO messages_fts(messages_fts, rowid, content) VALUES('delete', old.rowid, old.content);
END;
CREATE TRIGGER IF NOT EXISTS messages_au AFTER UPDATE ON messages BEGIN
  INSERT INTO messages_fts(messages_fts, rowid, content) VALUES('delete', old.rowid, old.content);
  INSERT INTO messages_fts(rowid, content) VALUES (new.rowid, new.content);
END;
-- Repeat for server_messages_fts.
```

On first migration, **backfill** existing rows: `INSERT INTO messages_fts(rowid, content) SELECT rowid, content FROM messages WHERE content IS NOT NULL`.

**DB functions:**
- `searchMessages(conversationId, query, limit=50)` → `SELECT m.* FROM messages m JOIN messages_fts fts ON m.rowid = fts.rowid WHERE m.conversationId = ? AND messages_fts MATCH ? ORDER BY m.timestamp DESC LIMIT ?`
- `searchServerMessages(serverId, query, limit=50)` → similar.

**IPC:** `db:messages:search` and `db:server-messages:search`.

**Preload:** add `search` methods.

**UI:**
- Add search icon to `ChatHeader.tsx`. Click → dropdown search box below header.
- New component `src/renderer/src/components/chat/SearchResults.tsx`: list of hits with sender, timestamp, match highlighted.
- Click result → scroll the MessageFeed to that `messageId` and briefly highlight the bubble (add a `highlightedMessageId` state in MessageFeed).

### Gotchas
- FTS5 queries don't accept arbitrary punctuation. Escape single quotes, wrap the user query in double quotes for phrase search: `MATCH '"${cleanQuery}"'`.
- Don't build FTS on encrypted content — if you ever add application-layer encryption to `content`, FTS breaks. Currently `content` is stored plaintext, so this works.
- `content_rowid=rowid` requires `messages.rowid` stability. `better-sqlite3` gives stable rowids as long as you don't use `WITHOUT ROWID`.

---

## Feature 7 — Multiple Signaling Server Fallback

### Approach
Settings stores an ordered list of signaling URLs. On connect, try them in order with exponential backoff. The main process picks the first one that connects and reports back to renderer.

### Files to touch

**Settings DB:**
- Store list as JSON in `settings` table under key `signalingServers`: `[{url, enabled}, ...]`.
- Store `activeSignalingUrl` as a separate key (set by main on successful connect).

**Main (`src/main/socket-client.ts`):**
- Refactor `connectToSignaling(serverUrl, userId)` → `connectToSignaling(userId, urls: string[])`.
- Iterate URLs; for each, try to connect with a 5s timeout. First success wins; store the active URL.
- On `disconnect` with reason `io server disconnect` or `transport close`, wait 2s then restart the iteration.
- Emit `signaling:active-url-changed` to renderer on every switch.

**Renderer:**
- `src/renderer/src/pages/settings/NetworkSettings.tsx` or a new `ConnectionSettings.tsx`:
  - Editable list of signaling URLs.
  - Drag-to-reorder (use `framer-motion` Reorder or a tiny native drag implementation — keep dependencies minimal).
  - Active URL shown with a green dot.
  - Add / remove / test-connection buttons.
- Settings store persists the list via `db:settings:set`.

### Gotchas
- The connection attempt loop must not block the main process event loop. Use `async` + `Promise.race` with a timeout.
- On app start, load the list from DB **before** the first `connectToSignaling` call. If the list is empty, fall back to the current default (`http://localhost:3000`).
- When the list changes via settings UI, call `disconnectFromSignaling()` then `connectToSignaling()` with the new list. Re-emit `register-user`, re-join all rooms the user had open.
- Presence + status state is **per-signaling-server**. When switching servers, the user's `online` state needs to re-register on the new server. The `register-user` handler on the server side already does this, but don't forget to re-emit it.

---

## Verification Checklist (run after EACH feature)

1. `npm run build` passes cleanly (no TS errors, no unresolved imports).
2. `npm run dev` + `npm run dev:user2` + `npm run signaling` all launch.
3. Two clients on the same machine, opposite identities: the new feature propagates in real time.
4. Stop the signaling server mid-feature: action still completes if both clients have an open WebRTC data channel; when server comes back, any queued relay messages drain.
5. Close one client, perform the action from the other, reopen the first — the queued message arrives (offline queue works).
6. Quit both clients, relaunch: new state persists (DB write-through worked).
7. No errors in either renderer console, no unhandled promise rejections in main console.
8. `git diff` shows changes **only** in the files your feature required — no accidental edits to `signaling.ts`, `webrtc.ts`, `relay-manager.ts`, or existing store actions.

---

## File Map Quick Reference

| Concern | File |
|---|---|
| Main entry | `src/main/index.ts` |
| IPC handlers | `src/main/ipc-handlers.ts` |
| DB schema + helpers | `src/main/database.ts` |
| Socket.io client (main) | `src/main/socket-client.ts` |
| File transfer helpers | `src/main/file-manager.ts` |
| Signaling server | `src/server/signaling.ts` |
| WebRTC manager | `src/renderer/src/lib/webrtc.ts` |
| Preload bridge | `src/preload/index.ts` + `.d.ts` |
| Shared IPC types | `src/shared/types.ts` |
| Stores | `src/renderer/src/stores/*.store.ts` |
| Chat UI | `src/renderer/src/components/chat/*` |
| Server UI | `src/renderer/src/components/server/*`, `src/renderer/src/pages/server/*` |
| App init | `src/renderer/src/App.tsx` |

---

## Commit Discipline

- One commit per feature, message: `feat: <feature name>` or `feat(feature-3): <sub-task>` while WIP.
- Before starting each feature, confirm the tree is clean (`git status`).
- The safety commit `bd2f202` marks the point before streaming work — use it as a fallback if anything pre-streaming regresses.
