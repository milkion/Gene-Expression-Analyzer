"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface HistoryItem {
	id: string;
	datasetName: string;
	analysisId: string;
	dateCreated: string;
}

export function QuickHistory() {
	const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
	const router = useRouter();

	useEffect(() => {
		// Load history from localStorage when component mounts
		const loadHistory = () => {
			const savedHistory = localStorage.getItem("viewedReports");
			if (savedHistory) {
				try {
					const parsedHistory = JSON.parse(savedHistory);
					setHistoryItems(parsedHistory.slice(0, 5)); // Only show the 5 most recent
				} catch (error) {
					console.error("Error parsing history:", error);
				}
			}
		};

		loadHistory();
	}, []);

	const handleRowClick = (id: string) => {
		router.push(`/reports/${id}`);
	};

	if (historyItems.length === 0) {
		return null; // Don't show the component if there's no history
	}

	return (
		<div className="mt-2 mx-8">
			<h2 className="text-lg font-medium mb-4">Quick History</h2>
			<div className="bg-black/5 rounded-xl p-4 shadow-sm">
				<div className="grid grid-cols-3 gap-4 px-4 py-2 font-medium text-gray-600">
					<div>Dataset Name</div>
					<div>Analysis ID</div>
					<div>Date Created</div>
				</div>

				{historyItems.map((item) => (
					<div
						key={`${item.id}-${item.dateCreated}`}
						className="grid grid-cols-3 gap-4 px-4 py-4 bg-gray-200 rounded-lg my-2 cursor-pointer hover:bg-gray-300 transition-colors"
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
