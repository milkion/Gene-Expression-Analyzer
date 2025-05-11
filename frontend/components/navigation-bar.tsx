"use client";

import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import LogoutButton from "@/components/LogoutButton"; // ✅ Import LogoutButton
import { useEffect, useState } from "react";

export function NavigationBar() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	useEffect(() => {
		const token = localStorage.getItem("token");
		setIsAuthenticated(!!token);
	}, []);

	return (
		<div className="relative z-50 bg-white shadow-sm">
			<div className="flex flex-row justify-between items-center max-w mx-auto px-20 py-6">
				<a href="/" className="font-medium text-3xl hover:cursor-pointer">
					BioGeneX
				</a>

				<div className="ml-auto list-none">
					<NavigationMenu>
						<NavigationMenuList className="flex gap-8 text-xl font-medium">
							<NavigationMenuItem>
								<NavigationMenuLink href="/reports">Reports</NavigationMenuLink>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<NavigationMenuLink href="/forum" className="cursor-pointer hover:font-semibold">
									Forum
								</NavigationMenuLink>
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
	);
}
