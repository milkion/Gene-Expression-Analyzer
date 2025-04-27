"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function WikipediaGeneTable({ genes }: { genes: string[] }) {
	const [wikiData, setWikiData] = useState<{ [key: string]: any }>({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedGene, setSelectedGene] = useState<string | null>(null);
	const [showGeneDialog, setShowGeneDialog] = useState(false);

	useEffect(() => {
		async function fetchWikipediaData() {
			setLoading(true);
			setError(null);

			try {
				// Process genes in batches to avoid overloading the server
				const geneBatches = [];
				for (let i = 0; i < genes.length; i += 10) {
					geneBatches.push(genes.slice(i, i + 10));
				}

				const allResults: { [key: string]: any } = {};

				for (const batch of geneBatches) {
					// Call our API route with a batch of genes
					const response = await fetch("/api/wikipedia", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ genes: batch }),
					});

					if (!response.ok) {
						throw new Error(
							`API returned ${response.status}: ${response.statusText}`
						);
					}

					const batchResults = await response.json();

					// Merge results
					Object.assign(allResults, batchResults);

					// Add a small delay between batches
					await new Promise((resolve) => setTimeout(resolve, 500));
				}

				setWikiData(allResults);
				setLoading(false);
			} catch (err) {
				console.error("Error fetching Wikipedia data:", err);
				setError("Failed to fetch gene information from Wikipedia.");
				setLoading(false);
			}
		}

		if (genes.length > 0) {
			fetchWikipediaData();
		} else {
			setLoading(false);
		}
	}, [genes]);

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
				// Use uniprotID if available, otherwise fall back to search by gene symbol
				if (wikiData[selectedGene]?.uniprotID) {
					url = `https://www.uniprot.org/uniprotkb/${wikiData[selectedGene].uniprotID}/entry`;
				} else {
					url = `https://www.uniprot.org/uniprotkb?query=${selectedGene}&facets=model_organism%3A9606`;
				}
				break;
			default:
				return;
		}

		window.open(url, "_blank", "noopener,noreferrer");
		setShowGeneDialog(false);
	};

	if (loading) {
		return (
			<div className="p-4 text-center">
				Loading gene information from Wikipedia...
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive" className="mb-4">
				<Terminal className="h-4 w-4" />
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>{error}</AlertDescription>
			</Alert>
		);
	}

	return (
		<>
			<table className="w-full table-fixed">
				<colgroup>
					<col style={{ width: "25%" }} /> {/* Gene Symbol */}
					<col style={{ width: "30%" }} /> {/* Description */}
					<col style={{ width: "30%" }} /> {/* Function */}
					<col style={{ width: "25%" }} /> {/* Image */}
				</colgroup>
				<thead>
					<tr>
						<th className="py-3 px-6 text-center">Gene Symbol</th>
						<th className="py-3 px-6 text-left">Description</th>
						<th className="py-3 px-6 text-left">Function</th>
						<th className="py-3 px-6 text-center">Image</th>
					</tr>
				</thead>
				<tbody>
					{genes.slice(0, 20).map((gene) => (
						<tr key={gene} className="hover:bg-gray-50">
							<td className="py-3 px-6 text-center">
								<a
									href="#"
									className="font-medium text-blue-600 hover:underline"
									onClick={(e) => handleGeneClick(gene, e)}
								>
									{gene}
								</a>
							</td>
							<td className="py-3 px-6 text-left">
								{wikiData[gene]?.description || "No description available"}
							</td>
							<td className="py-3 px-6 text-left">
								{wikiData[gene]?.function ||
									"No function information available"}
							</td>
							<td className="py-3 px-6 text-center">
								{wikiData[gene]?.imageUrl ? (
									<img
										src={wikiData[gene].imageUrl}
										alt={`Image of ${gene}`}
										className="w-20 h-20 object-contain mx-auto"
									/>
								) : (
									<span className="text-gray-400">No image available</span>
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>

			<Dialog open={showGeneDialog} onOpenChange={setShowGeneDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{selectedGene}</DialogTitle>
						<DialogDescription>
							View this gene in external databases
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<Button
							className="w-full"
							onClick={() => navigateToGeneResource("genecards")}
						>
							GeneCards
						</Button>
						<Button
							className="w-full"
							onClick={() => navigateToGeneResource("uniprot")}
						>
							UniProt
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
