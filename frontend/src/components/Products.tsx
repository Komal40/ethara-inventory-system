import React, { useEffect, useState } from 'react';
import { productService } from '../services/api';
import { type Product } from '../types/api';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: '', sku: '', price: 0, quantity: 0 });

  const load = () => productService.getAll().then(res => setProducts(res.data)).catch(console.error);

  useEffect(() => { load(); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    productService.create(form)
      .then(() => { 
        load(); 
        setForm({ name: '', sku: '', price: 0, quantity: 0 }); 
      })
      .catch(err => alert(err.detail || 'An error occurred during save operations.'));
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold text-slate-800">Master Product Catalog</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border grid grid-cols-4 gap-4 items-end">
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">Product Name</label>
          <input className="w-full border rounded-lg p-2 text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">SKU</label>
          <input className="w-full border rounded-lg p-2 text-sm" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} required />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">Price ($)</label>
          <input type="number" step="0.01" className="w-full border rounded-lg p-2 text-sm" value={form.price || ''} onChange={e => setForm({...form, price: parseFloat(e.target.value)})} required />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">Stock Quantity</label>
          <input type="number" className="w-full border rounded-lg p-2 text-sm" value={form.quantity || ''} onChange={e => setForm({...form, quantity: parseInt(e.target.value)})} required />
        </div>
        <button type="submit" className="col-span-4 bg-indigo-600 text-white rounded-lg py-2.5 font-medium text-sm hover:bg-indigo-700 transition-colors">
          Add New Product Asset
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b text-gray-600 uppercase text-xs font-bold">
              <th className="p-4">Product</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-800">{p.name}</td>
                <td className="p-4 text-gray-500">{p.sku}</td>
                <td className="p-4 font-semibold">${p.price.toFixed(2)}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${p.quantity < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {p.quantity} Units
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};