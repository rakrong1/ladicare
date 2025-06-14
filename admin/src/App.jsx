// In your App.jsx or main component
import React from 'react';
import AdminPanel from './components/AdminPanel/AdminPanel';
import Dashboard from './components/AdminPanel/Dashboard';
import OrderManagement from './components/AdminPanel/OrderManagement';
import ReviewManagement from './components/AdminPanel/ReviewManagement';

function App() {
  return (
    <div className="App">
      <AdminPanel />
      <Dashboard />
      <OrderManagement />
      <ReviewManagement />
    </div>
  );
}