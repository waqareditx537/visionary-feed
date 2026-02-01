import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  showSearch: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchToggle: () => void;
}

export function Header({
  showSearch,
  searchQuery,
  onSearchChange,
  onSearchToggle,
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <span className="font-bold text-lg">Downterest</span>
        </div>

        {/* Search */}
        <div
          className={cn(
            "flex items-center transition-all duration-300",
            showSearch ? "flex-1 ml-4" : ""
          )}
        >
          {showSearch ? (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search photos & videos..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-secondary rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
    </header>
  );
}
