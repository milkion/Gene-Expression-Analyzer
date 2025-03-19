"use client";

import { useParams } from "next/navigation";
import { NavigationBar } from "@/components/navigation-bar";
import { gql, useQuery } from "@apollo/client";
import { AnalysisInformation } from "./analysis-info";

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
			}
			createdAt
			updatedAt
		}
	}
`;

export default function DetailedReportPage() {
	const params = useParams();
	const analysisId = params.id as string;

	// Fetch data using useQuery
	const { loading, error, data } = useQuery(GET_ANALYSIS, {
		variables: { id: analysisId },
	});

	if (loading) return <p>Loading analysis data...</p>;
	if (error) return <p>Error: {error.message}</p>;

	const analysis = data?.analysis;

	return (
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
								<div className="bg-gray-100 rounded-2xl pt-10 py-6">
									<table className="w-full">
										<thead>
											<tr>
												<th className="py-2">Gene Symbol</th>
												<th className="py-2">Log FC</th>
												<th className="py-2">Avg Expression</th>
												<th className="py-2">t-Value</th>
												<th className="py-2">p-Value</th>
												<th className="py-2">Adjusted p-Value</th>
												<th className="py-2">B Statistic</th>
											</tr>
										</thead>
										<tbody>
											{analysis.result.results.map((result) => (
												<tr key={result.id} className="hover:bg-gray-50">
													<td className="py-2 text-center">{result.gene.symbol}</td>
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
	);
}
