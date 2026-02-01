import { useState, useEffect, useCallback, useMemo } from "react";
import { Header } from "@/components/Header";
import { BottomNav, TabType } from "@/components/BottomNav";
import { MediaCard } from "@/components/MediaCard";
import { VideoModal } from "@/components/VideoModal";
import { PhotoModal } from "@/components/PhotoModal";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { useMediaStore } from "@/hooks/useMediaStore";
import {
  MediaItem,
  getCuratedPhotos,
  getPopularVideos,
  searchPhotos,
  searchVideos,
  photoToMediaItem,
  videoToMediaItem,
} from "@/lib/pexels";

export default function Index() {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  const { savedItems, saveItem, unsaveItem, isSaved, toggleLike, isLiked } =
    useMediaStore();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2 || searchQuery.length === 0) {
        setDebouncedQuery(searchQuery);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch media based on tab and search
  const fetchMedia = useCallback(async (reset = false) => {
    setLoading(true);
    const currentPage = reset ? 1 : page;

    try {
      let newItems: MediaItem[] = [];

      if (activeTab === "search" && debouncedQuery.length >= 2) {
        const [photos, videos] = await Promise.all([
          searchPhotos(debouncedQuery, currentPage),
          searchVideos(debouncedQuery, currentPage),
        ]);
        newItems = [
          ...photos.map(photoToMediaItem),
          ...videos.map(videoToMediaItem),
        ];
      } else if (activeTab === "home" || activeTab === "search") {
        const [photos, videos] = await Promise.all([
          getCuratedPhotos(currentPage),
          getPopularVideos(currentPage),
        ]);
        newItems = [
          ...photos.map(photoToMediaItem),
          ...videos.map(videoToMediaItem),
        ];
      } else if (activeTab === "trending") {
        const [photos, videos] = await Promise.all([
          getCuratedPhotos(currentPage, 30),
          getPopularVideos(currentPage, 15),
        ]);
        newItems = [
          ...photos.map(photoToMediaItem),
          ...videos.map(videoToMediaItem),
        ];
      }

      // Shuffle for variety
      newItems.sort(() => Math.random() - 0.5);

      if (reset) {
        setItems(newItems);
        setPage(1);
      } else {
        setItems((prev) => [...prev, ...newItems]);
      }
    } catch (error) {
      console.error("Failed to fetch media:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedQuery, page]);

  // Initial load and tab/search changes
  useEffect(() => {
    if (activeTab !== "saved" && activeTab !== "downloads") {
      setItems([]);
      fetchMedia(true);
    }
  }, [activeTab, debouncedQuery]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 1000 &&
        !loading &&
        activeTab !== "saved" &&
        activeTab !== "downloads"
      ) {
        setPage((p) => p + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, activeTab]);

  // Load more when page changes
  useEffect(() => {
    if (page > 1 && activeTab !== "saved" && activeTab !== "downloads") {
      fetchMedia();
    }
  }, [page]);

  // Handle tab change
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setShowSearch(tab === "search");
    if (tab !== "search") {
      setSearchQuery("");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle save toggle
  const handleSaveToggle = (item: MediaItem) => {
    if (isSaved(item.id, item.type)) {
      unsaveItem(item.id, item.type);
    } else {
      saveItem(item);
    }
  };

  // Display items based on tab
  const displayItems = useMemo(() => {
    if (activeTab === "saved") return savedItems;
    return items;
  }, [activeTab, savedItems, items]);

  return (
    <div className="min-h-screen bg-background pb-20 pt-16">
      <Header
        showSearch={showSearch || activeTab === "search"}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchToggle={() => {
          setShowSearch(!showSearch);
          if (!showSearch) setActiveTab("search");
        }}
      />

      <main className="px-3 py-4 max-w-7xl mx-auto">
        {activeTab === "downloads" ? (
          <EmptyState type="downloads" />
        ) : activeTab === "saved" && savedItems.length === 0 ? (
          <EmptyState type="saved" />
        ) : activeTab === "search" &&
          debouncedQuery.length >= 2 &&
          !loading &&
          items.length === 0 ? (
          <EmptyState type="search" />
        ) : (
          <>
            <div className="masonry-grid">
              {displayItems.map((item) => (
                <MediaCard
                  key={`${item.type}-${item.id}`}
                  item={item}
                  isLiked={isLiked(item.id)}
                  isSaved={isSaved(item.id, item.type)}
                  onLike={() => toggleLike(item.id)}
                  onSave={() => handleSaveToggle(item)}
                  onClick={() => setSelectedItem(item)}
                />
              ))}
            </div>

            {loading && <LoadingSpinner />}
          </>
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Modals */}
      {selectedItem?.type === "video" && (
        <VideoModal
          item={selectedItem}
          isLiked={isLiked(selectedItem.id)}
          isSaved={isSaved(selectedItem.id, selectedItem.type)}
          onLike={() => toggleLike(selectedItem.id)}
          onSave={() => handleSaveToggle(selectedItem)}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {selectedItem?.type === "photo" && (
        <PhotoModal
          item={selectedItem}
          isLiked={isLiked(selectedItem.id)}
          isSaved={isSaved(selectedItem.id, selectedItem.type)}
          onLike={() => toggleLike(selectedItem.id)}
          onSave={() => handleSaveToggle(selectedItem)}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
