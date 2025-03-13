"use client";

import profileIcon from "@/public/profile-picture.svg";

export function ProfileSection() {
    const name = "Leon";
    const email = "leonfoonghf@gmail.com";

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <img
                src={profileIcon}
                alt="Profile Icon"
                className="w-24 h-24 rounded-full border-2 border-gray-300"
            />
            <p className="mt-4 text-lg font-semibold text-gray-700">
                Name: {name}
            </p>
            <p className="mt-4 text-lg font-semibold text-gray-700">
                Email: {email}
            </p>
        </div>
    );
}
