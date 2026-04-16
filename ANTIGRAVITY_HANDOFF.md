# MESH — Antigravity AI Handoff: Pre-Testdrive Fixes

> **You are picking up an in-flight Electron + React + Zustand + WebRTC project.**
> The codebase is stable. Onboarding, encrypted DB, signaling, WebRTC mesh, and server/voice plumbing are all working. The fixes below are **surface-level UX features only**. Do not refactor. Do not touch core networking. Follow each fix exactly.

---

## STEP 0 — Safety checkpoint (do this FIRST, before any edits)

```bash
git add .
git commit -m "safety checkpoint before pre-testdrive fixes"
```

If this fails because there's nothing staged, do:
```bash
git commit --allow-empty -m "safety checkpoint before pre-testdrive fixes"
```

You must be able to `git reset --hard HEAD` back to this commit if anything goes wrong.

---

## DO NOT TOUCH

These files/areas are working. Changing them will break things. Stay out unless a fix below **explicitly** names the file.

- **Backend / networking / WebRTC core logic:**
  - `src/server/signaling.ts`
  - `src/renderer/src/lib/webrtc.ts`
  - `src/main/relay-manager.ts`
- **IPC handlers** beyond the ones named in the fixes below.
- **Database schema** in `src/main/database.ts` — no `ALTER TABLE`, no new tables unless a fix says so.
- **Zustand store logic** beyond the slices named in the fixes below. Do not rewrite `messages.store.ts`, `voice.store.ts`, `friends.store.ts` unless told.
- **Identity / crypto paths** in `src/main/identity.ts` — only *use* the exposed helpers, never modify them.

If a fix seems to require touching something on this list, **stop and leave a TODO comment**. Do not improvise.

---

## FIX 1 — Auto Reconnection for signaling server

**File:** `src/main/socket-client.ts`

**Behavior:**
- On `disconnect` event from the socket.io client, start a reconnection loop.
- Retry every **5 seconds**.
- Max **10 attempts**, then give up and emit a terminal failure event.
- While reconnecting, emit a status event to the renderer on every attempt with the attempt number.
- On successful reconnect, clear the retry state and emit a "connected" status.

**Implementation notes:**
- Keep a single `reconnectTimer: NodeJS.Timeout | null` and `reconnectAttempts: number` inside the module.
- Do **not** use socket.io's built-in reconnection — disable it (`reconnection: false` in client options) and own the loop yourself so the UI can see attempt counts cleanly.
- New IPC event (main → renderer): `signaling:reconnect-status` with payload `{ state: 'reconnecting' | 'connected' | 'failed', attempt?: number, max?: number }`.

**Preload additions (`src/preload/index.ts` + `index.d.ts`):**
```ts
signaling.onReconnectStatus(cb: (s: { state: 'reconnecting' | 'connected' | 'failed'; attempt?: number; max?: number }) => void): () => void
```

**Settings UI (`src/renderer/src/pages/settings/NetworkSettings.tsx`):**
- Subscribe to `signaling.onReconnectStatus`.
- While `state === 'reconnecting'`, show:
  `Reconnecting... (attempt N/10)` in amber.
- On `state === 'failed'`, show:
  `Could not reconnect. Check your network or relay.` in red with a **Retry** button that calls `signaling.connect(...)` again.
- On `state === 'connected'`, show the existing green connected chip.

**Test:** Run the app, `npm run signaling`, verify connection, kill the signaling server. The Settings page should count up 1/10 → 10/10 → failed. Restart signaling before 10 attempts expire — it should reconnect and go green.

---

## FIX 2 — Leave Server / Delete Server dropdown

**File:** `src/renderer/src/components/server/ServerSidePanel.tsx`

**Behavior:**
- Add a "⋯" (three-dots) icon button in the server header, right side, next to the server name.
- Clicking it opens a small dropdown menu (absolute-positioned, closes on outside click and Escape).
- The menu contents depend on `server.role`:
  - **Member (`role !== 'host'`):**
    - Copy Server ID
    - Leave Server (red text)
  - **Host (`role === 'host'`):**
    - Copy Server ID
    - Delete Server (red text)

