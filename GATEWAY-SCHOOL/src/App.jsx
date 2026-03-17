// App.jsx
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SingUp";
import Elearning from "./pages/E-learning";
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
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;