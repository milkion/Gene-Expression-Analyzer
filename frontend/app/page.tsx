"use client";
import { NavigationBar } from "@/components/navigation-bar";
import { FileDropzone } from "@/components/dropzone";
import { SearchBar } from "@/components/search-bar";
import { searchGene } from "./searchHandlers";

export default function Home() {
	return (
		<div>
			<NavigationBar />
			<FileDropzone />
		</div>
	);
}
