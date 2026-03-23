import React, { useState } from "react";
import supabase from "../lib/supabase";

const CreateStudent = () => {
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [classId, setClassId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [classes, setClasses] = useState([]);

  React.useEffect(() => {
    const fetchClasses = async () => {
      const { data } = await supabase.from("classes").select("*").order("class_name");
      if (data) setClasses(data);
    };
    fetchClasses();
  }, []);

  const handleCreateStudent = async (e) => {
    e.preventDefault();

    const autoEmail = `${studentId}@student.gatewayschool.com`;
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
      role: "student",
    });
    if (profileError) {
      setMessage(profileError.message);
      return;
    }

    // 3️⃣ INSERT INTO STUDENTS
    const { error: studentError } = await supabase.from("students").insert({
      id: userId,
      student_id: studentId,
      class_id: classId || null,
    });
    if (studentError) {
      setMessage(studentError.message);
      return;
    }

    setMessage("Student created successfully!");
    setFullName("");
    setStudentId("");
    setClassId("");
    setPassword("");
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Student</h2>
      <form onSubmit={handleCreateStudent} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Select Class (Optional for now)</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.class_name}
            </option>
          ))}
        </select>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
          Create Student
        </button>
      </form>
      {message && <p className="mt-4 text-center text-green-600">{message}</p>}
    </div>
  );
};

export default CreateStudent;