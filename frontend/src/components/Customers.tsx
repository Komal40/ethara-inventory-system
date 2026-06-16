import React, { useEffect, useState } from 'react';
import { customerService } from '../services/api';
import { type Customer } from '../types/api';
import { Modal } from '../common/Modal';
import { UserPlus, Trash2, AlertCircle } from 'lucide-react';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Modal Dialog UI state configurations
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, targetId: 0 });

  const load = () => customerService.getAll().then(res => setCustomers(res.data)).catch(console.error);

  useEffect(() => { load(); }, []);

  const validateForm = () => {
    const tempErrors: Record<string, string> = {};
    if (!form.name.trim()) tempErrors.name = "Full Name is required.";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      tempErrors.email = "Email address is required.";
    } else if (!emailRegex.test(form.email)) {
      tempErrors.email = "Please enter a valid email format.";
    }

    const phoneRegex = /^\d{10,15}$/;
    if (!form.phone.trim()) {
      tempErrors.phone = "Phone number is required.";
    } else if (!phoneRegex.test(form.phone)) {
      tempErrors.phone = "Phone number must be between 10 to 15 digits long.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    customerService.create(form)
      .then(() => {
        load();
        setForm({ name: '', email: '', phone: '' });
        setErrors({});
      })
      .catch(err => {
        // Replaced native alert with custom modal popup
        setAlertModal({
          isOpen: true,
          title: "Registration Error",
          message: err.detail || "Failed to complete customer configuration profiles."
        });
      });
  };

  const executeDelete = () => {
    if (confirmModal.targetId !== 0) {
      customerService.delete(confirmModal.targetId)
        .then(() => {
          load();
          setConfirmModal({ isOpen: false, targetId: 0 });
        })
        .catch(console.error);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold text-slate-800">Customers Directory</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">Full Name</label>
          <input className="w-full border rounded-lg p-2 text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          {errors.name && <span className="text-xs text-red-500 mt-1 block">{errors.name}</span>}
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">Email Address</label>
          <input className="w-full border rounded-lg p-2 text-sm" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          {errors.email && <span className="text-xs text-red-500 mt-1 block">{errors.email}</span>}
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">Phone Number</label>
          <input className="w-full border rounded-lg p-2 text-sm" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          {errors.phone && <span className="text-xs text-red-500 mt-1 block">{errors.phone}</span>}
        </div>
        <button type="submit" className="md:col-span-3 bg-indigo-600 text-white rounded-lg py-2.5 font-medium text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2">
          <UserPlus size={16} />
          <span>Register Profile Node</span>
        </button>
      </form>

      {/* Directory Table Layout */}
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-50 border-b text-gray-600 uppercase text-xs font-bold">
              <th className="p-4">Customer</th>
              <th className="p-4">Email</th>
              <th className="p-4">Phone Line</th>
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
                  <button 
                    onClick={() => setConfirmModal({ isOpen: true, targetId: c.id })} 
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* UI Error/Warning Notification Modal */}
      <Modal 
        isOpen={alertModal.isOpen} 
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })} 
        title={alertModal.title}
      >
        <div className="flex items-start space-x-3 text-slate-600">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <p>{alertModal.message}</p>
        </div>
        <div className="mt-5 flex justify-end">
          <button 
            onClick={() => setAlertModal({ ...alertModal, isOpen: false })}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-semibold tracking-wide"
          >
            Acknowledge
          </button>
        </div>
      </Modal>

      {/* UI Resource Destruction Confirmation Modal */}
      <Modal 
        isOpen={confirmModal.isOpen} 
        onClose={() => setConfirmModal({ isOpen: false, targetId: 0 })} 
        title="Confirm Deletion"
      >
        <p className="text-slate-600 text-sm">
          Are you sure you want to permanently delete this customer profile registry? This action cannot be undone.
        </p>
        <div className="mt-5 flex justify-end space-x-2">
          <button 
            onClick={() => setConfirmModal({ isOpen: false, targetId: 0 })}
            className="border text-gray-500 hover:bg-gray-50 px-4 py-2 rounded-lg text-xs font-semibold"
          >
            Cancel
          </button>
          <button 
            onClick={executeDelete}
            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-semibold"
          >
            Confirm Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};