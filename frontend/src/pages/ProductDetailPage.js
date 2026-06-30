import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const T = { primary:'#0D9488', dark:'#0F172A', mid:'#475569', light:'#F1F5F9', accent:'#F59E0B' };
const fmt = n => 'Rp ' + n.toLocaleString('id-ID');

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    api.get(`/products/${id}`).then(r=>setProduct(r.data)).catch(()=>nav('/products'));
  }, [id]);

  const handleAdd = async () => {
    if (!user) return nav('/login');
    try { await addToCart(product.id, 1); alert('✅ Ditambahkan ke keranjang!'); } catch {}
  };

  if (!product) return <div style={{ textAlign:'center', padding:80, color:T.mid }}>Memuat...</div>;

  return (
    <div style={{ padding:'32px 48px', background:T.light, minHeight:'100vh' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:32, background:'#fff', borderRadius:16, padding:32, boxShadow:'0 2px 16px rgba(0,0,0,0.07)' }}>
        <div style={{ background:`linear-gradient(135deg,#CCFBF1,#E0F2FE)`, borderRadius:12, height:300, display:'flex', alignItems:'center', justifyContent:'center', fontSize:80 }}>📦</div>
        <div>
          <div style={{ fontSize:12, color:T.primary, fontWeight:700, marginBottom:8 }}>{product.category_name}</div>
          <h1 style={{ color:T.dark, fontWeight:900, fontSize:28, marginBottom:12 }}>{product.name}</h1>
          <div style={{ color:T.accent, marginBottom:8 }}>⭐ {product.rating} · {product.sold} terjual</div>
          <div style={{ fontSize:32, fontWeight:900, color:T.primary, marginBottom:16 }}>{fmt(product.price)}</div>
          <div style={{ color:T.mid, marginBottom:24, lineHeight:1.6 }}>{product.description}</div>
          <div style={{ fontSize:13, color:product.stock > 0 ? '#22C55E' : '#EF4444', marginBottom:20, fontWeight:600 }}>
            {product.stock > 0 ? `✅ Stok tersedia (${product.stock})` : '❌ Stok habis'}
          </div>
          <div style={{ display:'flex', gap:12 }}>
            <button onClick={handleAdd} disabled={product.stock === 0} style={{ flex:1, background:T.primary, color:'#fff', border:'none', padding:'14px', borderRadius:10, fontWeight:700, fontSize:16, cursor:'pointer' }}>+ Keranjang</button>
            <button onClick={()=>{handleAdd();nav('/cart')}} style={{ flex:1, background:'#0F766E', color:'#fff', border:'none', padding:'14px', borderRadius:10, fontWeight:700, fontSize:16, cursor:'pointer' }}>Beli Sekarang</button>
          </div>
        </div>
      </div>
    </div>
  );
}
