import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./graphql/typeDefs.js";
import { resolvers } from "./graphql/resolvers.js";
import { ResponseData } from "./graphql/resolvers.js";
import fs from 'fs';
import csv from "csv-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
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


