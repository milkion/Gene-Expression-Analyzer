import Dataset from "../models/Dataset.js";
import Analysis from "../models/Analysis.js";
import Result from "../models/Result.js";
import Gene from "../models/Gene.js";
import mongoose from "mongoose";

// Define types for resolver parameters and context
type ResolverParent = any;
type ResolverContext = any;

// Define types for GraphQL arguments
interface AnalysisArgs {
	id: string;
}

interface DatasetInput {
	name: string;
	description: string;
}

interface CreateAnalysisArgs {
	datasetInput: DatasetInput;
}

interface DeleteAnalysisArgs {
	id: string;
}

interface UpdateAnalysisWithResultsArgs {
	id: string;
	results: any; // This would be AnalysisResult input
}

interface CreateAnalysisResultArgs {
	results: any; // This would be AnalysisResult input
}

interface GeneData {
	symbol: string;
	logFC: number;
	AveExpr: number;
	t: number;
	PValue: number;
	adjPValue: number;
	B: number;
	_row: string;
}

export interface ResponseData {
	significantGenes: GeneData[];
}

// Tell Apollo server how we should fetch data associated with each type
export const resolvers = {
	Query: {
		async getAnalyses(): Promise<any[]> {
			try {
				return await Analysis.find().populate("dataset").populate("results");
			} catch (error: unknown) {
				if (error instanceof Error) {
					throw new Error(`Failed to fetch analyses: ${error.message}`);
				}
				throw new Error("Failed to fetch analyses: Unknown error");
			}
		},
		async analysis(_: ResolverParent, { id }: AnalysisArgs): Promise<any> {
			try {
				const analysis = await Analysis.findById(id)
					.populate("dataset")
					.populate({
						path: "results",
						populate: { path: "gene" },
					});

				if (!analysis) {
					throw new Error(`Analysis with ID ${id} not found`);
				}

				return analysis;
			} catch (error: unknown) {
				if (error instanceof Error) {
					throw new Error(`Failed to fetch analysis: ${error.message}`);
				}
				throw new Error("Failed to fetch analysis: Unknown error");
			}
		},
	},
	Mutation: {
		async createAnalysis(
			_: ResolverParent,
			{ datasetInput: { name, description } }: CreateAnalysisArgs
		): Promise<any> {
			try {
				// Create a new dataset
				const dataset = new Dataset({
					name: name,
					description: description,
					uploadedAt: new Date(),
					size: 0, // To change (or maybe remove)
				});

				const savedDataset = await dataset.save();

				// Create a new analysis linked to this dataset
				const analysis = new Analysis({
					date: new Date(),
					status: "FETCHING", // Initial status
					dataset: savedDataset._id,
					results: [],
					visualization: null,
				});

				const savedAnalysis = await analysis.save();

				// Populate the dataset field for the response
				await savedAnalysis.populate("dataset");

				return savedAnalysis;
			} catch (error: unknown) {
				if (error instanceof Error) {
					throw new Error(`Failed to create analysis: ${error.message}`);
				}
				throw new Error("Failed to create analysis: Unknown error");
			}
		},
		async deleteAnalysis(
			_: ResolverParent,
			{ id }: DeleteAnalysisArgs
		): Promise<boolean> {
			try {
				// Find the analysis to get associated results
				const analysis = await Analysis.findById(id);

				if (!analysis) {
					throw new Error(`Analysis with ID ${id} not found`);
				}

				// Delete associated results
				if (analysis.results && analysis.results.length > 0) {
					await Result.deleteMany({ _id: { $in: analysis.results } });
				}

				// Delete the analysis itself
				const deleteResult = await Analysis.findByIdAndDelete(id);

				return !!deleteResult; // Return true if deletion was successful
			} catch (error: unknown) {
				if (error instanceof Error) {
					throw new Error(`Failed to delete analysis: ${error.message}`);
				}
				throw new Error("Failed to delete analysis: Unknown error");
			}
		},
		async updateAnalysisWithResults(
			_: ResolverParent,
			{ id, results }: UpdateAnalysisWithResultsArgs
		): Promise<any> {
			try {
				// Find the analysis to update
				const analysis = await Analysis.findById(id);

				if (!analysis) {
					throw new Error(`Analysis with ID ${id} not found`);
				}

				// Create results and save them
				const resultIds = [];

				if (results.results && results.results.length > 0) {
					for (const resultData of results.results) {
						// Create or find gene
						let gene;
						if (resultData.gene.id) {
							gene = await Gene.findById(resultData.gene.id);
							if (!gene) {
								gene = new Gene(resultData.gene);
								await gene.save();
							}
						} else {
							gene = new Gene(resultData.gene);
							await gene.save();
						}

						// Create result
						const result = new Result({
							gene: gene._id,
							analysis: id,
							logFC: resultData.logFC,
							avgExpr: resultData.avgExpr,
							tValue: resultData.tValue,
							pValue: resultData.pValue,
							adjustedPValue: resultData.adjustedPValue,
							bStat: resultData.bStat,
						});

						const savedResult = await result.save();
						resultIds.push(savedResult._id);
					}
				}

				// Update analysis with results and status
				analysis.results = resultIds;
				analysis.status = "COMPLETED";
				analysis.visualization = results.visualization || null;

				const updatedAnalysis = await analysis.save();

				// Populate related fields
				await updatedAnalysis.populate("dataset");
				await updatedAnalysis.populate({
					path: "results",
					populate: { path: "gene" },
				});

				return updatedAnalysis;
			} catch (error: unknown) {
				if (error instanceof Error) {
					throw new Error(
						`Failed to update analysis with results: ${error.message}`
					);
				}
				throw new Error(
					"Failed to update analysis with results: Unknown error"
				);
			}
		},
	},
	// Field resolvers
	Analysis: {
		async result(parent: any): Promise<any[]> {
			try {
				if (parent.results.length === 0) return [];

				return await Result.find({ _id: { $in: parent.results } }).populate(
					"gene"
				);
			} catch (error: unknown) {
				if (error instanceof Error) {
					throw new Error(`Failed to fetch results: ${error.message}`);
				}
				throw new Error("Failed to fetch results: Unknown error");
			}
		},
		async dataset(parent: any): Promise<any> {
			try {
				if (parent.dataset instanceof mongoose.Types.ObjectId) {
					return await Dataset.findById(parent.dataset);
				}
				return parent.dataset;
			} catch (error: unknown) {
				if (error instanceof Error) {
					throw new Error(`Failed to fetch dataset: ${error.message}`);
				}
				throw new Error("Failed to fetch dataset: Unknown error");
			}
		},
	},
	Result: {
		id(parent: any): string {
			return parent._id.toString();
		},
		async gene(parent: any): Promise<any> {
			try {
				if (parent.gene instanceof mongoose.Types.ObjectId) {
					return await Gene.findById(parent.gene);
				}
				return parent.gene;
			} catch (error: unknown) {
				if (error instanceof Error) {
					throw new Error(`Failed to fetch gene: ${error.message}`);
				}
				throw new Error("Failed to fetch gene: Unknown error");
			}
		},
	},
};


