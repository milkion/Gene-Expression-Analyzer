"use client";

import { NavigationBar } from "@/components/navigation-bar";
import { FileDropzone } from "@/components/dropzone";

export default function Home() {
	return (
		<div>
			<NavigationBar />
			<FileDropzone />
		</div>
	);
}
