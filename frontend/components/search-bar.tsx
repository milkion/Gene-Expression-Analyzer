import { useState } from "react";

interface SearchBarProps {
    searchHandler: (query: string) => Promise<void>;
    placeholder?: string;
}

const SearchBar = ({ searchHandler, placeholder = "Search" }) => {
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
        <form onSubmit={handleSearch}>
            <div className="flex items-center w-80 h-12 rounded-full border-none bg-white pl-4 py-1 mb-4">
                <input
                    type="text"
                    name="query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    required
                    className="flex-1 border-none bg-transparent outline-none text-base pl-2 w-full block"
                    placeholder="Search"
                />
                <button
                    className="h-10 bg-transparent block mr-3"
                    type="submit"
                    onSubmit={handleSearch}
                >
                    <img
                        src="./search-icon.svg"
                        alt="Search Icon"
                        className="w-5 h-5 mr-2 pb-1"
                    />
                </button>
            </div>
        </form>
    );
};

export { SearchBar, SearchBarProps };
