import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Bookmark, Download, ExternalLink, Play } from "lucide-react";
import { MediaCard } from "@/components/MediaCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useMediaStore } from "@/hooks/useMediaStore";
import {
  MediaItem,
  Photo,
  Video,
  searchPhotos,
  searchVideos,
  photoToMediaItem,
  videoToMediaItem,
  downloadFile,
} from "@/lib/pexels";
import { cn } from "@/lib/utils";

export default function PinDetail() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<MediaItem | null>(null);
  const [relatedItems, setRelatedItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(true);

  const { saveItem, unsaveItem, isSaved, toggleLike, isLiked } = useMediaStore();

  // Fetch the specific item
  useEffect(() => {
    const fetchItem = async () => {
      if (!type || !id) return;
      setLoading(true);

      try {
        const headers = {
          Authorization: "mNLXXMu2HeJ2ISqziN9GZeFC1HsQuLmP0LVh2aBY5Z50jmFlojrr34Ou",
        };

        if (type === "photo") {
          const res = await fetch(`https://api.pexels.com/v1/photos/${id}`, { headers });
          const photo: Photo = await res.json();
          setItem(photoToMediaItem(photo));
        } else if (type === "video") {
          const res = await fetch(`https://api.pexels.com/videos/videos/${id}`, { headers });
          const video: Video = await res.json();
          setItem(videoToMediaItem(video));
        }
      } catch (error) {
        console.error("Failed to fetch item:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [type, id]);

  // Fetch related items based on photographer name or general content
  useEffect(() => {
    const fetchRelated = async () => {
      if (!item) return;
      setRelatedLoading(true);

      try {
        // Search for related content using photographer name or generic terms
        const searchTerm = item.photographer.split(" ")[0] || "nature";
        const [photos, videos] = await Promise.all([
          searchPhotos(searchTerm, 1, 12),
          searchVideos(searchTerm, 1, 6),
        ]);

        const related = [
          ...photos.map(photoToMediaItem),
          ...videos.map(videoToMediaItem),
        ]
          .filter((i) => i.id !== item.id) // Exclude current item
          .sort(() => Math.random() - 0.5)
          .slice(0, 12);

        setRelatedItems(related);
      } catch (error) {
        console.error("Failed to fetch related items:", error);
      } finally {
        setRelatedLoading(false);
      }
    };

    fetchRelated();
  }, [item]);

  const handleDownload = async () => {
    if (!item) return;
    const ext = item.type === "video" ? "mp4" : "jpg";
    await downloadFile(item.downloadUrl, `downterest-${item.id}.${ext}`);
  };

  const handleSaveToggle = () => {
    if (!item) return;
    if (isSaved(item.id, item.type)) {
      unsaveItem(item.id, item.type);
    } else {
      saveItem(item);
    }
  };

  const handleRelatedClick = (relatedItem: MediaItem) => {
    navigate(`/pin/${relatedItem.type}/${relatedItem.id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Content not found</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-full"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <h1 className="text-lg font-bold gradient-text">Downterest</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="pt-16 pb-8">
        {/* Pin Detail Card */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-card rounded-2xl overflow-hidden shadow-2xl">
            {/* Media */}
            <div className="relative bg-black">
              {item.type === "video" ? (
                <video
                  src={item.downloadUrl}
                  poster={item.preview}
                  controls
                  className="w-full max-h-[70vh] object-contain"
                />
              ) : (
                <img
                  src={item.downloadUrl}
                  alt={`Photo by ${item.photographer}`}
                  className="w-full max-h-[70vh] object-contain"
                />
              )}

              {/* Type badge */}
              {item.type === "video" && (
                <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Play className="w-4 h-4 fill-primary text-primary" />
                  <span className="text-sm font-medium">Video</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-6">
              {/* Photographer info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-lg">
                  {item.photographer.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">{item.photographer}</h2>
                  <p className="text-sm text-muted-foreground">Content Creator</p>
                </div>
              </div>

              {/* Title/Description */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {item.type === "video" ? "Video" : "Photo"} by {item.photographer}
                </h3>
                <p className="text-muted-foreground">
                  Beautiful {item.type} content available for download. High quality media from Pexels.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => toggleLike(item.id)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-full transition-all font-medium",
                    isLiked(item.id)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground hover:bg-muted"
                  )}
                >
                  <Heart className={cn("w-5 h-5", isLiked(item.id) && "fill-current")} />
                  <span>Like</span>
                </button>

                <button
                  onClick={handleSaveToggle}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-full transition-all font-medium",
                    isSaved(item.id, item.type)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground hover:bg-muted"
                  )}
                >
                  <Bookmark className={cn("w-5 h-5", isSaved(item.id, item.type) && "fill-current")} />
                  <span>Save</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium"
                >
                  <Download className="w-5 h-5" />
                  <span>Download</span>
                </button>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary text-foreground hover:bg-muted transition-all font-medium"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>View on Pexels</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Related Pins */}
        <div className="max-w-7xl mx-auto px-4 mt-8">
          <h2 className="text-xl font-bold text-foreground mb-4">More like this</h2>

          {relatedLoading ? (
            <LoadingSpinner />
          ) : relatedItems.length > 0 ? (
            <div className="masonry-grid">
              {relatedItems.map((relatedItem) => (
                <MediaCard
                  key={`${relatedItem.type}-${relatedItem.id}`}
                  item={relatedItem}
                  isLiked={isLiked(relatedItem.id)}
                  isSaved={isSaved(relatedItem.id, relatedItem.type)}
                  onLike={() => toggleLike(relatedItem.id)}
                  onSave={() => {
                    if (isSaved(relatedItem.id, relatedItem.type)) {
                      unsaveItem(relatedItem.id, relatedItem.type);
                    } else {
                      saveItem(relatedItem);
                    }
                  }}
                  onClick={() => handleRelatedClick(relatedItem)}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No related content found</p>
          )}
        </div>
      </main>
    </div>
  );
}
