import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

// User interface
export interface IUser extends Document {
	name: string;
	email: string;
	password: string; // Added password field
	createdAt: Date;
	validatePassword(candidatePassword: string): Promise<boolean>; // Method for password validation
}

// User schema
const UserSchema: Schema<IUser> = new Schema({
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
	password: {
		type: String,
		required: true,
		minlength: 6, // Enforce password length
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

// Hash password before saving
UserSchema.pre<IUser>("save", async function (next) {
	if (!this.isModified("password")) {
		return next(); // Skip if password isn't changed
	}

	const saltRounds = 10;
	this.password = await bcrypt.hash(this.password, saltRounds);
	next();
});


// Method to validate password on login
UserSchema.methods.validatePassword = async function (this: IUser, candidatePassword: string): Promise<boolean> {
	return bcrypt.compare(candidatePassword, this.password);
};

// Hide password field from API responses
UserSchema.set("toJSON", {
	transform: function (doc, ret) {
		delete ret.password;
		return ret;
	},
});

// Create and export User model
export default mongoose.model<IUser>("User", UserSchema);
