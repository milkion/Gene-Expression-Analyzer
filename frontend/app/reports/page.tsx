"use client";

import { useState } from "react";
import SearchBar from "./searchbar";
import FilterDropdown from "./filterdropdown";
import { NavigationBar } from "@/components/navigation-bar";

const reportsData = [
	{ id: 1, title: "Gene Expression Analysis", type: "Genomics" },
	{ id: 2, title: "RNA Sequencing Results", type: "Transcriptomics" },
	{ id: 3, title: "Differential Expression Report", type: "Genomics" },
	{ id: 4, title: "Protein Analysis", type: "Proteomics" },
];

export default function ReportsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedFilter, setSelectedFilter] = useState("");

	// Filtered Reports based on Search & Filter
	const filteredReports = reportsData.filter((report) => {
		const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesFilter = selectedFilter ? report.type === selectedFilter : true;
		return matchesSearch && matchesFilter;
	});

	return (
		<div className="p-4">
			{/* <h1 className="text-4xl font-bold mb-6">Reports</h1> */}
			<NavigationBar />

			<div className="flex mb-6 pt-2">
				<SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
				<div className="ml-auto mr-8">
					<FilterDropdown selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter} />
				</div>
			</div>

			<table className="w-full border-collapse border border-gray-300">
				<thead>
					<tr className="bg-gray-100">
						<th className="border p-1 text-left">ID</th>
						<th className="border p-1 text-left">Title</th>
						<th className="border p-1 text-left">Type</th>
					</tr>
				</thead>
				<tbody>
					{filteredReports.length > 0 ? (
						filteredReports.map((report) => (
							<tr key={report.id} className="border">
								<td className="border p-3">{report.id}</td>
								<td className="border p-3">{report.title}</td>
								<td className="border p-3">{report.type}</td>
							</tr>
						))
					) : (
						<tr>
							<td colSpan={3} className="text-center p-1">No reports found.</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
}