export const MAX_AVATAR_URL_LENGTH = 500;

const allowedImageExtensions = new Set([
  "avif",
  "gif",
  "jpeg",
  "jpg",
  "png",
  "svg",
  "webp",
]);

const blockedFileExtensions = new Set([
  "css",
  "exe",
  "htm",
  "html",
  "js",
  "json",
  "mjs",
  "pdf",
  "php",
  "sh",
  "txt",
  "xml",
]);

function getPathExtension(pathname: string) {
  const fileName = pathname.split("/").pop();

  if (!fileName || !fileName.includes(".")) {
    return null;
  }

  return fileName.split(".").pop()?.toLowerCase() ?? null;
}

export function isSafeAvatarUrl(value: string) {
  const trimmedValue = value.trim();

  if (
    trimmedValue.length === 0 ||
    trimmedValue.length > MAX_AVATAR_URL_LENGTH
  ) {
    return false;
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(trimmedValue);
  } catch {
    return false;
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return false;
  }

  if (parsedUrl.username || parsedUrl.password) {
    return false;
  }

  const extension = getPathExtension(parsedUrl.pathname);

  if (!extension) {
    return true;
  }

  if (allowedImageExtensions.has(extension)) {
    return true;
  }

  return !blockedFileExtensions.has(extension);
}

export function getSafeAvatarUrl(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();

  return isSafeAvatarUrl(trimmedValue) ? trimmedValue : null;
}
