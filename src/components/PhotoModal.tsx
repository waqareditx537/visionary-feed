import { X, Heart, Bookmark, Download } from "lucide-react";
import { MediaItem, downloadFile } from "@/lib/pexels";
import { cn } from "@/lib/utils";

interface PhotoModalProps {
  item: MediaItem;
  isLiked: boolean;
  isSaved: boolean;
  onLike: () => void;
  onSave: () => void;
  onClose: () => void;
}

export function PhotoModal({
  item,
  isLiked,
  isSaved,
  onLike,
  onSave,
  onClose,
}: PhotoModalProps) {
  const handleDownload = async () => {
    await downloadFile(item.downloadUrl, `downterest-${item.id}.jpg`);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-card rounded-2xl overflow-hidden shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image */}
        <div className="relative max-h-[70vh] overflow-hidden bg-black">
          <img
            src={item.downloadUrl}
            alt=""
            className="w-full h-full object-contain"
          />
        </div>

        {/* Controls below image */}
        <div className="p-4 bg-card border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {item.photographer}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={onLike}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                  isLiked
                    ? "bg-primary text-white"
                    : "bg-secondary text-foreground hover:bg-muted"
                )}
              >
                <Heart
                  className={cn("w-4 h-4", isLiked && "fill-current")}
                />
                <span className="text-sm font-medium">Like</span>
              </button>
              <button
                onClick={onSave}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                  isSaved
                    ? "bg-primary text-white"
                    : "bg-secondary text-foreground hover:bg-muted"
                )}
              >
                <Bookmark
                  className={cn("w-4 h-4", isSaved && "fill-current")}
                />
                <span className="text-sm font-medium">Save</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-all"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
