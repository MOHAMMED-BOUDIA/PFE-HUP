import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
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
import AdminPanel from './pages/AdminPanel';
import Instructors from './pages/Instructors';
import InstructorGroups from './pages/InstructorGroups';
import MyGroups from './pages/MyGroups';
import AdminDashboard from './pages/AdminDashboard';
import AdminInstructors from './pages/AdminInstructors';
import AdminStudents from './pages/AdminStudents';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Main Layout Wrapper
const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Navigation Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        />
        
        {/* Page Outlet */}
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
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify/:token" element={<VerifyToken />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected Workspace Dashboard Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* STUDENT ROUTES */}
            <Route index element={<ProtectedRoute allowedRoles={['student']}><Navigate to="/instructors" replace /></ProtectedRoute>} />
            <Route path="instructors" element={<ProtectedRoute allowedRoles={['student']}><Instructors /></ProtectedRoute>} />
            <Route path="instructors/:id/groups" element={<ProtectedRoute allowedRoles={['student']}><InstructorGroups /></ProtectedRoute>} />
            <Route path="projects" element={<ProtectedRoute allowedRoles={['student','instructor']}><Projects /></ProtectedRoute>} />
            <Route path="projects/:id" element={<ProtectedRoute allowedRoles={['student','instructor']}><ProjectDetails /></ProtectedRoute>} />
            <Route path="tasks" element={<ProtectedRoute allowedRoles={['student','instructor']}><Tasks /></ProtectedRoute>} />
            <Route path="teams" element={<ProtectedRoute allowedRoles={['student','instructor']}><Teams /></ProtectedRoute>} />
            <Route path="documents" element={<ProtectedRoute allowedRoles={['student','instructor']}><Documents /></ProtectedRoute>} />
            <Route path="meetings" element={<ProtectedRoute allowedRoles={['student','instructor']}><Meetings /></ProtectedRoute>} />
            <Route path="resources" element={<ProtectedRoute allowedRoles={['student','instructor']}><Resources /></ProtectedRoute>} />
            <Route path="challenges" element={<Challenges />} />
            <Route path="profile" element={<Profile />} />

            {/* INSTRUCTOR ROUTES */}
            <Route path="instructor/dashboard" element={<Dashboard />} />
            <Route path="my-groups" element={<MyGroups />} />

            {/* ADMIN ROUTES */}
            <Route path="admin" element={<AdminPanel />} />
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/instructors" element={<AdminInstructors />} />
            <Route path="admin/students" element={<AdminStudents />} />
            <Route path="admin/settings" element={<AdminPanel />} />
          </Route>

          {/* Catch-all Route redirects to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>

      {/* Toast Notifications Container */}
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
