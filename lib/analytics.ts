export { sendGAEvent } from "@next/third-parties/google"

// ---------------------------------------------------------------------------
// Event name constants (GA4 direct integration)
// ---------------------------------------------------------------------------

/** sendGAEvent("countdown_created", { countdown_category: string }) */
export const GA_EVENT_COUNTDOWN_CREATED = "countdown_created"

/** sendGAEvent("countdown_shared", { method: "generate_link" | "copy_link" | "native_share" }) */
export const GA_EVENT_COUNTDOWN_SHARED = "countdown_shared"

/** sendGAEvent("login", { method: string }) */
export const GA_EVENT_LOGIN = "login"

/** sendGAEvent("magic_link_sent") */
export const GA_EVENT_MAGIC_LINK_SENT = "magic_link_sent"
