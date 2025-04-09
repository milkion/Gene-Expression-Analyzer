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

import { useState, useRef } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import importIcon from "@/public/import.svg";
import { createAnalysis } from "../../backend/src/graphql/mutation";
import { SearchBar } from "./searchbar";

export function FileDropzone() {
	const [showDialog, setShowDialog] = useState(false);
	const [currentFile, setCurrentFile] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const fileNameRef = useRef<HTMLInputElement>(null);
	const descriptionRef = useRef<HTMLInputElement>(null);

	// TODO: dropzone function to be updated when in development
	const dropzone = useDropzone({
		onDropFile: async (file: File) => {
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

			const result = await createAnalysis(datasetInput);
			console.log("Analysis created:", result);

			// Trigger R script processing with the analysis ID
			if (result && result.id) {
				try {
					// Updated to use the correct backend URL - make sure this matches your backend server
					const response = await fetch('http://localhost:4000/api/process-analysis', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ analysisId: result.id }),
					});

					if (!response.ok) {
						const errorData = await response.json();
						throw new Error(errorData.error || "Failed to process analysis");
					}

					console.log('Analysis processing started');
				} catch (processError) {
					console.error("Error processing analysis:", processError);
					setError("File uploaded but analysis processing failed: " +
						(processError instanceof Error ? processError.message : String(processError)));
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
			<h2 className="text-2xl font-medium mb-4 ml-4">Dataset Upload</h2>
			<Dropzone {...dropzone}>
				<DropZoneArea className="min-h-[300px]">
					<DropzoneTrigger className="w-full flex flex-col items-center text-center pt-20 pb-16 gap-4 text-lg">
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
							Please ensure that the zip file contains the expression data and
							the phenotype data
						</p>
						{/* <SearchBar /> */}
					</DropzoneTrigger>
				</DropZoneArea>
			</Dropzone>

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
									<strong>File Description:</strong>{" "}
									<input
										ref={descriptionRef}
										className="w-full border rounded-md p-2"
										placeholder="Optional description"
									/>
								</p>
								<p>
									<strong>File Size:</strong>{" "}
									{(currentFile.size / (1024 * 1024)).toFixed(2)} MB
								</p>
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
