import { API_ACTIONS } from "./actions";

/**
 * Login action payload.
 * Used for wallet authentication/login.
 */
export interface LoginPayload {
  action: typeof API_ACTIONS.LOGIN;
}
