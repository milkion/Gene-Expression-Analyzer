"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import profileIcon from "@/public/profile-picture.svg";
import { Card, CardDescription } from "@/components/ui/card";

export function ProfileSection() {
    let name = "Leon";
    let password = "biogenex";

    return (
        <div>
            <Avatar>
                <AvatarImage src={profileIcon.src} />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Card>
                <CardDescription>
                    <p>Name: {name}</p>
                    <p>Password: {password}</p>
                </CardDescription>
            </Card>
        </div>
    );
}
