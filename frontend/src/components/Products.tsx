import React, { useEffect, useState } from 'react';
import { productService } from '../services/api';
import { type Product } from '../types/api';
import { Modal } from '../common/Modal';
import { BarChart3, ShieldAlert, PackageCheck, Edit2, PlusCircle, RotateCcw } from 'lucide-react';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: '', sku: '', price: 0, quantity: 0 });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Track karke rakhein ki hum create kar rhe hain ya kisi existing id ko edit
  const [editingId, setEditingId] = useState<number | null>(null);

  // States for Detail View Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Initial load: Sirf screen par pehli baar aane par chalega
  useEffect(() => {
    productService.getAll()
      .then(res => setProducts(res.data)) // Backend already order_by desc bhej raha hai
      .catch(console.error);
  }, []);

  const validateForm = () => {
    const tempErrors: Record<string, string> = {};
    if (!form.name.trim()) tempErrors.name = "Product Name is required.";
    const skuRegex = /^[A-Z0-9-]+$/i;
    if (!form.sku.trim()) {
      tempErrors.sku = "SKU is required.";
    } else if (!skuRegex.test(form.sku)) {
      tempErrors.sku = "SKU must be alphanumeric.";
    }
    if (form.price <= 0) tempErrors.price = "Price must be greater than 0.";
    if (form.quantity < 0) tempErrors.quantity = "Stock cannot be negative.";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingId) {
      // ⚡ UPDATE WORKFLOW (No redundancy: state updated locally)
      productService.update(editingId, form)
        .then(res => {
          const updatedProduct = res.data;
          setProducts(prev => prev.map(p => p.id === editingId ? updatedProduct : p));
          resetForm();
        })
        .catch(err => alert(err.detail || 'Update operation failed.'));
    } else {
      // ⚡ CREATE WORKFLOW (No redundancy: prepended instantly to top)
      productService.create(form)
        .then(res => {
          const newProduct = res.data;
          setProducts(prev => [newProduct, ...prev]);
          resetForm();
        })
        .catch(err => alert(err.detail || 'Save operation failed.'));
    }
  };

  const handleEditClick = (product: Product) => {
    setIsDetailOpen(false); // Close modal sheet
    setEditingId(product.id);
    setForm({
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity: product.quantity
    });
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Form par focus le jaane k liye scroll up
  };

  const resetForm = () => {
    setForm({ name: '', sku: '', price: 0, quantity: 0 });
    setEditingId(null);
    setErrors({});
  };

  const openDetail = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-slate-800">Master Product Catalog</h1>
        {editingId && (
          <button onClick={resetForm} className="flex items-center space-x-1 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors">
            <RotateCcw size={14} />
            <span>Cancel Edit Mode</span>
          </button>
        )}
      </div>
      
      {/* Dynamic Action Form (Handles both Create & Update views dynamically) */}
      <form onSubmit={handleSubmit} className={`p-6 rounded-xl shadow-sm border grid grid-cols-1 md:grid-cols-4 gap-4 items-end transition-all ${editingId ? 'bg-amber-50/40 border-amber-200' : 'bg-white'}`}>
        
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">Product Name</label>
          <input className="w-full border rounded-lg p-2 text-sm bg-white" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          {errors.name && <span className="text-xs text-red-500 mt-1 block">{errors.name}</span>}
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">SKU</label>
          <input className="w-full border rounded-lg p-2 text-sm uppercase bg-white disabled:opacity-50" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} />
          {errors.sku && <span className="text-xs text-red-500 mt-1 block">{errors.sku}</span>}
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">Price ($)</label>
          <input type="number" step="0.01" className="w-full border rounded-lg p-2 text-sm bg-white" value={form.price || ''} onChange={e => setForm({...form, price: parseFloat(e.target.value) || 0})} />
          {errors.price && <span className="text-xs text-red-500 mt-1 block">{errors.price}</span>}
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">Stock Quantity</label>
          <input type="number" className="w-full border rounded-lg p-2 text-sm bg-white" value={form.quantity || ''} onChange={e => setForm({...form, quantity: parseInt(e.target.value) || 0})} />
          {errors.quantity && <span className="text-xs text-red-500 mt-1 block">{errors.quantity}</span>}
        </div>
        <button type="submit" className={`md:col-span-4 text-white rounded-lg py-2.5 font-medium text-sm transition-colors flex items-center justify-center space-x-2 ${editingId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
          {editingId ? <Edit2 size={16} /> : <PlusCircle size={16} />}
          <span>{editingId ? 'Commit Modifications Data' : 'Add New Product Asset'}</span>
        </button>
      </form>

      {/* Catalog Table View */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <p className="p-4 text-xs text-slate-400 font-medium bg-slate-50 border-b">💡 Click any row layout log to access detail assessment metrics and full modification modules.</p>
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
              <tr key={p.id} onClick={() => openDetail(p)} className={`cursor-pointer transition-colors ${editingId === p.id ? 'bg-amber-50 hover:bg-amber-100/70' : 'hover:bg-indigo-50/40'}`}>
                <td className="p-4 font-medium text-slate-800 flex items-center gap-2">
                  {p.name}
                  {editingId === p.id && <span className="text-[10px] bg-amber-200 text-amber-800 font-bold px-1.5 py-0.5 rounded">Editing</span>}
                </td>
                <td className="p-4 text-gray-500 font-mono text-xs">{p.sku}</td>
                <td className="p-4 font-semibold text-slate-700">${p.price.toFixed(2)}</td>
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

      {/* DETAILED MODAL WITH INLINE EDIT ROUTER */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Product Deep Dive Assessment">
        {selectedProduct && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">System Database ID: #PROD-{selectedProduct.id}</span>
                <h2 className="text-xl font-bold text-slate-800">{selectedProduct.name}</h2>
                <p className="text-xs font-mono text-indigo-600">SKU Core: {selectedProduct.sku}</p>
              </div>
              
              {/* EDIT TRIGGER BUTTON inside Modal */}
              <button 
                onClick={() => handleEditClick(selectedProduct)}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 p-2 rounded-lg transition-colors flex items-center space-x-1 text-xs font-bold"
              >
                <Edit2 size={14} />
                <span>Modify</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border p-3 rounded-lg">
                <span className="text-xs text-gray-400 block">Unit Cost</span>
                <span className="text-lg font-bold text-slate-700">${selectedProduct.price.toFixed(2)}</span>
              </div>
              <div className="border p-3 rounded-lg">
                <span className="text-xs text-gray-400 block">Current Stock</span>
                <span className="text-lg font-bold text-slate-700">{selectedProduct.quantity} Units</span>
              </div>
            </div>

            <div className="border p-4 rounded-lg flex items-center justify-between bg-indigo-50/30">
              <div className="flex items-center space-x-3">
                <BarChart3 className="text-indigo-600" size={20} />
                <div>
                  <span className="text-xs text-gray-500 block font-medium">Total Asset Value Valuation</span>
                  <span className="text-md font-extrabold text-slate-800">${(selectedProduct.price * selectedProduct.quantity).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs font-medium p-3 rounded-lg border">
              {selectedProduct.quantity < 5 ? (
                <>
                  <ShieldAlert className="text-red-500" size={16} />
                  <span className="text-red-700">Critical Status: Replenishment workflow required immediately.</span>
                </>
              ) : (
                <>
                  <PackageCheck className="text-green-500" size={16} />
                  <span className="text-green-700">Healthy Status: Stock parameters are safe within standards.</span>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};