"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRoleGuard } from "@/hooks/useRoleGuard";

export default function DashboardHome() {
  useRoleGuard();

  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalPredictions: 0,
    totalOrders: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // ✅ 1. Total users
        const { count: totalUsers, error: usersError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });
        if (usersError) throw usersError;

        // ✅ 2. Total predictions
        const { count: totalPredictions, error: predictionsError } =
          await supabase
            .from("predictions")
            .select("*", { count: "exact", head: true });
        if (predictionsError) throw predictionsError;

        // ✅ 3. Total orders
        const { count: totalOrders, error: ordersError } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true });
        if (ordersError) throw ordersError;

        // ✅ 4. Fetch latest 5 orders with user info
        const { data: recentOrders, error: recentError } = await supabase
          .from("orders")
          .select(
            `
            id,
            user_id,
            amount,
            currency,
            status,
            paystack_ref,
            created_at,
            profiles (
              full_name,
              email
            )
          `
          )
          .order("created_at", { ascending: false })
          .limit(5);

        if (recentError) throw recentError;

        // ✅ Set data
        setDashboardData({
          totalUsers: totalUsers || 0,
          totalPredictions: totalPredictions || 0,
          totalOrders: totalOrders || 0,
          recentOrders: recentOrders || [],
        });
      } catch (err) {
        console.error("Error loading dashboard:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    {
      title: "Total Users",
      value: dashboardData.totalUsers,
      bg: "bg-[#142B6F]",
      color: "text-white",
      delay: 0.1,
    },
    {
      title: "Total Predictions",
      value: dashboardData.totalPredictions,
      bg: "bg-[#FFD601]",
      color: "text-[#142B6F]",
      delay: 0.2,
    },
    {
      title: "Total Orders",
      value: dashboardData.totalOrders,
      bg: "bg-[#142B6F]",
      color: "text-white",
      delay: 0.3,
    },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-semibold text-[#FFD601] mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-300 text-sm">
          {loading
            ? "Loading data..."
            : "Welcome back! Here’s what’s happening today."}
        </p>
      </motion.div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stat.delay }}
            whileHover={{ scale: 1.02 }}
            className={`${stat.bg} ${stat.color} rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300`}
          >
            <p className="text-sm opacity-90 mb-1">{stat.title}</p>
            <p className="text-3xl font-bold">
              {loading ? "..." : stat.value.toLocaleString()}
            </p>
          </motion.div>
        ))}
      </div>

      {/* RECENT ORDERS */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-md overflow-hidden"
      >
        <div className="bg-[#142B6F] px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-[#FFD601]">
              Recent Orders
            </h2>
            <p className="text-sm text-gray-300">
              Latest bookings and transactions
            </p>
          </div>
        </div>

        <div className="p-6 bg-white/5">
          {loading ? (
            <p className="text-center text-gray-400 py-10">Loading...</p>
          ) : dashboardData.recentOrders.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recentOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white/10 border border-white/10 rounded-xl p-4 hover:bg-white/20 transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-white mb-1">
                        {order.profiles?.full_name ||
                          order.profiles?.email ||
                          "Unknown User"}
                      </h3>
                      <p className="text-sm text-gray-300 mb-1">
                        Paystack Ref: {order.paystack_ref || "N/A"}
                      </p>
                      <p className="text-sm text-gray-400">
                        <span className="text-[#FFD601] font-medium">
                          {order.amount} {order.currency}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-1">
                        {formatDate(order.created_at)}
                      </p>
                      <span
                        className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-12">
              No recent orders yet.
            </p>
          )}
        </div>

        <div className="bg-[#142B6F] px-6 py-3 border-t border-white/10">
          <p className="text-sm text-gray-300">
            Showing {dashboardData.recentOrders.length} recent orders
          </p>
        </div>
      </motion.div>
    </div>
  );
}
