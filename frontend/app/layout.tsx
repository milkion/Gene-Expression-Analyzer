"use client"; // ✅ Required because Apollo uses React hooks

import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "./globals.css";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const mulish = Mulish({
	variable: "--font-mulish",
	subsets: ["latin"],
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const router = useRouter();
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [client, setClient] = useState<ApolloClient<any> | null>(null);

	useEffect(() => {
		const token = localStorage.getItem("token");
		setIsAuthenticated(true);

		const apolloClient = new ApolloClient({
			uri: "http://localhost:4000/graphql",
			cache: new InMemoryCache(),
			headers: {
				authorization: `Bearer ${token}`,
			},
		});
		setClient(apolloClient);
	}, [router]);

	return (
		<html lang="en">
			<body className={`${mulish.variable} antialiased`}>
				{client ? (
					<ApolloProvider client={client}>{children}</ApolloProvider>
				) : (
					<div className="h-screen flex items-center justify-center">
						Loading...
					</div>
				)}
			</body>
		</html>
	);
}
