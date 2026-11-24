import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, GraduationCap, ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles, Users, Zap } from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Notice } from '../components/UI.jsx';
export default function AuthPage({ registerMode = false }) {
  const { login } = useAuth(); const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false), [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [error, setError] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async e => { e.preventDefault(); setBusy(true); setMessage(''); setError(false);
    try { if (registerMode) { await api('/auth/register', { method: 'POST', body: form }); setMessage('Tạo tài khoản thành công. Đang đăng nhập...'); }
      await login(form.email, form.password); navigate('/'); }
    catch (err) { setError(true); setMessage(err.message); } finally { setBusy(false); }
  };
  return <div className="auth-page"><div className="auth-visual"><div className="auth-brand"><div className="brand-mark"><GraduationCap size={24}/></div> EduSpace</div><div className="auth-hero"><div className="eyebrow"><Sparkles size={16}/> HỌC TẬP KHÔNG GIỚI HẠN</div><h1>Nơi kiến thức<br/>kết nối <em>tương lai.</em></h1><p>Quản lý khóa học, chia sẻ tài liệu và phát triển kỹ năng trong một không gian học tập hiện đại.</p><div className="auth-benefits"><span><BookOpen size={18}/> Học liệu phong phú</span><span><Users size={18}/> Kết nối giảng viên</span><span><ShieldCheck size={18}/> An toàn, bảo mật</span></div></div><div className="auth-illustration"><div className="float-card card-one"><Zap size={24}/><div><b>Học linh hoạt</b><small>Mọi lúc, mọi nơi</small></div></div><div className="illustration-main"><div className="abstract-book"><BookOpen size={106} strokeWidth={1.5}/></div><div className="small-sparkle s1">✦</div><div className="small-sparkle s2">✧</div></div><div className="float-card card-two"><span className="small-check">✓</span><div><b>Tiến bộ mỗi ngày</b><small>Luôn theo dõi kết quả</small></div></div></div></div>
    <div className="auth-form-side"><div className="auth-card"><div className="login-logo"><GraduationCap size={28}/></div><span className="auth-overline">CHÀO MỪNG ĐẾN VỚI EDUSPACE</span><h2>{registerMode ? 'Tạo tài khoản mới' : 'Đăng nhập tài khoản'}</h2><p className="auth-subtitle">{registerMode ? 'Bắt đầu hành trình khám phá tri thức của bạn' : 'Tiếp tục hành trình học tập của bạn ngay hôm nay'}</p><Notice message={message} error={error}/><form className="auth-form" onSubmit={submit}>
      {registerMode && <label>Họ và tên<input name="name" value={form.name} onChange={change} placeholder="Nguyễn Văn A" required maxLength={100}/></label>}
      <label>Địa chỉ email<input name="email" type="email" value={form.email} onChange={change} placeholder="example@email.com" required/></label>
      <label>Mật khẩu<div className="password-input"><input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={change} placeholder="Tối thiểu 8 ký tự" required minLength={8}/><button type="button" onClick={() => setShowPass(!showPass)} aria-label="Hiển thị mật khẩu">{showPass ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></label>
      {registerMode && <label>Vai trò<select name="role" value={form.role} onChange={change}><option value="student">Sinh viên</option><option value="teacher">Giảng viên</option></select></label>}
      <button className="primary-btn auth-submit" type="submit" disabled={busy}>{busy ? 'Đang xử lý...' : registerMode ? 'Tạo tài khoản' : 'Đăng nhập'}<ArrowRight size={18}/></button>
    </form><div className="auth-switch">{registerMode ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'} <Link to={registerMode ? '/login' : '/register'}>{registerMode ? 'Đăng nhập' : 'Đăng ký ngay'}</Link></div><p className="auth-note">Bằng việc tiếp tục, bạn đồng ý sử dụng hệ thống học tập vì mục đích giáo dục.</p></div></div>
  </div>;
}
