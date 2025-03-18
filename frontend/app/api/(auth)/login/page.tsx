"use client"; // ✅ Ensure this is a Client Component

import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation"; // ✅ Correct import

// Define the GraphQL Mutation for Login
const LOGIN_MUTATION = gql`
	mutation Login($email: String!, $password: String!) {
		login(email: $email, password: $password) {
			token
			user {
				id
				name
				email
			}
		}
	}
`;

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	// Apollo Mutation Hook
	const [login, { loading }] = useMutation(LOGIN_MUTATION, {
		onCompleted: (data) => {
			// Store token in localStorage
			localStorage.setItem("token", data.login.token);
			// Redirect to dashboard
			router.push("/");
		},
		onError: (err) => {
			setError(err.message);
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(""); // Clear previous errors

		if (!email || !password) {
			setError("Both fields are required!");
			return;
		}

		await login({
			variables: { email, password },
		});
	};

	return (
		<div>
			{/* BioGeneX Header */}
			<div className="flex flex-row justify-between items-center max-w mx-auto px-20 py-6">
				<h2 className="font-medium text-3xl">BioGeneX</h2>
			</div>

			{/* Login Page Container */}
			<div className="flex items-center justify-center h-screen">
				<div className="text-center">
					{/* Bigger Avatar Logo */}
					<div className="flex justify-center mb-5">
						<img src="/avatar.svg" alt="User Avatar" className="w-32 h-32 object-contain" />
					</div>

					<form onSubmit={handleSubmit}>
						{/* Display Error Message */}
						{error && <p className="text-red-500">{error}</p>}

						{/* Email Input */}
						<div className="flex items-center w-80 h-12 rounded-full border bg-gray-100 px-3 py-1 mb-4">
							<img src="/email-icon.svg" alt="Email Icon" className="w-5 h-5 ml-1" />
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
							<img src="/lock-icon.svg" alt="Password Icon" className="w-5 h-5 ml-1" />
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

						{/* Login Button (with hover effect) */}
						<div className="w-80 h-12 rounded-full bg-gray-500 flex items-center justify-center cursor-pointer mb-4 transition-all transform hover:scale-110">
							<button
								type="submit"
								className="border-none bg-transparent text-white text-base cursor-pointer w-full h-full rounded-full"
								disabled={loading}
							>
								{loading ? "Logging in..." : "Login"}
							</button>
						</div>

						{/* Register Redirect Button */}
						<p className="text-gray-600 text-sm mt-2">Don't have an account?</p>
						<button
							type="button"
							onClick={() => router.push("/api/register")} // ✅ Redirect to Register Page
							className="w-80 h-12 mt-2 rounded-full border border-gray-500 text-gray-500 bg-transparent hover:bg-gray-500 hover:text-white transition-all"
						>
							Register
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
