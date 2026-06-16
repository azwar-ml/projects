"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader } from "lucide-react";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      try {
        const res = await fetch(`${API_URL}/users/all`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.status === 403) {
          setError("Access Denied: Only azwarwaqar@gmail.com can access the admin panel");
          setTimeout(() => router.push("/dashboard"), 3000);
          return;
        }
        
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        } else {
          setError("Failed to fetch users");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Connection error. Make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 font-sans flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-zinc-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 font-sans flex items-center justify-center">
        <div className="max-w-md">
          <div className="bg-red-600/20 border border-red-600/50 rounded-xl p-6 text-center">
            <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-red-400 mb-4">{error}</p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 py-3 text-base font-bold rounded-lg"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-950 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Admin Console
            </span>
          </h1>
          <p className="text-zinc-400 text-lg">Managing FinLens AI Ecosystem</p>
        </header>
        
        {/* Users Table */}
        <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm">
          <CardHeader className="border-b border-zinc-800/50">
            <CardTitle className="text-xl font-bold text-white">System Users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {users.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800/50">
                      <TableHead className="text-zinc-400 py-4 px-6 font-semibold">Email</TableHead>
                      <TableHead className="text-zinc-400 font-semibold">Role</TableHead>
                      <TableHead className="text-zinc-400 text-right px-6 font-semibold">Joined</TableHead>
                      <TableHead className="text-right text-zinc-400 px-6 font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user: any) => (
                      <TableRow key={user.id} className="border-zinc-800/30 hover:bg-zinc-800/30 transition-colors">
                        <TableCell className="py-4 px-6 font-medium text-white">
                          {user.email}
                          {user.email === "azwarwaqar@gmail.com" && (
                            <span className="ml-2 inline-block text-xs font-bold bg-amber-600/30 text-amber-400 px-2 py-1 rounded">
                              ADMIN
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="inline-block text-xs font-bold uppercase bg-violet-600/20 px-3 py-1 rounded-full text-violet-300">
                            {user.email === "azwarwaqar@gmail.com" ? "Administrator" : "User"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-zinc-400 text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right px-6">
                          <Button variant="ghost" className="hover:text-red-400 hover:bg-red-600/20 rounded-lg transition-colors">
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <p className="text-zinc-500 text-lg font-medium">No users found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}