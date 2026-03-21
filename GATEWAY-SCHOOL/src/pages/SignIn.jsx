import React, { useState } from "react";
import supabase from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import gatewayLogo from "../images/gatewayLogo.jpeg";

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      return;
    }

    // get role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      setError("User profile not found");
      return;
    }

    switch (profile.role) {
      case "admin":
        navigate("/dashboards/AdminPanel");
        break;
      case "teacher":
        navigate("/dashboards/TeacherDashboard");
        break;
      case "student":
        navigate("/dashboards/StudentDashboard");
        break;
      default:
        navigate("/");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <img
        src={gatewayLogo}
        alt="Gateway Logo"
        className="w-32 mb-6 cursor-pointer"
        onClick={() => navigate("/")}
      />

      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6">Sign In</h2>

        <form onSubmit={handleSignIn} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border rounded-lg"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 border rounded-lg"
          />
          <button className="bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">
            Sign In
          </button>
        </form>

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default SignIn;