import React, { useState } from "react";
import supabase from "../lib/supabase";

const CreateTeacher = () => {
  const [fullName, setFullName] = useState("");
  const [teacherCode, setTeacherCode] = useState("");
  const [subject, setSubject] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleCreateTeacher = async (e) => {
    e.preventDefault();

    const autoEmail = `${teacherCode}@teacher.gatewayschool.com`;
    const { data, error } = await supabase.auth.signUp({
      email: autoEmail,
      password,
    });
    if (error) {
      setMessage(error.message);
      return;
    }

    const userId = data.user.id;

    // 2️⃣ INSERT INTO PROFILES
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      full_name: fullName,
      role: "teacher",
    });
    if (profileError) {
      setMessage(profileError.message);
      return;
    }

    // 3️⃣ INSERT INTO TEACHERS
    const { error: teacherError } = await supabase.from("teachers").insert({
      id: userId,
      teacher_code: teacherCode,
      subject,
    });
    if (teacherError) {
      setMessage(teacherError.message);
      return;
    }

    setMessage("Teacher created successfully!");
    setFullName("");
    setTeacherCode("");
    setSubject("");
    setPassword("");
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Teacher</h2>
      <form onSubmit={handleCreateTeacher} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Teacher Code"
          value={teacherCode}
          onChange={(e) => setTeacherCode(e.target.value)}
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">
          Create Teacher
        </button>
      </form>
      {message && <p className="mt-4 text-center text-green-600">{message}</p>}
    </div>
  );
};

export default CreateTeacher;