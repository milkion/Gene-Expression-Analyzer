"use client";

interface SearchBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

export default function SearchBar({ searchQuery, setSearchQuery }: SearchBarProps) {
    return (
        <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-2 w-full max-w-xs rounded-md"
        />
    );
}
