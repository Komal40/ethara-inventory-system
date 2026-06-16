import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/api';
import { type DashboardMetrics } from '../types/api';
import { Layers, Users, ShoppingBag, AlertTriangle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [err, setErr] = useState<string>('');

  useEffect(() => {
    dashboardService.getMetrics()
      .then(res => setMetrics(res.data))
      .catch(() => setErr('Could not reach backend API pipeline server.'));
  }, []);

  if (err) return <div className="p-4 bg-red-100 text-red-700 rounded-xl border border-red-200 font-medium">{err}</div>;
  if (!metrics) return <div className="text-gray-500 animate-pulse font-medium">Loading analytics...</div>;

  const cards = [
    { title: 'Total Products', val: metrics.total_products, icon: Layers, color: 'bg-blue-500' },
    { title: 'Registered Customers', val: metrics.total_customers, icon: Users, color: 'bg-green-500' },
    { title: 'Orders Formed', val: metrics.total_orders, icon: ShoppingBag, color: 'bg-purple-500' },
    { title: 'Low Stock Items', val: metrics.low_stock_products, icon: AlertTriangle, color: 'bg-red-500' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-slate-800 mb-8">System Analytics Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4">
            <div className={`${c.color} p-4 rounded-lg text-white`}><c.icon size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{c.title}</p>
              <p className="text-2xl font-bold text-gray-800">{c.val}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};