import { Heart, Bookmark, Download, Play } from "lucide-react";
import { MediaItem, downloadFile } from "@/lib/pexels";
import { cn } from "@/lib/utils";

interface MediaCardProps {
  item: MediaItem;
  isLiked: boolean;
  isSaved: boolean;
  onLike: () => void;
  onSave: () => void;
  onClick: () => void;
}

export function MediaCard({
  item,
  isLiked,
  isSaved,
  onLike,
  onSave,
  onClick,
}: MediaCardProps) {
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const ext = item.type === "video" ? "mp4" : "jpg";
    await downloadFile(item.downloadUrl, `downterest-${item.id}.${ext}`);
  };

  return (
    <div
      className="masonry-item group cursor-pointer animate-fade-in"
      onClick={onClick}
    >
      <div className="relative overflow-hidden rounded-xl shadow-card bg-card">
        {/* Image/Preview */}
        <img
          src={item.preview}
          alt=""
          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Video badge */}
        {item.type === "video" && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm px-2.5 py-1 rounded-full">
            <Play className="w-3.5 h-3.5 fill-primary text-primary" />
            <span className="text-xs font-medium">Video</span>
          </div>
        )}

        {/* Play button overlay for videos */}
        {item.type === "video" && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-glow">
              <Play className="w-6 h-6 text-white fill-white ml-1" />
            </div>
          </div>
        )}

        {/* Bottom overlay with actions */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/80 truncate max-w-[120px]">
              {item.photographer}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLike();
                }}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                  isLiked
                    ? "bg-primary text-white"
                    : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                )}
              >
                <Heart
                  className={cn("w-4 h-4", isLiked && "fill-current")}
                />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSave();
                }}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                  isSaved
                    ? "bg-primary text-white"
                    : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                )}
              >
                <Bookmark
                  className={cn("w-4 h-4", isSaved && "fill-current")}
                />
              </button>
              <button
                onClick={handleDownload}
                className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 flex items-center justify-center transition-all"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
