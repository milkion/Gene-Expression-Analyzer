"use client";

import { useState } from "react";
import SearchBar from "./searchbar";
import FilterDropdown from "./filterdropdown";
import { NavigationBar } from "@/components/navigation-bar";
import { gql, useQuery } from "@apollo/client";
import { redirect } from 'next/navigation'

// Define the GraphQL Query
const GET_ANALYSES = gql`
  query GetAnalyses {
    getAnalyses {
      id
      status
      date
      dataset {
        name
        description
      }
    }
  }
`;

function openPage() {
	redirect("/detailedreports")
}
export default function ReportsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedFilter, setSelectedFilter] = useState("");

	// Fetch data using useQuery
	const { loading, error, data } = useQuery(GET_ANALYSES);

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error.message}</p>;

	// Use data from the query or fallback to an empty array
	const reportsData = data?.getAnalyses || [];

	// Filtered Reports based on Search & Filter
	const filteredReports = reportsData.filter((report) => {
		const matchesSearch = report.id.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesFilter = selectedFilter ? report.status === selectedFilter : true;
		return matchesSearch && matchesFilter;
	});

	return (
		<div className="p-4">
			<NavigationBar />

			<div className="flex mb-6 pt-2">
				<SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
				<div className="ml-auto mr-8">
					<FilterDropdown selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter} />
				</div>
			</div>

			<table className="w-full border-collapse border border-gray-300">
				<thead>
					<tr className="bg-gray-100 " >
						<th className="border p-1 text-left">Report ID</th>
						<th className="border p-1 text-left">Dataset Name</th>
						<th className="border p-1 text-left">Status</th>
					</tr>
				</thead>
				<tbody>
					{filteredReports.length > 0 ? (
						filteredReports.map((report) => (
							<tr key={report.id} className="border hover:bg-[#737373]  hover:text-white transition-all duration-300 ease-in-out" onClick={() => openPage()}>
								<td className="border p-3">{report.id}</td>
								<td className="border p-3">{report.dataset.name}</td>
								<td className="border p-3">{report.status}</td>
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
