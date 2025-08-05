export interface MediumCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  size: number;
  httpOnly: boolean;
  secure: boolean;
  session: boolean;
  sameSite?: string;
}

export interface MediumHeaders {
  Cookie: string;
  "User-Agent": string;
  Referer: string;
  Origin: string;
  "Content-Type": string;
  Accept: string;
  "Accept-Language": string;
  "Accept-Encoding": string;
  Connection: string;
  "Sec-Fetch-Dest": string;
  "Sec-Fetch-Mode": string;
  "Sec-Fetch-Site": string;
}

export interface MediumUser {
  id: string;
  name: string;
  username: string;
  email?: string;
}

export interface MediumDraft {
  id: string;
  title: string;
  content: string;
  tags: string[];
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

export interface DeltaOperation {
  type: number;
  index: number;
  paragraph?: {
    name: string;
    type: number;
    text: string;
    markups: Record<string, unknown>[];
  };
  insert?: string;
  delete?: number;
}

export interface BatchRequest {
  baseRev: number;
  deltas: DeltaOperation[];
}

export interface GraphQLRequest {
  query: string;
  variables?: Record<string, unknown>;
}

export interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

export interface CapturedRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  postData?: string;
  timestamp: Date;
}

export interface CapturedResponse {
  url: string;
  status: number;
  headers: Record<string, string>;
  body: string;
  timestamp: Date;
}

export interface MediumPublisherConfig {
  headless: boolean;
  devtools: boolean;
  timeout: number;
  captureRequests: boolean;
  outputDir: string;
}
