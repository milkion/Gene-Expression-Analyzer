"use client";

import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import LogoutButton from "@/components/LogoutButton";
import { useEffect, useState } from "react";

export function NavigationBar() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	useEffect(() => {
		const token = localStorage.getItem("token");
		setIsAuthenticated(!!token);
	}, []);

	return (
		<>
			<style jsx>{`
		@keyframes shimmer {
			0% {
			background-position: -100% 0;
			}
			100% {
			background-position: 100% 0;
			}
		}

		.shimmer-brand {
			position: relative;
			display: inline-block;
			background-image: linear-gradient(
			90deg,
			rgba(0, 0, 0, 0.9) 0%,
			rgba(170, 178, 227, 0.3) 50%,
			rgba(0, 0, 0, 0.9) 100%
			);
			background-size: 200% 100%;
			background-repeat: repeat;
			background-position: -200% 0;
			-webkit-background-clip: text;
			background-clip: text;
			color: transparent;
			-webkit-text-fill-color: transparent;
			animation: shimmer 10s linear infinite;
			transform: translateZ(0); /* prevents visual folding */
		}
		`}</style>




			<div className="relative z-50 bg-white shadow-sm">
				<div className="flex flex-row justify-between items-center max-w mx-auto px-20 py-6">
					<a href="/" className="font-medium text-3xl hover:cursor-pointer shimmer-brand">
						BioGeneX
					</a>

					<div className="ml-auto list-none">
						<NavigationMenu>
							<NavigationMenuList className="flex gap-8 text-xl font-medium">
								<NavigationMenuItem>
									<NavigationMenuLink href="/reports" className="cursor-pointer hover:font-semibold">Reports</NavigationMenuLink>
								</NavigationMenuItem>
								<NavigationMenuItem>
									<NavigationMenuLink href="/forum" className="cursor-pointer hover:font-semibold">
										Forum
									</NavigationMenuLink>
								</NavigationMenuItem>
								<NavigationMenuItem>
									<a
										href="https://www.ncbi.nlm.nih.gov/gds/"
										target="_blank"
										rel="noopener noreferrer"
										className="cursor-pointer hover:font-semibold"
									>
										NCBI
									</a>
								</NavigationMenuItem>
								<NavigationMenuItem>
									<NavigationMenuLink
										href="/profile"
										className="cursor-pointer hover:font-semibold"
									>
										Profile
									</NavigationMenuLink>
								</NavigationMenuItem>
								{isAuthenticated && (
									<NavigationMenuItem>
										<LogoutButton />
									</NavigationMenuItem>
								)}
							</NavigationMenuList>
						</NavigationMenu>
					</div>
				</div>
				<Separator />
			</div>
		</>
	);
}
