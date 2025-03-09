import mongoose, { Document, Schema } from "mongoose";

// User interface
export interface IUser extends Document {
	name: string;
	email: string;
	createdAt: Date;
}

// User schema
const UserSchema: Schema = new Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		lowercase: true,
		match: [
			/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
			"Please provide a valid email address",
		],
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

// Create and export User model
export default mongoose.model<IUser>("User", UserSchema);
