export default function RegisterPage() {
	return (
		<div>
			{/* BioGeneX Header */}
			<div className="flex flex-row justify-between items-center max-w mx-auto px-20 py-6">
				<h2 className="font-medium text-3xl">BioGeneX</h2>
			</div>

			{/* Register Page Container */}
			<div className="register-container">
				<div className="register-box">
					{/* Bigger Avatar Logo */}
					<div className="register-avatar">
						<img src="/avatar.svg" alt="User Avatar" />
					</div>
					<form className="register-form">
						{/* Name Input with Icon */}
						<div className="input-container">
							<img src="/name-icon.svg" alt="Name Icon" className="input-icon" />
							<input type="text" name="name" required className="register-input" placeholder="Name" />
						</div>

						{/* Email Input with Icon */}
						<div className="input-container">
							<img src="/email-icon.svg" alt="Email Icon" className="input-icon" />
							<input type="email" name="email" required className="register-input" placeholder="Email" />
						</div>

						{/* Password Input with Icon */}
						<div className="input-container">
							<img src="/lock-icon.svg" alt="Password Icon" className="input-icon" />
							<input type="password" name="password" required className="register-input" placeholder="Password" />
						</div>

						{/* Register Button with Gray Background */}
						<div className="register-button-container">
							<button type="submit" className="register-button">Register</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
