import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const T = { primary:'#0D9488', dark:'#0F172A', mid:'#475569', light:'#F1F5F9', danger:'#EF4444', success:'#22C55E' };
const fmt = n => 'Rp ' + n.toLocaleString('id-ID');

export default function CartPage() {
  const { cart, updateQty, removeItem, total, count } = useCart();
  const nav = useNavigate();

  if (!cart.length) return (
    <div style={{ textAlign:'center', padding:80 }}>
      <div style={{ fontSize:64 }}>🛒</div>
      <div style={{ fontWeight:700, color:T.mid, margin:'16px 0' }}>Keranjang masih kosong</div>
      <button onClick={()=>nav('/products')} style={{ background:T.primary, color:'#fff', border:'none', padding:'12px 24px', borderRadius:10, fontWeight:700, cursor:'pointer' }}>Mulai Belanja</button>
    </div>
  );

  return (
    <div style={{ padding:'32px 48px', background:T.light, minHeight:'100vh' }}>
      <h2 style={{ color:T.dark, fontWeight:900, marginBottom:24 }}>🛒 Keranjang ({count} item)</h2>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:24 }}>
        <div style={{ background:'#fff', borderRadius:16, padding:24, boxShadow:'0 2px 16px rgba(0,0,0,0.07)' }}>
          {cart.map(item=>(
            <div key={item.id} style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 0', borderBottom:'1px solid #F1F5F9' }}>
              <div style={{ fontSize:36, background:T.light, borderRadius:10, width:56, height:56, display:'flex', alignItems:'center', justifyContent:'center' }}>📦</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, color:T.dark }}>{item.name}</div>
                <div style={{ color:T.primary, fontWeight:700 }}>{fmt(item.price)}</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <button onClick={()=>updateQty(item.id, item.qty-1)} style={{ background:'#F1F5F9', border:'none', width:30, height:30, borderRadius:8, cursor:'pointer', fontWeight:700 }}>−</button>
                <span style={{ fontWeight:700, minWidth:24, textAlign:'center' }}>{item.qty}</span>
                <button onClick={()=>updateQty(item.id, item.qty+1)} style={{ background:T.primary, color:'#fff', border:'none', width:30, height:30, borderRadius:8, cursor:'pointer', fontWeight:700 }}>+</button>
              </div>
              <div style={{ fontWeight:900, minWidth:100, textAlign:'right' }}>{fmt(item.price*item.qty)}</div>
              <button onClick={()=>removeItem(item.id)} style={{ background:'none', border:'none', color:T.danger, cursor:'pointer', fontSize:18 }}>🗑</button>
            </div>
          ))}
        </div>
        <div style={{ background:'#fff', borderRadius:16, padding:24, boxShadow:'0 2px 16px rgba(0,0,0,0.07)', alignSelf:'start' }}>
          <h3 style={{ margin:'0 0 16px', color:T.dark }}>Ringkasan</h3>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:14 }}>
            <span>Subtotal</span><span>{fmt(total)}</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16, fontSize:14, color:T.success }}>
            <span>Ongkir</span><span>Gratis</span>
          </div>
          <div style={{ borderTop:`2px solid #CCFBF1`, paddingTop:16, display:'flex', justifyContent:'space-between', fontWeight:900, color:T.primary, fontSize:18, marginBottom:16 }}>
            <span>Total</span><span>{fmt(total)}</span>
          </div>
          <button onClick={()=>nav('/checkout')} style={{ width:'100%', background:T.primary, color:'#fff', border:'none', padding:'13px', borderRadius:10, fontWeight:700, fontSize:15, cursor:'pointer' }}>
            Checkout →
          </button>
        </div>
      </div>
    </div>
  );
}
