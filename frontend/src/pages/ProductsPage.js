import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const T = { primary:'#0D9488', primary3:'#CCFBF1', dark:'#0F172A', mid:'#475569', light:'#F1F5F9', accent:'#F59E0B' };
const fmt = n => 'Rp ' + n.toLocaleString('id-ID');

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('');
  const [sort, setSort] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();

  const fetch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit:20, ...(cat&&{category:cat}), ...(search&&{search}), ...(sort&&{sort}) });
      const r = await api.get(`/products?${params}`);
      setProducts(r.data.products || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [cat, sort]);
  useEffect(() => {
    api.get('/products/meta/categories').then(r=>setCategories(r.data||[])).catch(()=>{});
  }, []);

  const handleAdd = async (id) => {
    if (!user) return nav('/login');
    try { await addToCart(id, 1); alert('✅ Ditambahkan ke keranjang!'); } catch {}
  };

  return (
    <div style={{ padding:'32px 48px', background:T.light, minHeight:'100vh' }}>
      <h2 style={{ color:T.dark, fontWeight:900, marginBottom:24 }}>🛍 Semua Produk</h2>
      <div style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap' }}>
        <input placeholder="🔍 Cari produk..." value={search}
          onChange={e=>setSearch(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&fetch()}
          style={{ padding:'10px 14px', borderRadius:10, border:'1.5px solid #CBD5E1', fontSize:14, outline:'none', minWidth:240 }}/>
        <select value={sort} onChange={e=>setSort(e.target.value)}
          style={{ padding:'10px 14px', borderRadius:10, border:'1.5px solid #CBD5E1', fontSize:14, outline:'none' }}>
          <option value="">Urutkan</option>
          <option value="low">Harga Terendah</option>
          <option value="high">Harga Tertinggi</option>
          <option value="rating">Rating Terbaik</option>
          <option value="sold">Terlaris</option>
        </select>
        <button onClick={()=>setCat('')} style={{ background:!cat?T.primary:'transparent', color:!cat?'#fff':T.primary, border:`2px solid ${T.primary}`, padding:'9px 16px', borderRadius:10, fontWeight:700, cursor:'pointer' }}>Semua</button>
        {categories.map(c=>(
          <button key={c.id} onClick={()=>setCat(c.slug)} style={{ background:cat===c.slug?T.primary:'transparent', color:cat===c.slug?'#fff':T.primary, border:`2px solid ${T.primary}`, padding:'9px 16px', borderRadius:10, fontWeight:700, cursor:'pointer' }}>{c.icon} {c.name}</button>
        ))}
      </div>
      {loading ? <div style={{ textAlign:'center', padding:60, color:T.mid }}>Memuat...</div> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:20 }}>
          {products.map(p=>(
            <div key={p.id} style={{ background:'#fff', borderRadius:16, overflow:'hidden', boxShadow:'0 2px 16px rgba(0,0,0,0.07)' }}>
              <div style={{ background:`linear-gradient(135deg,${T.primary3},#E0F2FE)`, height:140, display:'flex', alignItems:'center', justifyContent:'center', fontSize:52 }}>📦</div>
              <div style={{ padding:14 }}>
                <div style={{ fontSize:11, color:T.primary, fontWeight:700, marginBottom:4 }}>{p.category_name}</div>
                <div style={{ fontWeight:700, color:T.dark, fontSize:14, marginBottom:4 }}>{p.name}</div>
                <div style={{ color:T.accent, fontSize:13, marginBottom:6 }}>⭐ {p.rating}</div>
                <div style={{ fontWeight:900, color:T.primary, fontSize:16, marginBottom:12 }}>{fmt(p.price)}</div>
                <button onClick={()=>handleAdd(p.id)} style={{ width:'100%', background:T.primary, color:'#fff', border:'none', padding:'9px', borderRadius:10, fontWeight:700, cursor:'pointer' }}>+ Keranjang</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && products.length === 0 && (
        <div style={{ textAlign:'center', padding:60, color:T.mid }}>
          <div style={{ fontSize:48 }}>🔍</div>
          <div style={{ fontWeight:700, marginTop:12 }}>Produk tidak ditemukan</div>
        </div>
      )}
    </div>
  );
}
