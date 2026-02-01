const PEXELS_API_KEY = "mNLXXMu2HeJ2ISqziN9GZeFC1HsQuLmP0LVh2aBY5Z50jmFlojrr34Ou";

export interface Photo {
  id: number;
  width: number;
  height: number;
  url: string;
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
}

const headers = {
  Authorization: PEXELS_API_KEY,
};

export async function getCuratedPhotos(page = 1, perPage = 20): Promise<Photo[]> {
  const res = await fetch(
    `https://api.pexels.com/v1/curated?page=${page}&per_page=${perPage}`,
    { headers }
  );
  const data = await res.json();
  return data.photos || [];
}

export async function getPopularVideos(page = 1, perPage = 10): Promise<Video[]> {
  const res = await fetch(
    `https://api.pexels.com/videos/popular?page=${page}&per_page=${perPage}`,
    { headers }
  );
  const data = await res.json();
  return data.videos || [];
}

export async function searchPhotos(query: string, page = 1, perPage = 20): Promise<Photo[]> {
  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
    { headers }
  );
  const data = await res.json();
  return data.photos || [];
}

export async function searchVideos(query: string, page = 1, perPage = 10): Promise<Video[]> {
  const res = await fetch(
    `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
    { headers }
  );
  const data = await res.json();
  return data.videos || [];
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
    // Fallback: open in new tab
    window.open(url, "_blank");
  }
}
