import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';

import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import VerifyToken from './pages/VerifyToken';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Tasks from './pages/Tasks';
import Teams from './pages/Teams';
import Documents from './pages/Documents';
import Meetings from './pages/Meetings';
import Resources from './pages/Resources';
import Challenges from './pages/Challenges';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import AdminPanel from './pages/AdminPanel';
import Instructors from './pages/Instructors';
import InstructorGroups from './pages/InstructorGroups';
import MyGroups from './pages/MyGroups';
import AdminDashboard from './pages/AdminDashboard';
import AdminInstructors from './pages/AdminInstructors';
import AdminStudents from './pages/AdminStudents';
import AdminDepartments from './pages/AdminDepartments';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import About from './pages/About';
import Contact from './pages/Contact';
import Pricing from './pages/Pricing';
import FAQ from './pages/FAQ';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Help from './pages/Help';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Careers from './pages/Careers';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
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
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ModalProvider>
        <Router>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify/:token" element={<VerifyToken />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/help" element={<Help />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/careers" element={<Careers />} />

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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>

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
