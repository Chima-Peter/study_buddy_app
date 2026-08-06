export const TOKEN_STORAGE_KEY = "studybuddy_token";
export const USER_STORAGE_KEY = "studybuddy_user";
export const THEME_STORAGE_KEY = "studybuddy_theme";

export const JWT_REFRESH_BUFFER_MS = 2 * 60 * 1000; // refresh 2 min before expiry
export const DEFAULT_PAGE_LIMIT = 20;

export const ALLOWED_FILE_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".txt",
  ".md",
  ".markdown",
  ".doc",
  ".rtf",
  ".odt",
  ".epub",
] as const;

export const MAX_FILE_SIZE_MB = 50;
