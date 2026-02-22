import { Search, X, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  showSearch: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchToggle: () => void;
}

const TRENDING_SEARCHES = [
  "Nature", "Animals", "Technology", "Architecture", "Food",
  "Travel", "Flowers", "Ocean", "Mountains", "City",
];

export function Header({
  showSearch,
  searchQuery,
  onSearchChange,
  onSearchToggle,
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between h-14 px-3 sm:px-4 max-w-7xl mx-auto gap-2">
        {/* Logo */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          {!showSearch && (
            <span className="font-bold text-base sm:text-lg">Downterest</span>
          )}
        </div>

        {/* Search */}
        <div
          className={cn(
            "flex items-center transition-all duration-300",
            showSearch ? "flex-1" : ""
          )}
        >
          {showSearch ? (
            <div className="relative flex-1 max-w-lg w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search photos & videos..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 bg-secondary rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onSearchToggle}
              className="w-10 h-10 rounded-full bg-secondary hover:bg-muted flex items-center justify-center transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Trending search tags - shown when search is active but no query */}
      {showSearch && !searchQuery && (
        <div className="px-3 pb-2.5 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            {TRENDING_SEARCHES.map((tag) => (
              <button
                key={tag}
                onClick={() => onSearchChange(tag)}
                className="shrink-0 px-3 py-1.5 bg-secondary hover:bg-muted rounded-full text-xs font-medium text-foreground transition-colors active:scale-95"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
