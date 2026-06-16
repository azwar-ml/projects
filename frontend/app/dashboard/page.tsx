"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, TrendingUp, TrendingDown, Wallet, Edit, Trash2 } from "lucide-react";

export default function Dashboard() {
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("Food");
  const [transactions, setTransactions] = useState([]);
  const [metrics, setMetrics] = useState({ totalBalance: 0, monthlyExpenses: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  // Use the backend URL from env or default to 3000
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  const refreshData = () => {
    fetchTransactions();
    fetchMetrics();
  };

  const fetchTransactions = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/transactions/summary`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      } else {
        console.error("Failed to fetch transactions:", res.status);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  const fetchMetrics = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/transactions/metrics`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      } else {
        console.error("Failed to fetch metrics:", res.status);
      }
    } catch (err) {
      console.error("Error fetching metrics:", err);
    }
  };

  const handleAddExpense = async () => {
    setError("");
    if (!amount || !desc) {
      setError("Please fill in all fields");
      return;
    }
    
    setLoading(true);
    const token = localStorage.getItem("token");
    
    try {
      if (editingId) {
        const res = await fetch(`${API_URL}/transactions/${editingId}`, {
          method: "PATCH",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
          },
          body: JSON.stringify({ amount: Number(amount), description: desc, category }),
        });
        
        const responseData = await res.json();
        
        if (res.ok) {
          setEditingId(null);
          setAmount("");
          setDesc("");
          setCategory("Food");
          setOpen(false);
          await refreshData();
        } else {
          setError(responseData.message || "Failed to update expense");
        }
      } else {
        const res = await fetch(`${API_URL}/transactions/add`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
          },
          body: JSON.stringify({ amount: Number(amount), description: desc, category }),
        });
        
        const responseData = await res.json();
        
        if (res.ok) {
          setAmount("");
          setDesc("");
          setCategory("Food");
          setOpen(false);
          await refreshData();
        } else {
          setError(responseData.message || "Failed to add expense");
        }
      }
    } catch (err: any) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (transactionId: number) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    setDeleting(transactionId);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/transactions/${transactionId}`, {
        method: "DELETE",
        headers: { 
          "Authorization": `Bearer ${token}` 
        },
      });

      if (res.ok) {
        await refreshData();
      } else {
        alert("Failed to delete transaction");
      }
    } catch (err) {
      alert("Error deleting transaction");
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (tx: any) => {
    setEditingId(tx.id);
    setAmount(tx.amount);
    setDesc(tx.description);
    setCategory(tx.category);
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-950 p-4 md:p-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
          <span className="text-white">Financial </span>
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Overview</span>
        </h1>
        <p className="text-zinc-400 text-lg">Monitor and manage your expenses with ease</p>
      </div>

      {/* Action Button */}
      <div className="mb-8 flex justify-end">
        <Dialog open={open} onOpenChange={(newOpen) => {
          setOpen(newOpen);
          if (!newOpen) {
            setEditingId(null);
            setAmount("");
            setDesc("");
            setCategory("Food");
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 gap-2 rounded-xl px-8 py-6 text-lg font-bold shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 transition-all active:scale-95">
              <PlusCircle size={24} />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">{editingId ? "Edit Expense" : "Add New Expense"}</DialogTitle>
              <DialogDescription className="text-zinc-400">{editingId ? "Update your expense details" : "Track your spending to get AI insights"}</DialogDescription>
            </DialogHeader>
            <div className="space-y-5 pt-4">
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-2 block">Amount (PKR)</label>
                <Input 
                  value={amount} 
                  type="number" 
                  placeholder="0.00" 
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={loading}
                  className="bg-zinc-800/50 border-zinc-700 h-11 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300 mb-2 block">Description</label>
                <Input 
                  value={desc} 
                  placeholder="e.g., Coffee, Gas, Rent" 
                  onChange={(e) => setDesc(e.target.value)}
                  disabled={loading}
                  className="bg-zinc-800/50 border-zinc-700 h-11 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300 mb-2 block">Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={loading}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 outline-none transition-all"
                >
                  <option value="Food">🍽️ Food & Dining</option>
                  <option value="Software">💻 Software & Tech</option>
                  <option value="Business">🏢 Business</option>
                  <option value="Personal">👤 Personal</option>
                  <option value="Transport">🚗 Transport</option>
                  <option value="Entertainment">🎬 Entertainment</option>
                </select>
              </div>

              {error && (
                <div className="p-3 bg-red-600/20 border border-red-600/50 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <Button 
                onClick={handleAddExpense} 
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 py-6 text-base font-bold rounded-lg transition-all disabled:opacity-50"
              >
                {loading ? (editingId ? "Updating..." : "Adding...") : (editingId ? "Update Expense" : "Track Expense")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm hover:border-violet-500/30 transition-all">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-zinc-400 text-sm font-medium mb-2">Total Balance</p>
                <p className="text-3xl md:text-4xl font-bold text-white mb-1">
                  PKR {metrics.totalBalance?.toLocaleString() || "0"}
                </p>
                <p className="text-green-400 text-xs font-medium">+Updated now</p>
              </div>
              <div className="p-3 bg-violet-600/20 rounded-lg">
                <Wallet className="text-violet-400" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm hover:border-cyan-500/30 transition-all">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-zinc-400 text-sm font-medium mb-2">Monthly Expenses</p>
                <p className="text-3xl md:text-4xl font-bold text-white mb-1">
                  PKR {metrics.monthlyExpenses?.toLocaleString() || "0"}
                </p>
                <p className="text-cyan-400 text-xs font-medium">Live tracking</p>
              </div>
              <div className="p-3 bg-cyan-600/20 rounded-lg">
                <TrendingDown className="text-cyan-400" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm hover:border-indigo-500/30 transition-all">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-zinc-400 text-sm font-medium mb-2">Total Transactions</p>
                <p className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {transactions.length}
                </p>
                <p className="text-indigo-400 text-xs font-medium">Tracked</p>
              </div>
              <div className="p-3 bg-indigo-600/20 rounded-lg">
                <TrendingUp className="text-indigo-400" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm">
        <CardHeader className="border-b border-zinc-800/50">
          <CardTitle className="text-xl font-bold text-white">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                    <TableHead className="text-zinc-400 py-4 px-6 font-semibold">Description</TableHead>
                    <TableHead className="text-zinc-400 font-semibold">Category</TableHead>
                    <TableHead className="text-zinc-400 text-right px-6 font-semibold">Amount</TableHead>
                    <TableHead className="text-zinc-400 text-right px-6 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx: any) => (
                    <TableRow key={tx.id} className="border-zinc-800/30 hover:bg-zinc-800/30 transition-colors">
                      <TableCell className="py-4 px-6 font-medium text-white">{tx.description}</TableCell>
                      <TableCell>
                        <span className="inline-block text-xs font-bold uppercase bg-zinc-800/60 px-3 py-1 rounded-full text-zinc-300">
                          {tx.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-right px-6 font-mono font-bold text-violet-400 text-lg">
                        PKR {Number(tx.amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right px-6 flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(tx)}
                          className="p-2 hover:bg-violet-600/20 rounded-lg transition-colors text-violet-400 hover:text-violet-300"
                          title="Edit transaction"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-2 hover:bg-red-600/20 rounded-lg transition-colors text-red-400 hover:text-red-300 disabled:opacity-50"
                          title="Delete transaction"
                        >
                          <Trash2 size={18} />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <PlusCircle className="mx-auto text-zinc-600 mb-4" size={48} />
              <p className="text-zinc-500 text-lg font-medium">No expenses tracked yet</p>
              <p className="text-zinc-600 text-sm mt-1">Add your first expense to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}