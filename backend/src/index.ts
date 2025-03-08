import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./graphql/typeDefs.js";
import { resolvers } from "./graphql/resolvers.js";
import { ResponseData } from "./graphql/resolvers.js";
import fs from 'fs';
import csv from "csv-parser";
import { ResponseData } from "./graphql/resolvers.js";
import fs from 'fs';
import csv from "csv-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { updateAnalysis } from "./graphql/mutation.js";

dotenv.config();
import path from "path";
import { fileURLToPath } from "url";

// dotenv.config();

// const MONGODB_URI = process.env.MONGODB_URI || "";

// // Initialize Apollo Server
// const server = new ApolloServer({
// 	typeDefs,
// 	resolvers,
// });

const PORT = 4000;
import { spawn } from "child_process";

function runR() {
	return new Promise((resolve, reject) => {


		// Convert `import.meta.url` to a file path
		const __filename = fileURLToPath(import.meta.url);
		const __dirname = path.dirname(__filename);
		// Get the absolute path to the R script
		const rScriptPath = path.resolve(process.cwd(), "src/R/GSE16561.R");
		console.log("Running R script at:", rScriptPath);

		// Run the R script
		const rProcess = spawn("Rscript", [rScriptPath]);
		let output = "";
		let errorOutput = "";

		rProcess.stdout.on("data", (data) => {
			output += data.toString();
		});

		rProcess.stderr.on("data", (data) => {
			errorOutput += data.toString();
		});


		rProcess.on("close", (code) => {
			if (code === 0) {
				const jsonData = fs.readFileSync("/Users/rin/Desktop/FIT3162-FYP/FIT3162-FYP/backend/significantGenes.json", "utf8");
				resolve(JSON.parse(jsonData));  // Send parsed JSON
			} else {
				reject(new Error("R script failed"));
			}
		});

	});
}

// Call the function
runR()
	.then((data: ResponseData) => {
		console.log("Processing Data...");

		// Ensure significantGenes exists before iterating
		if (!data.significantGenes || !Array.isArray(data.significantGenes)) {
			console.error("Error: significantGenes is missing or not an array.");
			return;
		}

		data.significantGenes.forEach((gene, index) => {
			console.log(`Row ${index + 1}:`);
			console.log(`Symbol: ${gene.symbol}`);
			console.log(`Log Fold Change: ${gene.logFC}`);
			console.log(`Average Expression: ${gene.AveExpr}`);
			console.log(`T-statistic: ${gene.t}`);
			console.log(`P-Value: ${gene.PValue}`);
			console.log(`Adjusted P-Value: ${gene.adjPValue}`);
			console.log(`B-Statistic: ${gene.B}`);
			console.log(`Row ID: ${gene._row}`);
			console.log("-----------------------------");
		});
	})
	.catch((err) => console.error("Error running R script:", err));

// mongoose
// 	.connect(MONGODB_URI)
// 	.then(async () => {
// 		console.log("Connected to MongoDB");
// 		const { url } = await startStandaloneServer(server, {
// 			listen: { port: PORT },
// 		});
// 		console.log(`🚀 Server ready at ${url}`);



// 	})
// 	.catch((error) => {
// 		console.error("Error connecting to MongoDB:", error);
// 	});





// const readCSVFile = () => {
// 	return new Promise((resolve, reject) => {
// 		const results = [];
// 		const filePath = '/Users/rin/Desktop/R-code/significantGenes.csv';
// 		fs.createReadStream(filePath)
// 			.pipe(csv())
// 			.on("data", (row) => results.push(row))
// 			.on("end", () => resolve(results))
// 			.on("error", reject);
// 	});
// };

// const formatGeneData = (csvData) => {
// 	return csvData.map((row, index) => ({
// 		id: index + 1,
// 		symbol: row.symbol,
// 		logFC: parseFloat(row.logFC),
// 		AveExpr: parseFloat(row.AveExpr),
// 		t: parseFloat(row.t),
// 		PValue: parseFloat(row.PValue),
// 		adjPValue: parseFloat(row.adjPValue),
// 		B: parseFloat(row.B),
// 	}));
// };

// console.log("📂 Fetching genes from CSV...");
// const rawData = await readCSVFile();
// const dosomething = formatGeneData(rawData);


import { spawn } from "child_process";

function runR() {
	return new Promise((resolve, reject) => {
		const __filename = fileURLToPath(import.meta.url);
		const __dirname = path.dirname(__filename);
		const rScriptPath = path.resolve(process.cwd(), "src/R/GSE16561.R");

		console.log("Running R script at:", rScriptPath);

		const rProcess = spawn("Rscript", [rScriptPath]);

		let output = "";
		let errorOutput = "";

		rProcess.stdout.on("data", (data) => {
			output += data.toString();
			console.log("R Output:", data.toString());  // ✅ Log R script output in real-time
		});

		rProcess.stderr.on("data", (data) => {
			errorOutput += data.toString();
			console.error("R Error:", data.toString());  // ✅ Log R script errors in real-time
		});

		rProcess.on("close", (code) => {
			console.log(`R script exited with code ${code}`);
			if (code === 0) {
				try {
					const jsonData = fs.readFileSync("/Users/rin/Desktop/FIT3162-FYP/FIT3162-FYP/backend/significantGenes.json", "utf8");
					resolve(JSON.parse(jsonData));
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


mongoose
	.connect(MONGODB_URI)
	.then(async () => {
		console.log("Connected to MongoDB");
		const { url } = await startStandaloneServer(server, {
			listen: { port: PORT },
		});
		console.log(`🚀 Server ready at ${url}`);

		const significantGenes = await runR()
			.then((data: ResponseData) => {
				console.log("Processing Data...");

				if (!data.significantGenes || !Array.isArray(data.significantGenes)) {
					console.error("Error: significantGenes is missing or not an array.");
					return;
				}

				// Transform significantGenes into the new format
				const formattedResults = {
					updateAnalysisWithResultsId: "67c9c0dd12ca8bb8c2ec90a1", // Example ID
					results: {
						results: data.significantGenes.map((gene) => ({
							gene: {
								symbol: gene.symbol,
								description: `${gene.symbol} description` // Placeholder description
							},
							logFC: gene.logFC,
							avgExpr: gene.AveExpr,
							tValue: gene.t,
							pValue: gene.PValue,
							adjustedPValue: gene.adjPValue,
							bStat: gene.B
						}))
					},
					datasetInput: {
						name: "Lego",
						description: "Cool lego cat"
					}
				};

				// console.log("Formatted Data:", JSON.stringify(formattedResults, null, 2));
				// console.log("Formatted data: ", formattedResults.results)
				return formattedResults.results.results
			})
			.catch((err) => console.error("Error running R script:", err));

		console.log("Format data: ", significantGenes)

		if (significantGenes) {
			console.log("Formatted Data: ", significantGenes);

			const updatePayload = {
				analysisId: "67c9c0dd12ca8bb8c2ec90a1", // Example ID, replace as needed
				significantGenes: significantGenes, // Use results array here
			};


			console.log("Final Mutation Payload:", JSON.stringify(updatePayload, null, 2));

			// Call the function directly in Node.js
			await updateAnalysis(updatePayload.analysisId, updatePayload.significantGenes);

		}

	})
	.catch((error) => {
		console.error("Error connecting to MongoDB:", error);
	});



