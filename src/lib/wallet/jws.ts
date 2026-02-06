/**
 * JWS (JSON Web Signature) utilities for wallet-signed requests.
 *
 * Format: header.payload.signature
 * - header: base64url encoded {"system": "ethereum"}
 * - payload: base64url encoded JSON with action and parameters
 * - signature: hex-encoded EIP-191 personal_sign signature of the payload JSON
 *
 * Actions:
 * - LOGIN: { action: "LOGIN", address, timestamp }
 * - LIKE_POST: { action: "LIKE_POST", address, timestamp, path }
 * - UNLIKE_POST: { action: "UNLIKE_POST", address, timestamp, path }
 * - CREATE_COMMENT: { action: "CREATE_COMMENT", address, timestamp, path, body, parent_id? }
 */

import { JWSPayload, JWSPayloadInput } from "@/lib/api/actions";

type EthereumProvider = {
  request: (args: { method: string; params: unknown[] }) => Promise<string>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

function base64UrlEncode(str: string): string {
  const base64 = btoa(str);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Creates a compact JWS string signed by the user's Ethereum wallet.
 * The signature is over the JSON payload string directly.
 *
 * @param address - The wallet address
 * @param customPayload - Action-specific payload fields (must include "action")
 * @returns The compact JWS string: header.payload.signature
 */
export async function createSignedJWS(
  address: string,
  customPayload: JWSPayloadInput
): Promise<string> {
  if (!window.ethereum) {
    throw new Error("No Ethereum provider found");
  }

  // Create header
  const header = JSON.stringify({ system: "ethereum" });
  const protectedB64 = base64UrlEncode(header);

  // Create payload with address, timestamp, and custom fields
  const payload: JWSPayload = {
    ...customPayload,
    address: address,
    timestamp: Math.floor(Date.now() / 1000),
  } as JWSPayload;
  const payloadJSON = JSON.stringify(payload);
  const payloadB64 = base64UrlEncode(payloadJSON);

  // Sign the JSON payload directly using EIP-191 personal_sign
  const signature = await window.ethereum.request({
    method: "personal_sign",
    params: [payloadJSON, address],
  });

  // Remove "0x" prefix if present for the final JWS
  const sigHex = signature.startsWith("0x") ? signature.slice(2) : signature;

  return `${protectedB64}.${payloadB64}.${sigHex}`;
}
