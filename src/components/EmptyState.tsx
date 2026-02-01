import { Bookmark, Image, Search } from "lucide-react";

interface EmptyStateProps {
  type: "saved" | "search" | "downloads";
}

const config = {
  saved: {
    icon: Bookmark,
    title: "No saved items yet",
    description: "Save photos and videos to view them here",
  },
  search: {
    icon: Search,
    title: "No results found",
    description: "Try a different search term",
  },
  downloads: {
    icon: Image,
    title: "Download history",
    description: "Downloaded items will appear in your device's gallery",
  },
};

export function EmptyState({ type }: EmptyStateProps) {
  const { icon: Icon, title, description } = config[type];

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
        <Icon className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
    </div>
  );
}
