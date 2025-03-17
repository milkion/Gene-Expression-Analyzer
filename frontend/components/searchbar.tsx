import { useState } from "react";

const SearchBar = () => {
	const [query, setQuery] = useState("");
	const [error, setError] = useState("");

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!query.trim()) {
			setError("Please enter a search term");
			return;
		}
		console.log("Searching for:", query);
	};

	return (
		<div>
			<form onSubmit={handleSearch}>
				<div className="flex items-center w-[500px] h-10 rounded-full border-none bg-white pl-4 py-1 mb-4">
					<input
						type="text"
						name="query"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="flex-1 border-none bg-transparent outline-none text-base pl-2 w-full block"
						placeholder="Search for GEO Dataset"
					/>
					<button className="h-8 bg-transparent block mr-3" type="submit">
						<img
							src="./search.svg"
							alt="Search Icon"
							className="w-5 h-5 mr-2 pb-1"
						/>
					</button>
				</div>
			</form>
			{error && <p className="text-red-500 text-sm pl-4">{error}</p>}
		</div>
	);
};

export { SearchBar };
