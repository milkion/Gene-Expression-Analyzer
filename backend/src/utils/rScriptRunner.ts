import fs from 'fs';
import { spawn } from "child_process";
import { ResponseData } from "../graphql/resolvers.js";
import { updateAnalysis } from "../graphql/mutation.js";

export function runR(analysisId) {
	return new Promise((resolve, reject) => {
		const rScriptPath = "src/R/significantGenes.R";

		/** USE BELOW FOR MAC */
		console.log("Running R script at:", rScriptPath);
		const rProcess = spawn("Rscript", [rScriptPath]);

		/** USE BELOW FOR WINDOWS */
		// const rscriptExecutable = "C:\\Program Files\\R\\R-4.4.3\\bin\\Rscript.exe";
		// console.log("Running R script at:", rScriptPath);
		// const rProcess = spawn(rscriptExecutable, [rScriptPath]);

		let output = "";
		let errorOutput = "";

		rProcess.stdout.on("data", (data) => {
			output += data.toString();
			console.log("R Output:", data.toString());
		});

		rProcess.stderr.on("data", (data) => {
			errorOutput += data.toString();
			console.error("R Error:", data.toString());
		});

		rProcess.on("close", async (code) => {
			console.log(`R script exited with code ${code}`);
			if (code === 0) {
				try {
					const jsonData = fs.readFileSync("public/significantGenes.json", "utf8");
					const data = JSON.parse(jsonData);
					
					if (!data.significantGenes || !Array.isArray(data.significantGenes)) {
						console.error("Error: significantGenes is missing or not an array.");
						reject(new Error("Invalid data format from R script"));
						return;
					}

					// Transform significantGenes into the new format
					const significantGenes = data.significantGenes.map((gene) => ({
						gene: {
							symbol: gene.symbol,
							description: `${gene.symbol} description testing` // Placeholder description
						},
						logFC: gene.logFC,
						avgExpr: gene.AveExpr,
						tValue: gene.t,
						pValue: gene.PValue,
						adjustedPValue: gene.adjPValue,
						bStat: gene.B
					}));

					// Update the analysis with the results
					const updatePayload = {
						results: { results: significantGenes }
					};
					
					await updateAnalysis(analysisId, updatePayload.results);
					resolve(significantGenes);
				} catch (err) {
					console.error("Error reading JSON output:", err);
					reject(err);
				}
			} else {
				console.error("R script failed with errors:", errorOutput);
				reject(new Error(`R script failed with code ${code}`));
			}
		});
	});
}