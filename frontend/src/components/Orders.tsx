import React, { useEffect, useState } from 'react';
import { orderService, productService, customerService } from '../services/api';
import {type Order,type Product,type Customer } from '../types/api';
import { ShoppingBag, Plus, Trash2 } from 'lucide-react';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(0);
  const [cart, setCart] = useState<{ product_id: number; quantity: number; name: string; price: number }[]>([]);
  const [curProduct, setCurProduct] = useState<number>(0);
  const [curQty, setCurQty] = useState<number>(1);

  const loadAll = () => {
    orderService.getAll().then(res => setOrders(res.data)).catch(console.error);
    productService.getAll().then(res => setProducts(res.data)).catch(console.error);
    customerService.getAll().then(res => setCustomers(res.data)).catch(console.error);
  };

  useEffect(() => { loadAll(); }, []);

  const addToCart = () => {
    if (!curProduct || curQty <= 0) return;
    const prod = products.find(p => p.id === curProduct);
    if (!prod) return;

    if (prod.quantity < curQty) {
      alert(`Insufficient product stock capacity. Available: ${prod.quantity}`);
      return;
    }

    setCart([...cart, { product_id: prod.id, quantity: curQty, name: prod.name, price: prod.price }]);
    setCurProduct(0);
    setCurQty(1);
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || cart.length === 0) {
      alert('Please select a profile client target and append inventory stock variables.');
      return;
    }

    const payload = {
      customer_id: selectedCustomerId,
      items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity }))
    };

    orderService.create(payload)
      .then(() => {
        loadAll();
        setCart([]);
        setSelectedCustomerId(0);
      })
      .catch(err => alert(err.detail || 'Checkout process rejected. Check component data locks.'));
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold text-slate-800">Transactional Order Ledgers</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column panels: Interactive Cart builder mechanism */}
        <form onSubmit={handleCheckout} className="bg-white p-6 rounded-xl shadow-sm border space-y-4 h-fit">
          <h2 className="text-lg font-bold text-slate-700 flex items-center space-x-2 border-b pb-2">
            <ShoppingBag size={18} className="text-indigo-600" />
            <span>Create New Checkout Unit</span>
          </h2>
          
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">Target Account Profile</label>
            <select className="w-full border rounded-lg p-2 text-sm bg-white" value={selectedCustomerId} onChange={e => setSelectedCustomerId(parseInt(e.target.value))} required>
              <option value={0}>-- Select Customer Account --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
            </select>
          </div>

          <div className="border p-4 rounded-lg bg-slate-50 space-y-3">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Append Item Stream</span>
            <select className="w-full border rounded-lg p-2 text-sm bg-white" value={curProduct} onChange={e => setCurProduct(parseInt(e.target.value))}>
              <option value={0}>-- Select Catalog Item --</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} - ${p.price} ({p.quantity} left)</option>)}
            </select>
            <div className="flex space-x-2">
              <input type="number" min={1} className="w-24 border rounded-lg p-2 text-sm" value={curQty} onChange={e => setCurQty(parseInt(e.target.value))} />
              <button type="button" onClick={addToCart} className="flex-1 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 flex items-center justify-center space-x-1">
                <Plus size={14} /> <span>Append Basket</span>
              </button>
            </div>
          </div>

          {/* Render Active Cart Queue List stack */}
          {cart.length > 0 && (
            <div className="divide-y border-t pt-2 max-h-40 overflow-y-auto">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 text-xs">
                  <div>
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-gray-500">{item.quantity} x ${item.price.toFixed(2)}</p>
                  </div>
                  <span className="font-bold text-slate-700">${(item.quantity * item.price).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          <button type="submit" disabled={cart.length === 0} className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
            Commit Financial Balance Check
          </button>
        </form>

        {/* Right column view panel element: Full History Grid Log View Ledger info table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[550px]">
              <thead>
                <tr className="bg-slate-50 border-b text-gray-600 uppercase text-xs font-bold">
                  <th className="p-4">OrderID</th>
                  <th className="p-4">Account Holder</th>
                  <th className="p-4">Items Manifest Count</th>
                  <th className="p-4">Total Settled</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="p-4 font-mono font-bold text-indigo-600">#ORD-00{o.id}</td>
                    <td className="p-4 text-slate-800 font-medium">{o.customer?.name || `ID References: ${o.customer_id}`}</td>
                    <td className="p-4 text-gray-500">{o.items?.length || 0} Distinct Units</td>
                    <td className="p-4 font-extrabold text-slate-900">${o.total_amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};