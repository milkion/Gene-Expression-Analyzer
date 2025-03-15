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

import importIcon from "@/public/import.svg";
import { SearchBar } from "./search-bar";
import { searchGene } from "@/app/searchHandlers";

export function FileDropzone() {
	// TODO: dropzone function to be updated when in development
	const dropzone = useDropzone({
		onDropFile: async (file: File) => {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			return {
				status: "success",
				result: file,
			};
		},
		validation: {
			accept: {
				"image/*": [".png", ".jpg", ".jpeg", ".gif", ".svg"],
			},
			maxSize: 10 * 1024 * 1024,
			maxFiles: 1,
		},
	});
	return (
		<div className="p-8">
			<Dropzone {...dropzone}>
				<DropZoneArea>
					<DropzoneTrigger className="w-full flex flex-col items-center text-center py-20 gap-4 text-lg">
						<p>Drop your dataset here, or import from your local files</p>
						<img src={importIcon.src} alt="File icon" className="my-4 h-10" />
						<p>or search for dataset from the GEO database below</p>
						<SearchBar searchHandler={searchGene}/>
					</DropzoneTrigger>
				</DropZoneArea>
			</Dropzone>
		</div>
	);
}
