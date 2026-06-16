import React, { useEffect, useState } from 'react';
import { orderService, productService, customerService } from '../services/api';
import { type Order,type Product,type Customer } from '../types/api';
import { Modal } from '../common/Modal';
import { ShoppingBag, Plus, AlertTriangle } from 'lucide-react';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(0);
  const [cart, setCart] = useState<{ product_id: number; quantity: number; name: string; price: number }[]>([]);
  const [curProduct, setCurProduct] = useState<number>(0);
  const [curQty, setCurQty] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Custom UI alert state structure configuration
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '' });

  const loadAll = () => {
    orderService.getAll().then(res => setOrders(res.data)).catch(console.error);
    productService.getAll().then(res => setProducts(res.data)).catch(console.error);
    customerService.getAll().then(res => setCustomers(res.data)).catch(console.error);
  };

  useEffect(() => { loadAll(); }, []);

  const addToCart = () => {
    setErrors({});
    if (!curProduct) {
      setErrors({ cartItem: "Please select a product item." });
      return;
    }
    if (curQty <= 0) {
      setErrors({ cartItem: "Quantity must be at least 1 unit." });
      return;
    }

    const prod = products.find(p => p.id === curProduct);
    if (!prod) return;

    const existingCartItem = cart.find(item => item.product_id === curProduct);
    const totalRequestedQty = (existingCartItem?.quantity || 0) + curQty;

    if (prod.quantity < totalRequestedQty) {
      setErrors({ cartItem: `Insufficient stock. Only ${prod.quantity} units available.` });
      return;
    }

    if (existingCartItem) {
      setCart(cart.map(item => item.product_id === curProduct ? { ...item, quantity: totalRequestedQty } : item));
    } else {
      setCart([...cart, { product_id: prod.id, quantity: curQty, name: prod.name, price: prod.price }]);
    }

    setCurProduct(0);
    setCurQty(1);
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    const tempErrors: Record<string, string> = {};

    if (!selectedCustomerId) tempErrors.customer = "You must select a target customer.";
    if (cart.length === 0) tempErrors.cart = "Your shopping basket selection is empty.";

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
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
        setErrors({});
      })
      .catch(err => {
        // Replaced native checkout exception alert with custom structured modal popup
        setAlertModal({
          isOpen: true,
          title: "Checkout Transact Rejected",
          message: err.detail || "Order submission failed due to data consistency conflicts."
        });
      });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold text-slate-800">Transactional Order Ledgers</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleCheckout} className="bg-white p-6 rounded-xl shadow-sm border space-y-4 h-fit">
          <h2 className="text-lg font-bold text-slate-700 flex items-center space-x-2 border-b pb-2">
            <ShoppingBag size={18} className="text-indigo-600" />
            <span>Create New Checkout Unit</span>
          </h2>
          
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">Target Account Profile</label>
            <select className="w-full border rounded-lg p-2 text-sm bg-white" value={selectedCustomerId} onChange={e => setSelectedCustomerId(parseInt(e.target.value))}>
              <option value={0}>-- Select Customer Account --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.customer && <span className="text-xs text-red-500 mt-1 block">{errors.customer}</span>}
          </div>

          <div className="border p-4 rounded-lg bg-slate-50 space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase">Append Item Stream</span>
            <select className="w-full border rounded-lg p-2 text-sm bg-white" value={curProduct} onChange={e => setCurProduct(parseInt(e.target.value))}>
              <option value={0}>-- Select Catalog Item --</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price})</option>)}
            </select>
            <div className="flex space-x-2">
              <input type="number" min={1} className="w-24 border rounded-lg p-2 text-sm" value={curQty} onChange={e => setCurQty(parseInt(e.target.value) || 0)} />
              <button type="button" onClick={addToCart} className="flex-1 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 flex items-center justify-center space-x-1">
                <Plus size={14} /> <span>Append Basket</span>
              </button>
            </div>
            {errors.cartItem && <span className="text-xs text-red-500 mt-1 block">{errors.cartItem}</span>}
          </div>

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
          {errors.cart && <span className="text-xs text-red-500 mt-1 block">{errors.cart}</span>}

          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-indigo-700 transition-colors">
            Commit Financial Balance Check
          </button>
        </form>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[550px]">
              <thead>
                <tr className="bg-slate-50 border-b text-gray-600 uppercase text-xs font-bold">
                  <th className="p-4">OrderID</th>
                  <th className="p-4">Account Holder</th>
                  <th className="p-4">Items Manifest</th>
                  <th className="p-4">Total Settled</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="p-4 font-mono font-bold text-indigo-600">#ORD-00{o.id}</td>
                    <td className="p-4 text-slate-800 font-medium">{o.customer?.name || `Customer ID: ${o.customer_id}`}</td>
                    <td className="p-4 text-gray-500">{o.items?.length || 0} Distinct Units</td>
                    <td className="p-4 font-extrabold text-slate-900">${o.total_amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Unified Transaction Error Alert Modal Context Popup */}
      <Modal 
        isOpen={alertModal.isOpen} 
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })} 
        title={alertModal.title}
      >
        <div className="flex items-start space-x-3 text-slate-600">
          <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
          <p>{alertModal.message}</p>
        </div>
        <div className="mt-5 flex justify-end">
          <button 
            onClick={() => setAlertModal({ ...alertModal, isOpen: false })}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-semibold"
          >
            Dismiss Alert
          </button>
        </div>
      </Modal>
    </div>
  );
};