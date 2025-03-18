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
				<a href="/" className="font-medium text-3xl hover:cursor-pointer">BioGeneX</a>

				<div className="ml-auto list-none">
					<NavigationMenu>
						<NavigationMenuList className="flex gap-8 text-xl font-medium">
							<NavigationMenuItem>
								<Link href="/reports" passHref>
									<NavigationMenuLink>Reports</NavigationMenuLink>
								</Link>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<NavigationMenuLink
									href="/profile"
									className="cursor-pointer hover:font-semibold"
								>
									Profile
								</NavigationMenuLink>
							</NavigationMenuItem>

						</NavigationMenuList>
					</NavigationMenu>
				</div>
			</div>
			<Separator />
		</div>
	);
}
