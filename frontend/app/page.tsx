"use client";

import { NavigationBar } from "@/components/navigation-bar";
import { FileDropzone } from "@/components/dropzone";
import { QuickHistory } from "@/components/quick-history";
import Protected from "@/components/Protected";

export default function Home() {
	return (
		<Protected>
			<div>
				<NavigationBar />
				<FileDropzone />
				<QuickHistory />
			</div>
		</Protected>
	);
}
