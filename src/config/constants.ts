export const TOKEN_STORAGE_KEY = "studybuddy_token";
export const USER_STORAGE_KEY = "studybuddy_user";
export const THEME_STORAGE_KEY = "studybuddy_theme";

export const DEFAULT_PAGE_LIMIT = 20;

/** Max documents that can ground a single chat turn (matches backend). */
export const MAX_DOCUMENT_IDS = 3;

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
