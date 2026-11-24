import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { Loading } from './components/UI.jsx';
import Shell from './components/Shell.jsx';
import AuthPage from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { Catalog, CourseForm } from './pages/Courses.jsx';
import CourseDetail from './pages/CourseDetail.jsx';
import GradeSubmissions from './pages/GradeSubmissions.jsx';
import Admin from './pages/Admin.jsx';
function Protect({ children, allowed }) { const { user, loading } = useAuth(); if (loading) return <Loading/>; if (!user) return <Navigate to="/login" replace/>; if (allowed && !allowed.includes(user.role)) return <Navigate to="/" replace/>; return children; }
function Guest({ children }) { const { user, loading } = useAuth(); if (loading) return <Loading/>; if (user) return <Navigate to="/" replace/>; return children; }
export default function App() { return <Routes>
  <Route path="/login" element={<Guest><AuthPage/></Guest>}/>
  <Route path="/register" element={<Guest><AuthPage registerMode/></Guest>}/>
  <Route element={<Protect><Shell/></Protect>}>
    <Route index element={<Dashboard/>}/>
    <Route path="courses" element={<Catalog/>}/>
    <Route path="courses/:id" element={<CourseDetail/>}/>
    <Route path="learning" element={<Protect allowed={['student']}><Catalog mine/></Protect>}/>
    <Route path="teaching" element={<Protect allowed={['teacher']}><Catalog mine/></Protect>}/>
    <Route path="courses/new" element={<Protect allowed={['teacher']}><CourseForm/></Protect>}/>
    <Route path="courses/:id/edit" element={<Protect allowed={['teacher']}><CourseForm/></Protect>}/>
    <Route path="assignments/:id/submissions" element={<Protect allowed={['teacher','admin']}><GradeSubmissions/></Protect>}/>
    <Route path="admin/users" element={<Protect allowed={['admin']}><Admin page="users"/></Protect>}/>
    <Route path="admin/courses" element={<Protect allowed={['admin']}><Admin page="courses"/></Protect>}/>
  </Route><Route path="*" element={<Navigate to="/" replace/>}/>
</Routes>; }
