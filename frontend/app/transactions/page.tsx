"use client";
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      const token = localStorage.getItem("token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${API_URL}/transactions/summary`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="min-h-screen bg-[#050508] text-white p-8">
      <h1 className="text-3xl font-bold mb-8 font-sans">Full Ledger</h1>
      <Card className="bg-zinc-950/50 border-zinc-800 backdrop-blur-md overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-900/40">
            <TableRow className="border-zinc-800">
              <TableHead className="text-zinc-500">Date</TableHead>
              <TableHead className="text-zinc-500">Description</TableHead>
              <TableHead className="text-zinc-500">Category</TableHead>
              <TableHead className="text-right text-zinc-500 pr-8">Amount (PKR)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx: any) => (
              <TableRow key={tx.id} className="border-zinc-800 hover:bg-white/5 transition-colors">
                <TableCell className="text-zinc-500 font-mono text-xs">
                  {new Date(tx.date).toLocaleDateString()}
                </TableCell>
                <TableCell className="font-medium">{tx.description}</TableCell>
                <TableCell>
                  <span className="bg-zinc-800 px-2 py-1 rounded text-[10px] uppercase font-bold text-zinc-400">
                    {tx.category}
                  </span>
                </TableCell>
                <TableCell className="text-right pr-8 font-bold text-violet-400 font-mono">
                  {tx.amount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}