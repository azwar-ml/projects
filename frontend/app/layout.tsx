"use client";
import "./globals.css";
import { Inter } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  
  const isAuthPage = pathname === "/auth" || pathname === "/";

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem("token");
    
    if (!token && !isAuthPage) {
      // No token and trying to access protected page - redirect to auth
      router.push("/auth");
    }
    
    setIsMounted(true);
  }, [pathname, isAuthPage, router]);

  // Prevent hydration errors - only render after mount
  if (!isMounted) {
    return (
      <html lang="en" className="dark">
        <body className={`${inter.className} bg-[#05050a] text-white antialiased`}>
          <div className="flex min-h-screen" />
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#05050a] text-white antialiased`}>
        <div className="flex min-h-screen">
          {!isAuthPage && <Sidebar />}
          <main className={`flex-1 transition-all duration-300 ${!isAuthPage ? "ml-64" : ""}`}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}