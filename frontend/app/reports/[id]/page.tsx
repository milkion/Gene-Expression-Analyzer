"use client";

import { useParams } from "next/navigation";
import { NavigationBar } from "@/components/navigation-bar";
import { gql, useQuery } from "@apollo/client";
import { AnalysisInformation } from "./analysis-info";
import Protected from "@/components/Protected";
import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Terminal } from "lucide-react";

// Define the GraphQL Query for a single analysis
const GET_ANALYSIS = gql`
	query GetAnalysis($id: ID!) {
		analysis(id: $id) {
			id
			date
			status
			dataset {
				name
				description
			}
			result {
				results {
					id
					gene {
						symbol
						description
					}
					logFC
					avgExpr
					tValue
					pValue
					adjustedPValue
					bStat
				}
				visualization
			}
			createdAt
			updatedAt
		}
	}
`;

export default function DetailedReportPage() {
	const params = useParams();
	const analysisId = params.id as string;
	const [sortField, setSortField] = useState<string | null>(null);
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

	// Fetch data using useQuery
	const { loading, error, data } = useQuery(GET_ANALYSIS, {
		variables: { id: analysisId },
	});

	const [isClient, setIsClient] = useState(false);
	const [selectedGene, setSelectedGene] = useState<string | null>(null);
	const [showGeneDialog, setShowGeneDialog] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	useEffect(() => {
		if (data?.analysis && isClient) {
			const historyItem = {
				id: analysisId,
				datasetName: data.analysis.dataset?.name || "Unknown Dataset",
				analysisId: analysisId,
				dateCreated: new Date().toLocaleString(),
			};

			const existingHistory = localStorage.getItem("viewedReports");
			let history = existingHistory ? JSON.parse(existingHistory) : [];

			history = history.filter((item) => item.id !== analysisId);

			history.unshift(historyItem);

			history = history.slice(0, 10);

			localStorage.setItem("viewedReports", JSON.stringify(history));
		}
	}, [data, analysisId, isClient]);

	if (loading) return <p>Loading analysis data...</p>;
	if (error) return <p>Error: {error.message}</p>;

	const analysis = data?.analysis;

	const visualization_string = analysis?.result?.visualization; // Can be null
	const imageSrc = visualization_string
		? `data:image/png;base64,${visualization_string}`
		: null;

	const handleGeneClick = (geneSymbol: string, e: React.MouseEvent) => {
		e.preventDefault();
		setSelectedGene(geneSymbol);
		setShowGeneDialog(true);
	};

	const navigateToGeneResource = (resource: string) => {
		if (!selectedGene) return;

		let url = "";
		switch (resource) {
			case "genecards":
				url = `https://www.genecards.org/cgi-bin/carddisp.pl?gene=${selectedGene}`;
				break;
			case "uniprot":
				url = `https://www.uniprot.org/uniprotkb?query=${selectedGene}&facets=model_organism%3A9606`;
				break;
			default:
				return;
		}

		window.open(url, "_blank", "noopener,noreferrer");
		setShowGeneDialog(false);
	};

	const copyGeneSymbols = () => {
		if (!analysis?.result?.results) return;

		const geneSymbols = analysis.result.results
			.map((result) => result.gene.symbol)
			.join("\n");

		navigator.clipboard
			.writeText(geneSymbols)
			.then(() => {
				alert("All gene symbols have been copied to your clipboard.");
			})
			.catch((err) => {
				console.error("Failed to copy: ", err);
				alert("Failed to copy gene symbols. Please try again.");
			});
	};

	const handleSort = (field: string) => {
		if (sortField === field) {
			// If clicking the same field, toggle direction
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			// If clicking a new field, set it with ascending direction
			setSortField(field);
			setSortDirection("asc");
		}
	};

	const getSortedResults = () => {
		if (!analysis?.result?.results || !sortField)
			return analysis?.result?.results;

		return [...analysis.result.results].sort((a, b) => {
			const aValue = a[sortField];
			const bValue = b[sortField];
			const modifier = sortDirection === "asc" ? 1 : -1;

			return aValue > bValue ? modifier : -modifier;
		});
	};

	return (
		<Protected>
			<div>
				<NavigationBar />
				<div className="p-4 mx-8">
					<div className="flex items-center gap-2 text-gray-600 mt-4 mx-4">
						<span>Reports</span>
						<span>{">"}</span>
						<span>{analysis?.id}</span>
					</div>

					{analysis ? (
						<div className="mt-6">
							<AnalysisInformation analysis={analysis} />

							{analysis.result &&
							analysis.result.results &&
							analysis.result.results.length > 0 ? (
								<div>
									<h2 className="font-medium mt-10 m-4">
										Gene Analysis Results
									</h2>

									<Alert className="bg-blue-100 rounded-2xl mb-4">
										<Terminal className="h-4 w-4" />
										<AlertTitle className="text-blue-800 font-lg">
											Heads up!
										</AlertTitle>
										<AlertDescription>
											Click on a gene symbol to view more information about it.
										</AlertDescription>
									</Alert>

									<div className="bg-gray-100 rounded-2xl pt-10 py-6">
										<table className="w-full">
											<thead>
												<tr>
													<th className="py-2">Gene Symbol</th>
													{[
														{ key: "logFC", label: "Log FC" },
														{ key: "avgExpr", label: "Avg Expression" },
														{ key: "tValue", label: "t-Value" },
														{ key: "pValue", label: "p-Value" },
														{
															key: "adjustedPValue",
															label: "Adjusted p-Value",
														},
														{ key: "bStat", label: "B Statistic" },
													].map(({ key, label }) => (
														<th
															key={key}
															className="py-2 cursor-pointer hover:bg-gray-200 transition-colors"
															onClick={() => handleSort(key)}
														>
															<div className="flex items-center justify-center gap-1">
																{label}
																<span className="text-gray-400">
																	{sortField === key
																		? sortDirection === "asc"
																			? "↑"
																			: "↓"
																		: "↕"}
																</span>
															</div>
														</th>
													))}
												</tr>
											</thead>
											<tbody>
												{getSortedResults()?.map((result) => (
													<tr key={result.id} className="hover:bg-gray-50">
														<td className="py-2 text-center">
															<button
																onClick={(e) =>
																	handleGeneClick(result.gene.symbol, e)
																}
																className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
																title={`Find more information about ${result.gene.symbol}`}
															>
																{result.gene.symbol}
															</button>
														</td>
														<td className="p-2 text-center">
															{result.logFC.toFixed(4)}
														</td>
														<td className="p-2 text-center">
															{result.avgExpr.toFixed(4)}
														</td>
														<td className="p-2 text-center">
															{result.tValue.toFixed(4)}
														</td>
														<td className="p-2 text-center">
															{Number(result.pValue).toExponential(4)}
														</td>
														<td className="p-2 text-center">
															{Number(result.adjustedPValue).toExponential(4)}
														</td>
														<td className="p-2 text-center">
															{result.bStat.toFixed(4)}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>

									<div className="mt-6 bg-violet-200 rounded-2xl p-6 relative">
										<h3 className="text-md">Batch Query Gene Symbols</h3>

										<p className="text-sm text-gray-600 mt-2 max-w-3xl">
											Use the button below to copy all gene symbols to your
											clipboard. You can paste these genes directly into
											<a
												href="https://ctdbase.org/tools/batchQuery.go"
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-600 hover:underline"
											>
												{" "}
												CTD Batch Query
											</a>{" "}
											to batch query gene information.
										</p>

										<Button
											onClick={copyGeneSymbols}
											className="bg-blue-600 hover:bg-blue-700 text-white absolute bottom-6 right-6"
										>
											Copy All Gene Symbols
										</Button>
									</div>

									{imageSrc ? (
										<div>
											<h2 className="font-medium mt-10 m-4">Visualizations</h2>
											<div className="bg-gray-100 rounded-2xl py-10 px-10">
												<h2 className="font-medium m-4">Graphs</h2>
												<div className="bg-white rounded-2xl py-10 px-10 flex justify-center items-center">
													<img
														id="base64-image"
														src={imageSrc}
														alt="Visualization"
														width="576"
														height="432"
													/>
												</div>
											</div>
										</div>
									) : (
										<></>
									)}
								</div>
							) : (
								<p>No analysis results available.</p>
							)}
						</div>
					) : (
						<p>Analysis not found</p>
					)}
				</div>

				{/* Gene Information Dialog */}
				<Dialog open={showGeneDialog} onOpenChange={setShowGeneDialog}>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>Gene Information: {selectedGene}</DialogTitle>
							<DialogDescription>
								Choose where you want to view information about this gene.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<Button
								onClick={() => navigateToGeneResource("genecards")}
								className="w-full"
							>
								GeneCards
							</Button>
							<Button
								onClick={() => navigateToGeneResource("uniprot")}
								className="w-full"
							>
								UniProt
							</Button>
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setShowGeneDialog(false)}
							>
								Cancel
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</Protected>
	);
}
