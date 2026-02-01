import { useState, useEffect, useCallback } from "react";
import { MediaItem } from "@/lib/pexels";

const SAVED_KEY = "downterest_saved";
const LIKED_KEY = "downterest_liked";

export function useMediaStore() {
  const [savedItems, setSavedItems] = useState<MediaItem[]>([]);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem(SAVED_KEY);
    const liked = localStorage.getItem(LIKED_KEY);
    
    if (saved) {
      try {
        setSavedItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved items");
      }
    }
    
    if (liked) {
      try {
        setLikedIds(new Set(JSON.parse(liked)));
      } catch (e) {
        console.error("Failed to parse liked items");
      }
    }
  }, []);

  const saveItem = useCallback((item: MediaItem) => {
    setSavedItems((prev) => {
      const exists = prev.some((i) => i.id === item.id && i.type === item.type);
      if (exists) return prev;
      const updated = [...prev, item];
      localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const unsaveItem = useCallback((id: number, type: "photo" | "video") => {
    setSavedItems((prev) => {
      const updated = prev.filter((i) => !(i.id === id && i.type === type));
      localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isSaved = useCallback(
    (id: number, type: "photo" | "video") => {
      return savedItems.some((i) => i.id === id && i.type === type);
    },
    [savedItems]
  );

  const toggleLike = useCallback((id: number) => {
    setLikedIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      localStorage.setItem(LIKED_KEY, JSON.stringify([...updated]));
      return updated;
    });
  }, []);

  const isLiked = useCallback(
    (id: number) => {
      return likedIds.has(id);
    },
    [likedIds]
  );

  return {
    savedItems,
    saveItem,
    unsaveItem,
    isSaved,
    toggleLike,
    isLiked,
  };
}
