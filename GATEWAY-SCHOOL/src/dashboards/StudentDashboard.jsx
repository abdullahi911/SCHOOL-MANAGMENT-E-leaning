import React, { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { FiBell, FiUser, FiInfo, FiBookOpen } from "react-icons/fi";
import gatewayLogo from "../images/gatewayLogo.jpeg";

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
          data: { session },
          error,
        } = await supabase.auth.getSession();
        const user = session?.user;

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

        if (!prof || prof.role?.trim()?.toLowerCase() !== "student") {
          navigate("/");
          return;
        }

        if (isMounted) setProfile(prof);

        // Student + class
        const { data: stud } = await supabase
          .from("students")
          .select(`
            *,
            classes (
              class_name,
              teachers (
                profiles (full_name)
              )
            )
          `)
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
      <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800 font-sans pb-16">
      {/* BEAUTIFUL HERO SECTION */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-12 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/3 -translate-y-1/3">
            <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFFFFF" d="M45.7,-76.3C58.9,-69.3,69.1,-55.3,77.6,-40.4C86.1,-25.5,93,-9.7,90.4,4.7C87.8,19.2,75.8,32.3,64.2,43.5C52.6,54.7,41.4,64.1,28.2,71.2C15,78.3,-0.2,83.1,-15.5,81.4C-30.8,79.7,-46.2,71.6,-57.8,60.2C-69.4,48.8,-77.2,34.2,-81.8,18.7C-86.4,3.2,-87.8,-13.2,-82.1,-27.1C-76.4,-41,-63.5,-52.4,-49.6,-59.4C-35.7,-66.4,-20.8,-69.1,-3.9,-63.2C13,-57.3,26,-42.8,45.7,-76.3Z" transform="translate(100 100)" />
            </svg>
          </div>
          
          <div className="flex items-center gap-6 relative z-10">
            <img src={gatewayLogo} alt="Gateway Logo" className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-lg bg-white dark:bg-slate-700" />
            <div>
              <p className="text-blue-200 font-semibold tracking-wider text-sm uppercase mb-1">Student Portal</p>
              <h1 className="text-4xl font-extrabold tracking-tight mb-2">Welcome back, {profile?.full_name}</h1>
              <div className="flex gap-3 items-center">
                <span className="bg-white dark:bg-slate-700/20 backdrop-blur-md border border-white/30 text-white px-3 py-1 rounded-full text-sm font-medium">ID: {student?.student_id || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: CLASS INFO */}
        <div className="lg:col-span-1 space-y-8">
          
          {student?.classes ? (
            <div className="bg-white dark:bg-slate-700 rounded-3xl p-8 shadow-xl shadow-blue-100 border border-blue-50 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
               <div className="absolute top-0 right-0 bg-gradient-to-bl from-blue-100 to-transparent w-24 h-24 rounded-bl-[100px] z-0"></div>
               <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                      <FiBookOpen className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Your Class</h2>
                 </div>
                 <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
                   {student.classes.class_name}
                 </p>
                 <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-600">
                    <p className="text-sm font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-2">Assigned Teacher</p>
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                         {student?.classes?.teachers?.profiles?.full_name?.charAt(0) || "T"}
                       </div>
                       <p className="text-lg font-bold text-gray-700 dark:text-gray-200">{student?.classes?.teachers?.profiles?.full_name || "No teacher yet"}</p>
                    </div>
                 </div>
               </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 shadow-lg border border-amber-100 relative">
               <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                    <FiInfo className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-amber-900">Class Status</h2>
               </div>
               <p className="text-xl font-semibold text-amber-800 mb-2">Unassigned</p>
               <p className="text-amber-700/80 text-sm">You have not been assigned to a class yet. Please contact administration for your class placement.</p>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: NOTIFICATIONS */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-700 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 dark:border-slate-600 overflow-hidden flex flex-col h-full min-h-[500px]">
            <div className="p-8 border-b border-gray-50 flex items-center gap-4 bg-gray-50 dark:bg-slate-700 dark:bg-slate-700">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl shadow-inner">
                <FiBell className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Communication Board</h2>
                <p className="text-gray-500 dark:text-gray-300 text-sm mt-1">Official announcements from admins and teachers</p>
              </div>
            </div>

            <div className="p-8 flex-1 bg-gray-50 dark:bg-slate-700 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center h-full">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-slate-600 rounded-full flex items-center justify-center mb-4">
                    <FiBell className="text-gray-300 w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">You're all caught up!</h3>
                  <p className="text-gray-500 dark:text-gray-300 max-w-sm">There are no new notifications for your class at this time.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((n) => (
                    <div key={n.id} className="bg-white dark:bg-slate-700 p-6 rounded-2xl border border-gray-100 dark:border-slate-600 shadow-sm hover:shadow-md transition-shadow group">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 group-hover:text-blue-600 transition-colors">{n.title}</h3>
                        <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${n.profiles?.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {n.profiles?.role}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-4">{n.message}</p>
                      <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                        <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-600 flex items-center justify-center text-xs text-gray-500 dark:text-gray-300 font-bold border border-gray-200 dark:border-slate-600">
                          {n.profiles?.full_name?.charAt(0) || "?"}
                        </div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-300">
                          {n.profiles?.full_name || "Unknown Sender"} • {new Date(n.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;