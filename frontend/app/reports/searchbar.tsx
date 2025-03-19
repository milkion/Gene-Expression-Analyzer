"use client";

interface SearchBarProps {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
}

export default function SearchBar({
	searchQuery,
	setSearchQuery,
}: SearchBarProps) {
	return (
		<input 
			type="text"
			placeholder="Search by Report ID"
			value={searchQuery}
			onChange={(e) => setSearchQuery(e.target.value)}
			className="border-2 w-full max-w-md rounded-3xl px-5 py-2"
		/>
	);
}
