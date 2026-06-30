import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const T = { primary:'#0D9488', dark:'#0F172A', mid:'#475569', light:'#F1F5F9', danger:'#EF4444' };
const inp = { width:'100%', padding:'11px 14px', borderRadius:10, border:'1.5px solid #CBD5E1', fontSize:14, outline:'none', boxSizing:'border-box' };

export default function RegisterPage() {
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'', role:'user' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const nav = useNavigate();

  const handle = async () => {
    if (form.password !== form.confirm) return setErr('Password tidak cocok!');
    setLoading(true); setErr('');
    try {
      await register({ name:form.name, email:form.email, password:form.password, role:form.role });
      nav('/');
    } catch (e) {
      setErr(e.response?.data?.message || 'Registrasi gagal');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:T.light, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#fff', borderRadius:16, padding:40, width:400, boxShadow:'0 2px 16px rgba(0,0,0,0.07)' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ background:T.primary, color:'#fff', fontWeight:900, fontSize:22, padding:'8px 16px', borderRadius:10, display:'inline-block', marginBottom:8 }}>JKN21</div>
          <div style={{ fontWeight:800, fontSize:22, color:T.dark }}>Buat Akun Baru</div>
        </div>
        {err && <div style={{ background:'#FEE2E2', color:T.danger, padding:'10px 14px', borderRadius:8, marginBottom:16, fontSize:13 }}>{err}</div>}
        {[['Nama Lengkap','name','text'],['Email','email','email'],['Password','password','password'],['Konfirmasi Password','confirm','password']].map(([l,k,t])=>(
          <div key={k} style={{ marginBottom:14 }}>
            <label style={{ fontSize:13, fontWeight:600, color:T.dark, display:'block', marginBottom:6 }}>{l}</label>
            <input style={inp} type={t} placeholder={l} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/>
          </div>
        ))}
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:13, fontWeight:600, color:T.dark, display:'block', marginBottom:6 }}>Daftar sebagai</label>
          <select style={inp} value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
            <option value="user">Pembeli</option>
            <option value="seller">Penjual</option>
          </select>
        </div>
        <button onClick={handle} disabled={loading} style={{ width:'100%', background:T.primary, color:'#fff', border:'none', padding:'13px', borderRadius:10, fontWeight:700, fontSize:15, cursor:'pointer' }}>
          {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
        </button>
        <div style={{ textAlign:'center', marginTop:16, fontSize:13, color:T.mid }}>
          Sudah punya akun? <Link to="/login" style={{ color:T.primary, fontWeight:700 }}>Masuk</Link>
        </div>
      </div>
    </div>
  );
}
