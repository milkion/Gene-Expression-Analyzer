import express from "express";
import Gene from "../models/Gene.js";

const router = express.Router();

// Get gene data 
router.post("/get", async (req, res) => {
	try {
		const { genes } = req.body;

		if (!genes || !Array.isArray(genes)) {
			return res
				.status(400)
				.json({ error: "Invalid request. Expected an array of gene symbols." });
		}

		const existingGenes = await Gene.find({
			symbol: { $in: genes }
		}).lean();

		const results = {};
		const missingGenes = [...genes]; // Start with all genes as missing

		existingGenes.forEach((gene) => {
			// Check if the gene has real data or just the default "testing" description
			const hasRealDescription = gene.description && !gene.description.includes("description testing");
			const hasRealFunction = gene.function && gene.function !== "No function information available";
			
			// Only consider the gene as "cached" if it has real data
			if (hasRealDescription || hasRealFunction || gene.imageUrl) {
				results[gene.symbol] = {
					description: gene.description,
					function: gene.function,
					imageUrl: gene.imageUrl,
					uniprotID: gene.uniprotID,
				};
				
				// Remove from missingGenes if we have real data
				const index = missingGenes.indexOf(gene.symbol);
				if (index > -1) {
					missingGenes.splice(index, 1);
				}
			}
		});

		return res.json({
			cachedGenes: results,
			missingGenes: missingGenes,
		});
	} catch (error) {
		console.error("Error retrieving gene data:", error);
		res.status(500).json({ error: "Failed to retrieve gene data" });
	}
});

// Save gene data
router.post("/save", async (req, res) => {
	try {
		const { geneData, overwriteExisting = false } = req.body;

		if (!geneData || typeof geneData !== "object") {
			return res
				.status(400)
				.json({ error: "Invalid request. Expected gene data object." });
		}

		const updates = Object.entries(geneData).map(
			([symbol, data]: [string, any]) => {
				// Define the update operation
				let updateOperation;
				
				if (overwriteExisting) {
					// Completely replace fields with new data
					updateOperation = {
						$set: {
							symbol: symbol,
							description: data.description,
							function: data.function,
							imageUrl: data.imageUrl,
							uniprotID: data.uniprotID,
							lastUpdated: new Date(),
						},
					};
				} else {
					// Only update fields that aren't already populated with real data
					updateOperation = {
						$set: {
							symbol: symbol,
							lastUpdated: new Date(),
						},
						$setOnInsert: {
							description: data.description,
							function: data.function,
							imageUrl: data.imageUrl,
							uniprotID: data.uniprotID,
						},
					};
				}
				
				return {
					updateOne: {
						filter: { symbol: symbol },
						update: updateOperation,
						upsert: true,
					},
				};
			}
		);

		const bulkWriteOptions = { ordered: false };
		await Gene.bulkWrite(updates, bulkWriteOptions);

		return res.json({ success: true });
	} catch (error) {
		console.error("Error saving gene data:", error);
		res.status(500).json({ error: "Failed to save gene data" });
	}
});

export default router;
