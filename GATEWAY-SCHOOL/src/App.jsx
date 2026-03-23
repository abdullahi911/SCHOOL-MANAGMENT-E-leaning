// App.jsx
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SingUp";
import Elearning from "./pages/Elearning";

// NEW ADMIN IMPORTS
import AdminPanel from "./dashboards/AdminPanel";
import CreateStudent from "./dashboards/CreateStudent";
import CreateTeacher from "./dashboards/CreateTeacher";
import TeacherDashboard from "./dashboards/TeacherDashboard";
import StudentDashboard from "./dashboards/StudentDashboard";
import Profile from "./pages/Profile";

import Header from "./component/Header";
import Footer from "./component/Footer";

const App = () => {
  return (
    <div className="flex flex-col min-h-screen bg-amber-50">
      <Header />

      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/elearning" element={<Elearning />} />
          <Route path="/profile" element={<Profile />} />

          {/* ADMIN & DASHBOARD ROUTES */}
          <Route path="/dashboards/AdminPanel" element={<AdminPanel />} />
          <Route path="/admin" element={<AdminPanel />} /> {/* Fallback just in case */}
          <Route path="/admin/create-student" element={<CreateStudent />} />
          <Route path="/admin/create-teacher" element={<CreateTeacher />} />
          <Route path="/dashboards/TeacherDashboard" element={<TeacherDashboard />} />
          <Route path="/dashboards/StudentDashboard" element={<StudentDashboard />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;