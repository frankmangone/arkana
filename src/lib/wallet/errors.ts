// MetaMask error code for user rejection
const USER_REJECTED_CODE = 4001;

/**
 * Checks if an error is a user rejection (e.g., user clicked "Reject" in MetaMask).
 */
export function isUserRejection(error: unknown): boolean {
  if (error && typeof error === "object" && "code" in error) {
    return (error as { code: number }).code === USER_REJECTED_CODE;
  }
  return false;
}
