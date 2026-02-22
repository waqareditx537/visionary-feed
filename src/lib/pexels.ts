const PEXELS_API_KEY = "mNLXXMu2HeJ2ISqziN9GZeFC1HsQuLmP0LVh2aBY5Z50jmFlojrr34Ou";

// Comprehensive NSFW keyword list for blocking queries AND filtering results
const NSFW_KEYWORDS = [
  "nude", "naked", "adult", "nsfw", "sexy", "erotic", "porn",
  "xxx", "bikini", "lingerie", "boudoir", "sensual", "provocative",
  "seductive", "topless", "underwear", "18+", "mature", "hentai",
  "lesbian", "gay", "fetish", "strip", "stripper", "playboy",
  "onlyfans", "thong", "cleavage", "busty", "boobs", "breast",
  "ass", "butt", "twerk", "intimate", "orgasm", "sex",
  "shirtless", "naughty", "kinky", "hottie", "milf",
  "hookup", "dating", "escort", "massage parlor",
];

// Additional URL/alt-text patterns that indicate NSFW content from Pexels results
const NSFW_URL_PATTERNS = [
  /nude/i, /naked/i, /topless/i, /lingerie/i, /boudoir/i,
  /sexy/i, /sensual/i, /erotic/i, /bikini/i, /underwear/i,
  /breast/i, /chest/i, /brassiere/i, /intimate/i, /seductive/i,
  /sultry/i, /allur/i, /provocat/i,
];

export interface Photo {
  id: number;
  width: number;
  height: number;
  url: string;
  alt?: string;
  photographer: string;
  photographer_url: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
}

export interface Video {
  id: number;
  width: number;
  height: number;
  url: string;
  image: string;
  duration: number;
  user: {
    id: number;
    name: string;
    url: string;
  };
  video_files: {
    id: number;
    quality: string;
    file_type: string;
    width: number;
    height: number;
    link: string;
  }[];
}

export interface MediaItem {
  id: number;
  type: "photo" | "video";
  width: number;
  height: number;
  url: string;
  preview: string;
  downloadUrl: string;
  photographer: string;
  source?: string;
}

const headers = {
  Authorization: PEXELS_API_KEY,
};

/** Check if a query contains any NSFW keywords */
function isNsfwQuery(query: string): boolean {
  const lower = query.toLowerCase();
  return NSFW_KEYWORDS.some(kw => lower.includes(kw));
}

/** Filter out NSFW photos based on URL and alt text */
function filterSafePhotos(photos: Photo[]): Photo[] {
  return photos.filter(photo => {
    const textToCheck = `${photo.url} ${photo.alt || ""}`.toLowerCase();
    return !NSFW_URL_PATTERNS.some(pattern => pattern.test(textToCheck));
  });
}

/** Filter out NSFW videos based on URL */
function filterSafeVideos(videos: Video[]): Video[] {
  return videos.filter(video => {
    const textToCheck = video.url.toLowerCase();
    return !NSFW_URL_PATTERNS.some(pattern => pattern.test(textToCheck));
  });
}

export async function getCuratedPhotos(page = 1, perPage = 20): Promise<Photo[]> {
  const res = await fetch(
    `https://api.pexels.com/v1/curated?page=${page}&per_page=${perPage}`,
    { headers }
  );
  const data = await res.json();
  return filterSafePhotos(data.photos || []);
}

export async function getPopularVideos(page = 1, perPage = 10): Promise<Video[]> {
  const res = await fetch(
    `https://api.pexels.com/videos/popular?page=${page}&per_page=${perPage}`,
    { headers }
  );
  const data = await res.json();
  return filterSafeVideos(data.videos || []);
}

export async function searchPhotos(query: string, page = 1, perPage = 20): Promise<Photo[]> {
  if (isNsfwQuery(query)) return [];
  const safeQuery = `${query} -nude -naked -adult -nsfw -sexy -erotic -porn -xxx -bikini -lingerie -topless -boudoir -sensual`;
  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(safeQuery)}&page=${page}&per_page=${perPage}`,
    { headers }
  );
  const data = await res.json();
  return filterSafePhotos(data.photos || []);
}

export async function searchVideos(query: string, page = 1, perPage = 10): Promise<Video[]> {
  if (isNsfwQuery(query)) return [];
  const safeQuery = `${query} -nude -naked -adult -nsfw -sexy -erotic -porn -xxx -bikini -lingerie -topless -boudoir -sensual`;
  const res = await fetch(
    `https://api.pexels.com/videos/search?query=${encodeURIComponent(safeQuery)}&page=${page}&per_page=${perPage}`,
    { headers }
  );
  const data = await res.json();
  return filterSafeVideos(data.videos || []);
}

export function photoToMediaItem(photo: Photo): MediaItem {
  return {
    id: photo.id,
    type: "photo",
    width: photo.width,
    height: photo.height,
    url: photo.url,
    preview: photo.src.large,
    downloadUrl: photo.src.original,
    photographer: photo.photographer,
    source: "Pexels",
  };
}

export function videoToMediaItem(video: Video): MediaItem {
  const hdFile = video.video_files.find(f => f.quality === "hd") || video.video_files[0];
  return {
    id: video.id,
    type: "video",
    width: video.width,
    height: video.height,
    url: video.url,
    preview: video.image,
    downloadUrl: hdFile?.link || "",
    photographer: video.user.name,
    source: "Pexels",
  };
}

export async function downloadFile(url: string, filename: string): Promise<void> {
  try {
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();
    const blobURL = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobURL;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobURL);
  } catch (error) {
    window.open(url, "_blank");
  }
}
