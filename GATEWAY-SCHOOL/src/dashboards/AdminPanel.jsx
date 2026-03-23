import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabase";

const AdminPanel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ teachers: 0, students: 0, byClass: [] });

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        navigate("/signin");
        return;
      }

      if (user.email === "apdilaahiapdi143@gmail.com") {
        await fetchStats();
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        navigate("/dashboard"); // non-admins redirected
      } else {
        await fetchStats();
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      // Teachers total
      const { count: tCount } = await supabase.from('teachers').select('*', { count: 'exact', head: true });
      // Students total
      const { count: sCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
      
      // Classes & Students for breakdown
      const { data: classData } = await supabase.from('classes').select('*').order('class_name');
      const { data: studentData } = await supabase.from('students').select('class_id');
      
      let byClass = [];
      if (classData && studentData) {
        byClass = classData.map(c => {
          const matchCount = studentData.filter(s => s.class_id === c.id).length;
          return { name: c.class_name, count: matchCount };
        });
      }
      
      setStats({ teachers: tCount || 0, students: sCount || 0, byClass });
    };

    checkAdmin();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-10">
        <div
          onClick={() => navigate("/admin/create-student")}
          className="cursor-pointer bg-blue-600 text-white p-4 rounded-xl shadow hover:bg-blue-700 font-semibold flex items-center justify-center transition"
        >
          Create Student
        </div>

        <div
          onClick={() => navigate("/admin/create-teacher")}
          className="cursor-pointer bg-green-600 text-white p-4 rounded-xl shadow hover:bg-green-700 font-semibold flex items-center justify-center transition"
        >
          Create Teacher
        </div>

        <div
          onClick={() => alert("Global Notifications feature can be implemented here")}
          className="cursor-pointer bg-amber-600 text-white p-4 rounded-xl shadow hover:bg-amber-700 font-semibold flex items-center justify-center transition"
        >
          Global Announcment
        </div>

        <div
          onClick={() => alert("Manage other school settings here")}
          className="cursor-pointer bg-purple-600 text-white p-4 rounded-xl shadow hover:bg-purple-700 font-semibold flex items-center justify-center transition"
        >
          Manage Settings
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Overview</h2>
          <div className="flex flex-col gap-4 mt-4">
            <div className="p-4 bg-gray-50 border rounded-lg flex justify-between">
              <span className="font-semibold text-gray-700">Total Teachers</span>
              <span className="text-2xl font-bold text-green-600">{stats.teachers}</span>
            </div>
            <div className="p-4 bg-gray-50 border rounded-lg flex justify-between">
              <span className="font-semibold text-gray-700">Total Students</span>
              <span className="text-2xl font-bold text-blue-600">{stats.students}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Students by Class</h2>
          {stats.byClass.length === 0 ? (
            <p className="text-gray-500">No classes found.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 mt-4 max-h-64 overflow-y-auto">
              {stats.byClass.map((c, i) => (
                <div key={i} className="p-3 border rounded-lg bg-gray-50 flex justify-between items-center text-sm">
                  <span className="font-semibold">{c.name}</span>
                  <span className="bg-blue-100 text-blue-800 py-1 px-2 rounded-full font-bold">{c.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;