import React, { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      if (!user) {
        navigate("/signin");
        return;
      }
      if (user.email === "apdilaahiapdi143@gmail.com") {
        navigate("/dashboards/AdminPanel");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData || { role: "unknown" });
    };
    fetchProfile();
  }, []);

  if (!profile) return <p className="text-center mt-10">Loading...</p>;

  useEffect(() => {
    if (profile) {
      if (profile.role === "admin") navigate("/dashboards/AdminPanel");
      else if (profile.role === "teacher") navigate("/dashboards/TeacherDashboard");
      else if (profile.role === "student") navigate("/dashboards/StudentDashboard");
      else navigate("/"); // Fallback if no valid role
    }
  }, [profile, navigate]);

  return <p className="text-center mt-10">Redirecting...</p>;
};

export default Dashboard;