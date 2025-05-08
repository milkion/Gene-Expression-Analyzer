"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { NavigationBar } from "@/components/navigation-bar";
import { gql, useQuery, useMutation } from "@apollo/client";
import Protected from "@/components/Protected";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import background from "@/public/background4.png"; // Import the background image

// GraphQL queries and mutations
const GET_FORUM_POST = gql`
	query GetForumPost($id: ID!) {
		forumPost(id: $id) {
			id
			title
			content
			createdAt
			author {
				id
				name
			}
			comments {
				id
				content
				createdAt
				author {
					id
					name
				}
			}
			analysisId
		}
	}
`;

const ADD_COMMENT = gql`
	mutation AddComment($postId: ID!, $content: String!) {
		addComment(postId: $postId, content: $content) {
			id
			content
			createdAt
			author {
				id
				name
			}
		}
	}
`;

const DELETE_COMMENT = gql`
	mutation DeleteComment($id: ID!) {
		deleteComment(id: $id)
	}
`;

const GET_CURRENT_USER = gql`
	query GetCurrentUser {
		me {
			id
		}
	}
`;

export default function PostDetailPage() {
	const params = useParams();
	const router = useRouter();
	const postId = params.id as string;
	const [commentContent, setCommentContent] = useState("");
	const [error, setError] = useState("");
	const [toast, setToast] = useState({ show: false, message: "", type: "" });

	// Function to show toast messages
	const showToast = (message, type = "error") => {
		setToast({ show: true, message, type });
		// Auto-hide after 3 seconds
		setTimeout(() => {
			setToast({ show: false, message: "", type: "" });
		}, 3000);
	};

	// Fetch post details
	const {
		loading,
		error: queryError,
		data,
		refetch,
	} = useQuery(GET_FORUM_POST, {
		variables: { id: postId },
		fetchPolicy: "network-only",
	});

	// Get current user
	const { data: userData } = useQuery(GET_CURRENT_USER);
	const currentUserId = userData?.me?.id;

	// Add comment mutation
	const [addComment, { loading: commentLoading }] = useMutation(ADD_COMMENT, {
		onCompleted: () => {
			setCommentContent("");
			refetch();
		},
		onError: (error) => {
			setError(error.message);
		},
	});

	// Delete comment mutation
	const [deleteComment] = useMutation(DELETE_COMMENT, {
		onCompleted: () => {
			refetch();
		},
	});

	// Handle comment submission
	const handleAddComment = async () => {
		if (!commentContent.trim()) {
			setError("Comment cannot be empty");
			return;
		}

		try {
			await addComment({
				variables: {
					postId,
					content: commentContent,
				},
			});
		} catch (err) {
			console.error("Error adding comment:", err);
		}
	};

	// Handle comment deletion
	const handleDeleteComment = async (id, authorId) => {
		// Check if the current user is the author
		if (currentUserId !== authorId) {
			showToast("You can only delete your own comments.");
			return;
		}

		if (confirm("Are you sure you want to delete this comment?")) {
			try {
				await deleteComment({
					variables: { id },
				});
			} catch (err) {
				console.error("Error deleting comment:", err);

				// Show error toast if the server rejects the deletion
				if (err.message.includes("Not authorized")) {
					showToast("You can only delete your own comments.");
				} else {
					showToast("Failed to delete comment. Please try again.");
				}
			}
		}
	};

	// Navigate to analysis detail if shared
	const navigateToAnalysis = () => {
		if (data?.forumPost?.analysisId) {
			router.push(`/reports/${data.forumPost.analysisId}`);
		}
	};

	// Format date for display
	const formatDate = (dateString: string) => {
		return new Date(parseInt(dateString)).toLocaleString();
	};

	if (loading) return <p className="p-8 text-center">Loading post...</p>;
	if (queryError)
		return (
			<p className="p-8 text-center text-red-500">
				Error: {queryError.message}
			</p>
		);
	if (!data?.forumPost)
		return <p className="p-8 text-center">Post not found</p>;

	const post = data.forumPost;

	return (
		<Protected>
			<div>
				<NavigationBar />

				{/* Fixed Background Image */}
				<div
					className="fixed top-[72px] left-0 right-0 bottom-0 bg-cover bg-center bg-no-repeat animate-pulse-slow overflow-hidden"
					style={{
						backgroundImage: `url(${background.src})`,
						zIndex: -1,
						transformOrigin: "center center",
						opacity: 0.6,
					}}
				/>

				{/* Add custom toast component */}
				{toast.show && (
					<div
						className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-md ${
							toast.type === "error" ? "bg-red-500" : "bg-green-500"
						} text-white`}
					>
						{toast.message}
					</div>
				)}

				<div className="p-4 mx-8 relative z-10">
					<div className="flex items-center gap-2 text-gray-600 mt-4 mx-4">
						<span
							className="cursor-pointer hover:underline"
							onClick={() => router.push("/forum")}
						>
							Forum
						</span>
						<span>{">"}</span>
						<span>{post.title}</span>
					</div>

					<div className="backdrop-blur-md bg-white/30 min-h-screen rounded-3xl py-10 px-10 mt-6 border border-white/40 shadow-xl">
						{/* Post Header - with analysis button positioned top right */}
						<div>
							<div className="flex justify-between items-start">
								<h1 className="text-2xl font-medium">{post.title}</h1>
								
								{post.analysisId && (
									<Button 
										variant="outline" 
										className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
										onClick={navigateToAnalysis}
									>
										View Shared Analysis
									</Button>
								)}
							</div>
							
							<div className="flex items-center text-sm text-gray-500 mt-2">
								<span>Posted by {post.author.name}</span>
								<span className="mx-2">•</span>
								<span>{formatDate(post.createdAt)}</span>
							</div>
							
							<div className="mt-6 text-gray-700 whitespace-pre-line text-lg">
								{post.content}
							</div>
						</div>
						
						{/* Comments Section */}
						<div className="mt-8">
							<h2 className="text-xl font-medium mb-4">Comments ({post.comments.length})</h2>
							
							{/* Add Comment Form */}
							<div className="bg-white/40 backdrop-blur-sm rounded-xl p-6 shadow-sm mb-6 border border-white/40">
								<h3 className="text-lg font-medium mb-3">Add a Comment</h3>

								{error && (
									<Alert variant="destructive" className="mb-4">
										<AlertDescription>{error}</AlertDescription>
									</Alert>
								)}

								<Textarea
									value={commentContent}
									onChange={(e) => setCommentContent(e.target.value)}
									placeholder="Share your thoughts..."
									rows={3}
									className="mb-3"
								/>

								<Button
									onClick={handleAddComment}
									disabled={commentLoading}
									className="bg-black hover:bg-gray-800 text-white"
								>
									{commentLoading ? "Posting..." : "Post Comment"}
								</Button>
							</div>

							{/* Comments List */}
							{post.comments.length === 0 ? (
								<div className="text-center py-8 bg-white/40 backdrop-blur-sm rounded-xl border border-white/40">
									<p className="text-gray-500">
										No comments yet. Be the first to comment!
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{post.comments.map((comment) => (
										<div
											key={comment.id}
											className="bg-white/40 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/40"
										>
											<div className="flex justify-between items-start">
												<div className="flex items-center text-sm text-gray-500">
													<span className="font-medium text-gray-700">
														{comment.author.name}
													</span>
													<span className="mx-2">•</span>
													<span>{formatDate(comment.createdAt)}</span>
												</div>

												<button
													onClick={() =>
														handleDeleteComment(comment.id, comment.author.id)
													}
													className={`text-gray-400 hover:text-red-500 ${
														currentUserId !== comment.author.id ? "hidden" : ""
													}`}
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="16"
														height="16"
														fill="currentColor"
														viewBox="0 0 16 16"
													>
														<path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
														<path
															fillRule="evenodd"
															d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
														/>
													</svg>
												</button>
											</div>

											<div className="mt-3 text-gray-700 whitespace-pre-line">
												{comment.content}
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</Protected>
	);
}
