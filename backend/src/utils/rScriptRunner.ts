import fs from 'fs';
import { spawn } from "child_process";
import { ResponseData } from "../graphql/resolvers.js";
import { updateAnalysis } from "../graphql/mutation.js";
import * as path from 'path';
import { ZipExtractor } from './extractZip.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Manually define __dirname in ES modules
const __dirname = dirname(fileURLToPath(import.meta.url));


async function preprocessFiles(): Promise<void> {
	const extractor = new ZipExtractor();
	const projectRoot = path.resolve(__dirname, '../../..'); // Going up from dist/utils to the project root

	// Resolve the dragdropDir relative to the project root
	const dragdropDir = path.join(projectRoot, 'public/dragdrop_files');

	// Ensure directory exists
	if (!fs.existsSync(dragdropDir)) {
		throw new Error(`FAILED: Directory not found: ${dragdropDir}`);
	}

	const files = fs.readdirSync(dragdropDir)
		.filter(file => file.endsWith('.zip'))
		.map(file => ({
			file,
			time: fs.statSync(path.join(dragdropDir, file)).mtime.getTime()
		}))
		.sort((a, b) => b.time - a.time);

	if (files.length === 0) {
		throw new Error("FAILED: No ZIP files found.");
	}

	const zipFilePath = path.join(dragdropDir, files[0].file);
	console.log(`PROCESS: Processing file: ${zipFilePath}`);

	await extractor.extract(zipFilePath);

	console.log("SUCCESS: ZIP extraction complete.");
}

export async function runR(analysisId: string): Promise<any> {
	try {
		// Wait for ZIP extraction to complete
		await preprocessFiles();


		const expressionFilePath = ("../public/dragdrop_files/unzipped/expression_data.csv");
		if (fs.existsSync(expressionFilePath)) {
			console.log("CSV file found at:", expressionFilePath);

			console.log("Starting R script after successful extraction...");

			const rScriptPath = ("src/R/significantGenes.R");
			console.log("Running R script at:", rScriptPath);

			return new Promise((resolve, reject) => {
				const rProcess = spawn("Rscript", [rScriptPath]);

				let output = "";
				let errorOutput = "";

				// Print out the console log/terminal when the R code is running for developers only. Remove later so it doesn't appear in terminal.
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
							console.log("Current Node.js working directory:", process.cwd());

							const jsonData = fs.readFileSync(path.resolve("../backend", "../backend/src/R/public/output/significantGenes.json"), "utf8");
							const data = JSON.parse(jsonData);

							if (!data.significantGenes || !Array.isArray(data.significantGenes)) {
								return reject(new Error("Invalid data format from R script"));
							}

							const significantGenes = data.significantGenes.map((gene) => ({
								gene: {
									symbol: gene.symbol,
									description: `${gene.symbol} description testing`
								},
								logFC: gene.logFC,
								avgExpr: gene.AveExpr,
								tValue: gene.t,
								pValue: gene.PValue,
								adjustedPValue: gene.adjPValue,
								bStat: gene.B
							}));

							const updatePayload = { results: { results: significantGenes } };
							await updateAnalysis(analysisId, updatePayload.results);

							console.log("SUCCESS: Analysis updated successfully.");
							resolve(significantGenes);
						} catch (err) {
							console.error("Error processing JSON output:", err);
							reject(err);
						}
					} else {
						reject(new Error(`R script failed with code ${code}`));
					}
				});
			});
		} else {
			console.error("ERROR: CSV file NOT found. Check extraction logic.");
		}
	} catch (err) {
		console.error("ERROR: Error during preprocessing or R execution:", err);
		throw err;
	}
}
