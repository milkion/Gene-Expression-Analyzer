import { Schema, model } from "mongoose";

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

export default model("Analysis", analysisSchema);
