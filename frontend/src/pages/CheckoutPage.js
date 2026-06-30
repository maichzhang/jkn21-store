import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const T = { primary:'#0D9488', dark:'#0F172A', mid:'#475569', light:'#F1F5F9', danger:'#EF4444', success:'#22C55E' };
const fmt = n => 'Rp ' + n.toLocaleString('id-ID');
const inp = { width:'100%', padding:'11px 14px', borderRadius:10, border:'1.5px solid #CBD5E1',
  fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:12 };
const btn = (v='primary') => ({ background:v==='primary'?T.primary:v==='danger'?T.danger:'#fff',
  color:v==='outline'?T.primary:'#fff', border:v==='outline'?`2px solid ${T.primary}`:'none',
  padding:'12px 24px', borderRadius:10, fontWeight:700, cursor:'pointer', fontSize:15 });

export default function CheckoutPage() {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ shipping_name: user?.name || '', shipping_phone: '', shipping_address: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    // Load Midtrans Snap script
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', process.env.REACT_APP_MIDTRANS_CLIENT_KEY);
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleOrder = async () => {
    if (!form.shipping_name || !form.shipping_phone || !form.shipping_address)
      return setErr('Lengkapi data pengiriman!');
    setLoading(true);
    setErr('');
    try {
      const items = cart.map(i => ({ product_id: i.product_id, qty: i.qty }));
      const res = await api.post('/orders', { items, ...form });

      // Open Midtrans Snap
      window.snap.pay(res.data.snap_token, {
        onSuccess: () => { nav('/orders'); },
        onPending: () => { nav('/orders'); },
        onError: () => setErr('Pembayaran gagal. Coba lagi.'),
        onClose: () => setErr('Pembayaran dibatalkan.'),
      });
    } catch (e) {
      setErr(e.response?.data?.message || 'Gagal membuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  if (!cart.length) return (
    <div style={{ textAlign:'center', padding:80 }}>
      <div style={{ fontSize:64 }}>🛒</div>
      <div style={{ fontWeight:700, color:T.mid, margin:'16px 0' }}>Keranjang kosong</div>
      <button onClick={()=>nav('/products')} style={btn()}>Belanja Dulu</button>
    </div>
  );

  return (
    <div style={{ padding:'32px 48px', background:T.light, minHeight:'100vh' }}>
      <h2 style={{ color:T.dark, fontWeight:900, marginBottom:24 }}>💳 Checkout</h2>
      {err && <div style={{ background:'#FEE2E2', color:T.danger, padding:'12px 16px', borderRadius:10, marginBottom:16 }}>{err}</div>}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:24 }}>
        <div style={{ background:'#fff', borderRadius:16, padding:24, boxShadow:'0 2px 16px rgba(0,0,0,0.07)' }}>
          <h3 style={{ margin:'0 0 16px', color:T.dark }}>📍 Data Pengiriman</h3>
          {[['Nama Penerima','shipping_name','text'],['No. Telepon','shipping_phone','tel'],['Alamat Lengkap','shipping_address','text']].map(([l,k,t])=>(
            <div key={k}>
              <label style={{ fontSize:13, fontWeight:600, color:T.dark, display:'block', marginBottom:6 }}>{l}</label>
              {k === 'shipping_address'
                ? <textarea style={{ ...inp, minHeight:80, resize:'vertical' }} value={form[k]}
                    onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={l}/>
                : <input style={inp} type={t} value={form[k]}
                    onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={l}/>
              }
            </div>
          ))}
          <label style={{ fontSize:13, fontWeight:600, color:T.dark, display:'block', marginBottom:6 }}>Catatan (opsional)</label>
          <textarea style={{ ...inp, minHeight:60, resize:'vertical' }} value={form.notes}
            onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Catatan untuk penjual..."/>
        </div>

        <div>
          <div style={{ background:'#fff', borderRadius:16, padding:24, boxShadow:'0 2px 16px rgba(0,0,0,0.07)' }}>
            <h3 style={{ margin:'0 0 16px', color:T.dark }}>🧾 Ringkasan Pesanan</h3>
            {cart.map(i=>(
              <div key={i.id} style={{ display:'flex', gap:12, padding:'8px 0', borderBottom:'1px solid #F1F5F9' }}>
                <div style={{ fontSize:28, width:40, height:40, background:T.light, borderRadius:8,
                  display:'flex', alignItems:'center', justifyContent:'center' }}>{i.image || '📦'}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:T.dark }}>{i.name}</div>
                  <div style={{ fontSize:12, color:T.mid }}>×{i.qty}</div>
                </div>
                <div style={{ fontWeight:700, fontSize:13 }}>{fmt(i.price * i.qty)}</div>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', fontSize:13, color:T.mid }}>
              <span>Ongkir</span><span style={{ color:T.success }}>Gratis</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontWeight:900,
              color:T.primary, fontSize:18, borderTop:`2px solid #CCFBF1`, paddingTop:12, marginBottom:16 }}>
              <span>Total</span><span>{fmt(total)}</span>
            </div>
            <div style={{ background:'#FFFBEB', borderRadius:10, padding:12, marginBottom:16, fontSize:12, color:'#92400E' }}>
              🔒 Pembayaran aman via <strong>Midtrans</strong> — Transfer, QRIS, E-Wallet, Kartu Kredit
            </div>
            <button onClick={handleOrder} disabled={loading}
              style={{ ...btn('primary'), width:'100%', opacity:loading?0.7:1 }}>
              {loading ? '⏳ Memproses...' : '💳 Bayar Sekarang'}
            </button>
            <button onClick={()=>nav('/cart')} style={{ ...btn('outline'), width:'100%', marginTop:8 }}>
              ← Kembali ke Keranjang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
