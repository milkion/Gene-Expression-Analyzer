import { Schema, model } from "mongoose";

const datasetSchema = new Schema({
	name: String,
	description: String,
	uploadedAt: {
		type: Date,
		required: true,
		default: Date.now,
	},
	size: {
		type: Number,
		required: true,
	},
});

export default model("Dataset", datasetSchema);
