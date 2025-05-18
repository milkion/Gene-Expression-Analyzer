"use client";

import {
	Dropzone,
	DropZoneArea,
	DropzoneDescription,
	DropzoneFileList,
	DropzoneFileListItem,
	DropzoneMessage,
	DropzoneRemoveFile,
	DropzoneTrigger,
	useDropzone,
} from "@/components/ui/dropzone";

import { useState, useRef, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { gql, useQuery } from "@apollo/client";

import importIcon from "@/public/import.svg";
import { createAnalysis } from "../../backend/src/graphql/mutation";
import { SearchBar } from "./searchbar";

const CHECK_ANALYZING = gql`
	query CheckAnalyzing {
		getAnalyses {
			id
			status
		}
	}
`;

export function FileDropzone() {
	const [showDialog, setShowDialog] = useState(false);
	const [currentFile, setCurrentFile] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const fileNameRef = useRef<HTMLInputElement>(null);
	const descriptionRef = useRef<HTMLInputElement>(null);
	const wasAnalyzingRef = useRef(false);
	const getpValue = useRef<HTMLInputElement>(null);
	const getlogFC = useRef<HTMLInputElement>(null);

	// Check for analyzing reports
	const { data: analysisData, refetch } = useQuery(CHECK_ANALYZING);

	// Update the analyzing state when data changes
	useEffect(() => {
		if (analysisData?.getAnalyses) {
			const hasAnalyzingReport = analysisData.getAnalyses.some(
				(analysis: any) => analysis.status === "ANALYZING"
			);
			setIsAnalyzing(hasAnalyzingReport);
		}
	}, [analysisData]);

	// Add effect to refresh page when analysis completes
	useEffect(() => {
		// If we were analyzing before but not anymore, refresh the page
		if (wasAnalyzingRef.current && !isAnalyzing) {
			console.log("Analysis completed, refreshing page...");
			window.location.reload();
		}

		// Update the ref with current state for next check
		wasAnalyzingRef.current = isAnalyzing;
	}, [isAnalyzing]);

	// Poll for status changes every 10 seconds
	useEffect(() => {
		const interval = setInterval(() => {
			refetch();
		}, 10000);

		return () => clearInterval(interval);
	}, [refetch]);

	// TODO: dropzone function to be updated when in development
	const dropzone = useDropzone({
		onDropFile: async (file: File) => {
			if (isAnalyzing) {
				return {
					status: "error",
					error:
						"Analysis already in progress. Please wait until it completes.",
				};
			}

			await new Promise((resolve) => setTimeout(resolve, 1000));
			setCurrentFile(file);
			setShowDialog(true);
			return {
				status: "success",
				result: file,
			};
		},
		validation: {
			accept: {
				"application/gzip": [".zip"],
			},
			maxSize: 10 * 1024 * 1024,
			maxFiles: 1,
		},
	});

	const uploadAPI = async (file: File) => {
		try {
			const formData = new FormData();

			// ✅ Keep the original file and name without modification
			formData.append("file", file);

			const response = await fetch("http://localhost:4000/api/upload", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "File upload failed");
			}

			const data = await response.json();
			console.log("File uploaded successfully:", data);
			return data;
		} catch (error) {
			console.error("Error uploading file:", error);
			throw error;
		}
	};

	const handleProcessFile = async () => {
		if (!currentFile) return;

		setLoading(true);
		setError(null);

		try {
			const uploadResult = await uploadAPI(currentFile);
			console.log("Upload response:", uploadResult);

			const datasetInput = {
				name: fileNameRef.current?.value || currentFile.name,
				description: descriptionRef.current?.value || "",
				size: parseFloat((currentFile.size / (1024 * 1024)).toFixed(2)),
			};

			const logfc = getlogFC.current?.value;
			const pval = getpValue.current?.value;

			if (!logfc || isNaN(Number(logfc)) || !pval || isNaN(Number(pval))) {
				alert("Please enter valid numeric values for logFC and p-value thresholds!");
				return;
			}

			const result = await createAnalysis({
				datasetInput,
				logThreshold: Number(logfc),
				pThreshold: Number(pval)
			});

			// Trigger R script processing with the analysis ID
			if (result && result.id) {
				try {
					const response = await fetch(
						"http://localhost:4000/api/process-analysis",
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								Authorization: `Bearer ${localStorage.getItem("token")}`,
							},
							body: JSON.stringify({
								analysisId: result.id,
								log_threshold: logfc,
								p_threshold: pval,
							}),
						}
					);

					if (!response.ok) {
						const errorData = await response.json();
						throw new Error(errorData.error || "Failed to process analysis");
					}

					console.log("Analysis processing started");

					// Refresh the analysis status
					refetch();
				} catch (processError) {
					console.error("Error processing analysis:", processError);
					setError(
						"File uploaded but analysis processing failed: " +
						(processError instanceof Error
							? processError.message
							: String(processError))
					);
				}
			}

			// Close dialog after successful processing
			setShowDialog(false);
		} catch (err) {
			console.error("Error creating analysis:", err);
			setError("Failed to process file. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="px-20 py-8">
			<div className="backdrop-blur-md bg-white/30 p-6 rounded-3xl border border-white/40 shadow-xl">
				<h2 className="text-2xl font-medium my-4 ml-4">Dataset Upload</h2>
				<Dropzone {...dropzone}>
					<DropZoneArea
						className={`min-h-[300px] ${isAnalyzing ? "bg-gray-100/70 opacity-75" : "bg-white/20"
							} rounded-2xl`}
					>
						<DropzoneTrigger className="w-full flex flex-col items-center text-center pt-20 pb-16 gap-4 text-lg">
							{isAnalyzing ? (
								<div className="font-medium p-6 rounded-xl">
									<div className="flex items-center justify-center mb-4">
										<svg
											className="animate-spin -ml-1 mr-3 h-8 w-8"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												className="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="4"
											></circle>
											<path
												className="opacity-100"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
									</div>
									<p className="text-xl">Analysis in progress</p>
									<p className="mt-3">
										Please wait until the current analysis completes before
										uploading a new file.
									</p>
									<p className="mt-5 text-sm">
										You can view the progress in the Reports section.
									</p>
								</div>
							) : (
								<>
									<p>Drop your dataset here, or import from your local files</p>
									<DropzoneMessage className="mt-2 text-center">
										Supported format: .zip
									</DropzoneMessage>
									<img
										src={importIcon.src}
										alt="File icon"
										className="my-4 h-20 w-20"
									/>
									<p className="max-w-xl">
										Please ensure that the zip file contains the expression data
										and the phenotype data
									</p>
								</>
							)}
						</DropzoneTrigger>
					</DropZoneArea>
				</Dropzone>
			</div>

			<Dialog open={showDialog} onOpenChange={setShowDialog}>
				<DialogContent className="m:max-w-[425px] text-lg">
					<DialogHeader>
						<DialogTitle>File Uploaded Successfully</DialogTitle>
						<p>Your file has been uploaded and is ready for processing.</p>
					</DialogHeader>
					<div className="pt-2 pb-4">
						{currentFile && (
							<div className="flex flex-col gap-4">
								<p>
									<strong>File Name:</strong>{" "}
									<input
										ref={fileNameRef}
										defaultValue={currentFile.name}
										className="w-full border rounded-md p-2"
									/>
								</p>
								<p>
									<strong>File Keywords:</strong>{" "}
									<input
										ref={descriptionRef}
										className="w-full border rounded-md p-2"
										placeholder="Optional keywords"
									/>
								</p>
								<div className="flex gap-4">
									<p className="flex-1">
										<strong>P Value:</strong>{" "}
										<input
											ref={getpValue}
											type="number"
											className="w-full border rounded-md p-2"
											defaultValue="0.05"
											placeholder="Enter P Value"
										/>
									</p>
									<p className="flex-1">
										<strong>Log Fold Change:</strong>{" "}
										<input
											ref={getlogFC}
											type="number"
											className="w-full border rounded-md p-2"
											defaultValue="1"
											placeholder="Enter Log Fold Change"
										/>
									</p>
								</div>
								<p className="text-xs">P Value and Log Fold Values above are default values, adjust to your needs.</p>

							</div>
						)}
					</div>
					<DialogFooter>
						<Button onClick={() => setShowDialog(false)} disabled={loading}>
							Cancel
						</Button>
						<Button
							type="submit"
							onClick={handleProcessFile}
							disabled={loading}
						>
							{loading ? "Processing..." : "Process File"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
