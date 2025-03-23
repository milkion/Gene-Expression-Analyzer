"use client"; // ✅ Client Component

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token
    router.push("/login"); // Redirect to login page
  };

  return (
    <button
      onClick={handleLogout}
      className="cursor-pointer hover:font-semibold"
    >
      Logout
    </button>
  );
}