**Leave Server flow:**
- Confirm dialog: `Leave "{server.name}"? You'll lose access to all channels in this server.`
- On confirm:
  - Call `window.api.server.leave({ serverId })` (already exists in preload).
  - Navigate to `/channels/@me` (home).
  - Remove the server from `servers.store` locally (use existing `removeServer` action).

**Delete Server flow (host only):**
- Confirm dialog: `Delete "{server.name}"? This removes the server for everyone. This cannot be undone.`
- On confirm:
  - Call `window.api.server.leave({ serverId })` with a `destroy: true` flag — if that flag isn't already supported, add it **only in the preload passthrough and in the main-side server handler**, not in webrtc/signaling core.
  - Navigate to `/channels/@me`.
  - Remove from local store.

**Use the existing confirm-modal component** if there is one (search `components/ui` for `ConfirmDialog` / `Modal`). Do not roll your own if one exists.

---

## FIX 3 — Copy Invite Button

**Where:** Inside the same dropdown from FIX 2.

**Behavior:**
- Menu item label: `Copy Server ID` (Member) / also show it for Host.
- On click:
  - `await navigator.clipboard.writeText(server.id)` (or `server.inviteCode` if that field exists — check `types/server.ts`).
  - Show a small tooltip/badge next to the menu item that says `Copied!` in green.
  - Auto-clear the badge after **2 seconds**.
- Do not close the dropdown immediately on click — leave it open so the user sees the confirmation, then close on the next outside click or after 2s.

---

## FIX 4 — Optional Server Password

**Files:**
- `src/renderer/src/components/server/CreateServerModal.tsx`
- `src/renderer/src/components/server/JoinServerModal.tsx`
- `src/main/identity.ts` or wherever `sodium` helpers live — **only to expose a hash helper via IPC; do not modify existing crypto.**

**Create flow (`CreateServerModal.tsx`):**
- Add an optional `Password (optional)` input field below the server name.
- Add a hint: `Leave blank for an open server. If set, members must enter this password to join.`
- On submit:
  - If the password field is non-empty, compute `passwordHash = sodium.crypto_generichash(32, password)` **in the main process**, base64-encode it, and persist it on the server record.
  - The **plaintext password must never leave the renderer's memory, must never be written to disk, and must never be sent over the wire.**
  - Only the hash is stored and only the hash is checked on join.

**Join flow (`JoinServerModal.tsx`):**
- After the user enters the server ID, call a new IPC `server:requires-password({ serverId })` that returns `boolean`.
- If `true`, show a password input.
- On submit, hash the entered password client-side (via a new main-process IPC: `crypto:hashPassword(password) -> base64Hash`) and send only the hash to the join handler.
- On mismatch, show `Incorrect password` inline in red. Do not close the modal.

**IPC additions (minimal, only these):**
- `crypto:hashPassword(password: string) -> string` (base64 of `crypto_generichash(32, password)`)
- `server:requires-password({ serverId }) -> boolean`
- Extend existing `server:create` payload with optional `passwordHash?: string`.
- Extend existing `server:join` payload with optional `passwordHash?: string`.

