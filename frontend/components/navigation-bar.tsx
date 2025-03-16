"use client";

import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Link from 'next/link';
import { Separator } from "@/components/ui/separator";

export function NavigationBar() {
	return (
		<div>
			<div className="flex flex-row justify-between items-center max-w mx-auto px-20 py-6">
				<Link href="/" passHref>
					<h2 className="font-medium text-3xl cursor-pointer">BioGeneX</h2>
				</Link>


				<div className="ml-auto list-none">
					<NavigationMenu>
						<NavigationMenuList className="flex gap-8 text-xl font-medium">
							<NavigationMenuItem>
								<Link href="/reports" passHref>
									<NavigationMenuLink>Reports</NavigationMenuLink>
								</Link>
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
