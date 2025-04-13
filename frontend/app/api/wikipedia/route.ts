import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import axios from "axios";

export async function POST(request: NextRequest) {
	try {
		const { genes } = await request.json();

		if (!genes || !Array.isArray(genes)) {
			return NextResponse.json(
				{ error: "Invalid request. Expected an array of gene symbols." },
				{ status: 400 }
			);
		}

		// First check cache
		const cacheResponse = await fetch(
			"http://localhost:4000/api/geneCache/get",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ genes }),
			}
		);

		if (!cacheResponse.ok) {
			throw new Error("Failed to check gene cache");
		}

		const { cachedGenes, missingGenes } = await cacheResponse.json();
		const results = { ...cachedGenes };

		// Fetch missing genes from Wikipedia
		for (const gene of missingGenes) {
			try {
				// First try the search approach to find the most relevant page
				const searchResponse = await axios.get(
					`https://en.wikipedia.org/w/api.php?action=opensearch&search=${gene}+gene&limit=1&namespace=0&format=json`
				);

				let pageUrl = null;
				let pageTitle = null;

				// If search gives results, use that
				if (
					searchResponse.data[1].length > 0 &&
					searchResponse.data[3].length > 0
				) {
					pageUrl = searchResponse.data[3][0];
					pageTitle = pageUrl.split("/").pop();
				}

				// Try to fetch the Wikipedia page HTML for the gene
				const response = pageTitle
					? await axios.get(`https://en.wikipedia.org/wiki/${pageTitle}`)
					: await axios.get(`https://en.wikipedia.org/wiki/${gene}`);

				const html = response.data;
				const $ = cheerio.load(html);

				// Extract the description (first paragraph after the infobox)
				let description = "";
				const infobox = $("table.infobox");
				if (infobox.length > 0) {
					// Find the first paragraph after the infobox
					let nextElement = infobox.first().next();
					while (
						nextElement.length > 0 &&
						nextElement.prop("tagName")?.toLowerCase() !== "p"
					) {
						nextElement = nextElement.next();
					}

					if (nextElement.length > 0 && nextElement.text().trim().length > 0) {
						const paragraphText = nextElement.text().trim();
						// Remove citation references [n] from the text
						const cleanText = paragraphText
							.replace(/\[\d+\]/g, "")
							.replace(/\[citation needed\]/g, "");

						// Use the first sentence as the description
						description = cleanText.split(". ")[0] + ".";

						// Extract function (next few sentences)
						let functionText = "";
						if (cleanText.split(". ").length > 1) {
							functionText = cleanText.split(". ").slice(1, 3).join(". ") + ".";
						}

						// If we found a description paragraph, we'll also use it for function
						if (functionText) {
							results[gene] = {
								...results[gene],
								function: functionText,
							};
						}
					}
				}

				// If no description was found after the infobox, fall back to the first substantive paragraph
				if (!description) {
					const paragraphs = $("#mw-content-text p").filter(function () {
						// Filter out empty paragraphs or those with just image captions
						return $(this).text().trim().length > 50;
					});

					if (paragraphs.length > 0) {
						const firstParagraph = paragraphs.first().text().trim();
						// Remove citation references [n] from the text
						const cleanText = firstParagraph
							.replace(/\[\d+\]/g, "")
							.replace(/\[citation needed\]/g, "");

						description = cleanText.split(". ")[0] + ".";

						// Extract function from the same paragraph if not already set
						if (!results[gene]?.function && cleanText.split(". ").length > 1) {
							results[gene] = {
								...results[gene],
								function: cleanText.split(". ").slice(1, 3).join(". ") + ".",
							};
						}
					}
				}

				// Try to extract gene function from a section with "Function" in the title if not already found
				if (!results[gene]?.function) {
					// Look for the specific Function heading structure
					const functionHeading = $(
						"div.mw-heading.mw-heading2:has(h2#Function)"
					);

					if (functionHeading.length > 0) {
						// Get the paragraph after the heading div
						const functionSection = functionHeading.next("p");
						if (functionSection.length > 0) {
							let functionText = functionSection.text().trim();
							// Remove citation references [n] from the text
							functionText = functionText
								.replace(/\[\d+\]/g, "")
								.replace(/\[citation needed\]/g, "");

							// Limit to first 2 sentences
							const sentences = functionText.split(". ");
							if (sentences.length > 2) {
								functionText = sentences.slice(0, 2).join(". ") + ".";
							}

							results[gene] = {
								...results[gene],
								function: functionText,
							};
						}
					} else {
						// Fallback to more general function heading search
						const functionHeadings = $("h2, h3").filter((i, el) => {
							return $(el).text().toLowerCase().includes("function");
						});

						if (functionHeadings.length > 0) {
							const functionSection = functionHeadings.first().next("p");
							if (functionSection.length > 0) {
								let functionText = functionSection.text().trim();
								// Remove citation references [n] from the text
								functionText = functionText
									.replace(/\[\d+\]/g, "")
									.replace(/\[citation needed\]/g, "");

								// Limit to first 2 sentences
								const sentences = functionText.split(". ");
								if (sentences.length > 2) {
									functionText = sentences.slice(0, 2).join(". ") + ".";
								}

								results[gene] = {
									...results[gene],
									function: functionText,
								};
							}
						}
					}
				}

				// Extract image - improved approach to find relevant images
				let imageUrl = null;

				// Try infobox image first (most reliable)
				const infoboxImage = $("table.infobox img").first();
				if (infoboxImage.length > 0) {
					imageUrl = infoboxImage.attr("src");
					// Fix protocol-relative URLs
					if (imageUrl && imageUrl.startsWith("//")) {
						imageUrl = "https:" + imageUrl;
					}
				}

				// If no infobox image, try looking in figure elements (common for gene diagrams)
				if (!imageUrl) {
					const figureImage = $("figure.mw-default-size img").first();
					if (figureImage.length > 0) {
						imageUrl = figureImage.attr("src");
						if (imageUrl && imageUrl.startsWith("//")) {
							imageUrl = "https:" + imageUrl;
						}
					}
				}

				// Try thumbinner images (Wikipedia's thumbnail container)
				if (!imageUrl) {
					const thumbImage = $("div.thumbinner img").first();
					if (thumbImage.length > 0) {
						imageUrl = thumbImage.attr("src");
						if (imageUrl && imageUrl.startsWith("//")) {
							imageUrl = "https:" + imageUrl;
						}
					}
				}

				// Last resort - any image in the content that's not tiny
				if (!imageUrl) {
					const contentImages = $("#mw-content-text img").filter(function () {
						// Filter out tiny icons and decorative images
						const width = parseInt($(this).attr("width") || "0", 10);
						const height = parseInt($(this).attr("height") || "0", 10);
						return (
							(width > 50 || height > 50) &&
							!$(this).parent().hasClass("metadata")
						);
					});

					if (contentImages.length > 0) {
						imageUrl = contentImages.first().attr("src");
						if (imageUrl && imageUrl.startsWith("//")) {
							imageUrl = "https:" + imageUrl;
						}
					}
				}

				// Check if it's a thumbnail and get full size if possible
				if (imageUrl && imageUrl.includes("/thumb/")) {
					// Extract the actual image path
					const parts = imageUrl.split("/thumb/");
					if (parts.length > 1) {
						const imagePath = parts[1];
						// Remove the thumbnail size specification (last part after last slash)
						const pathParts = imagePath.split("/");
						if (pathParts.length > 1) {
							pathParts.pop(); // Remove last element (sizing spec)
							const fullImagePath = parts[0] + "/" + pathParts.join("/");
							imageUrl = fullImagePath;
						}
					}
				}

				results[gene] = {
					...results[gene],
					description: description || "No description available.",
					function:
						results[gene]?.function || "No function information available.",
					imageUrl,
					uniprotID: await fetchUniprotID(gene),
				};

				// If we still don't have an image, try to get one via the Wikipedia API
				if (!imageUrl && pageTitle) {
					try {
						const imageInfoResponse = await axios.get(
							`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
								pageTitle
							)}&prop=pageimages&format=json&pithumbsize=300&origin=*`
						);

						const pages = imageInfoResponse.data.query.pages;
						const pageId = Object.keys(pages)[0];

						if (pages[pageId].thumbnail && pages[pageId].thumbnail.source) {
							results[gene].imageUrl = pages[pageId].thumbnail.source;
						}
					} catch (imgError) {
						console.error(`Error fetching image for ${gene}:`, imgError);
					}
				}
			} catch (error) {
				console.error(`Error fetching data for gene ${gene}:`, error);
				results[gene] = {
					description: "Failed to fetch data",
					function: "Information unavailable",
					imageUrl: null,
				};
			}
		}

		// Save new results to cache if any were fetched
		if (missingGenes.length > 0) {
			const newGeneData = {};
			missingGenes.forEach((gene) => {
				if (results[gene]) {
					newGeneData[gene] = results[gene];
				}
			});

			await fetch("http://localhost:4000/api/geneCache/save", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ geneData: newGeneData }),
			});
		}

		return NextResponse.json(results);
	} catch (error) {
		console.error("Error processing request:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

async function fetchUniprotID(geneSymbol) {
	try {
		// You can use the UniProt API to get the ID
		const response = await axios.get(
			`https://rest.uniprot.org/uniprotkb/search?query=${geneSymbol}+AND+organism_id:9606&format=json&fields=accession`
		);

		if (response.data.results && response.data.results.length > 0) {
			return response.data.results[0].primaryAccession;
		}
		return null;
	} catch (error) {
		console.error(`Error fetching UniProt ID for ${geneSymbol}:`, error);
		return null;
	}
}
