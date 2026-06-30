import { useState, useEffect } from 'react';
import api from '../api';

const T = { primary:'#0D9488', dark:'#0F172A', mid:'#475569', light:'#F1F5F9', accent:'#F59E0B', success:'#22C55E', danger:'#EF4444' };
const fmt = n => 'Rp ' + n.toLocaleString('id-ID');
const statusColor = { pending:T.accent, paid:T.success, processed:T.primary, shipped:'#8B5CF6', delivered:T.success, cancelled:T.danger };

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get('/orders/my').then(r=>setOrders(r.data||[])).catch(()=>{});
  }, []);

  return (
    <div style={{ padding:'32px 48px', background:T.light, minHeight:'100vh' }}>
      <h2 style={{ color:T.dark, fontWeight:900, marginBottom:24 }}>📦 Pesanan Saya</h2>
      {orders.length === 0 ? (
        <div style={{ textAlign:'center', padding:60, color:T.mid }}>
          <div style={{ fontSize:64 }}>📦</div>
          <div style={{ fontWeight:700, marginTop:12 }}>Belum ada pesanan</div>
        </div>
      ) : orders.map(o=>(
        <div key={o.id} style={{ background:'#fff', borderRadius:16, padding:24, marginBottom:16, boxShadow:'0 2px 16px rgba(0,0,0,0.07)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
            <div>
              <div style={{ fontWeight:800, color:T.dark }}>{o.id}</div>
              <div style={{ fontSize:13, color:T.mid }}>{new Date(o.created_at).toLocaleDateString('id-ID')}</div>
            </div>
            <span style={{ background:(statusColor[o.status]||T.mid)+'22', color:statusColor[o.status]||T.mid, padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:700 }}>{o.status}</span>
          </div>
          {(o.items||[]).map((item,i)=>(
            <div key={i} style={{ display:'flex', gap:12, padding:'8px 0', borderTop:'1px solid #F1F5F9', fontSize:13 }}>
              <span style={{ flex:1, color:T.dark }}>{item.product_name} ×{item.qty}</span>
              <span style={{ fontWeight:700 }}>{fmt(item.price*item.qty)}</span>
            </div>
          ))}
          <div style={{ borderTop:`2px solid #CCFBF1`, marginTop:8, paddingTop:8, display:'flex', justifyContent:'flex-end', fontWeight:900, color:T.primary }}>
            Total: {fmt(o.total)}
          </div>
        </div>
      ))}
    </div>
  );
}
