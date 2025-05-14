import { runR } from "../utils/rScriptRunner.js";

export async function processAnalysis(req, res) {
	try {
		const { analysisId, log_threshold, p_threshold } = req.body;

		if (!analysisId) {
			return res.status(400).json({ error: "Analysis ID is required" });
		}

		// Start R script processing in the background
		runR(analysisId, log_threshold, p_threshold)
			.then(() => {
				console.log(`Analysis ${analysisId} with settings [log: ${log_threshold} p: ${p_threshold}] processed successfully`);
			})
			.catch((error) => {
				console.error(`Error processing analysis ${analysisId}:`, error);
			});

		// Return success response immediately since processing happens in the background
		return res.status(200).json({ message: "Analysis processing started" });
	} catch (error) {
		console.error("Error in processAnalysis endpoint:", error);
		return res.status(500).json({ error: "Server error" });
	}
}
