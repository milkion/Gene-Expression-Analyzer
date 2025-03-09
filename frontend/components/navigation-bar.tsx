"use client";

import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from "@/components/ui/navigation-menu";

import { Separator } from "@/components/ui/separator";

export function NavigationBar() {
	return (
		<div>
			<div className="flex flex-row justify-between items-center max-w mx-auto px-20 py-6">
				<h2 className="font-medium text-3xl">BioGeneX</h2>

				<div className="ml-auto list-none">
					<NavigationMenu>
						<NavigationMenuList className="flex gap-8 text-xl font-medium">
							<NavigationMenuItem>
								<NavigationMenuLink>Reports</NavigationMenuLink>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<NavigationMenuLink>Profile</NavigationMenuLink>
							</NavigationMenuItem>
						</NavigationMenuList>
					</NavigationMenu>
				</div>
			</div>
			<Separator />
		</div>
	);
}
