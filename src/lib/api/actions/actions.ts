export const API_ACTIONS = {
    LOGIN: "LOGIN",
    LIKE_POST: "LIKE_POST",
    UNLIKE_POST: "UNLIKE_POST",
    CREATE_COMMENT: "CREATE_COMMENT",
  } as const;
  
  export type ApiAction = (typeof API_ACTIONS)[keyof typeof API_ACTIONS];
  