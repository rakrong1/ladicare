import React from 'react';

const OrderManagement = () => {
  const orders = [
    { id: 'LDC-001', customer: 'Sarah Johnson', total: '$89.99', status: 'processing', date: '2024-06-11' },
    { id: 'LDC-002', customer: 'Emma Wilson', total: '$156.50', status: 'shipped', date: '2024-06-10' },
    { id: 'LDC-003', customer: 'Lisa Brown', total: '$73.25', status: 'delivered', date: '2024-06-09' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-2">Order Management</h2>
        <p className="text-gray-300">Track and manage customer orders</p>
      </div>

      {/* Orders Table */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-gray-300 font-medium">Order ID</th>
                <th className="px-6 py-4 text-left text-gray-300 font-medium">Customer</th>
                <th className="px-6 py-4 text-left text-gray-300 font-medium">Total</th>
                <th className="px-6 py-4 text-left text-gray-300 font-medium">Status</th>
                <th className="px-6 py-4 text-left text-gray-300 font-medium">Date</th>
                <th className="px-6 py-4 text-left text-gray-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-white/10 hover:bg-white/5 transition-all duration-300">
                  <td className="px-6 py-4 text-white font-medium">{order.id}</td>
                  <td className="px-6 py-4 text-gray-300">{order.customer}</td>
                  <td className="px-6 py-4 text-white font-medium">{order.total}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'delivered' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : order.status === 'shipped'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{order.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all duration-300">
                        View
                      </button>
                      <button className="p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all duration-300">
                        Update
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;