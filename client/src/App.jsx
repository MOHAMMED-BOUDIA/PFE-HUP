import { useState, lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import { NotificationProvider } from './context/NotificationContext';

import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import Loader from './components/common/Loader';
const AIChatbot = lazy(() => import('./components/AIChatbot'));

// Light pages — eager load
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import VerifyToken from './pages/VerifyToken';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';

// Heavy pages — lazy load
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetails = lazy(() => import('./pages/ProjectDetails'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Teams = lazy(() => import('./pages/Teams'));
const Documents = lazy(() => import('./pages/Documents'));
const Meetings = lazy(() => import('./pages/Meetings'));
const Resources = lazy(() => import('./pages/Resources'));
const Challenges = lazy(() => import('./pages/Challenges'));
const Profile = lazy(() => import('./pages/Profile'));
const Chat = lazy(() => import('./pages/Chat'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const Instructors = lazy(() => import('./pages/Instructors'));
const InstructorGroups = lazy(() => import('./pages/InstructorGroups'));
const MyGroups = lazy(() => import('./pages/MyGroups'));
const Notifications = lazy(() => import('./pages/Notifications'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminInstructors = lazy(() => import('./pages/AdminInstructors'));
const AdminStudents = lazy(() => import('./pages/AdminStudents'));
const AdminDepartments = lazy(() => import('./pages/AdminDepartments'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Pricing = lazy(() => import('./pages/Pricing'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Help = lazy(() => import('./pages/Help'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const Careers = lazy(() => import('./pages/Careers'));

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { i18n } = useTranslation();

  return (
    <div dir="ltr" className="flex h-screen w-screen overflow-hidden bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        />
        <main dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          <Suspense fallback={<Loader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <AuthProvider>
      <ModalProvider>
        <NotificationProvider>
        <Router>
        <Suspense fallback={<Loader />}>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify/:token" element={<VerifyToken />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/about" element={<Suspense fallback={<Loader />}><About /></Suspense>} />
          <Route path="/contact" element={<Suspense fallback={<Loader />}><Contact /></Suspense>} />
          <Route path="/pricing" element={<Suspense fallback={<Loader />}><Pricing /></Suspense>} />
          <Route path="/faq" element={<Suspense fallback={<Loader />}><FAQ /></Suspense>} />
          <Route path="/terms" element={<Suspense fallback={<Loader />}><Terms /></Suspense>} />
          <Route path="/privacy" element={<Suspense fallback={<Loader />}><Privacy /></Suspense>} />
          <Route path="/help" element={<Suspense fallback={<Loader />}><Help /></Suspense>} />
          <Route path="/blog" element={<Suspense fallback={<Loader />}><Blog /></Suspense>} />
          <Route path="/blog/:id" element={<Suspense fallback={<Loader />}><BlogDetail /></Suspense>} />
          <Route path="/careers" element={<Suspense fallback={<Loader />}><Careers /></Suspense>} />

          {/* Protected dashboard routes */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            {/* STUDENT ROUTES */}
            <Route path="/instructors" element={<RoleProtectedRoute allowedRoles={['student']}><ProtectedRoute allowedRoles={['student']}><Instructors /></ProtectedRoute></RoleProtectedRoute>} />
            <Route path="/instructors/:id/groups" element={<RoleProtectedRoute allowedRoles={['student']}><ProtectedRoute allowedRoles={['student']}><InstructorGroups /></ProtectedRoute></RoleProtectedRoute>} />
            <Route path="/projects" element={<RoleProtectedRoute allowedRoles={['student','instructor']}><ProtectedRoute allowedRoles={['student','instructor']}><Projects /></ProtectedRoute></RoleProtectedRoute>} />
            <Route path="/projects/:id" element={<RoleProtectedRoute allowedRoles={['student','instructor']}><ProtectedRoute allowedRoles={['student','instructor']}><ProjectDetails /></ProtectedRoute></RoleProtectedRoute>} />
            <Route path="/tasks" element={<RoleProtectedRoute allowedRoles={['student','instructor']}><ProtectedRoute allowedRoles={['student','instructor']}><Tasks /></ProtectedRoute></RoleProtectedRoute>} />
            <Route path="/teams" element={<RoleProtectedRoute allowedRoles={['student','instructor']}><ProtectedRoute allowedRoles={['student','instructor']}><Teams /></ProtectedRoute></RoleProtectedRoute>} />
            <Route path="/documents" element={<RoleProtectedRoute allowedRoles={['student','instructor']}><ProtectedRoute allowedRoles={['student','instructor']}><Documents /></ProtectedRoute></RoleProtectedRoute>} />
            <Route path="/meetings" element={<RoleProtectedRoute allowedRoles={['student','instructor']}><ProtectedRoute allowedRoles={['student','instructor']}><Meetings /></ProtectedRoute></RoleProtectedRoute>} />
            <Route path="/resources" element={<RoleProtectedRoute allowedRoles={['student','instructor']}><ProtectedRoute allowedRoles={['student','instructor']}><Resources /></ProtectedRoute></RoleProtectedRoute>} />
            <Route path="/chat" element={<RoleProtectedRoute allowedRoles={['student','instructor']}><ProtectedRoute allowedRoles={['student','instructor']}><Chat /></ProtectedRoute></RoleProtectedRoute>} />
            <Route path="/challenges" element={<RoleProtectedRoute allowedRoles={['student','instructor']}><ProtectedRoute allowedRoles={['student','instructor']}><Challenges /></ProtectedRoute></RoleProtectedRoute>} />
            <Route path="/notifications" element={<RoleProtectedRoute allowedRoles={['admin','instructor','student']}><Notifications /></RoleProtectedRoute>} />
            <Route path="/profile" element={<RoleProtectedRoute allowedRoles={['admin','instructor','student']}><Profile /></RoleProtectedRoute>} />

            {/* INSTRUCTOR ROUTES */}
            <Route path="/dashboard" element={<RoleProtectedRoute allowedRoles={['instructor']}><Dashboard /></RoleProtectedRoute>} />
            <Route path="/my-groups" element={<RoleProtectedRoute allowedRoles={['instructor']}><MyGroups /></RoleProtectedRoute>} />

            {/* ADMIN ROUTES */}
            <Route path="/admin" element={<RoleProtectedRoute allowedRoles={['admin']}><AdminPanel /></RoleProtectedRoute>} />
            <Route path="/admin/dashboard" element={<RoleProtectedRoute allowedRoles={['admin']}><AdminDashboard /></RoleProtectedRoute>} />
            <Route path="/admin/instructors" element={<RoleProtectedRoute allowedRoles={['admin']}><AdminInstructors /></RoleProtectedRoute>} />
            <Route path="/admin/students" element={<RoleProtectedRoute allowedRoles={['admin']}><AdminStudents /></RoleProtectedRoute>} />
            <Route path="/admin/departments" element={<RoleProtectedRoute allowedRoles={['admin']}><AdminDepartments /></RoleProtectedRoute>} />
            <Route path="/admin/settings" element={<RoleProtectedRoute allowedRoles={['admin']}><AdminPanel /></RoleProtectedRoute>} />
          </Route>

          <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <AIChatbot />
        </Router>
        </NotificationProvider>
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      </ModalProvider>
    </AuthProvider>
  );
}

export default App;
