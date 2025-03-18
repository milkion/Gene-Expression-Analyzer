import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./graphql/typeDefs.js";
import { resolvers } from "./graphql/resolvers.js";
import { ResponseData } from "./graphql/resolvers.js";
import fs from 'fs';
import mongoose from "mongoose";
import dotenv from "dotenv";
import { updateAnalysis } from "./graphql/mutation.js";
import { spawn } from "child_process";
import jwt from "jsonwebtoken";


dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "";

// Initialize Apollo Server
const server = new ApolloServer({
	typeDefs,
	resolvers,
});

const PORT = 4000;

function runR() {
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
					const jsonData = fs.readFileSync("public/significantGenes.json", "utf8");
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
			context: async ({ req }) => {
				// Get the token from the Authorization header
				const auth = req.headers.authorization || '';
				
				if (auth.startsWith('Bearer ')) {
					try {
						const token = auth.substring(7);
						const decoded = jwt.verify(token, process.env.JWT_SECRET);
						return { userId: decoded.userId };
					} catch (err) {
						// Invalid token
						console.log("Invalid token:", err);
					}
				}
				
				// Return empty context if no valid auth
				return {};
			},
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
					updateAnalysisWithResultsId: "67d5cfbe54276c3346158c43", // Example ID
					results: {
						results: data.significantGenes.map((gene) => ({
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
						}))
					},
					datasetInput: {
						name: "Lego",
						description: "Cool lego cat"
					}
				};
				return formattedResults.results.results
			})
			.catch((err) => console.error("Error running R script:", err));

		if (significantGenes) {
			console.log("Formatted Data: ", significantGenes);

			const updatePayload = {
				analysisId: "67d5cfbe54276c3346158c43", // Example ID, replace as needed
				results: { results: significantGenes }, // Use results array here
			};
			// Call the function directly in Node.js
			await updateAnalysis(updatePayload.analysisId, updatePayload.results);

		}

	})
	.catch((error) => {
		console.error("Error connecting to MongoDB:", error);
	});



