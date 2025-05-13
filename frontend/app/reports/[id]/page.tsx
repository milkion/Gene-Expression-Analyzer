"use client";

import { useParams } from "next/navigation";
import { NavigationBar } from "@/components/navigation-bar";
import { gql, useQuery } from "@apollo/client";
import { AnalysisInformation } from "./analysis-info";
import Protected from "@/components/Protected";
import { useEffect, useRef, useState } from "react";
const html2pdf = (await import("html2pdf.js")).default;
import { useDownloadPDF } from "./downloadpdf";

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
import { WikipediaGeneTable } from "./WikipediaGeneTable";

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
	const { reportRef, handleDownloadPDF } = useDownloadPDF(analysisId); // Use the hook

	// Fetch data using useQuery
	const { loading, error, data } = useQuery(GET_ANALYSIS, {
		variables: { id: analysisId },
	});

	const [isClient, setIsClient] = useState(false);

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

	const handleDownloadImage = (imageSrc: string) => {
		const a = document.createElement("a");
		a.href = imageSrc;
		a.download = "visualization.png"; // Name of the image
		a.click();
	};


	function downloadCSV(genes) {
		const csvContent = "data:text/csv;charset=utf-8," +
			// Define headers based on the structure of your WikipediaGeneTable data
			"Gene Symbol, Description, Other Data\n" + // Adjust this as needed
			genes.map(gene =>
				[
					gene.symbol,        // Gene Symbol
					gene.description,   // Gene Description
					gene.otherData      // Additional data, adjust as necessary
				].join(",")
			).join("\n");

		// Create a temporary link element to trigger download
		const link = document.createElement("a");
		link.setAttribute("href", encodeURI(csvContent));
		link.setAttribute("download", "wikipedia_gene_table.csv");
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}


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

	const handleDownload = () => {
		const results = analysis?.result?.results;

		const convertToCSV = (data: typeof results) => {
			const headers = [
				"Gene Symbol",
				"Log FC",
				"Avg Expression",
				"t-Value",
				"p-Value",
				"Adjusted p-Value",
				"B Statistic",
			];

			const rows = data.map((result) => [
				result.gene.symbol,
				result.logFC.toFixed(4),
				result.avgExpr.toFixed(4),
				result.tValue.toFixed(4),
				result.pValue.toExponential(4),
				result.adjustedPValue.toExponential(4),
				result.bStat.toFixed(4),
			]);

			const csvContent = [headers, ...rows]
				.map((row) => row.join(","))
				.join("\n");

			return csvContent;
		};

		const csvContent = convertToCSV(results);

		const timestamp = new Date().toLocaleString().replace(/[:.,]/g, "_");

		const blob = new Blob([csvContent], { type: "text/csv" });

		const link = document.getElementById("download-csv") as HTMLAnchorElement;
		link.href = URL.createObjectURL(blob);
		link.download = `results-${analysisId}-${timestamp}.csv`;
	};


	const parseKeywords = (keywords: string | null) => {
		if (!keywords) return "";
		return keywords.replace(/[\s,]+/g, '+') + "+";
	}


	return (
		<Protected>
			<div>
				<NavigationBar />
				<div id="analysis_overview" ref={reportRef}>
					<div className="flex justify-between items-center mt-10 mx-11">
						<h2 className="font-medium mt-1 m-4">Analysis Overview</h2>
						<Button onClick={handleDownloadPDF} className="mt-4 text-xs">
							Download PDF
						</Button>
					</div>
					<div className="p-4 mx-8">
						<div className="flex items-center gap-2 text-gray-600 mt-4 mx-4">
							<span>Reports</span>
							<span>{">"}</span>
							<span>{analysis?.id}</span>
						</div>

						{analysis ? (
							<div className="mt-6">

								<AnalysisInformation analysis={analysis} />

								<div className="bg-gray-100 rounded-2xl pt-10 py-6 px-6 mt-6 relative">
									<div className="grid grid-cols-3 grid-rows-2 gap-4 items-stretch justify-center relative">
										{/* Top Left - Statistical Significance */}
										<div className="bg-white rounded-xl shadow-sm p-4 col-start-1 row-start-1 flex flex-col items-center justify-center text-center">
											<h3 className="font-semibold mb-2">
												Statistical Significance
											</h3>
											<p>
												Lowest adjusted p-value:{" "}
												{Number(
													analysis.result.results[0].adjustedPValue
												).toExponential(2)}
											</p>
											<p>Indicates high confidence in these top results.</p>
										</div>
										{/* Top Genes - Center */}
										<div className="bg-white rounded-xl shadow-sm p-6 col-start-2 row-start-1 row-span-2 flex flex-col items-center justify-center text-center">
											<h3 className="font-semibold text-md mb-4">Top Genes</h3>
											<ul className="space-y-2">
												{analysis.result.results.slice(0, 5).map((r: any) => (
													<li key={r.gene.symbol} className="text-lg">
														{r.gene.symbol}
													</li>
												))}
											</ul>
										</div>

										{/* Top Right - B Statistic */}
										<div className="bg-white rounded-xl shadow-sm p-4 col-start-3 row-start-1 flex flex-col items-center justify-center text-center">
											<h3 className="font-semibold mb-2">
												Confidence (B-Statistic)
											</h3>
											<p>
												Top B score: {analysis.result.results[0].bStat.toFixed(2)}
											</p>
											<p>Higher B means stronger model confidence.</p>
										</div>

										{/* Bottom Left - Average Absolute LogFC */}
										<div className="bg-white rounded-xl shadow-sm p-4 col-start-1 row-start-2 flex flex-col items-center justify-center text-center">
											<h3 className="font-semibold mb-2">Avg. LogFC</h3>
											<p className="text-xl font">
												{(
													analysis.result.results.reduce(
														(sum: number, r: any) => sum + Math.abs(r.logFC),
														0
													) / analysis.result.results.length
												).toFixed(4)}
											</p>
										</div>

										{/* Bottom Right - Total Genes */}
										<div className="bg-white rounded-xl shadow-sm p-4 col-start-3 row-start-2 flex flex-col items-center justify-center text-center">
											<h3 className="font-semibold mb-2">Total genes:</h3>
											<p className="text-xl font">
												{analysis.result.results.length}
											</p>
										</div>
									</div>
								</div>

								{analysis.result &&
									analysis.result.results &&
									analysis.result.results.length > 0 ? (
									<div>
										<h2 className="font-medium mt-10 m-4">
											Gene Analysis Results
										</h2>

										<div className="bg-gray-100 rounded-2xl pt-10 py-6">
											<div className="group cursor-pointer mb-4">
												<a
													className="font-medium ml-1 pl-12 text-base group-hover:underline"
													id="download-csv"
													onClick={handleDownload}
												>
													Download
												</a>
												<img
													src="/../download-icon.svg"
													alt="download_icon"
													className="ml-3 pb-2 inline-block"
												/>
											</div>

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
																{result.gene.symbol}
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

										{imageSrc ? (
											<div>
												<h2 className="font-medium mt-10 m-4">Visualization</h2>

												<div className="bg-gray-100 rounded-2xl py-8 px-10">
													{/* Button Section - Positioned Left */}
													<div className="mt-8 w-full text-left mb-6">
														<div className="group cursor-pointer mb-1">
															<a
																className="font-medium text-base group-hover:underline"
																onClick={() => handleDownloadImage(imageSrc)}
															>
																Download Image
															</a>
															<img
																src="/../download-icon.svg"
																alt="download_icon"
																className="ml-3 pb-2 inline-block"
															/>
														</div>
														{/* Optional Button */}
														{/* <Button onClick={}>Download CSV</Button> */}
													</div>

													{/* Volcano Plot Section */}
													<div className="bg-white rounded-2xl py-8 px-10 flex flex-col justify-center items-center">
														<h2 className="font-medium text-xl mb-4">Volcano Plot</h2>

														<img
															id="base64-image"
															src={imageSrc}
															alt="Visualization"
															width="576"
															height="432"
															className="rounded-lg shadow-md" // Adds rounded corners and shadow
														/>
													</div>
												</div>
											</div>

										) : (
											<></>
										)
										}

										{/* Wikipedia Gene Information Section */}
										<div>
											<h2 className="font-medium mt-10 m-4">Gene Encyclopedia</h2>
											<p className="text-gray-700 m-4">
												The gene information displayed below is sourced from Wikipedia and may not always be accurate or up-to-date.
												Wikipedia content is community-edited and should be used as a starting point for research only. We recommend
												cross-checking any critical information with authoritative scientific databases or literature.
											</p>
											<Alert className="bg-blue-100 rounded-2xl mb-4">
												<Terminal className="h-4 w-4" />
												<AlertTitle className="text-blue-800 font-lg">
													Heads up!
												</AlertTitle>
												<AlertDescription>
													Click on a gene symbol to view more information about
													it.
												</AlertDescription>
											</Alert>

											<div className="bg-gray-100 rounded-2xl pt-10 py-6">

												<WikipediaGeneTable
													genes={analysis.result.results.map(
													(r) => r.gene.symbol
												  )} 
												  keywords={analysis.dataset.description}
												/>
											</div>
										</div>
									</div>
								) : (
									<p>No analysis results available.</p>
								)}
							</div>
						) : (
							<p>Analysis not found</p>
						)}
					</div>
				</div>
			</div>

		</Protected>
	);
}


