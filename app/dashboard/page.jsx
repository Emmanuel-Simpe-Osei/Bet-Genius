"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function DashboardHome() {
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalPredictions: 0,
    totalOrders: 0,
    recentOrders: [],
  });

  // Simulate data fetching - replace with real API calls later
  useEffect(() => {
    // Simulate API call delay
    const fetchDashboardData = async () => {
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
    };

    fetchDashboardData();
  }, []);

  // Stats cards data
  const stats = [
    {
      title: "Total Users",
      value: dashboardData.totalUsers,
      icon: "👥",
      color: "from-blue-500 to-blue-600",
      textColor: "text-white",
      delay: 0.1,
    },
    {
      title: "Total Predictions",
      value: dashboardData.totalPredictions,
      icon: "🎯",
      color: "from-[#FFB800] to-yellow-500",
      textColor: "text-[#002583]",
      delay: 0.2,
    },
    {
      title: "Total Orders",
      value: dashboardData.totalOrders,
      icon: "💰",
      color: "from-green-500 to-green-600",
      textColor: "text-white",
      delay: 0.3,
    },
  ];

  // Format date for display
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

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with your platform today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: stat.delay, type: "spring", stiffness: 200 }}
            whileHover={{
              scale: 1.02,
              y: -5,
              transition: { duration: 0.2 },
            }}
            className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${stat.textColor} opacity-90 mb-1`}
                >
                  {stat.title}
                </p>
                <motion.p
                  className={`text-3xl font-bold ${stat.textColor}`}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: stat.delay + 0.2 }}
                >
                  {stat.value.toLocaleString()}
                </motion.p>
              </div>
              <motion.div
                className="text-3xl"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                {stat.icon}
              </motion.div>
            </div>

            {/* Progress bar for visual interest */}
            <div className="mt-4">
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div
                  className="bg-white/40 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(stat.value % 1000) / 10}%` }}
                  transition={{ delay: stat.delay + 0.3, duration: 1 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        {/* Section Header */}
        <div className="bg-gradient-to-r from-[#002583] to-[#1a3a9c] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Recent Orders</h2>
              <p className="text-blue-200 text-sm">
                Latest transactions and predictions
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 bg-white/20 rounded-xl text-white text-sm font-medium cursor-pointer"
            >
              View All
            </motion.div>
          </div>
        </div>

        {/* Orders List */}
        <div className="p-6">
          {dashboardData.recentOrders.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recentOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{
                    scale: 1.01,
                    backgroundColor: "rgba(249, 250, 251, 1)",
                  }}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    {/* User and Game Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#002583] to-[#FFB800] rounded-full flex items-center justify-center text-white font-bold">
                          {order.userName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {order.userName}
                          </h3>
                          <p className="text-sm text-gray-600">{order.game}</p>
                        </div>
                      </div>

                      {/* Prediction and Details */}
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-500">Prediction:</span>
                          <span className="font-medium text-[#002583]">
                            {order.prediction}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-500">Amount:</span>
                          <span className="font-medium text-green-600">
                            {order.amount}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Date and Status */}
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-2">
                        {formatDate(order.date)}
                      </p>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
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
            // Loading state
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No orders yet
              </h3>
              <p className="text-gray-500">
                Orders will appear here once users start making predictions.
              </p>
            </motion.div>
          )}
        </div>

        {/* Quick Actions Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-gray-50 px-6 py-4 border-t border-gray-200"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {dashboardData.recentOrders.length} recent orders
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-[#002583] to-[#1a3a9c] text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
            >
              Export Report
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
