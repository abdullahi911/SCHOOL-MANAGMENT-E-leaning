import React, { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { FiBell, FiUser, FiInfo } from "react-icons/fi";

const StatCard = ({ title, value, icon, colorClass, subtitle }) => (
  <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex items-center justify-between hover:scale-[1.02] transition">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
    <div className={`p-4 rounded-xl ${colorClass}`}>{icon}</div>
  </div>
);

const StudentDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [student, setStudent] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          navigate("/signin");
          return;
        }

        // Profile
        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!prof || prof.role !== "student") {
          navigate("/");
          return;
        }

        if (isMounted) setProfile(prof);

        // Student + class
        const { data: stud } = await supabase
          .from("students")
          .select(
            `
            *,
            classes (
              class_name,
              teachers (
                profiles (full_name)
              )
            )
          `
          )
          .eq("id", user.id)
          .single();

        if (isMounted) setStudent(stud);

        // Notifications
        let query = supabase
          .from("notifications")
          .select("*, profiles!created_by(full_name, role)")
          .order("created_at", { ascending: false });

        if (stud?.class_id) {
          query = query.or(
            `class_id.eq.${stud.class_id},class_id.is.null`
          );
        } else {
          query = query.is("class_id", null);
        }

        const { data: notifData } = await query;

        if (isMounted && notifData) {
          setNotifications(notifData);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">
              Welcome, {profile?.full_name}
            </h1>
            <p className="text-gray-500 text-sm">
              Student ID: {student?.student_id || "N/A"}
            </p>
          </div>

          {student?.classes ? (
            <div className="bg-emerald-50 border px-5 py-2 rounded-xl">
              <p className="text-xs text-emerald-600 font-bold">
                Assigned Class
              </p>
              <p className="font-bold text-emerald-800">
                {student.classes.class_name}
              </p>
            </div>
          ) : (
            <div className="bg-red-50 border px-5 py-2 rounded-xl">
              <p className="text-xs text-red-500 font-bold">Status</p>
              <p className="font-bold text-red-700">
                No Class Assigned
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-10">
        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <StatCard
            title="Class Teacher"
            value={
              student?.classes?.teachers?.profiles?.full_name || "N/A"
            }
            subtitle={
              student?.classes
                ? `For class ${student.classes.class_name}`
                : "Waiting for assignment"
            }
            icon={<FiUser className="w-6 h-6 text-blue-600" />}
            colorClass="bg-blue-50"
          />

          <StatCard
            title="Notifications"
            value={notifications.length}
            subtitle="From admin and teachers"
            icon={<FiBell className="w-6 h-6 text-amber-600" />}
            colorClass="bg-amber-50"
          />
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl shadow border overflow-hidden">
          <div className="p-6 border-b flex items-center gap-2">
            <FiBell className="text-amber-500" />
            <h2 className="font-bold text-lg">
              Your Communication Board
            </h2>
          </div>

          <div className="p-6 space-y-4 bg-gray-50 min-h-[350px]">
            {notifications.length === 0 ? (
              <div className="text-center py-10">
                <FiInfo className="mx-auto text-gray-300 w-10 h-10 mb-2" />
                <p className="text-gray-500">
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="bg-white p-4 rounded-xl border shadow-sm"
                >
                  <div className="flex justify-between mb-2">
                    <h3 className="font-semibold">{n.title}</h3>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100">
                      {n.profiles?.role}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm">
                    {n.message}
                  </p>

                  <p className="text-xs text-gray-400 mt-2">
                    From: {n.profiles?.full_name || "Unknown"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;