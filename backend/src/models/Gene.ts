import { Schema, model } from "mongoose";

const geneSchema = new Schema({
	symbol: {
		type: String,
		required: true,
		unique: true,
		index: true,
	},
	description: {
		type: String,
		required: false,
	},
	function: {
		type: String,
		required: false,
	},
	pathway: {
		type: String,
		required: false,
	},
});

// Create text indexes for searching
geneSchema.index({ symbol: "text", description: "text" });

export default model("Gene", geneSchema);
