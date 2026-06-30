import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const T = { primary:'#0D9488', primary2:'#0F766E', primary3:'#CCFBF1', dark:'#0F172A', mid:'#475569', light:'#F1F5F9', accent:'#F59E0B', success:'#22C55E' };
const fmt = n => 'Rp ' + n.toLocaleString('id-ID');

function ProductCard({ p, onAdd }) {
  return (
    <div style={{ background:'#fff', borderRadius:16, overflow:'hidden', boxShadow:'0 2px 16px rgba(0,0,0,0.07)', transition:'transform .2s' }}
      onMouseEnter={e=>e.currentTarget.style.transform='translateY(-4px)'}
      onMouseLeave={e=>e.currentTarget.style.transform=''}>
      <div style={{ background:`linear-gradient(135deg,${T.primary3},#E0F2FE)`, height:140,
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:52 }}>
        {p.image && !p.image.startsWith('/') ? p.image : '📦'}
      </div>
      <div style={{ padding:14 }}>
        <div style={{ fontSize:11, color:T.primary, fontWeight:700, marginBottom:4 }}>{p.category_name}</div>
        <div style={{ fontWeight:700, color:T.dark, fontSize:14, marginBottom:4 }}>{p.name}</div>
        <div style={{ color:T.accent, fontSize:13, marginBottom:6 }}>⭐ {p.rating} <span style={{ color:T.mid }}>({p.sold} terjual)</span></div>
        <div style={{ fontWeight:900, color:T.primary, fontSize:16, marginBottom:12 }}>{fmt(p.price)}</div>
        <button onClick={()=>onAdd(p.id)} style={{ width:'100%', background:T.primary, color:'#fff',
          border:'none', padding:'9px', borderRadius:10, fontWeight:700, cursor:'pointer', fontSize:14 }}>
          + Keranjang
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cat, setCat] = useState('');
  const { addToCart } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    api.get('/products?limit=8').then(r => setProducts(r.data.products || [])).catch(()=>{});
    api.get('/products/meta/categories').then(r => setCategories(r.data || [])).catch(()=>{});
  }, []);

  const handleAdd = async (id) => {
    if (!user) return nav('/login');
    try { await addToCart(id, 1); } catch {}
  };

  return (
    <div>
      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg,${T.dark} 0%,#134E4A 100%)`, padding:'72px 48px', textAlign:'center', color:'#fff' }}>
        <div style={{ fontSize:13, color:T.primary3, letterSpacing:3, marginBottom:12, fontWeight:600 }}>MARKETPLACE TERPERCAYA</div>
        <h1 style={{ fontSize:48, fontWeight:900, margin:'0 0 16px', lineHeight:1.1 }}>
          Belanja Lebih <span style={{ color:T.primary }}>Cerdas</span><br/>di JKN21 Store
        </h1>
        <p style={{ color:'#94A3B8', fontSize:17, maxWidth:520, margin:'0 auto 32px' }}>
          Ribuan produk fashion, elektronik, dan digital dengan harga terbaik.
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
          <button onClick={()=>nav('/products')} style={{ background:T.primary, color:'#fff', border:'none', padding:'14px 32px', borderRadius:10, fontWeight:700, fontSize:16, cursor:'pointer' }}>🛍 Mulai Belanja</button>
          <button onClick={()=>nav('/register')} style={{ background:'transparent', color:'#fff', border:`2px solid ${T.primary}`, padding:'14px 32px', borderRadius:10, fontWeight:700, fontSize:16, cursor:'pointer' }}>Daftar Gratis</button>
        </div>
      </div>

      {/* Products */}
      <div style={{ background:T.light, padding:'40px 48px' }}>
        <h2 style={{ margin:'0 0 20px', color:T.dark, fontWeight:800 }}>🔥 Produk Terbaru</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:20 }}>
          {products.map(p => <ProductCard key={p.id} p={p} onAdd={handleAdd}/>)}
        </div>
        {products.length === 0 && (
          <div style={{ textAlign:'center', padding:40, color:T.mid }}>Memuat produk...</div>
        )}
        <div style={{ textAlign:'center', marginTop:32 }}>
          <button onClick={()=>nav('/products')} style={{ background:T.primary, color:'#fff', border:'none', padding:'12px 32px', borderRadius:10, fontWeight:700, fontSize:15, cursor:'pointer' }}>Lihat Semua Produk →</button>
        </div>
      </div>

      <footer style={{ background:T.dark, color:'#94A3B8', padding:'32px 48px', textAlign:'center' }}>
        <div style={{ color:T.primary, fontWeight:900, fontSize:20, marginBottom:8 }}>JKN21 Store</div>
        <div style={{ fontSize:13 }}>© 2024 JKN21 Store. Semua hak dilindungi.</div>
      </footer>
    </div>
  );
}
