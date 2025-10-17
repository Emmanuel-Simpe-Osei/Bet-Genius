"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function DashboardHome() {
  // ✅ Dashboard data state
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalPredictions: 0,
    totalOrders: 0,
    recentOrders: [],
  });

  // ✅ Simulate fetching data (replace with real API)
  useEffect(() => {
    setTimeout(() => {
      setDashboardData({
        totalUsers: 1247,
        totalPredictions: 3568,
        totalOrders: 892,
        recentOrders: [
          {
            id: 1,
            userName: "John Doe",
            game: "Premier League: ARS vs LIV",
            prediction: "Arsenal Win",
            amount: "$50.00",
            date: "2024-01-15 14:30",
            status: "completed",
          },
          {
            id: 2,
            userName: "Sarah Wilson",
            game: "NBA: Lakers vs Warriors",
            prediction: "Over 220.5 Points",
            amount: "$75.00",
            date: "2024-01-15 13:15",
            status: "completed",
          },
          {
            id: 3,
            userName: "Mike Johnson",
            game: "UCL: Bayern vs Real Madrid",
            prediction: "Both Teams to Score",
            amount: "$60.00",
            date: "2024-01-15 11:45",
            status: "pending",
          },
        ],
      });
    }, 1000);
  }, []);

  // ✅ Stats data
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

  // ✅ Date formatter
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✅ Status badge color
  const getStatusColor = (status) => {
    switch (status) {
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
          Welcome back! Here’s what’s happening today.
        </p>
      </motion.div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stat.delay }}
            whileHover={{ scale: 1.02 }}
            className={`${stat.bg} ${stat.color} rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300`}
          >
            <p className="text-sm opacity-90 mb-1">{stat.title}</p>
            <p className="text-3xl font-bold">{stat.value.toLocaleString()}</p>
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
        {/* Section Header */}
        <div className="bg-[#142B6F] px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-[#FFD601]">
              Recent Orders
            </h2>
            <p className="text-sm text-gray-300">
              Latest booking and prediction records
            </p>
          </div>
        </div>

        {/* Orders List */}
        <div className="p-6 bg-white/5">
          {dashboardData.recentOrders.length > 0 ? (
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
                        {order.userName}
                      </h3>
                      <p className="text-sm text-gray-300 mb-1">{order.game}</p>
                      <p className="text-sm text-gray-400">
                        <span className="text-[#FFD601] font-medium">
                          {order.prediction}
                        </span>{" "}
                        · <span className="text-green-400">{order.amount}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-1">
                        {formatDate(order.date)}
                      </p>
                      <span
                        className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg text-gray-300">No Data</span>
              </div>
              <p>No recent orders to show yet.</p>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="bg-[#142B6F] px-6 py-3 border-t border-white/10">
          <p className="text-sm text-gray-300">
            Showing {dashboardData.recentOrders.length} recent orders
          </p>
        </div>
      </motion.div>
    </div>
  );
}
