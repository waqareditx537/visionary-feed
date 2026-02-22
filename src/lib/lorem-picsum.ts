import { MediaItem } from "@/lib/pexels";

/**
 * Lorem Picsum - Free random high-quality photos
 * No API key required. Great for variety in the feed.
 * https://picsum.photos
 */

interface PicsumPhoto {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

export async function getRandomPicsumPhotos(page = 1, perPage = 15): Promise<MediaItem[]> {
  try {
    const res = await fetch(
      `https://picsum.photos/v2/list?page=${page}&limit=${perPage}`
    );
    if (!res.ok) return [];
    const photos: PicsumPhoto[] = await res.json();
    return photos.map(photo => ({
      id: parseInt(photo.id) + 3000000, // Offset to avoid collisions
      type: "photo" as const,
      width: photo.width,
      height: photo.height,
      url: photo.url,
      preview: `https://picsum.photos/id/${photo.id}/600/400`,
      downloadUrl: photo.download_url,
      photographer: photo.author,
      source: "Lorem Picsum",
    }));
  } catch {
    return [];
  }
}
