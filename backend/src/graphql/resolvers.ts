import Dataset from "../models/Dataset.js";
import Analysis from "../models/Analysis.js";
import Result from "../models/Result.js";
import Gene from "../models/Gene.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import ForumPost from "../models/ForumPost.js";
import Comment from "../models/Comment.js";
import { Schema, model } from "mongoose";

dotenv.config(); 
type ResolverParent = any;
type ResolverContext = { userId?: string }; 

// Define types for GraphQL arguments
interface AnalysisArgs {
	id: string;
}

interface DatasetInput {
	name: string;
	description: string;
	size: number;
}

interface CreateAnalysisArgs {
	datasetInput: DatasetInput;
}

interface DeleteAnalysisArgs {
	id: string;
}

interface UpdateAnalysisWithResultsArgs {
	id: string;
	results: {
		results: any[];
		visualization?: string;
	};
}

interface CreateAnalysisResultArgs {
	results: any; // This would be AnalysisResult input
}

// Define types for User-related arguments
interface UserArgs {
	id: string;
}

interface UserInput {
	name: string;
	email: string;
	password: string;
}

interface CreateUserArgs {
	userInput: UserInput;
}

interface LoginArgs {
	email: string;
	password: string;
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
		async me(
			_: ResolverParent,
			__: {},
			context: ResolverContext
		): Promise<any> {
			if (!context.userId) {
				throw new Error("Not authenticated");
			}

			try {
				const user = await User.findById(context.userId).select("-password"); // Hide password
				if (!user) {
					throw new Error("User not found");
				}
				return user;
			} catch (error) {
				throw new Error("Failed to fetch current user");
			}
		},
		async user(
			_: ResolverParent,
			{ id }: UserArgs,
			context: ResolverContext
		): Promise<any> {
			if (!context.userId) {
				throw new Error("Not authenticated");
			}

			try {
				const user = await User.findById(id);
				if (!user) {
					throw new Error(`User with ID ${id} not found`);
				}
				return user;
			} catch (error: unknown) {
				if (error instanceof Error) {
					throw new Error(`Failed to fetch user: ${error.message}`);
				}
				throw new Error("Failed to fetch user: Unknown error");
			}
		},
		async checkAnalysesExist(_: any, { ids }: { ids: string[] }): Promise<string[]> {
			try {
				const existingAnalyses = await Analysis.find({ _id: { $in: ids } }).select('_id');
				return existingAnalyses.map(analysis => analysis._id.toString());
			} catch (error) {
				console.error("Error checking analyses existence:", error);
				throw new Error(`Failed to check analyses: ${error instanceof Error ? error.message : 'Unknown error'}`);
			}
		},
		async forumPosts() {
			try {
				return await ForumPost.find()
					.sort({ createdAt: -1 })
					.populate('author')
					.populate('comments');
			} catch (error) {
				throw new Error(`Failed to fetch forum posts: ${error.message}`);
			}
		},
		async forumPost(_, { id }) {
			try {
				const post = await ForumPost.findById(id)
					.populate('author')
					.populate({
						path: 'comments',
						populate: { path: 'author' },
						options: { sort: { createdAt: 1 } }
					});
				
				if (!post) {
					throw new Error(`Forum post with ID ${id} not found`);
				}
				
				return post;
			} catch (error) {
				throw new Error(`Failed to fetch forum post: ${error.message}`);
			}
		}
	},
	Mutation: {
		async createAnalysis(
			_: ResolverParent,
			{ datasetInput: { name, description, size } }: CreateAnalysisArgs
		): Promise<any> {
			try {
				// Create a new dataset
				const dataset = new Dataset({
					name: name,
					description: description,
					uploadedAt: new Date(),
					size: size,
				});

				const savedDataset = await dataset.save();

				// Create a new analysis linked to this dataset
				const analysis = new Analysis({
					date: new Date(),
					status: "ANALYZING", // Initial status
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
		async deleteAnalysis(_, { id }) {
			try {
				// Find the analysis first
				const analysis = await Analysis.findById(id);

				if (!analysis) {
					throw new Error(`Analysis with ID ${id} not found`);
				}

				// Using findByIdAndDelete won't trigger the middleware
				// So we need to use findById + deleteOne instead
				await analysis.deleteOne();

				return true; // Return boolean instead of object
			} catch (error) {
				console.error("Error deleting analysis:", error);
				throw new Error(`Failed to delete analysis: ${error.message}`);
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
							} else {
								// Update gene if found but preserve existing data
								gene.uniprotID = resultData.gene.uniprotID || gene.uniprotID;
								await gene.save();
							}
						} else {
							// Try to find by symbol first
							gene = await Gene.findOne({ symbol: resultData.gene.symbol });
							if (gene) {
								// Update with new data but preserve existing fields
								gene.uniprotID = resultData.gene.uniprotID || gene.uniprotID;
								await gene.save();
							} else {
								// Create new gene
								gene = new Gene(resultData.gene);
								await gene.save();
							}
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

				// Explicitly handle visualization data (ensuring it accepts a string)
				analysis.visualization = results.visualization;

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
		async createUser(
			_: ResolverParent,
			{ userInput }: CreateUserArgs
		): Promise<{ token: string; user: any }> {
			try {
				const existingUser = await User.findOne({ email: userInput.email });
				if (existingUser) {
					throw new Error("Email already exists");
				}

				const hashedPassword = await bcrypt.hash(userInput.password, 10);

				const newUser = new User({
					name: userInput.name,
					email: userInput.email,
					password: hashedPassword, // Fixed: Use hashed password
				});

				const savedUser = await newUser.save();

				if (!process.env.JWT_SECRET) {
					throw new Error("JWT_SECRET environment variable is not defined");
				}

				const token = jwt.sign(
					{ userId: savedUser.id },
					process.env.JWT_SECRET!,
					{ expiresIn: "1d" }
				);

				return {
					token,
					user: {
						id: savedUser.id,
						name: savedUser.name,
						email: savedUser.email,
						createdAt: savedUser.createdAt,
					},
				};
			} catch (error) {
				throw new Error(
					`Failed to create user: ${
						error instanceof Error ? error.message : "Unknown error"
					}`
				);
			}
		},
		async login(
			_: ResolverParent,
			{ email, password }: LoginArgs
		): Promise<{ token: string; user: any }> {
			try {
				const user = await User.findOne({ email });
				if (!user) {
					throw new Error("User not found");
				}

				const isPasswordValid = await bcrypt.compare(password, user.password);
				if (!isPasswordValid) {
					throw new Error("Invalid password");
				}

				const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
					expiresIn: "1d",
				});

				return {
					token,
					user: {
						id: user.id,
						name: user.name,
						email: user.email,
						createdAt: user.createdAt,
					},
				};
			} catch (error) {
				throw new Error(
					`Failed to log in: ${
						error instanceof Error ? error.message : "Unknown error"
					}`
				);
			}
		},
		async updateAnalysisStatus(
			_: any,
			{
				id,
				status,
				errorMessage,
			}: {
				id: string;
				status: "FETCHING" | "PARSING" | "ANALYZING" | "COMPLETED" | "FAILED";
				errorMessage?: string;
			}
		) {
			try {
				const analysis = await Analysis.findById(id);
				if (!analysis) {
					throw new Error(`Analysis with ID ${id} not found`);
				}

				analysis.status = status;
				if (errorMessage) {
					analysis.errorMessage = errorMessage;
				}
				await analysis.save();

				return analysis;
			} catch (error) {
				console.error("Error updating analysis status:", error);
				throw error;
			}
		},
		async createForumPost(_, { postInput }, context) {
			if (!context.userId) {
				throw new Error('Not authenticated');
			}
			
			try {
				const post = new ForumPost({
					title: postInput.title,
					content: postInput.content,
					author: context.userId,
					analysisId: postInput.analysisId || null,
					comments: []
				});
				
				const savedPost = await post.save();
				await savedPost.populate('author');
				
				return savedPost;
			} catch (error) {
				throw new Error(`Failed to create forum post: ${error.message}`);
			}
		},
		async addComment(_, { postId, content }, context) {
			if (!context.userId) {
				throw new Error('Not authenticated');
			}
			
			try {
				const post = await ForumPost.findById(postId);
				if (!post) {
					throw new Error(`Forum post with ID ${postId} not found`);
				}
				
				const comment = new Comment({
					content,
					author: context.userId,
					post: postId
				});
				
				const savedComment = await comment.save();
				
				// Add comment to post's comments array
				post.comments.push(savedComment._id);
				await post.save();
				
				await savedComment.populate('author');
				
				return savedComment;
			} catch (error) {
				throw new Error(`Failed to add comment: ${error.message}`);
			}
		},
		async deleteForumPost(_, { id }, context) {
			if (!context.userId) {
				throw new Error('Not authenticated');
			}
			
			try {
				const post = await ForumPost.findById(id);
				if (!post) {
					throw new Error(`Forum post with ID ${id} not found`);
				}
				
				// Check if user is the author
				if (post.author.toString() !== context.userId) {
					throw new Error('Not authorized to delete this post');
				}
				
				// Delete all comments associated with this post
				await Comment.deleteMany({ post: id });
				
				// Delete the post
				await ForumPost.findByIdAndDelete(id);
				
				return true;
			} catch (error) {
				throw new Error(`Failed to delete forum post: ${error.message}`);
			}
		},
		async deleteComment(_, { id }, context) {
			if (!context.userId) {
				throw new Error('Not authenticated');
			}
			
			try {
				const comment = await Comment.findById(id);
				if (!comment) {
					throw new Error(`Comment with ID ${id} not found`);
				}
				
				// Check if user is the author
				if (comment.author.toString() !== context.userId) {
					throw new Error('Not authorized to delete this comment');
				}
				
				// Remove comment from post's comments array
				await ForumPost.updateOne(
					{ _id: comment.post },
					{ $pull: { comments: id } }
				);
				
				// Delete the comment
				await Comment.findByIdAndDelete(id);
				
				return true;
			} catch (error) {
				throw new Error(`Failed to delete comment: ${error.message}`);
			}
		}
	},
	// Field resolvers
	// Field Resolvers to Hide Password
	User: {
		id(parent: any): string {
			return parent.id.toString();
		},
		createdAt(parent: any): string {
			return parent.createdAt.toISOString();
		},
	},
	Analysis: {
		async result(parent: any): Promise<any> {
			try {
				if (!parent.results || parent.results.length === 0) {
					return {
						results: [],
						visualization: parent.visualization,
					};
				}

				const results = await Result.find({
					_id: { $in: parent.results },
				}).populate("gene");

				return {
					results,
					visualization: parent.visualization,
				};
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
