"use client";

import profileIcon from "@/public/profile-picture.svg";
import { gql, useQuery } from "@apollo/client";

// Define the GraphQL Query for Profile Info
const PROFILE_QUERY = gql`
	query Profile {
		me {
			user{
                id
		        name
		        email
            }
		}
	}
`;

export function ProfileSection() {
    // TODO: Context Retrieval, data is undefined atm without context

    // Apollo Query Hook
    const { data, loading, error } = useQuery(PROFILE_QUERY);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            {loading ? (
                <p className="mt-4 text-lg font-semibold text-gray-700">
                    Loading Profile...
                </p>
            ) : (
                <>
                    <img
                        src={profileIcon}
                        alt="Profile Icon"
                        className="w-24 h-24 rounded-full border-2 border-gray-300"
                    />
                    {error && (
                        <p className="text-center text-red-500">
                            {error.message}
                        </p>
                    )}
                    <p className="mt-4 text-lg font-semibold text-gray-700">
                        Name: {"Name_placeholder"}
                    </p>
                    <p className="mt-4 text-lg font-semibold text-gray-700">
                        Email: {"Email_placeholder"}
                    </p>
                    <p className="mt-4 text-lg font-semibold text-gray-700">
                        ID: {"ID_Placeholder"}
                    </p>
                </>
            )}
        </div>
    );
}
