import { Schema, model } from "mongoose";
import Result from "./Result.js";
import Dataset from "./Dataset.js";
import Gene from "./Gene.js";
import Analysis from "./Analysis.js";

const analysisSchema = new Schema(
	{
		date: {
			type: Date,
			required: true,
			default: Date.now,
		},
		status: {
			type: String,
			required: true,
			enum: ["FETCHING", "PARSING", "ANALYZING", "COMPLETED", "FAILED"],
			default: "ANALYZING",
		},
		errorMessage: {
			type: String,
			required: false,
		},
		dataset: {
			type: Schema.Types.ObjectId,
			ref: "Dataset",
			required: true,
		},
		results: [
			{
				type: Schema.Types.ObjectId,
				ref: "Result",
			},
		],
		visualization: {
			type: String,
			required: false,
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
		updatedAt: {
			type: Date,
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
	}
);

// Pre-save middleware to convert dates to strings for GraphQL
analysisSchema.pre("save", function (next) {
	if (this.isModified()) {
		this.updatedAt = new Date();
	}
	next();
});

// Add pre-remove middleware to handle cascading deletion
analysisSchema.pre(
	"deleteOne",
	{ document: true, query: false },
	async function (next) {
		try {
			const analysis = this;

			// 1. Find all results associated with this analysis and get their gene IDs
			const results = await Result.find({ analysis: analysis._id });
			const geneIds = results.map((result) => result.gene);

			// 2. Delete all results associated with this analysis
			await Result.deleteMany({ analysis: analysis._id });

			// 3. Check and delete genes that are no longer referenced by any other results
			for (const geneId of geneIds) {
				const otherResultsWithGene = await Result.countDocuments({
					gene: geneId,
					analysis: { $ne: analysis._id },
				});

				if (otherResultsWithGene === 0) {
					// This gene is not used in any other results, safe to delete
					await Gene.findByIdAndDelete(geneId);
				}
			}

			// 4. Optionally delete the dataset if it's no longer needed
			// Uncomment if you want to delete datasets too
			const dataset = await Dataset.findById(analysis.dataset);
			if (
				dataset &&
				!(await Analysis.exists({
					dataset: dataset._id,
					_id: { $ne: analysis._id },
				}))
			) {
				await dataset.deleteOne();
			}

			next();
		} catch (error) {
			next(error);
		}
	}
);

export default model("Analysis", analysisSchema);