**DB:** Add a single nullable column `password_hash TEXT` on the `servers` table via a guarded migration (`ALTER TABLE servers ADD COLUMN password_hash TEXT` inside a `try { } catch { }` so it's idempotent). This is the **only** schema change you're allowed to make.

---

## FIX 5 — Profile Picture Sync

**Files:**
- `src/renderer/src/stores/avatar.store.ts` (create if missing — check first)
- `src/renderer/src/components/navigation/UserPanel.tsx` (upload entry point — check if it already exists)
- `src/main/avatar-store.ts` (new, tiny file for filesystem IO only)

**Behavior:**
- User picks an image from disk → resize to max 256×256, encode as PNG data URL.
- Save locally to `{userData}/avatars/{selfUserId}.png`.
- Broadcast the avatar to all connected peers (server members and friends) over the **existing** WebRTC data channel using a new message type:
  ```ts
  { type: 'avatar:update', userId: string, pngBase64: string }
  ```
- On receiving an `avatar:update` data-channel message:
  - Save to `{userData}/avatars/{fromUserId}.png` via IPC.
  - Update the avatar store so `<Avatar src={...} />` consumers re-render.

**Fallback (no avatar set):**
- Use a hash of `userId` to pick one of a fixed palette (8 colors) and show the **first letter of username** as a white glyph on that background.
- Implement this in the existing `Avatar` component — do not create a second one.

**IPC additions (filesystem only):**
- `avatar:save({ userId, pngBase64 }) -> { path: string }`
- `avatar:read({ userId }) -> string | null` (returns data URL or `null`)

**Do NOT change `src/renderer/src/lib/webrtc.ts`.** Use the existing `sendDataMessage(userId, message)` API — the manager already supports arbitrary JSON payloads over data channels.

---

## FIX 6 — Typing Indicator

**Files:**
- `src/renderer/src/components/chat/MessageInput.tsx`
- `src/renderer/src/pages/dm/DmConversationPage.tsx`

**Sender side (`MessageInput.tsx`):**
- On each keystroke (input `onChange`), if it's been more than 2s since the last emit, send a data-channel message:
  ```ts
  { type: 'typing:start', fromUserId: selfId }
  ```
  via `webrtcManager.sendDataMessage(peerUserId, payload)`.
- Debounce so you emit at most once every 2 seconds.
- On `send` (submit) or `blur`, emit:
  ```ts
  { type: 'typing:stop', fromUserId: selfId }
  ```

**Receiver side (`DmConversationPage.tsx`):**
- Listen for data-channel messages. On `typing:start`, set local state `peerTyping = true`, start a 3-second timer that clears it. Any new `typing:start` resets the timer. `typing:stop` clears it immediately.
- When `peerTyping` is `true`, render above the input:
  `{peerUsername} is typing...` in `text-mesh-text-muted text-xs italic` with a subtle animated 3-dot.

**No new IPC. No signaling changes. Pure data-channel.**

---

## FIX 7 — Scroll-to-Bottom button

**File:** `src/renderer/src/components/chat/MessageFeed.tsx`

**Behavior:**
- Track the scroll container's distance from the bottom.
- When `scrollHeight - scrollTop - clientHeight > 200`, show a floating pill at the bottom-center of the feed:
  - Green (`bg-mesh-green`), rounded-full, `px-4 py-2`, white text, small down-arrow icon (`ChevronDown` from lucide).
  - Text: `New messages ↓` (or just `Jump to present ↓` if you don't want to track unread count — the simpler form is fine).
- Clicking it smooth-scrolls to the bottom: `el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })`.
- Hide when within 200px of the bottom.

**Do not** refactor the existing scroll auto-follow logic. Add this as a sibling element inside the feed container.

---

## FIX 8 — Delete Server

Already covered by FIX 2 (Host dropdown → Delete Server). **Verify** that:
- The confirm dialog wording is correct.
- After deletion, the user is navigated to `/channels/@me`.
- The server is removed from the local store and from the sidebar.
- No orphaned server-member rows are left in the DB (cascade delete on `servers.id` — if the DB doesn't already cascade, add an explicit cleanup in the main-side handler, **not** a schema change).

If FIX 2 is complete and tested, FIX 8 is done.

---

## Final step — Build

After all 8 fixes are implemented and manually smoke-tested (you can launch with `npm run dev` and `npm run signaling` in parallel):

```bash
npm run dist
```

This must:
- Complete with **zero build errors**.
- Produce a working installer in `dist/` (Windows: `.exe`; look for `MESH-Setup-*.exe` or similar).

**Report in your final response:**
1. The full path to the produced `.exe` (or platform installer).
2. The complete list of files you changed, grouped by fix number.
3. Anything you had to leave as a TODO (with reasoning).
4. Confirmation that `npm run dist` completed cleanly.

---

## Guard rails

- Every new IPC channel must be registered in `src/main/ipc-handlers.ts` (or the dedicated module the codebase already uses).
- Every new preload method must be typed in `src/preload/index.d.ts`.
- No `any`. No `// @ts-ignore` unless you document why.
- No new npm packages. Everything you need (libsodium, lucide-react, zustand) is already installed.
- If you get stuck on a fix, leave a `// TODO(antigravity): ...` comment describing exactly what's missing, and **move on** to the next fix. Do not block the build.

Good luck.
