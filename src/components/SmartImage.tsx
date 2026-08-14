import React, { useState } from "react";
import { getDirectImageUrl } from "../lib/utils";
import { Image as ImageIcon } from "lucide-react";

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
  className?: string;
  fallbackIconSize?: number;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt = "Image",
  className = "",
  fallbackIconSize = 24,
  ...props
}) => {
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Generate candidate URLs in priority order for maximum reliability
  const candidateUrls = React.useMemo(() => {
    if (!src) return [];
    const clean = src.trim();
    if (!clean) return [];

    const urls: string[] = [];
    const converted = getDirectImageUrl(clean);
    urls.push(converted);

    // If it's a Google Drive link, add alternative Google endpoints as backup
    if (clean.includes("drive.google.com") || clean.includes("docs.google.com") || clean.includes("googleusercontent.com")) {
      const fileIdMatch = clean.match(/\/d\/([a-zA-Z0-9_-]{20,})/) || 
                          clean.match(/[?&]id=([a-zA-Z0-9_-]{20,})/) ||
                          converted.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
      if (fileIdMatch && fileIdMatch[1]) {
        const fileId = fileIdMatch[1];
        const alt1 = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
        const alt2 = `https://lh3.googleusercontent.com/d/${fileId}=s1600`;
        const alt3 = `https://drive.usercontent.google.com/download?id=${fileId}&export=view`;
        
        if (!urls.includes(alt1)) urls.push(alt1);
        if (!urls.includes(alt2)) urls.push(alt2);
        if (!urls.includes(alt3)) urls.push(alt3);
      }
    }

    if (!urls.includes(clean)) urls.push(clean);
    return urls;
  }, [src]);

  // Reset state when src changes
  React.useEffect(() => {
    setCurrentSrcIndex(0);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (currentSrcIndex + 1 < candidateUrls.length) {
      setCurrentSrcIndex(prev => prev + 1);
    } else {
      setHasError(true);
    }
  };

  if (!src || hasError || candidateUrls.length === 0) {
    return (
      <div className={`bg-slate-100 flex flex-col items-center justify-center text-slate-400 p-2 ${className}`}>
        <ImageIcon size={fallbackIconSize} className="opacity-40" />
        <span className="text-[10px] mt-1 font-medium opacity-60">Image Unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={candidateUrls[currentSrcIndex]}
      alt={alt}
      className={className}
      onError={handleError}
      referrerPolicy="no-referrer"
      loading="lazy"
      {...props}
    />
  );
};
