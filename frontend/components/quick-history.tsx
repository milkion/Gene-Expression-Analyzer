"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { gql, useQuery } from "@apollo/client";

// Query to check which analyses exist
const CHECK_ANALYSES_EXIST = gql`
	query CheckAnalysesExist($ids: [ID!]!) {
		checkAnalysesExist(ids: $ids)
	}
`;

interface HistoryItem {
	id: string;
	datasetName: string;
	analysisId: string;
	dateCreated: string;
}

export function QuickHistory() {
	const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
	const router = useRouter();
	
	// Get all analysis IDs from history
	const loadHistory = () => {
		const savedHistory = localStorage.getItem("viewedReports");
		if (savedHistory) {
			try {
				const parsedHistory = JSON.parse(savedHistory);
				return parsedHistory.slice(0, 10); // Load more than we need in case some are deleted
			} catch (error) {
				console.error("Error parsing history:", error);
				return [];
			}
		}
		return [];
	};
	
	const initialHistory = loadHistory();
	const historyIds = initialHistory.map(item => item.id);
	
	// Query to check which analyses still exist
	const { data, loading } = useQuery(CHECK_ANALYSES_EXIST, {
		variables: { ids: historyIds },
		skip: historyIds.length === 0,
		fetchPolicy: "network-only" // Always check the server
	});
	
	useEffect(() => {
		if (data && data.checkAnalysesExist) {
			// Filter history to only include existing analyses
			const existingIds = new Set(data.checkAnalysesExist);
			const filteredHistory = initialHistory.filter(item => existingIds.has(item.id));
			
			// Update localStorage with the filtered history
			localStorage.setItem("viewedReports", JSON.stringify(filteredHistory));
			
			// Show only the 5 most recent
			setHistoryItems(filteredHistory.slice(0, 5));
		} else if (initialHistory.length > 0 && !loading) {
			// If query failed or returned no data but we have history items
			setHistoryItems(initialHistory.slice(0, 5));
		}
	}, [data, loading]);

	const handleRowClick = (id: string) => {
		router.push(`/reports/${id}`);
	};

	if (historyItems.length === 0) {
		return null; // Don't show the component if there's no history
	}

	return (
		<div className="px-20 mt-2">
			<div className="backdrop-blur-md bg-white/30 p-6 rounded-3xl border border-white/40 shadow-xl">
				<h2 className="text-2xl font-medium ml-4 my-4">Quick History</h2>

				<div className="grid grid-cols-3 gap-4 px-4 py-2 font-medium text-gray-600">
					<div>Dataset Name</div>
					<div>Analysis ID</div>
					<div>Date Created</div>
				</div>

				{historyItems.map((item) => (
					<div
						key={`${item.id}-${item.dateCreated}`}
						className="grid grid-cols-3 gap-4 px-4 py-4 bg-white/40 rounded-lg my-2 cursor-pointer hover:bg-white/60 transition-colors"
						onClick={() => handleRowClick(item.id)}
					>
						<div>{item.datasetName}</div>
						<div>{item.analysisId}</div>
						<div>{item.dateCreated}</div>
					</div>
				))}
			</div>
		</div>
	);
}
