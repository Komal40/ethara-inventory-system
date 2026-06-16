import React, { useEffect, useState } from 'react';
import { orderService, productService, customerService } from '../services/api';
import { type Order, type Product, type Customer } from '../types/api';
import { Modal } from '../common/Modal';
import { ShoppingBag, Plus, Receipt, User } from 'lucide-react';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(0);
  const [cart, setCart] = useState<{ product_id: number; quantity: number; name: string; price: number }[]>([]);
  const [curProduct, setCurProduct] = useState<number>(0);
  const [curQty, setCurQty] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 0ms Delay Instant Detail Modal States
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // PRODUCTION PATTERN: Promise.all handles asynchronous bootstrapping concurrently
  const loadScreenData = () => {
    setIsLoading(true);
    Promise.all([
      orderService.getAll(),
      productService.getAll(),
      customerService.getAll()
    ])
    .then(([orderRes, productRes, customerRes]) => {
      // Backend should already order by ID desc; otherwise fallback reverse locally if needed
      setOrders(orderRes.data);
      setProducts(productRes.data);
      setCustomers(customerRes.data);
    })
    .catch(console.error)
    .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadScreenData();
  }, []);

  const addToCart = () => {
    setErrors({});
    if (!curProduct || curProduct === 0) {
      setErrors({ cartItem: "Please select a valid product asset." });
      return;
    }
    if (curQty <= 0) {
      setErrors({ cartItem: "Quantity metrics must be 1 or higher." });
      return;
    }

    const prod = products.find(p => p.id === curProduct);
    if (!prod) {
      setErrors({ cartItem: "Product structural integrity lookup failed." });
      return;
    }

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
    if (!selectedCustomerId || selectedCustomerId === 0) {
      alert("Please link a target customer account node before checkout submission.");
      return;
    }
    if (cart.length === 0) {
      alert("Basket stack empty. Append catalog nodes to compute totals.");
      return;
    }
    
    const payload = {
      customer_id: selectedCustomerId,
      items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity }))
    };

    orderService.create(payload)
      .then(res => {
        const newOrder = res.data;
        // ⚡ ATOMIC OPTIMIZATION: Push newly mutated order node straight to memory state top
        setOrders(prev => [newOrder, ...prev]);
        
        // Subtract stock quantities locally to reflect changes in real-time instantly without re-fetching products catalog API
        setProducts(prevProducts => 
          prevProducts.map(p => {
            const boughtItem = cart.find(ci => ci.product_id === p.id);
            return boughtItem ? { ...p, quantity: p.quantity - boughtItem.quantity } : p;
          })
        );

        setCart([]);
        setSelectedCustomerId(0);
        setErrors({});
      })
      .catch(err => alert(err.detail || 'Checkout transactional pipe rejected.'));
  };

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-sm text-slate-500 font-medium font-mono animate-pulse">
        Streaming Transactional Registries Stack...
      </div>
    );
  }

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
            <select 
              className="w-full border rounded-lg p-2 text-sm bg-white" 
              value={selectedCustomerId} 
              onChange={e => {
                const parsedVal = parseInt(e.target.value);
                setSelectedCustomerId(isNaN(parsedVal) ? 0 : parsedVal);
              }}
            >
              <option value={0}>-- Select Customer Account --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="border p-4 rounded-lg bg-slate-50 space-y-3">
            <label className="text-xs font-bold text-gray-500 block">Catalog Asset Selector</label>
            <select 
              className="w-full border rounded-lg p-2 text-sm bg-white" 
              value={curProduct} 
              onChange={e => {
                const parsedProd = parseInt(e.target.value);
                // 🛡️ CRITICAL BUGFIX: If user clicks the header block default string, force clear integer state
                setCurProduct(isNaN(parsedProd) ? 0 : parsedProd);
              }}
            >
              <option value={0}>-- Select Catalog Item --</option>
              {products.map(p => (
                <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                  {p.name} (${p.price.toFixed(2)}) — [{p.quantity} Left]
                </option>
              ))}
            </select>
            
            <div className="flex space-x-2">
              <input 
                type="number" 
                min={1} 
                className="w-24 border rounded-lg p-2 text-sm" 
                value={curQty || ''} 
                onChange={e => setCurQty(Math.max(1, parseInt(e.target.value) || 0))} 
              />
              <button type="button" onClick={addToCart} className="flex-1 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 flex items-center justify-center space-x-1 transition-colors">
                <Plus size={14} /> <span>Append Basket</span>
              </button>
            </div>
            {errors.cartItem && <span className="text-xs text-red-500 mt-1 block font-medium">{errors.cartItem}</span>}
          </div>

          {/* Render Active Basket Layout Checklist if node elements array exists */}
          {cart.length > 0 && (
            <div className="border rounded-lg p-3 bg-indigo-50/20 space-y-2">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-indigo-600 block">Staged Basket Allocation</span>
              <div className="max-h-[160px] overflow-y-auto space-y-1.5 divide-y divide-dashed text-xs pr-1">
                {cart.map((item, idx) => (
                  <div key={item.product_id} className={`flex justify-between items-center ${idx > 0 ? 'pt-1.5' : ''}`}>
                    <div>
                      <p className="font-semibold text-slate-800">{item.name}</p>
                      <p className="text-gray-400 font-mono text-[10px]">{item.quantity} units @ ${item.price.toFixed(2)}</p>
                    </div>
                    <span className="font-bold text-slate-700">${(item.quantity * item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-xs text-slate-900">
                <span>Calculated Total:</span>
                <span>${cart.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)}</span>
              </div>
            </div>
          )}

          <button type="submit" disabled={cart.length === 0} className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none transition-colors">
            Commit Balance Check
          </button>
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
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400 italic font-medium">No order transaction ledgers compiled inside directory.</td>
                  </tr>
                ) : (
                  orders.map(o => (
                    <tr key={o.id} onClick={() => openOrderDetail(o)} className="hover:bg-indigo-50/40 cursor-pointer transition-colors">
                      <td className="p-4 font-mono font-bold text-indigo-600">#ORD-00{o.id}</td>
                      <td className="p-4 text-slate-800 font-medium">{o.customer?.name || 'Walk-in Client'}</td>
                      <td className="p-4 text-gray-500">{o.items?.length || 0} Lines</td>
                      <td className="p-4 font-extrabold text-slate-900">${o.total_amount.toFixed(2)}</td>
                    </tr>
                  ))
                )}
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
                  {selectedOrder.customer?.name || 'Unknown Client Reference'}
                </h3>
                <p className="text-xs text-gray-400 pl-5">{selectedOrder.customer?.email || 'No email profile attached'}</p>
                <p className="text-xs text-gray-400 pl-5 font-mono text-[11px]">{selectedOrder.customer?.phone}</p>
              </div>
              <Receipt className="text-slate-300" size={32} />
            </div>

            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Line Items Manifest</span>
              <div className="bg-slate-50 rounded-lg p-3 border space-y-2 max-h-[220px] overflow-y-auto">
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs border-b pb-2 last:border-none last:pb-0">
                      <div>
                        <p className="font-bold text-slate-800">{item.product?.name || `Product Node Target Ref: #${item.product_id}`}</p>
                        {item.product?.sku && <p className="text-gray-400 font-mono text-[10px]">{item.product.sku}</p>}
                        <p className="text-gray-400 mt-0.5">{item.quantity} Units x ${item.unit_price.toFixed(2)}</p>
                      </div>
                      <span className="font-bold text-slate-700 flex items-center">${(item.quantity * item.unit_price).toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic text-center py-2">No nested line rows cascade fetched inside this data block.</p>
                )}
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