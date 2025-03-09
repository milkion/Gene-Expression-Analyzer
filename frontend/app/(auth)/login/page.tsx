export default function LoginPage() {
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
						<img
							src="/avatar.svg"
							alt="User Avatar"
							className="w-32 h-32 object-contain"
						/>
					</div>
					<form>
						{/* Email Input with Icon */}
						<div className="flex items-center w-80 h-12 rounded-full border bg-gray-100 px-3 py-1 mb-4">
							<img
								src="/email-icon.svg"
								alt="Email Icon"
								className="w-5 h-5 ml-1"
							/>
							<input
								type="email"
								name="email"
								required
								className="flex-1 border-none bg-transparent outline-none text-base pl-2"
								placeholder="Email"
							/>
						</div>

						{/* Password Input with Icon */}
						<div className="flex items-center w-80 h-12 rounded-full border bg-gray-100 px-3 py-1 mb-4">
							<img
								src="/lock-icon.svg"
								alt="Password Icon"
								className="w-5 h-5 ml-1"
							/>
							<input
								type="password"
								name="password"
								required
								className="flex-1 border-none bg-transparent outline-none text-base pl-2"
								placeholder="Password"
							/>
						</div>

						{/* Login Button with Gray Background */}
						<div className="w-80 h-12 rounded-full bg-gray-500 flex items-center justify-center cursor-pointer">
							<button
								type="submit"
								className="border-none bg-transparent text-white text-base cursor-pointer w-full h-full rounded-full"
							>
								Login
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
