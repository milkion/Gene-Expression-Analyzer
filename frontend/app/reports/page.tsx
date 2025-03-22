"use client";

import { useState } from "react";
import SearchBar from "./searchbar";
import FilterDropdown from "./filterdropdown";
import { NavigationBar } from "@/components/navigation-bar";
import { gql, useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";

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

export default function ReportsPage() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedFilter, setSelectedFilter] = useState("");

	// Fetch data using useQuery
	const { loading, error, data } = useQuery(GET_ANALYSES);

	// Function to navigate to detail page
	const navigateToDetails = (reportId: string) => {
		router.push(`reports/${reportId}`);
	};

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error.message}</p>;

	// Use data from the query or fallback to an empty array
	const reportsData = data?.getAnalyses || [];

	// Filtered Reports based on Search & Filter
	const filteredReports = reportsData.filter((report) => {
		const matchesSearch = report.id
			.toLowerCase()
			.includes(searchQuery.toLowerCase());
		const matchesFilter = selectedFilter
			? report.status === selectedFilter
			: true;
		return matchesSearch && matchesFilter;
	});

	return (
		<div>
			<NavigationBar />
			<div className="p-4 mx-8">
				<div className="flex mb-6 pt-2 pl-4">
					<SearchBar
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
					/>

					{/* <div className="ml-auto mr-8">
						<FilterDropdown
							selectedFilter={selectedFilter}
							setSelectedFilter={setSelectedFilter}
						/>
					</div> */}
				</div>

				<div className="bg-slate-100 min-h-screen rounded-3xl py-10 px-10">
					<div className="grid grid-cols-[1fr_300px_100px] px-4 mb-2 text-gray-600">
						<div>Report ID</div>
						<div>Status</div>
						<div></div>
					</div>

					{filteredReports.length > 0 ? (
						<div className="space-y-3">
							{filteredReports.map((report) => {
								// Determine background color based on status
								let bgColor = "bg-gray-200";
								if (report.status === "COMPLETED") bgColor = "bg-green-200";
								else if (report.status === "FAILED") bgColor = "bg-red-200";
								else if (report.status === "ANALYZING")
									bgColor = "bg-amber-200";
								return (
									<div
										key={report.id}
										className={`${bgColor} rounded-3xl p-8 grid grid-cols-[1fr_300px_100px] items-center cursor-pointer hover:opacity-90 transition-all duration-300`}
										onClick={() => navigateToDetails(report.id)}
									>
										<div>
											<div className="font-medium">{report.id}</div>
											<div className="text-sm text-gray-600">
												Dataset: {report.dataset.name}
											</div>
										</div>
										<div className="font-medium">{report.status}</div>
										<button className="text-gray-500 justify-self-center">
											<img src="./trash.svg" alt="Delete" className="w-7 h-7" />
										</button>
									</div>
								);
							})}
						</div>
					) : (
						<div className="text-center p-4 bg-gray-100 rounded-lg">
							No reports found.
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
