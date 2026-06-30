import { useState, useEffect } from 'react';
import api from '../api';

const T = { primary:'#0D9488', dark:'#0F172A', mid:'#475569', light:'#F1F5F9', danger:'#EF4444', success:'#22C55E', accent:'#F59E0B' };
const fmt = n => 'Rp ' + n.toLocaleString('id-ID');

export default function AdminPage() {
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get('/admin/stats').then(r=>setStats(r.data)).catch(()=>{});
    api.get('/admin/users').then(r=>setUsers(r.data||[])).catch(()=>{});
    api.get('/orders/admin/all').then(r=>setOrders(r.data||[])).catch(()=>{});
  }, []);

  const tabs = [['dashboard','📊 Dashboard'],['orders','🧾 Pesanan'],['users','👥 User']];

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <div style={{ width:220, background:T.dark, padding:24 }}>
        <div style={{ color:T.primary, fontWeight:900, fontSize:16, marginBottom:24 }}>⚙️ Admin Panel</div>
        {tabs.map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{ display:'block', width:'100%', textAlign:'left',
            background:tab===k?T.primary:'transparent', color:tab===k?'#fff':'#94A3B8',
            border:'none', padding:'10px 14px', borderRadius:10, cursor:'pointer', fontWeight:600, marginBottom:4, fontSize:14 }}>{l}</button>
        ))}
      </div>
      <div style={{ flex:1, background:T.light, padding:32, overflowY:'auto' }}>
        {tab === 'dashboard' && (
          <div>
            <h2 style={{ color:T.dark, marginBottom:24 }}>📊 Dashboard</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
              {[['Revenue',fmt(stats.revenue||0),'💰',T.success],['Pesanan',stats.orders||0,'🧾',T.primary],['Produk',stats.products||0,'📦',T.accent],['User',stats.users||0,'👥','#8B5CF6']].map(([l,v,ic,c])=>(
                <div key={l} style={{ background:'#fff', borderRadius:14, padding:20, boxShadow:'0 2px 12px rgba(0,0,0,0.07)' }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>{ic}</div>
                  <div style={{ fontSize:22, fontWeight:900, color:c }}>{v}</div>
                  <div style={{ fontSize:13, color:T.mid }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'orders' && (
          <div>
            <h2 style={{ color:T.dark, marginBottom:24 }}>🧾 Semua Pesanan</h2>
            <div style={{ background:'#fff', borderRadius:16, overflow:'auto', boxShadow:'0 2px 12px rgba(0,0,0,0.07)' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr style={{ background:T.light }}>
                  {['ID','Pembeli','Total','Status','Tanggal'].map(h=>(
                    <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:12, fontWeight:700, color:T.mid, borderBottom:`2px solid #CCFBF1` }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>{orders.map(o=>(
                  <tr key={o.id} style={{ borderBottom:'1px solid #F1F5F9' }}>
                    <td style={{ padding:'12px 16px', fontWeight:700, fontSize:13 }}>{o.id}</td>
                    <td style={{ padding:'12px 16px', fontSize:13 }}>{o.user_name}</td>
                    <td style={{ padding:'12px 16px', fontWeight:700, color:T.primary }}>{fmt(o.total)}</td>
                    <td style={{ padding:'12px 16px' }}><span style={{ background:T.primary+'22', color:T.primary, padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:700 }}>{o.status}</span></td>
                    <td style={{ padding:'12px 16px', fontSize:13, color:T.mid }}>{new Date(o.created_at).toLocaleDateString('id-ID')}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}
        {tab === 'users' && (
          <div>
            <h2 style={{ color:T.dark, marginBottom:24 }}>👥 Pengguna</h2>
            <div style={{ background:'#fff', borderRadius:16, overflow:'auto', boxShadow:'0 2px 12px rgba(0,0,0,0.07)' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr style={{ background:T.light }}>
                  {['Nama','Email','Role','Status','Bergabung'].map(h=>(
                    <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:12, fontWeight:700, color:T.mid, borderBottom:`2px solid #CCFBF1` }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>{users.map(u=>(
                  <tr key={u.id} style={{ borderBottom:'1px solid #F1F5F9' }}>
                    <td style={{ padding:'12px 16px', fontWeight:600, fontSize:13 }}>{u.name}</td>
                    <td style={{ padding:'12px 16px', fontSize:13, color:T.mid }}>{u.email}</td>
                    <td style={{ padding:'12px 16px' }}><span style={{ background:T.primary+'22', color:T.primary, padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:700 }}>{u.role}</span></td>
                    <td style={{ padding:'12px 16px' }}><span style={{ color:u.is_active?T.success:T.danger, fontWeight:700, fontSize:13 }}>{u.is_active?'Aktif':'Nonaktif'}</span></td>
                    <td style={{ padding:'12px 16px', fontSize:13, color:T.mid }}>{new Date(u.created_at).toLocaleDateString('id-ID')}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
