import React from 'react';
import { Star } from 'lucide-react';

const ReviewManagement = () => {
  const reviews = [
    { id: 1, product: 'Skincare Serum', customer: 'Alice Smith', rating: 5, comment: 'Amazing product! Love it.', status: 'pending' },
    { id: 2, product: 'Hair Treatment', customer: 'Bob Johnson', rating: 4, comment: 'Good quality, fast shipping.', status: 'approved' },
    { id: 3, product: 'Moisturizer', customer: 'Carol White', rating: 3, comment: 'Decent product but could be better.', status: 'pending' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-2">Review Management</h2>
        <p className="text-gray-300">Moderate and approve customer reviews</p>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white font-medium">{review.product}</h3>
                <p className="text-gray-400 text-sm">by {review.customer}</p>
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-300 mb-4">{review.comment}</p>
            <div className="flex justify-between items-center">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                review.status === 'approved' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}>
                {review.status}
              </span>
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all duration-300">
                  Approve
                </button>
                <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300">
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewManagement;