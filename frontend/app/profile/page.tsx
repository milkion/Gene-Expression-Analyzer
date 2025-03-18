"use client";

import { NavigationBar } from "@/components/navigation-bar";
import profileIcon from "@/public/profile-icon.svg";
import Image from "next/image";
import { gql, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";

// Define the GraphQL Query to fetch current user
const ME_QUERY = gql`
	query GetCurrentUser {
		me {
			id
			name
			email
			createdAt
		}
	}
`;

export default function Profile() {
	const { loading, error, data } = useQuery(ME_QUERY);
	const [isClient, setIsClient] = useState(false);

	// Handle client-side localStorage access
	useEffect(() => {
		setIsClient(true);
	}, []);

	return (
		<div>
			<NavigationBar />
			<div className="mt-6 mb-2 ml-16">
				<p>Profile</p>
			</div>
			<div className="w-full h-[85vh] px-8 pb-8">
				<div className="bg-slate-100 rounded-3xl py-10 flex flex-col items-center justify-center h-full">
					<div className="w-48 h-48 relative mb-4">
						<Image
							src={profileIcon}
							alt="Profile"
							layout="fill"
							className="rounded-full"
						/>
					</div>

					{loading && <p className="text-xl mt-2">Loading...</p>}

					{error && (
						<div className="text-red-500 mt-2">
							<p>Error loading profile: {error.message}</p>
							{error.message.includes("Not authenticated") && isClient && (
								<p className="mt-2">Please log in to view your profile.</p>
							)}
						</div>
					)}

					{data && data.me && (
						<>
							<h2 className="text-xl mt-2">{data.me.name}</h2>
							<p className="mt-2">{data.me.email}</p>
							<p className="text-gray-500 mt-2">
								Member since: {new Date(data.me.createdAt).toLocaleDateString()}
							</p>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
