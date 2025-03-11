// import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchBar() {
    // const [query, setQuery] = useState("");

    // const handleSearch = () => {
    //     console.log("Searching for:", query);
    //     // Add your search logic here (e.g., redirect to a search page or fetch results)
    // };

    return (
        <div className="flex w-full max-w-sm items-center space-x-2">
            <Input type="text" placeholder="Search..." />
            <Button type="submit">Search</Button>
        </div>
    );
}
