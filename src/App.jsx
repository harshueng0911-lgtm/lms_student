
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Public pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Dashboard (layout + views)
import Dashboard from './pages/dashboard/Dashboard';
import Overview from './pages/dashboard/views/Overview';
import MyMaterials from './pages/dashboard/views/MyMaterials';
import Assignments from './pages/dashboard/views/Assignments';
import SavedMaterials from './pages/dashboard/views/SavedMaterials';
import Notifications from './pages/dashboard/views/Notifications';
import Settings from './pages/dashboard/views/Settings';

// LMS core
import SubjectDetail from './pages/subjects/SubjectDetail';

// Auth protection
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {


  return (
    <Router>
      <Routes>

        {/* 🌐 Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />

        {/* 📚 Subject Detail (Protected) */}
        <Route
          path="/subjects/:subject"
          element={
            <ProtectedRoute>
              <SubjectDetail />
            </ProtectedRoute>
          }
        />

        {/* 🎓 Dashboard (Protected + Nested Layout) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard
              />
            </ProtectedRoute>
          }
        >
          <Route index element={<Overview />} />
          <Route path="materials" element={<MyMaterials />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="assignments/:id" element={<Assignments />} />
          <Route path="saved" element={<SavedMaterials />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;