import { AlertCircle, CheckCircle2, LoaderCircle, Search, BookOpen, Code2, Palette, Database, BarChart3, GraduationCap, FileText } from 'lucide-react';
export const roleName = { student: 'Sinh viên', teacher: 'Giảng viên', admin: 'Quản trị viên' };
export const categoryIcon = { 'Lập trình': Code2, 'Thiết kế': Palette, 'Cơ sở dữ liệu': Database, 'Kinh doanh': BarChart3 };
export function Notice({ message, error = false }) { return message && <div className={`notice ${error ? 'error' : 'success'}`}>{error ? <AlertCircle size={18}/> : <CheckCircle2 size={18}/>}<span>{message}</span></div>; }
export function Loading({ label = 'Đang tải dữ liệu...' }) { return <div className="loading"><LoaderCircle className="spin" size={26}/><span>{label}</span></div>; }
export function Empty({ title = 'Chưa có dữ liệu', description = 'Nội dung sẽ hiển thị tại đây khi có dữ liệu.' }) { return <div className="empty"><div className="empty-icon"><BookOpen size={26}/></div><h3>{title}</h3><p>{description}</p></div>; }
export function CourseCard({ course, onClick }) {
  const Icon = categoryIcon[course.category] || GraduationCap;
  const themes = ['violet','sky','orange','mint'];
  const code = String(course.title || '').split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
  const theme = themes[code % themes.length];
  return <button className="course-card" onClick={onClick}>
    <div className={`course-art ${theme}`}><span className="art-orbit orbit-a"/><span className="art-orbit orbit-b"/><Icon size={46} strokeWidth={1.8}/><span className="course-art-chip">{course.level || 'Cơ bản'}</span></div>
    <div className="course-card-body"><span className="category-label">{course.category || 'Học tập'}</span><h3>{course.title}</h3><p>{course.description}</p><div className="course-card-meta"><span><GraduationCap size={15}/>{course.teacher?.name || 'Giảng viên'}</span><span><FileText size={15}/>{course.materialsCount ?? course.materials?.length ?? 0} bài</span></div>
    {course.progress != null && <div className="progress-wrap"><div className="progress-line"><span style={{ width: `${course.progress}%` }}/></div><small>Hoàn thành {course.progress}%</small></div>}</div>
  </button>;
}
