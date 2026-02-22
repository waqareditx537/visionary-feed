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
      <div className="relative overflow-hidden rounded-2xl shadow-card bg-card">
        {/* Image/Preview */}
        <img
          src={item.preview}
          alt=""
          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Video badge */}
        {item.type === "video" && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
            <Play className="w-3 h-3 fill-primary text-primary" />
            <span className="text-[10px] font-semibold">Video</span>
          </div>
        )}

        {/* Play button overlay for videos */}
        {item.type === "video" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full gradient-primary flex items-center justify-center shadow-glow opacity-80 group-hover:opacity-100 transition-opacity">
              <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white ml-0.5" />
            </div>
          </div>
        )}

        {/* Source badge */}
        {(item as any).source === "pixabay" && (
          <div className="absolute top-2.5 right-2.5 bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
            <span className="text-[10px] font-semibold text-muted-foreground">Pixabay</span>
          </div>
        )}

        {/* Bottom overlay - always visible on mobile, hover on desktop */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-white/90 truncate max-w-[90px] sm:max-w-[120px] font-medium">
              {item.photographer}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLike();
                }}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90",
                  isLiked
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                )}
              >
                <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSave();
                }}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90",
                  isSaved
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                )}
              >
                <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
              </button>
              <button
                onClick={handleDownload}
                className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 flex items-center justify-center transition-all active:scale-90"
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
