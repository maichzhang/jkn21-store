import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const T = { primary:'#0D9488', dark:'#0F172A', mid:'#475569', danger:'#EF4444' };

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  return (
    <nav style={{ background:T.dark, color:'#fff', padding:'0 32px', height:60,
      display:'flex', alignItems:'center', justifyContent:'space-between',
      position:'sticky', top:0, zIndex:100, boxShadow:'0 2px 12px rgba(0,0,0,0.3)' }}>
      <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ background:T.primary, padding:'4px 12px', borderRadius:8, fontWeight:900, fontSize:18 }}>JKN21</span>
        <span style={{ color:'#94A3B8', fontSize:13 }}>Store</span>
      </Link>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <Link to="/" style={navLink}>🏠 Home</Link>
        <Link to="/products" style={navLink}>🛍 Produk</Link>
        {user?.role === 'admin' && <Link to="/admin" style={navLink}>⚙️ Admin</Link>}
        {['seller','admin'].includes(user?.role) && <Link to="/seller" style={navLink}>📦 Toko</Link>}
        {user ? (
          <>
            <Link to="/cart" style={{ ...navLink, position:'relative' }}>
              🛒 {count > 0 && <span style={{ background:T.primary, borderRadius:'50%',
                padding:'1px 6px', fontSize:11, fontWeight:900, marginLeft:2 }}>{count}</span>}
            </Link>
            <Link to="/orders" style={navLink}>📦 Pesanan</Link>
            <div style={{ position:'relative' }}>
              <button onClick={()=>setOpen(!open)} style={{ background:T.primary, border:'none',
                borderRadius:'50%', width:36, height:36, color:'#fff', cursor:'pointer',
                fontWeight:700, fontSize:14 }}>{user.name[0]}</button>
              {open && (
                <div style={{ position:'absolute', right:0, top:44, background:'#fff', borderRadius:12,
                  boxShadow:'0 8px 30px rgba(0,0,0,0.15)', minWidth:160, overflow:'hidden', zIndex:200 }}>
                  <div style={{ padding:'12px 16px', borderBottom:'1px solid #F1F5F9' }}>
                    <div style={{ fontWeight:700, color:T.dark, fontSize:13 }}>{user.name}</div>
                    <div style={{ fontSize:11, color:T.mid }}>{user.role}</div>
                  </div>
                  <Link to="/profile" onClick={()=>setOpen(false)} style={dropLink}>👤 Profil</Link>
                  <button onClick={()=>{logout();setOpen(false);nav('/')}}
                    style={{ ...dropLink, background:'none', border:'none', width:'100%',
                      textAlign:'left', cursor:'pointer', color:T.danger }}>🚪 Logout</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" style={{ ...navLink, border:'2px solid #0D9488', borderRadius:8, padding:'6px 14px' }}>Masuk</Link>
            <Link to="/register" style={{ background:T.primary, color:'#fff', padding:'7px 16px',
              borderRadius:8, textDecoration:'none', fontWeight:700, fontSize:14 }}>Daftar</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const navLink = { color:'#94A3B8', textDecoration:'none', fontSize:14, fontWeight:500, padding:'4px 8px' };
const dropLink = { display:'block', padding:'10px 16px', fontSize:13, color:'#0F172A',
  textDecoration:'none', borderBottom:'1px solid #F8FAFC' };
