"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Protected({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			router.push("/login"); // 🔄 Redirect to login if not authenticated
		} else {
			setIsAuthenticated(true);
		}
	}, [router]);

	if (!isAuthenticated) return null; // ⏳ Prevent rendering protected content until authentication is checked

	return <>{children}</>;
}
