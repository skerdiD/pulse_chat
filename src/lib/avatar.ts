export function isSafeAvatarUrl(value: string) {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(value);
  } catch {
    return false;
  }

  return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
}

export function getSafeAvatarUrl(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return isSafeAvatarUrl(value) ? value : null;
}
