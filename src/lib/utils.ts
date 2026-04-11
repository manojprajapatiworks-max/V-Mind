import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDirectImageUrl(url: string): string {
  if (!url) return "";
  
  // Google Drive conversion
  // Matches patterns like:
  // https://drive.google.com/file/d/FILE_ID/view
  // https://drive.google.com/open?id=FILE_ID
  // https://drive.google.com/uc?id=FILE_ID
  // https://docs.google.com/file/d/FILE_ID/edit
  const driveMatch = url.match(/(?:drive\.google\.com|docs\.google\.com)\/(?:file\/d\/|open\?id=|uc\?id=|file\/d\/)([\w-]{25,})/);
  if (driveMatch && driveMatch[1]) {
    // Using the most reliable direct link format
    return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
  }
  
  return url;
}
