import "./login.css"; // Import CSS file

export default function LoginPage() {
	return (
		<div>
			{/* BioGeneX Header */}
			<div className="flex flex-row justify-between items-center max-w mx-auto px-20 py-6">
				<h2 className="font-medium text-3xl">BioGeneX</h2>
			</div>

			{/* Login Page Container */}
			<div className="login-container">
				<div className="login-box">
					{/* Avatar Logo */}
					<div className="login-avatar">
						<img src="/avatar.svg" alt="User Avatar" />
					</div>

					<form className="login-form">
						{/* Username Input with Icon */}
						<div className="input-container">
							<img src="/name-icon.svg" alt="Username Icon" className="input-icon" />
							<input type="text" name="username" required className="login-input" placeholder="Username" />
						</div>

						{/* Password Input with Icon */}
						<div className="input-container">
							<img src="/lock-icon.svg" alt="Password Icon" className="input-icon" />
							<input type="password" name="password" required className="login-input" placeholder="Password" />
						</div>

						{/* Login Button with Gray Background */}
						<div className="login-button-container">
							<button type="submit" className="login-button">Login</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
