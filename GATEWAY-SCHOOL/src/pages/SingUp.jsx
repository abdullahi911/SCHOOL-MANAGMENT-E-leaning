import React, { useState } from "react";
import supabase from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import gatewayLogo from "../images/gatewaylogo.jpeg";

const SignUp = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);

    // E-learning user registration only
    const { data: authData, error: authError } = await supabase.auth.signUp({ 
      email, 
      password 
    });
    if (authError) {
      setError(authError.message);
      return;
    }

    const userId = authData.user.id;
    
    // Insert into profiles
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      full_name: name,
      role: "student"
    });
    
    // Generate an eLearning student ID
    const generatedId = `E-LEARN-${Date.now().toString().slice(-6)}`;

    // Insert into students table, no class_id (they are not in a gateway class)
    const { error: studentError } = await supabase.from("students").insert({
      id: userId,
      student_id: generatedId
    });

    if (profileError || studentError) {
      setError("Error setting up profile. Please contact support.");
      // Note: we don't return early here because the user is fundamentally created,
      // but they might need to contact support if DB writes failed.
    }
    
    navigate("/dashboards/StudentDashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-800">
      <img
        src={gatewayLogo}
        alt="Gateway Logo"
        className="w-32 mb-6 cursor-pointer"
        onClick={() => navigate("/")}
      />

      <div className="bg-white dark:bg-slate-700 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6">
          Gateway E-Learning
        </h2>
        <p className="text-gray-500 dark:text-gray-300 text-center mb-6">Sign up to purchase courses and learn online.</p>

        <form onSubmit={handleSignUp} className="flex flex-col gap-4">

          <input
            type="text"
            placeholder="Full Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-slate-600 dark:text-white dark:bg-slate-600 dark:text-white dark:border-slate-500"
          />

          <input
            type="email"
            placeholder="Email Address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-slate-600 dark:text-white dark:bg-slate-600 dark:text-white dark:border-slate-500"
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-slate-600 dark:text-white dark:bg-slate-600 dark:text-white dark:border-slate-500"
          />

          <button className="bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            Create Account
          </button>
        </form>

        {error && <p className="text-red-500 mt-4 text-center text-sm">{error}</p>}

        <p className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <span
            className="text-blue-600 font-semibold cursor-pointer hover:underline"
            onClick={() => navigate("/signin")}
          >
            Sign In
          </span>
        </p>
        <p className="mt-4 text-center text-xs text-gray-400">
          *If you are an enrolled Gateway student or teacher, your account is provided by the admin. <span onClick={() => navigate("/signin")} className="underline cursor-pointer">Login here using your ID.</span>
        </p>
      </div>
    </div>
  );
};

export default SignUp;