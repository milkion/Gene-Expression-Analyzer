"use client";

import { useState } from "react";
import { FaFilter } from "react-icons/fa";

interface FilterDropdownProps {
    selectedFilter: string;
    setSelectedFilter: (filter: string) => void;
}

export default function FilterDropdown({ selectedFilter, setSelectedFilter }: FilterDropdownProps) {
    const filters = ["Genomics", "Transcriptomics", "Proteomics"];
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="border p-2 rounded-md flex items-center gap-2 bg-white shadow"
            >
                <FaFilter className="text-gray-600" />
                {selectedFilter || "Filter"}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-30 bg-white border rounded-md shadow-lg z-10">
                    <button
                        onClick={() => {
                            setSelectedFilter("");
                            setIsOpen(false);
                        }}
                        className="block w-full text-left p-2 hover:bg-gray-100"
                    >
                        All
                    </button>
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => {
                                setSelectedFilter(filter);
                                setIsOpen(false);
                            }}
                            className="block w-full text-left p-2 hover:bg-gray-100"
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
