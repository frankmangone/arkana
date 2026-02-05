/**
 * JWS (JSON Web Signature) utilities for wallet-signed requests.
 *
 * Format: header.payload.signature
 * - header: base64url encoded {"sys": "ethereum"}
 * - payload: base64url encoded {"addr": "0x...", "ts": unix_timestamp, ...customFields}
 * - signature: hex-encoded EIP-191 personal_sign signature
 */

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

interface JWSPayload {
  addr: string;
  ts: number;
  [key: string]: unknown;
}

/**
 * Creates a compact JWS string signed by the user's Ethereum wallet.
 *
 * @param address - The wallet address
 * @param customPayload - Additional fields to include in the payload (e.g., { path: "blog/post-slug" })
 * @returns The compact JWS string: header.payload.signature
 */
export async function createSignedJWS(
  address: string,
  customPayload: Record<string, unknown> = {}
): Promise<string> {
  if (!window.ethereum) {
    throw new Error("No Ethereum provider found");
  }

  // Create header
  const header = JSON.stringify({ sys: "ethereum" });
  const protectedB64 = base64UrlEncode(header);

  // Create payload with address, timestamp, and custom fields
  const payload: JWSPayload = {
    addr: address,
    ts: Math.floor(Date.now() / 1000),
    ...customPayload,
  };
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));

  // The signing input is the concatenation of header and payload
  const signingInput = `${protectedB64}.${payloadB64}`;

  // Sign using EIP-191 personal_sign
  // The wallet will prefix with "\x19Ethereum Signed Message:\n{length}"
  const signature = await window.ethereum.request({
    method: "personal_sign",
    params: [signingInput, address],
  });

  // Remove "0x" prefix if present for the final JWS
  const sigHex = signature.startsWith("0x") ? signature.slice(2) : signature;

  return `${protectedB64}.${payloadB64}.${sigHex}`;
}
