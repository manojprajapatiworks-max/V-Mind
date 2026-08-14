import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDirectImageUrl(url: string): string {
  if (!url) return "";
  const cleanUrl = url.trim();
  if (!cleanUrl) return "";

  // 1. Google Drive URLs
  // Handles:
  // - https://drive.google.com/file/d/FILE_ID/view?usp=drivesdk
  // - https://drive.google.com/file/d/FILE_ID/view
  // - https://drive.google.com/open?id=FILE_ID
  // - https://drive.google.com/uc?id=FILE_ID
  // - https://docs.google.com/file/d/FILE_ID/edit
  // - https://drive.google.com/file/u/0/d/FILE_ID/view
  // - https://drive.usercontent.google.com/download?id=FILE_ID
  if (cleanUrl.includes("drive.google.com") || cleanUrl.includes("docs.google.com") || cleanUrl.includes("drive.usercontent.google.com")) {
    const fileIdMatch = cleanUrl.match(/\/d\/([a-zA-Z0-9_-]{20,})/) || 
                        cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]{20,})/) ||
                        cleanUrl.match(/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      // lh3.googleusercontent.com/d/FILE_ID is the most reliable Google CDN image link for public files
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }

  // 2. Dropbox URLs
  // https://www.dropbox.com/s/xyz/photo.jpg?dl=0 -> https://dl.dropboxusercontent.com/s/xyz/photo.jpg
  // https://www.dropbox.com/scl/fi/xyz/photo.jpg?rlkey=abc&dl=0 -> &raw=1
  if (cleanUrl.includes("dropbox.com")) {
    if (cleanUrl.includes("dl=0")) {
      return cleanUrl.replace("dl=0", "raw=1").replace("www.dropbox.com", "dl.dropboxusercontent.com");
    }
    if (!cleanUrl.includes("raw=1") && !cleanUrl.includes("dl=1")) {
      const separator = cleanUrl.includes("?") ? "&" : "?";
      return `${cleanUrl.replace("www.dropbox.com", "dl.dropboxusercontent.com")}${separator}raw=1`;
    }
    return cleanUrl.replace("www.dropbox.com", "dl.dropboxusercontent.com");
  }

  // 3. GitHub blob URLs
  // https://github.com/user/repo/blob/main/image.png -> https://raw.githubusercontent.com/user/repo/main/image.png
  if (cleanUrl.includes("github.com") && cleanUrl.includes("/blob/")) {
    return cleanUrl.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
  }

  // 4. Imgur standard page to direct image
  // https://imgur.com/abc1234 -> https://i.imgur.com/abc1234.jpg
  if (cleanUrl.match(/^https?:\/\/(?:www\.)?imgur\.com\/([a-zA-Z0-9]+)$/)) {
    const match = cleanUrl.match(/^https?:\/\/(?:www\.)?imgur\.com\/([a-zA-Z0-9]+)$/);
    if (match && match[1] && match[1] !== 'gallery' && match[1] !== 'a') {
      return `https://i.imgur.com/${match[1]}.jpg`;
    }
  }

  // 5. OneDrive embed / download links
  if (cleanUrl.includes("1drv.ms") || cleanUrl.includes("onedrive.live.com")) {
    if (cleanUrl.includes("redir?") && !cleanUrl.includes("download=1")) {
      return cleanUrl.replace("redir?", "download?");
    }
  }

  return cleanUrl;
}

