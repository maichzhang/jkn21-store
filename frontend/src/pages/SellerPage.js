import { useState, useEffect, useRef } from 'react';
import api from '../api';

const T = { primary:'#0D9488', dark:'#0F172A', mid:'#475569', light:'#F1F5F9', danger:'#EF4444', success:'#22C55E', accent:'#F59E0B' };
const fmt = n => 'Rp ' + n.toLocaleString('id-ID');
const inp = { width:'100%', padding:'11px 14px', borderRadius:10, border:'1.5px solid #CBD5E1', fontSize:14, outline:'none', boxSizing:'border-box' };
const btn = (v='primary',sz='md') => ({ background:v==='primary'?T.primary:v==='danger'?T.danger:v==='outline'?'transparent':'#fff',
  color:v==='outline'?T.primary:v==='ghost'?T.mid:'#fff', border:v==='outline'?`2px solid ${T.primary}`:'none',
  padding:sz==='sm'?'6px 14px':'10px 20px', borderRadius:10, fontWeight:700, cursor:'pointer', fontSize:sz==='sm'?13:14 });

const EMPTY = { name:'', description:'', price:'', stock:'', category_id:'' };

export default function SellerPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState('products');
  const fileRef = useRef();

  useEffect(() => {
    fetchMyProducts();
    api.get('/products/meta/categories').then(r => setCategories(r.data)).catch(()=>{});
  }, []);

  const fetchMyProducts = async () => {
    try {
      const res = await api.get('/products?limit=50');
      setProducts(res.data.products || []);
    } catch {}
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price) return setMsg('❌ Nama dan harga wajib diisi');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach(img => fd.append('images', img));

      if (editId) {
        await api.put(`/products/${editId}`, fd, { headers:{'Content-Type':'multipart/form-data'} });
        setMsg('✅ Produk berhasil diperbarui!');
      } else {
        await api.post('/products', fd, { headers:{'Content-Type':'multipart/form-data'} });
        setMsg('✅ Produk berhasil ditambahkan!');
      }
      setForm(EMPTY); setImages([]); setPreviews([]); setEditId(null);
      fetchMyProducts();
    } catch (e) {
      setMsg('❌ ' + (e.response?.data?.message || 'Gagal menyimpan produk'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p) => {
    setForm({ name:p.name, description:p.description||'', price:p.price, stock:p.stock, category_id:p.category_id||'' });
    setEditId(p.id); setTab('add');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus produk ini?')) return;
    await api.delete(`/products/${id}`);
    fetchMyProducts();
  };

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      {/* Sidebar */}
      <div style={{ width:220, background:T.dark, padding:24 }}>
        <div style={{ color:T.primary, fontWeight:900, fontSize:16, marginBottom:24 }}>📦 Dashboard Seller</div>
        {[['products','📋 Produk Saya'],['add','➕ Tambah Produk']].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{ display:'block', width:'100%', textAlign:'left',
            background:tab===k?T.primary:'transparent', color:tab===k?'#fff':'#94A3B8',
            border:'none', padding:'10px 14px', borderRadius:10, cursor:'pointer', fontWeight:600,
            marginBottom:4, fontSize:14 }}>{l}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex:1, background:T.light, padding:32, overflowY:'auto' }}>
        {msg && <div style={{ background:msg.startsWith('✅')?'#DCFCE7':'#FEE2E2',
          color:msg.startsWith('✅')?'#166534':T.danger, padding:'12px 16px', borderRadius:10,
          marginBottom:16, fontWeight:600 }}>{msg}</div>}

        {tab === 'products' && (
          <div>
            <h2 style={{ color:T.dark, marginBottom:24, fontWeight:900 }}>📋 Produk Saya ({products.length})</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:16 }}>
              {products.map(p=>(
                <div key={p.id} style={{ background:'#fff', borderRadius:14, overflow:'hidden',
                  boxShadow:'0 2px 12px rgba(0,0,0,0.07)' }}>
                  <div style={{ height:120, background:`linear-gradient(135deg,#CCFBF1,#E0F2FE)`,
                    display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                    {p.image ? (
                      <img src={`http://localhost:5000${p.image}`} alt={p.name}
                        style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                    ) : <span style={{ fontSize:48 }}>📦</span>}
                    <span style={{ position:'absolute', top:8, right:8, background:p.is_active?T.success:T.danger,
                      color:'#fff', borderRadius:20, padding:'2px 8px', fontSize:11, fontWeight:700 }}>
                      {p.is_active?'Aktif':'Nonaktif'}
                    </span>
                  </div>
                  <div style={{ padding:14 }}>
                    <div style={{ fontWeight:700, color:T.dark, fontSize:14, marginBottom:4 }}>{p.name}</div>
                    <div style={{ color:T.primary, fontWeight:900, marginBottom:4 }}>{fmt(p.price)}</div>
                    <div style={{ fontSize:12, color:T.mid, marginBottom:12 }}>Stok: {p.stock} · Terjual: {p.sold}</div>
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={()=>handleEdit(p)} style={btn('outline','sm')}>✏️ Edit</button>
                      <button onClick={()=>handleDelete(p.id)} style={btn('danger','sm')}>🗑 Hapus</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {products.length === 0 && (
              <div style={{ textAlign:'center', padding:60, color:T.mid }}>
                <div style={{ fontSize:48 }}>📦</div>
                <div style={{ fontWeight:700, marginTop:12 }}>Belum ada produk</div>
                <button onClick={()=>setTab('add')} style={{ ...btn(), marginTop:16 }}>+ Tambah Produk</button>
              </div>
            )}
          </div>
        )}

        {tab === 'add' && (
          <div style={{ maxWidth:600 }}>
            <h2 style={{ color:T.dark, marginBottom:24, fontWeight:900 }}>
              {editId ? '✏️ Edit Produk' : '➕ Tambah Produk Baru'}
            </h2>
            <div style={{ background:'#fff', borderRadius:16, padding:28, boxShadow:'0 2px 16px rgba(0,0,0,0.07)' }}>
              {/* Upload foto */}
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:13, fontWeight:700, color:T.dark, display:'block', marginBottom:8 }}>📷 Foto Produk (maks 5)</label>
                <div onClick={()=>fileRef.current.click()} style={{ border:`2px dashed ${T.primary}`, borderRadius:12,
                  padding:24, textAlign:'center', cursor:'pointer', background:T.light }}>
                  {previews.length ? (
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'center' }}>
                      {previews.map((p,i)=>(
                        <img key={i} src={p} alt="" style={{ width:80, height:80, objectFit:'cover', borderRadius:8 }}/>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize:32, marginBottom:8 }}>📸</div>
                      <div style={{ fontSize:13, color:T.mid }}>Klik untuk upload foto produk</div>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" multiple accept="image/*" style={{ display:'none' }} onChange={handleImages}/>
              </div>

              {/* Form fields */}
              {[['Nama Produk','name','text'],['Harga (Rp)','price','number'],['Stok','stock','number']].map(([l,k,t])=>(
                <div key={k} style={{ marginBottom:14 }}>
                  <label style={{ fontSize:13, fontWeight:600, color:T.dark, display:'block', marginBottom:6 }}>{l}</label>
                  <input style={inp} type={t} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={l}/>
                </div>
              ))}

              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:13, fontWeight:600, color:T.dark, display:'block', marginBottom:6 }}>Kategori</label>
                <select style={inp} value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})}>
                  <option value="">Pilih kategori</option>
                  {categories.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>

              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:13, fontWeight:600, color:T.dark, display:'block', marginBottom:6 }}>Deskripsi</label>
                <textarea style={{ ...inp, minHeight:100, resize:'vertical' }} value={form.description}
                  onChange={e=>setForm({...form,description:e.target.value})} placeholder="Deskripsi produk..."/>
              </div>

              <div style={{ display:'flex', gap:12 }}>
                <button onClick={handleSubmit} disabled={loading} style={{ ...btn('primary'), flex:1, opacity:loading?0.7:1 }}>
                  {loading ? '⏳ Menyimpan...' : editId ? '✅ Simpan Perubahan' : '➕ Tambah Produk'}
                </button>
                {editId && <button onClick={()=>{setForm(EMPTY);setEditId(null);setTab('products')}}
                  style={btn('outline')}>Batal</button>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
