import { Schema, model } from "mongoose";

// Define the schema for cached gene data
const CachedGeneDataSchema = new Schema({
  geneSymbol: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  description: String,
  function: String,
  imageUrl: String,
  uniprotID: String,
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Set up cache expiration (30 days)
CachedGeneDataSchema.index({ lastUpdated: 1 }, { expireAfterSeconds: 2592000 });

// Define and export the model
export default model("CachedGeneData", CachedGeneDataSchema);