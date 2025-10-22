import { atom } from "jotai";

/**
 * Atom to track when an obituary is being updated via AI chat
 * Used to coordinate loading state between FloatingChatBubble and ObituaryViewerSimple
 */
export const obituaryUpdateProcessingAtom = atom<boolean>(false);
