"use client"; // ✅ Ensure this is a Client Component

import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation"; // ✅ Correct import

// Define the GraphQL Mutation for Register
const CREATE_USER_MUTATION = gql`
	mutation CreateUser($userInput: UserInput!) {
		createUser(userInput: $userInput) {
			token
			user {
				id
				name
				email
			}
		}
	}
`;

export default function RegisterPage() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	// Apollo Mutation Hook
	const [createUser, { loading }] = useMutation(CREATE_USER_MUTATION, {
		onCompleted: (data) => {
			// Store token in localStorage
			localStorage.setItem("token", data.createUser.token);
			// Redirect to dashboard
			router.push("/");
			setTimeout(() => {
				window.location.reload(); // Now reloads the home page after router.push
			}, 100); // A short delay (100ms) gives the router time to navigate

		},
		onError: (err) => {
			setError(err.message);
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(""); // Clear previous errors

		if (!name || !email || !password) {
			setError("All fields are required!");
			return;
		}

		await createUser({
			variables: {
				userInput: { name, email, password },
			},
		});
	};

	return (
		<div>
			{/* BioGeneX Header */}
			<div className="flex flex-row justify-between items-center max-w mx-auto px-20 py-6">
				<h2 className="font-medium text-3xl">BioGeneX</h2>
			</div>

			{/* Register Page Container */}
			<div className="flex items-center justify-center h-screen">
				<div className="text-center">
					{/* Bigger Avatar Logo */}
					<div className="flex justify-center mb-5">
						<img
							src="/avatar.svg"
							alt="User Avatar"
							className="w-32 h-32 object-contain"
						/>
					</div>

					<form onSubmit={handleSubmit}>
						{/* Display Error Message */}
						{error && <p className="text-red-500">{error}</p>}

						{/* Name Input */}
						<div className="flex items-center w-80 h-12 rounded-full border bg-gray-100 px-3 py-1 mb-4">
							<img
								src="/name-icon.svg"
								alt="Name Icon"
								className="w-5 h-5 ml-1"
							/>
							<input
								type="text"
								name="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								className="flex-1 border-none bg-transparent outline-none text-base pl-2"
								placeholder="Name"
							/>
						</div>

						{/* Email Input */}
						<div className="flex items-center w-80 h-12 rounded-full border bg-gray-100 px-3 py-1 mb-4">
							<img
								src="/email-icon.svg"
								alt="Email Icon"
								className="w-5 h-5 ml-1"
							/>
							<input
								type="email"
								name="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="flex-1 border-none bg-transparent outline-none text-base pl-2"
								placeholder="Email"
							/>
						</div>

						{/* Password Input */}
						<div className="flex items-center w-80 h-12 rounded-full border bg-gray-100 px-3 py-1 mb-4">
							<img
								src="/lock-icon.svg"
								alt="Password Icon"
								className="w-5 h-5 ml-1"
							/>
							<input
								type="password"
								name="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className="flex-1 border-none bg-transparent outline-none text-base pl-2"
								placeholder="Password"
							/>
						</div>

						{/* Register Button (with hover effect) */}
						<div className="w-80 h-12 rounded-full bg-gray-500 flex items-center justify-center cursor-pointer mb-4 transition-all transform hover:scale-110">
							<button
								type="submit"
								className="border-none bg-transparent text-white text-base cursor-pointer w-full h-full rounded-full"
								disabled={loading}
							>
								{loading ? "Registering..." : "Register"}
							</button>
						</div>

						{/* Login Redirect Button */}
						<p className="text-gray-600 text-sm mt-2">
							Already have an account?
						</p>
						<button
							type="button"
							onClick={() => router.push("/login")} // ✅ Redirect to Login Page
							className="w-80 h-12 mt-2 rounded-full border border-gray-500 text-gray-500 bg-transparent hover:bg-gray-500 hover:text-white transition-all"
						>
							Login
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
