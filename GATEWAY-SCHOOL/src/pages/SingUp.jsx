import React, { useState } from "react";
import supabase from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import gatewayLogo from "../images/gatewayLogo.jpeg";

const SignUp = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("admin"); // admin default
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [teacherCode, setTeacherCode] = useState("");
  const [error, setError] = useState(null);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);

    // ================= ADMIN =================
    if (selectedRole === "admin") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        return;
      }
      await supabase.from("profiles").insert({ id: data.user.id, role: "admin" });
      navigate("/dashboards/AdminPanel");
      return;
    }

    // ================= STUDENT =================
    if (selectedRole === "student") {
      const { data: student } = await supabase
        .from("students")
        .select("*")
        .eq("student_id", studentId)
        .single();
      if (!student) {
        setError("Invalid Student ID");
        return;
      }
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        return;
      }
      await supabase.from("students").update({ id: data.user.id }).eq("student_id", studentId);
      await supabase.from("profiles").insert({ id: data.user.id, role: "student" });
      navigate("/dashboards/StudentDashboard");
      return;
    }

    // ================= TEACHER =================
    if (selectedRole === "teacher") {
      const { data: teacher } = await supabase
        .from("teachers")
        .select("*")
        .eq("teacher_code", teacherCode)
        .single();
      if (!teacher) {
        setError("Invalid Teacher Code");
        return;
      }
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        return;
      }
      await supabase.from("teachers").update({ id: data.user.id }).eq("teacher_code", teacherCode);
      await supabase.from("profiles").insert({ id: data.user.id, role: "teacher" });
      navigate("/dashboards/TeacherDashboard");
      return;
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
        <h2 className="text-3xl font-bold text-center mb-6">
          Sign Up
        </h2>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="p-3 border rounded-lg mb-4 w-full"
        >
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
        </select>

        <form onSubmit={handleSignUp} className="flex flex-col gap-4">

          {selectedRole === "student" && (
            <input
              type="text"
              placeholder="Student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="p-3 border rounded-lg"
            />
          )}

          {selectedRole === "teacher" && (
            <input
              type="text"
              placeholder="Teacher Code"
              value={teacherCode}
              onChange={(e) => setTeacherCode(e.target.value)}
              className="p-3 border rounded-lg"
            />
          )}

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

          <button className="bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            Sign Up
          </button>
        </form>

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

        <p className="mt-6 text-center">
          Already have an account?{" "}
          <span
            className="text-green-600 font-semibold cursor-pointer hover:underline"
            onClick={() => navigate("/signin")}
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignUp;