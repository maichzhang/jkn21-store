import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const T = { primary:'#0D9488', dark:'#0F172A', mid:'#475569', light:'#F1F5F9', danger:'#EF4444' };
const inp = { width:'100%', padding:'11px 14px', borderRadius:10, border:'1.5px solid #CBD5E1', fontSize:14, outline:'none', boxSizing:'border-box' };

export default function LoginPage() {
  const [form, setForm] = useState({ email:'', password:'' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const handle = async () => {
    setLoading(true); setErr('');
    try {
      const res = await login(form.email, form.password);
      nav(res.user.role === 'admin' ? '/admin' : '/');
    } catch (e) {
      setErr(e.response?.data?.message || 'Login gagal');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:T.light, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#fff', borderRadius:16, padding:40, width:380, boxShadow:'0 2px 16px rgba(0,0,0,0.07)' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ background:T.primary, color:'#fff', fontWeight:900, fontSize:22, padding:'8px 16px', borderRadius:10, display:'inline-block', marginBottom:8 }}>JKN21</div>
          <div style={{ fontWeight:800, fontSize:22, color:T.dark }}>Masuk ke Akun</div>
        </div>
        {err && <div style={{ background:'#FEE2E2', color:T.danger, padding:'10px 14px', borderRadius:8, marginBottom:16, fontSize:13 }}>{err}</div>}
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:13, fontWeight:600, color:T.dark, display:'block', marginBottom:6 }}>Email</label>
          <input style={inp} type="email" placeholder="email@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:13, fontWeight:600, color:T.dark, display:'block', marginBottom:6 }}>Password</label>
          <input style={inp} type="password" placeholder="••••••••" value={form.password}
            onChange={e=>setForm({...form,password:e.target.value})} onKeyDown={e=>e.key==='Enter'&&handle()}/>
        </div>
        <button onClick={handle} disabled={loading} style={{ width:'100%', background:T.primary, color:'#fff', border:'none', padding:'13px', borderRadius:10, fontWeight:700, fontSize:15, cursor:'pointer', opacity:loading?0.7:1 }}>
          {loading ? 'Masuk...' : 'Masuk'}
        </button>
        <div style={{ textAlign:'center', marginTop:16, fontSize:13, color:T.mid }}>
          Belum punya akun? <Link to="/register" style={{ color:T.primary, fontWeight:700 }}>Daftar sekarang</Link>
        </div>
        <div style={{ marginTop:20, padding:14, background:T.light, borderRadius:10, fontSize:12, color:T.mid }}>
          <strong>Demo:</strong> admin@jkn21.com / admin123
        </div>
      </div>
    </div>
  );
}
