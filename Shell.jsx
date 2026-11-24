import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { BookOpen, LayoutDashboard, BookMarked, Compass, ShieldCheck, Users, LogOut, Bell, GraduationCap, Menu, X, ChevronDown, LibraryBig, PlusCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { roleName } from './UI.jsx';
export default function Shell() {
  const { user, logout } = useAuth(); const navigate = useNavigate(); const [open, setOpen] = useState(false);
  const items = [
    { href: '/', label: 'Tổng quan', icon: LayoutDashboard },
    { href: '/courses', label: 'Khám phá khóa học', icon: Compass },
    ...(user.role === 'student' ? [{ href: '/learning', label: 'Khóa học của tôi', icon: BookMarked }] : []),
    ...(user.role === 'teacher' ? [{ href: '/teaching', label: 'Quản lý giảng dạy', icon: LibraryBig }, { href: '/courses/new', label: 'Tạo khóa học', icon: PlusCircle }] : []),
    ...(user.role === 'admin' ? [{ href: '/admin/users', label: 'Quản lý người dùng', icon: Users }, { href: '/admin/courses', label: 'Quản lý khóa học', icon: ShieldCheck }] : [])
  ];
  const closeMenu = () => setOpen(false);
  return <div className="app-shell">
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><GraduationCap size={25} strokeWidth={2.7}/></div><span>Edu<span>Space</span><small>ONLINE CLASSROOM</small></span><button className="mobile-close" onClick={() => setOpen(false)}><X size={21}/></button></div>
      <div className="sidebar-caption">KHÔNG GIAN HỌC TẬP</div>
      <nav className="nav-links">{items.map(item => <NavLink key={item.href} onClick={closeMenu} to={item.href} end={item.href === '/'} className={({ isActive }) => `nav-item ${isActive ? 'nav-active' : ''}`}><item.icon size={20} strokeWidth={2}/><span>{item.label}</span></NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-bubble"><Sparkles size={18}/></div><strong>Học tập mỗi ngày!</strong><p>Khám phá kiến thức mới và chinh phục mục tiêu của bạn.</p></div><button className="nav-item logout" onClick={() => { logout(); navigate('/login'); }}><LogOut size={20}/><span>Đăng xuất</span></button></div>
    </aside>
    {open && <button aria-label="Đóng menu" className="sidebar-overlay" onClick={() => setOpen(false)}/>}
    <div className="main-area"><header className="topbar"><div className="topbar-left"><button className="menu-toggle" onClick={() => setOpen(true)}><Menu size={22}/></button><span className="breadcrumb">Không gian học tập <span className="dot">•</span> <b>{roleName[user.role]}</b></span></div><div className="topbar-right"><span className="today-pill"><span className="status-dot"/> Hệ thống đang hoạt động</span><div className="avatar small-avatar">{user.name.slice(0,1).toUpperCase()}</div><div className="person"><b>{user.name}</b><small>{roleName[user.role]}</small></div><ChevronDown size={16} color="#9BA1B6"/></div></header><main className="page-content"><Outlet /></main></div>
  </div>;
}
