import React from 'react';
import { BarChart3 } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { name: 'Total Products', value: '1,234', change: '+12%', color: 'from-purple-500 to-pink-500' },
    { name: 'Pending Reviews', value: '23', change: '+3%', color: 'from-blue-500 to-cyan-500' },
    { name: 'Orders Today', value: '89', change: '+18%', color: 'from-green-500 to-teal-500' },
    { name: 'Revenue', value: '$12,345', change: '+8%', color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
        <p className="text-gray-300">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={stat.name}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-4`}>
              <BarChart3 className="text-white" size={24} />
            </div>
            <h3 className="text-gray-300 text-sm font-medium">{stat.name}</h3>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            <p className="text-green-400 text-sm mt-2">{stat.change} from last month</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: 'New product added', time: '2 minutes ago', type: 'product' },
            { action: 'Order #1234 shipped', time: '1 hour ago', type: 'order' },
            { action: 'Review approved', time: '3 hours ago', type: 'review' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300">
              <div className={`w-3 h-3 rounded-full ${
                activity.type === 'product' ? 'bg-purple-500' :
                activity.type === 'order' ? 'bg-blue-500' : 'bg-green-500'
              }`}></div>
              <div className="flex-1">
                <p className="text-white font-medium">{activity.action}</p>
                <p className="text-gray-400 text-sm">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;