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

          {/* ADMIN ROUTES */}
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/create-student" element={<CreateStudent />} />
          <Route path="/admin/create-teacher" element={<CreateTeacher />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;