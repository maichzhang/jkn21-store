import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const T = { primary:'#0D9488', dark:'#0F172A', mid:'#475569', light:'#F1F5F9', success:'#22C55E' };
const inp = { width:'100%', padding:'11px 14px', borderRadius:10, border:'1.5px solid #CBD5E1', fontSize:14, outline:'none', boxSizing:'border-box' };

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name:user?.name||'', phone:user?.phone||'', address:user?.address||'' });
  const [msg, setMsg] = useState('');

  const handle = async () => {
    try {
      await api.put('/auth/profile', form);
      updateUser(form);
      setMsg('✅ Profil berhasil diperbarui!');
    } catch { setMsg('❌ Gagal memperbarui profil'); }
  };

  return (
    <div style={{ padding:'32px 48px', background:T.light, minHeight:'100vh' }}>
      <h2 style={{ color:T.dark, fontWeight:900, marginBottom:24 }}>👤 Profil Saya</h2>
      <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:24 }}>
        <div style={{ background:'#fff', borderRadius:16, padding:28, textAlign:'center', boxShadow:'0 2px 16px rgba(0,0,0,0.07)' }}>
          <div style={{ background:`linear-gradient(135deg,${T.primary},#0F766E)`, color:'#fff', borderRadius:'50%', width:80, height:80, fontSize:32, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>{user?.name?.[0]}</div>
          <div style={{ fontWeight:800, fontSize:18, color:T.dark }}>{user?.name}</div>
          <div style={{ color:T.mid, fontSize:13, marginBottom:8 }}>{user?.email}</div>
          <span style={{ background:T.primary+'22', color:T.primary, padding:'3px 12px', borderRadius:20, fontSize:12, fontWeight:700 }}>{user?.role}</span>
        </div>
        <div style={{ background:'#fff', borderRadius:16, padding:28, boxShadow:'0 2px 16px rgba(0,0,0,0.07)' }}>
          <h3 style={{ margin:'0 0 20px', color:T.dark }}>Edit Profil</h3>
          {msg && <div style={{ background:msg.startsWith('✅')?'#DCFCE7':'#FEE2E2', padding:'10px 14px', borderRadius:8, marginBottom:16, fontSize:13 }}>{msg}</div>}
          {[['Nama Lengkap','name','text'],['No. Telepon','phone','tel'],['Alamat','address','text']].map(([l,k,t])=>(
            <div key={k} style={{ marginBottom:16 }}>
              <label style={{ fontSize:13, fontWeight:600, color:T.dark, display:'block', marginBottom:6 }}>{l}</label>
              <input style={inp} type={t} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={l}/>
            </div>
          ))}
          <button onClick={handle} style={{ background:T.primary, color:'#fff', border:'none', padding:'11px 24px', borderRadius:10, fontWeight:700, cursor:'pointer' }}>Simpan</button>
        </div>
      </div>
    </div>
  );
}
