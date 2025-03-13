"use client"; // ✅ Required because Apollo uses React hooks

import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "./globals.css";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";

const mulish = Mulish({
	variable: "--font-mulish",
	subsets: ["latin"],
});

// ✅ Setup Apollo Client
const client = new ApolloClient({
	uri: "http://localhost:4000/graphql", // ✅ Update with your backend GraphQL URL
	cache: new InMemoryCache(),
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${mulish.variable} antialiased`}>
				<ApolloProvider client={client}> {/* ✅ Wrap children with ApolloProvider */}
					{children}
				</ApolloProvider>
			</body>
		</html>
	);
}
