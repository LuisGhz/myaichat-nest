export const ALLOWED_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/pdf',
  'text/plain',
] as const;

export const ALLOWED_FILE_EXTENSIONS = [
  '.png',
  '.jpeg',
  '.jpg',
  '.pdf',
  '.txt',
] as const;

export type AllowedFileType = (typeof ALLOWED_FILE_TYPES)[number];
export type AllowedFileExtension = (typeof ALLOWED_FILE_EXTENSIONS)[number];
