import express from "express";
import CachedGeneData from "../models/CachedGeneData.js";

const router = express.Router();

// Get cached gene data
router.post("/get", async (req, res) => {
	try {
		const { genes } = req.body;

		if (!genes || !Array.isArray(genes)) {
			return res
				.status(400)
				.json({ error: "Invalid request. Expected an array of gene symbols." });
		}

		const cachedGenes = await CachedGeneData.collection
			.find({
				geneSymbol: { $in: genes },
			})
			.toArray();

		const results = {};
		cachedGenes.forEach((gene) => {
			results[gene.geneSymbol] = {
				description: gene.description,
				function: gene.function,
				imageUrl: gene.imageUrl,
				uniprotID: gene.uniprotID,
			};
		});

		return res.json({
			cachedGenes: results,
			missingGenes: genes.filter((g) => !results[g]),
		});
	} catch (error) {
		console.error("Error retrieving cached gene data:", error);
		res.status(500).json({ error: "Failed to retrieve cached gene data" });
	}
});

// Save gene data to cache
router.post("/save", async (req, res) => {
	try {
		const { geneData } = req.body;

		if (!geneData || typeof geneData !== "object") {
			return res
				.status(400)
				.json({ error: "Invalid request. Expected gene data object." });
		}

		const updates = Object.entries(geneData).map(
			([symbol, data]: [string, any]) => ({
				updateOne: {
					filter: { geneSymbol: symbol },
					update: {
						$set: {
							geneSymbol: symbol,
							description: data.description,
							function: data.function,
							imageUrl: data.imageUrl,
							uniprotID: data.uniprotID,
							lastUpdated: new Date(),
						},
					},
					upsert: true,
				},
			})
		);

		const bulkWriteOptions = { ordered: false };
		await CachedGeneData.collection.bulkWrite(updates, bulkWriteOptions);

		return res.json({ success: true });
	} catch (error) {
		console.error("Error saving gene data to cache:", error);
		res.status(500).json({ error: "Failed to save gene data to cache" });
	}
});

export default router;
