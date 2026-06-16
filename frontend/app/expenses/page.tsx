"use client";
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);

  const COLORS = ["#8b5cf6", "#ec4899", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#14b8a6"];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const token = localStorage.getItem("token");
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/transactions/summary`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const transactions = data.transactions || [];
        setExpenses(transactions);
        
        // Calculate total
        const total = transactions.reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);
        setTotalExpenses(total);

        // Process category data for pie chart
        const categoryMap: { [key: string]: number } = {};
        transactions.forEach((tx: any) => {
          const cat = tx.category || "Uncategorized";
          categoryMap[cat] = (categoryMap[cat] || 0) + Number(tx.amount);
        });

        const categoryChartData = Object.entries(categoryMap).map(([name, value]) => ({
          name,
          value: Number(value.toFixed(2))
        }));
        setCategoryData(categoryChartData);

        // Process monthly data for bar chart
        const monthlyMap: { [key: string]: number } = {};
        transactions.forEach((tx: any) => {
          const date = new Date(tx.date);
          const monthKey = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
          monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + Number(tx.amount);
        });

        const monthlyChartData = Object.entries(monthlyMap)
          .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
          .map(([month, amount]) => ({
            month,
            amount: Number(amount.toFixed(2))
          }));
        setMonthlyData(monthlyChartData);
      }
    } catch (err) {
      console.error("Error fetching expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-sans mb-2">Expense Analytics</h1>
          <p className="text-zinc-400">Track and analyze your spending patterns</p>
        </div>

        {/* Total Expenses Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-violet-500/20 to-violet-500/5 border-violet-500/30 backdrop-blur-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm mb-2">Total Expenses</p>
                <h2 className="text-3xl font-bold text-violet-400">
                  PKR {totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
              </div>
              <div className="text-4xl text-violet-400 opacity-20">💰</div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500/20 to-pink-500/5 border-pink-500/30 backdrop-blur-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm mb-2">Total Transactions</p>
                <h2 className="text-3xl font-bold text-pink-400">{expenses.length}</h2>
              </div>
              <div className="text-4xl text-pink-400 opacity-20">📊</div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 backdrop-blur-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm mb-2">Average Expense</p>
                <h2 className="text-3xl font-bold text-cyan-400">
                  PKR {(totalExpenses / (expenses.length || 1)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
              </div>
              <div className="text-4xl text-cyan-400 opacity-20">📈</div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Category Pie Chart */}
          <Card className="bg-zinc-950/50 border-zinc-800 backdrop-blur-md p-6">
            <h3 className="text-xl font-bold mb-6 text-white">Expenses by Category</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: PKR ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `PKR ${value}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-zinc-500">
                No expense data available
              </div>
            )}
          </Card>

          {/* Monthly Trend Bar Chart */}
          <Card className="bg-zinc-950/50 border-zinc-800 backdrop-blur-md p-6">
            <h3 className="text-xl font-bold mb-6 text-white">Monthly Trend</h3>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    formatter={(value) => `PKR ${value}`}
                    contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}
                  />
                  <Bar dataKey="amount" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-zinc-500">
                No monthly data available
              </div>
            )}
          </Card>
        </div>

        {/* History Section */}
        <Card className="bg-zinc-950/50 border-zinc-800 backdrop-blur-md p-6">
          <h3 className="text-xl font-bold mb-6 text-white">Transaction History</h3>
          
          {loading ? (
            <div className="text-center text-zinc-400 py-8">Loading...</div>
          ) : expenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-zinc-400 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-semibold">Description</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-semibold">Category</th>
                    <th className="text-right py-3 px-4 text-zinc-400 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense: any) => (
                    <tr key={expense.id} className="border-b border-zinc-800 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 text-zinc-500 font-mono text-xs">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-white">{expense.description}</td>
                      <td className="py-4 px-4">
                        <span className="bg-zinc-800 px-3 py-1 rounded text-[10px] uppercase font-bold text-zinc-300">
                          {expense.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-violet-400 font-mono">
                        PKR {Number(expense.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-zinc-500 py-12">
              No expenses recorded yet. Start by adding transactions from the dashboard.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
