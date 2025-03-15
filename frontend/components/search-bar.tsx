import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import searchIcon from "@/public/search-icon.svg";

interface SearchBarProps {
    searchHandler: (query: string) => Promise<void>;
    placeholder?: string;
}

const SearchBar = ({searchHandler, placeholder = "Search"}) => {
    const [query, setQuery] = useState("");
    const [error, setError] = useState("");

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!query) {
            setError("Field missing!");
            return;
        }
        await searchHandler(query);
    };

    return (
        <div className="flex w-full max-w-sm items-center space-x-2 mx-auto justify-center mt-8">
            <form onSubmit={handleSearch}>
                {/* Display Error Message */}
                {error && <p className="text-red-500">{error}</p>}

                {/* Query Input */}
                <div className="flex gap-2">
                    <Input
                        type="text"
                        name="query"
                        value={query}
                        placeholder={placeholder}
                        onChange={(e) => setQuery(e.target.value)}
                        required
                        className="flex-1 border-gray-900 bg-transparent outline-none text-base pl-2 h-10"
                    />
                    <Button className="h-10 bg-black" type="submit" onSubmit={handleSearch}>
                        <img src="/search-icon.svg" className="w-5 h-5"></img>
                    </Button>
                </div>
            </form>
        </div>
    );
}

export { SearchBar, SearchBarProps };
