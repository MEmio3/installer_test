# Feature 3 — Emoji Reactions Implementation Plan

This plan finalizes the implementation of Feature 3 (Emoji Reactions) based on the current state described in the `FEATURE_HANDOFF.md` document. The backend plumbing and IPC handlers are mostly ready, and this PR will wire them up to the UI.

## User Review Required

Please review the structure. I will install emoji-mart using the standard npm process (since it's already in package.json according to the handoff doc, we just need to ensure the components are wired up). 

## Proposed Changes

### `src/preload/index.d.ts`
[MODIFY] src/preload/index.d.ts
- Wire `reaction: ReactionAPI` into the `MeshAPI` interface (which is currently missing it).

### `src/renderer/src/stores/messages.store.ts`
[MODIFY] src/renderer/src/stores/messages.store.ts
- Add `toggleReaction(conversationId, messageId, emojiId)` action.
- Add `applyRemoteReaction(messageId, emojiId, userId, add)` action.
- In `handleIncomingPeerMessage`, handle the `dm-reaction` payload to apply remote reactions locally.

### `src/renderer/src/stores/servers.store.ts`
[MODIFY] src/renderer/src/stores/servers.store.ts
- Add `toggleServerReaction(serverId, messageId, emojiId)`.
- Add `applyRemoteServerReaction(serverId, messageId, emojiId, userId, add)`.
- In `subscribeToServerEvents()`, listen to `message-reaction` and call the local action.

### `src/renderer/src/App.tsx`
[MODIFY] src/renderer/src/App.tsx
- Add a new subscription inside `useEffect` for `onDmReaction` using `window.api.signaling.onDmReaction` (the signaling fallback for DMs).

### `src/renderer/src/components/chat/ReactionPicker.tsx`
[NEW] src/renderer/src/components/chat/ReactionPicker.tsx
- Create a floating popover wrapper around `@emoji-mart/react`'s `<Picker>`.

### `src/renderer/src/components/chat/ReactionBar.tsx`
[NEW] src/renderer/src/components/chat/ReactionBar.tsx
- Create a row of "reaction pills" that display the count for each emoji based on the `ReactionMap`.
- Clicking a pill calls `onToggleReaction(emojiId)`.

### `src/renderer/src/components/chat/MessageBubble.tsx`
[MODIFY] src/renderer/src/components/chat/MessageBubble.tsx
- Add a `+` reaction button to the UI action bar.
- Conditionally render `<ReactionBar>` at the bottom of the message if there are reactions.
- Implement state to manage `<ReactionPicker>` popover visibility.

### `src/renderer/src/components/chat/MessageFeed.tsx`
[MODIFY] src/renderer/src/components/chat/MessageFeed.tsx
- Add an `onToggleReaction(messageId, emojiId)` prop and pass it through to `<MessageBubble>`.

### `src/renderer/src/pages/dm/DmConversationPage.tsx`
[MODIFY] src/renderer/src/pages/dm/DmConversationPage.tsx
- Pass the `toggleReaction` store function to `<MessageFeed>`.

### `src/renderer/src/pages/server/ServerTextChannel.tsx`
[MODIFY] src/renderer/src/pages/server/ServerTextChannel.tsx
- Pass the `toggleServerReaction` store function to `<MessageFeed>`.

## Open Questions

None. Everything aligns strictly with `FEATURE_HANDOFF.md`.

## Verification Plan

### Manual Verification
1. I will run `npm run build` after completion to ensure no TypeScript or resolving errors.
2. The user can start `npm run dev` and `npm run signaling` locally, log in, and test adding emoji reactions in DMs and server text channels.
