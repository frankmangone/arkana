import { LoginPayload } from "./login";
import { LikePostPayload } from "./like-post";
import { UnlikePostPayload } from "./unlike-post";
import { CreateCommentPayload } from "./create-comment";

export * from "./actions";

/**
 * Base payload fields that are always present in JWS payloads.
 */
export interface BaseJWSPayload {
  address: string;
  timestamp: number;
}

/**
 * Complete JWS payload union type (includes base fields).
 * This represents the full payload structure after address and timestamp are added.
 */
export type JWSPayload =
  | (LoginPayload & BaseJWSPayload)
  | (LikePostPayload & BaseJWSPayload)
  | (UnlikePostPayload & BaseJWSPayload)
  | (CreateCommentPayload & BaseJWSPayload);

/**
 * JWS payload input union type (without base fields).
 * This represents the input parameter to createSignedJWS.
 * Address and timestamp are added automatically.
 */
export type JWSPayloadInput =
  | LoginPayload
  | LikePostPayload
  | UnlikePostPayload
  | CreateCommentPayload;

// Re-export individual payload types for convenience
export type { LoginPayload } from "./login";
export type { LikePostPayload } from "./like-post";
export type { UnlikePostPayload } from "./unlike-post";
export type { CreateCommentPayload } from "./create-comment";
