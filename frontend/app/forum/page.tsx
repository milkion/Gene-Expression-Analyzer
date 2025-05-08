"use client";

import { useState, useEffect } from "react";
import { NavigationBar } from "@/components/navigation-bar";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import Protected from "@/components/Protected";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

// GraphQL queries and mutations
const GET_FORUM_POSTS = gql`
  query GetForumPosts {
    forumPosts {
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
      }
      analysisId
    }
  }
`;

const CREATE_FORUM_POST = gql`
  mutation CreateForumPost($postInput: ForumPostInput!) {
    createForumPost(postInput: $postInput) {
      id
      title
      content
      createdAt
      author {
        id
        name
      }
      analysisId
    }
  }
`;

const DELETE_FORUM_POST = gql`
  mutation DeleteForumPost($id: ID!) {
    deleteForumPost(id: $id)
  }
`;

// Get user analyses for sharing
const GET_USER_ANALYSES = gql`
  query GetUserAnalyses {
    getAnalyses {
      id
      status
      dataset {
        name
      }
    }
  }
`;

// Add this query to get the current user's ID
const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
    }
  }
`;

export default function ForumPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedAnalysis, setSelectedAnalysis] = useState("");
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
  
  // Fetch forum posts
  const { loading, error: queryError, data, refetch } = useQuery(GET_FORUM_POSTS, {
    fetchPolicy: "network-only"
  });
  
  // Fetch user analyses for sharing
  const { data: analysesData } = useQuery(GET_USER_ANALYSES);
  
  // Get current user
  const { data: userData } = useQuery(GET_CURRENT_USER);
  const currentUserId = userData?.me?.id;
  
  // Create post mutation
  const [createPost, { loading: createLoading }] = useMutation(CREATE_FORUM_POST, {
    onCompleted: () => {
      setShowCreateDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      setError(error.message);
    }
  });
  
  // Delete post mutation
  const [deletePost] = useMutation(DELETE_FORUM_POST, {
    onCompleted: () => {
      refetch();
    }
  });
  
  // Reset form fields
  const resetForm = () => {
    setTitle("");
    setContent("");
    setSelectedAnalysis("");
    setError("");
  };
  
  // Handle post creation
  const handleCreatePost = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    
    if (!content.trim()) {
      setError("Content is required");
      return;
    }
    
    try {
      await createPost({
        variables: {
          postInput: {
            title,
            content,
            analysisId: selectedAnalysis || null
          }
        }
      });
    } catch (err) {
      console.error("Error creating post:", err);
    }
  };
  
  // Update the delete post handler to check ownership
  const handleDeletePost = async (e, id, authorId) => {
    e.stopPropagation(); // Prevent navigation to post details
    
    // Check if the current user is the author
    if (currentUserId !== authorId) {
      showToast("You can only delete your own posts.");
      return;
    }
    
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost({
          variables: { id }
        });
      } catch (err) {
        console.error("Error deleting post:", err);
        
        // Show error toast if the server rejects the deletion
        if (err.message.includes("Not authorized")) {
          showToast("You can only delete your own posts.");
        } else {
          showToast("Failed to delete post. Please try again.");
        }
      }
    }
  };
  
  // Navigate to post detail page
  const navigateToPost = (postId: string) => {
    router.push(`/forum/${postId}`);
  };
  
  // Filter posts based on search query
  const filteredPosts = data?.forumPosts.filter((post) => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(parseInt(dateString)).toLocaleString();
  };
  
  return (
    <Protected>
      <div>
        <NavigationBar />
        {/* Add custom toast component */}
        {toast.show && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-md ${
            toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
          } text-white`}>
            {toast.message}
          </div>
        )}
        
        <div className="p-4 mx-8">
          <div className="flex justify-between items-center mb-6 pt-2 pl-4">
            <div className="flex-1">
              <input 
                type="text"
                placeholder="Search forum posts"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-2 w-full max-w-md rounded-3xl px-5 py-2"
              />
            </div>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-black hover:bg-gray-800 text-white rounded-xl px-4 py-2"
            >
              Create New Post
            </Button>
          </div>
          
          <div className="bg-slate-100 min-h-screen rounded-3xl py-10 px-10">
            <h1 className="text-2xl font-medium mb-6">Community Forum</h1>
            
            {loading ? (
              <p className="text-center py-8">Loading posts...</p>
            ) : queryError ? (
              <p className="text-center text-red-500 py-8">Error loading posts: {queryError.message}</p>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-xl">
                <p className="text-gray-500">No posts found. Be the first to create a post!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <div 
                    key={post.id}
                    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigateToPost(post.id)}
                  >
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-medium">{post.title}</h2>
                      <button
                        onClick={(e) => {
                          handleDeletePost(e, post.id, post.author.id);
                        }}
                        className={`text-gray-400 hover:text-red-500 ${currentUserId !== post.author.id ? 'hidden' : ''}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                          <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                        </svg>
                      </button>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mt-2">
                      <span>By {post.author.name}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(post.createdAt)}</span>
                      <span className="mx-2">•</span>
                      <span>{post.comments.length} comments</span>
                    </div>
                    
                    {post.analysisId && (
                      <div className="mt-2 inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Shared Analysis
                      </div>
                    )}
                    
                    <p className="mt-4 text-gray-700 line-clamp-3">{post.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Create Post Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
            </DialogHeader>
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Title</label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter post title"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">Content</label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts, questions, or insights..."
                  rows={6}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="analysis" className="text-sm font-medium">Share Analysis (Optional)</label>
                <select
                  id="analysis"
                  value={selectedAnalysis}
                  onChange={(e) => setSelectedAnalysis(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">None</option>
                  {analysesData?.getAnalyses
                    .filter(analysis => analysis.status === "COMPLETED")
                    .map(analysis => (
                      <option key={analysis.id} value={analysis.id}>
                        {analysis.dataset.name} ({analysis.id})
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500">
                  Only completed analyses can be shared
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePost} disabled={createLoading}>
                {createLoading ? "Creating..." : "Create Post"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Protected>
  );
} 