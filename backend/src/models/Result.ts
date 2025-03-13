import { Schema, model } from "mongoose";

const resultSchema = new Schema({
	gene: {
		type: Schema.Types.ObjectId,
		ref: "Gene",
		required: true,
	},
	analysis: {
		type: Schema.Types.ObjectId,
		ref: "Analysis",
		required: true,
	},
	logFC: {
		type: Number,
		required: true,
	},
	avgExpr: {
		type: Number,
		required: true,
	},
	tValue: {
		type: Number,
		required: true,
	},
	pValue: {
		type: Number,
		required: true,
	},
	adjustedPValue: {
		type: Number,
		required: true,
	},
	bStat: {
		type: Number,
		required: true,
	},
});

// Index for faster queries
resultSchema.index({ gene: 1, analysis: 1 });
resultSchema.index({ pValue: 1 });
resultSchema.index({ adjustedPValue: 1 });

export default model("Result", resultSchema);
