import React, { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        navigate("/signin");
        return;
      }
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();
      setProfile(profileData);
    };
    fetchProfile();
  }, []);

  if (!profile) return <p className="text-center mt-10">Loading...</p>;

  if (profile.role === "admin") navigate("/admin");
  if (profile.role === "teacher") navigate("/dashboards/TeacherPanel");
  if (profile.role === "student") navigate("/dashboards/StudentPanel");

  return null;
};

export default Dashboard;