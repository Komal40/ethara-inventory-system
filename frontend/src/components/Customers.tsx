import React, { useEffect, useState } from 'react';
import { customerService } from '../services/api';
import { type Customer } from '../types/api';
import { UserPlus, Trash2 } from 'lucide-react';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  const load = () => customerService.getAll().then(res => setCustomers(res.data)).catch(console.error);

  useEffect(() => { load(); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    customerService.create(form)
      .then(() => {
        load();
        setForm({ name: '', email: '', phone: '' });
      })
      .catch(err => alert(err.detail || 'Failed to enroll customer records profile.'));
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this customer account profile?')) {
      customerService.delete(id).then(load).catch(console.error);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold text-slate-800">Customers Directory</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">Full Name</label>
          <input className="w-full border rounded-lg p-2 text-sm focus:ring-1 focus:ring-indigo-500" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">Email Address</label>
          <input type="email" className="w-full border rounded-lg p-2 text-sm focus:ring-1 focus:ring-indigo-500" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">Phone String</label>
          <input className="w-full border rounded-lg p-2 text-sm focus:ring-1 focus:ring-indigo-500" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
        </div>
        <button type="submit" className="md:col-span-3 bg-indigo-600 text-white rounded-lg py-2.5 font-medium text-sm hover:bg-indigo-700 flex items-center justify-center space-x-2 transition-colors">
          <UserPlus size={16} />
          <span>Register Profile Node</span>
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-50 border-b text-gray-600 uppercase text-xs font-bold">
              <th className="p-4">Customer</th>
              <th className="p-4">Email</th>
              <th className="p-4">Phone Line Contact</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {customers.map(c => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-800">{c.name}</td>
                <td className="p-4 text-gray-500">{c.email}</td>
                <td className="p-4 text-gray-600 font-mono">{c.phone}</td>
                <td className="p-4 text-center">
                  <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 p-1">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};