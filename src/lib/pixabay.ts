import { MediaItem } from "@/lib/pexels";

const PIXABAY_API_KEY = "50108498-f7c60d0c8a7f0dde73d485d82";

const NSFW_TERMS = [
  "nude", "naked", "adult", "nsfw", "sexy", "erotic", "porn",
  "xxx", "bikini", "lingerie", "boudoir", "sensual", "provocative",
  "seductive", "topless", "underwear", "lesbian", "fetish", "strip",
];

const NSFW_QUERY_TERMS = [
  ...NSFW_TERMS, "lesbian", "gay", "sex", "breast", "boobs",
  "ass", "butt", "twerk", "intimate", "orgasm", "hentai",
  "playboy", "onlyfans", "escort", "hookup", "milf",
];

export interface PixabayImage {
  id: number;
  webformatURL: string;
  largeImageURL: string;
  imageWidth: number;
  imageHeight: number;
  user: string;
  tags: string;
}

export interface PixabayVideo {
  id: number;
  tags: string;
  user: string;
  videos: {
    large: { url: string; width: number; height: number };
    medium: { url: string; width: number; height: number };
    small: { url: string; width: number; height: number };
  };
  picture_id: string;
}

function isSafeContent(tags: string): boolean {
  const lowerTags = tags.toLowerCase();
  return !NSFW_TERMS.some(term => lowerTags.includes(term));
}

function isNsfwQuery(query: string): boolean {
  const lower = query.toLowerCase();
  return NSFW_QUERY_TERMS.some(kw => lower.includes(kw));
}

export async function searchPixabayImages(query: string, page = 1, perPage = 20): Promise<MediaItem[]> {
  if (isNsfwQuery(query)) return [];
  try {
    const res = await fetch(
      `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&safesearch=true&image_type=photo`
    );
    if (!res.ok) return [];
    const data = await res.json();
    const images: PixabayImage[] = data.hits || [];
    return images
      .filter(img => isSafeContent(img.tags))
      .map(img => ({
        id: img.id + 1000000,
        type: "photo" as const,
        width: img.imageWidth,
        height: img.imageHeight,
        url: img.largeImageURL,
        preview: img.webformatURL,
        downloadUrl: img.largeImageURL,
        photographer: img.user,
        source: "Pixabay",
      }));
  } catch {
    return [];
  }
}

export async function searchPixabayVideos(query: string, page = 1, perPage = 10): Promise<MediaItem[]> {
  if (isNsfwQuery(query)) return [];
  try {
    const res = await fetch(
      `https://pixabay.com/api/videos/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&safesearch=true`
    );
    if (!res.ok) return [];
    const data = await res.json();
    const videos: PixabayVideo[] = data.hits || [];
    return videos
      .filter(vid => isSafeContent(vid.tags))
      .map(vid => ({
        id: vid.id + 2000000,
        type: "video" as const,
        width: vid.videos.medium.width,
        height: vid.videos.medium.height,
        url: vid.videos.medium.url,
        preview: `https://i.vimeocdn.com/video/${vid.picture_id}_640x360.jpg`,
        downloadUrl: vid.videos.large?.url || vid.videos.medium.url,
        photographer: vid.user,
        source: "Pixabay",
      }));
  } catch {
    return [];
  }
}

export async function getPopularPixabayImages(page = 1, perPage = 20): Promise<MediaItem[]> {
  try {
    const res = await fetch(
      `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&page=${page}&per_page=${perPage}&safesearch=true&order=popular&image_type=photo&editors_choice=true`
    );
    if (!res.ok) return [];
    const data = await res.json();
    const images: PixabayImage[] = data.hits || [];
    return images
      .filter(img => isSafeContent(img.tags))
      .map(img => ({
        id: img.id + 1000000,
        type: "photo" as const,
        width: img.imageWidth,
        height: img.imageHeight,
        url: img.largeImageURL,
        preview: img.webformatURL,
        downloadUrl: img.largeImageURL,
        photographer: img.user,
        source: "Pixabay",
      }));
  } catch {
    return [];
  }
}
