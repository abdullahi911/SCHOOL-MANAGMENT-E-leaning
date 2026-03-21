import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabase";

const AdminPanel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        navigate("/signin");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();

      if (profile?.role !== "admin") {
        navigate("/dashboard"); // non-admins redirected
      } else {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div
        onClick={() => navigate("/admin/create-student")}
        className="cursor-pointer bg-blue-600 text-white p-6 rounded shadow hover:bg-blue-700 text-center font-semibold"
      >
        Create Student
      </div>

      <div
        onClick={() => navigate("/admin/create-teacher")}
        className="cursor-pointer bg-green-600 text-white p-6 rounded shadow hover:bg-green-700 text-center font-semibold"
      >
        Create Teacher
      </div>

      <div
        onClick={() => navigate("/admin/assign-class")}
        className="cursor-pointer bg-purple-600 text-white p-6 rounded shadow hover:bg-purple-700 text-center font-semibold"
      >
        Assign Class
      </div>
    </div>
  );
};

export default AdminPanel;