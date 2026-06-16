import React, { useEffect, useState } from 'react';
import { orderService, productService, customerService } from '../services/api';
import { type Order,type Product, type Customer } from '../types/api';
import { Modal } from '../common/Modal';
import { ShoppingBag, Plus, Receipt, User } from 'lucide-react';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(0);
  const [cart, setCart] = useState<{ product_id: number; quantity: number; name: string; price: number }[]>([]);
  const [curProduct, setCurProduct] = useState<number>(0);
  const [curQty, setCurQty] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 0ms Delay Instant Detail Modal States
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Single source atomic entry points mapping layer
  const loadAll = () => {
    orderService.getAll().then(res => setOrders([...res.data])).catch(console.error);
    productService.getAll().then(res => setProducts(res.data)).catch(console.error);
    customerService.getAll().then(res => setCustomers(res.data)).catch(console.error);
  };

  useEffect(() => { loadAll(); }, []);

  const addToCart = () => {
    setErrors({});
    if (!curProduct || curQty <= 0) return;
    const prod = products.find(p => p.id === curProduct);
    if (!prod) return;

    const existing = cart.find(item => item.product_id === curProduct);
    const totalQty = (existing?.quantity || 0) + curQty;

    if (prod.quantity < totalQty) {
      setErrors({ cartItem: `Only ${prod.quantity} items left in stock metrics.` });
      return;
    }

    if (existing) {
      setCart(cart.map(item => item.product_id === curProduct ? { ...item, quantity: totalQty } : item));
    } else {
      setCart([...cart, { product_id: prod.id, quantity: curQty, name: prod.name, price: prod.price }]);
    }
    setCurProduct(0);
    setCurQty(1);
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || cart.length === 0) return;
    
    const payload = {
      customer_id: selectedCustomerId,
      items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity }))
    };

    orderService.create(payload)
      .then(() => { loadAll(); setCart([]); setSelectedCustomerId(0); setErrors({}); })
      .catch(err => alert(err.detail || 'Checkout pipeline failed.'));
  };

  // NO API CALL MADE HERE: Data extracted instantly from pre-fetched array matrix
  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold text-slate-800">Transactional Order Ledgers</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Cart Form Configuration Card */}
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
          </div>

          <div className="border p-4 rounded-lg bg-slate-50 space-y-3">
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
          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-indigo-700">Commit Balance Check</button>
        </form>

        {/* Dynamic Multi-relational Master Registry Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border overflow-hidden">
         
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[550px]">
              <thead>
                <tr className="bg-slate-50 border-b text-gray-600 uppercase text-xs font-bold">
                  <th className="p-4">OrderID</th>
                  <th className="p-4">Account Holder</th>
                  <th className="p-4">Unique Items</th>
                  <th className="p-4">Total Settled</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {orders.map(o => (
                  <tr key={o.id} onClick={() => openOrderDetail(o)} className="hover:bg-indigo-50/40 cursor-pointer transition-colors">
                    <td className="p-4 font-mono font-bold text-indigo-600">#ORD-00{o.id}</td>
                    <td className="p-4 text-slate-800 font-medium">{o.customer?.name || 'Walk-in Client'}</td>
                    <td className="p-4 text-gray-500">{o.items?.length || 0} Lines</td>
                    <td className="p-4 font-extrabold text-slate-900">${o.total_amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* NO RE-FETCH REAL-TIME INSTANT INVOICE MODAL */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Invoice Audit Manifest">
        {selectedOrder && (
          <div className="space-y-4">
            <div className="border-b pb-3 flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-indigo-600 font-mono block">Order Reference: #ORD-00{selectedOrder.id}</span>
                <h3 className="text-md font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                  <User size={16} className="text-slate-400" />
                  {selectedOrder.customer?.name || 'Unknown'}
                </h3>
                <p className="text-xs text-gray-400 pl-5">{selectedOrder.customer?.email || 'No email attached'}</p>
                <p className="text-xs text-gray-400 pl-5 font-mono">{selectedOrder.customer?.phone}</p>
              </div>
              <Receipt className="text-slate-300" size={32} />
            </div>

            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Line Items Manifest</span>
              <div className="bg-slate-50 rounded-lg p-3 border space-y-2">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs border-b pb-2 last:border-none last:pb-0">
                    <div>
                      {/* Eager loaded product details accessed instantly inside memory */}
                      <p className="font-bold text-slate-800">{item.product?.name || `Product Asset #${item.product_id}`}</p>
                      <p className="text-gray-400 font-mono text-[11px]">{item.product?.sku}</p>
                      <p className="text-gray-400 mt-0.5">{item.quantity} Units x ${item.unit_price.toFixed(2)}</p>
                    </div>
                    <span className="font-bold text-slate-700 flex items-center">${(item.quantity * item.unit_price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t font-bold text-base text-slate-900">
              <span>Grand Total Settled:</span>
              <span className="text-xl text-indigo-600 font-extrabold">${selectedOrder.total_amount.toFixed(2)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};