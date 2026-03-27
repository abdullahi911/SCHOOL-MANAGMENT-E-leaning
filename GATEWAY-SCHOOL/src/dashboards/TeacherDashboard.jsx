import React, { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { FiBook, FiBell, FiUsers, FiMessageSquare } from "react-icons/fi";

const StatCard = ({ title, value, icon, colorClass }) => (
  <div className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 flex items-center justify-between hover:scale-[1.02] transition-transform duration-300">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
    </div>
    <div className={`p-4 rounded-xl ${colorClass}`}>
      {icon}
    </div>
  </div>
);

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [profile, setProfile] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Form states
  const [notifMessage, setNotifMessage] = useState("");
  const [notifClassId, setNotifClassId] = useState("");

  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!user || error) {
        if (mounted) navigate("/signin");
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (prof?.role !== "teacher") {
        if (mounted) navigate("/");
        return;
      }

      if (mounted) setProfile(prof);

      // Fetch teacher record
      const { data: teacherData } = await supabase
        .from("teachers")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (mounted) setTeacher(teacherData);

      // Fetch all classes
      const { data: clsData } = await supabase
        .from("classes")
        .select("*, teachers(profiles(full_name))")
        .order("class_name");
      if (mounted && clsData) setClasses(clsData);

      // Fetch all students and their assigned classes
      const { data: studData } = await supabase
        .from("students")
        .select("*, profiles(full_name), classes(class_name)");
      if (mounted && studData) setStudents(studData);

      // Fetch notifications sent to classes or global
      const { data: notifData } = await supabase
        .from("notifications")
        .select("*, classes(class_name), profiles!created_by(full_name)")
        .order("created_at", { ascending: false });
      if (mounted && notifData) setNotifications(notifData);

      if (mounted) setLoading(false);
    };

    init();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleCreateNotification = async () => {
    if (!notifMessage) return;
    
    await supabase.from("notifications").insert({
      title: "Teacher Announcement",
      message: notifMessage,
      created_by: profile.id,
      class_id: notifClassId || null // If no class selected, it's global
    });

    setNotifMessage("");
    setNotifClassId("");
    
    // Refresh notifications
    const { data: notifData } = await supabase
      .from("notifications")
      .select("*, classes(class_name), profiles!created_by(full_name)")
      .order("created_at", { ascending: false });
    setNotifications(notifData || []);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans pb-16">
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 lg:px-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
            Welcome back, {profile?.full_name}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Teacher Dashboard • Subject: {teacher?.subject || "Not Assigned"}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-10">
        
        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard 
            title="Total Classes" 
            value={classes.length} 
            icon={<FiBook className="w-6 h-6 text-emerald-600" />} 
            colorClass="bg-emerald-50"
          />
          <StatCard 
            title="Total Students" 
            value={students.length} 
            icon={<FiUsers className="w-6 h-6 text-blue-600" />} 
            colorClass="bg-blue-50"
          />
          <StatCard 
            title="Announcements" 
            value={notifications.length} 
            icon={<FiBell className="w-6 h-6 text-amber-600" />} 
            colorClass="bg-amber-50"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
          
          {/* SEND NOTIFICATIONS */}
          <div className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/40 border border-gray-100 flex flex-col xl:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-100 p-2 rounded-lg">
                <FiMessageSquare className="text-amber-600 w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Send Announcement</h2>
            </div>
            
            <div className="flex flex-col gap-4">
              <textarea 
                value={notifMessage} 
                onChange={(e) => setNotifMessage(e.target.value)} 
                placeholder="Write your announcement here..." 
                rows="4"
                className="border border-gray-200 p-3 focus:ring-2 focus:ring-amber-500 outline-none rounded-lg transition-all w-full resize-none"
              />
              <select 
                value={notifClassId} 
                onChange={(e) => setNotifClassId(e.target.value)} 
                className="border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all bg-white w-full">
                <option value="">Global (All Classes)</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
              </select>
              <button 
                onClick={handleCreateNotification} 
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold flex items-center justify-center gap-2 py-3 rounded-lg mt-2 hover:shadow-lg transition-all duration-300">
                <FiMessageSquare /> Send Notification
              </button>
            </div>
          </div>

          {/* VIEW CLASSES */}
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden xl:col-span-2 flex flex-col max-h-[500px]">
            <div className="p-8 border-b border-gray-100 flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <FiBook className="text-emerald-600 w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">School Classes Overview</h2>
            </div>
            <div className="overflow-y-auto pr-2 p-6 space-y-3 custom-scrollbar">
              {classes.length === 0 ? (
                 <p className="text-gray-400 text-sm py-4">No classes created by admin yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {classes.map(c => (
                    <div key={c.id} className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-xl hover:bg-emerald-50 transition-colors">
                      <h3 className="font-bold text-gray-800 text-lg mb-1">{c.class_name}</h3>
                      <p className="text-sm text-gray-500">
                        Teacher: {c.teachers?.profiles?.full_name || "Unassigned"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* STUDENTS LISTING */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden mb-10">
          <div className="p-8 border-b border-gray-100 flex items-center gap-3">
             <div className="bg-blue-100 p-2 rounded-lg">
                <FiUsers className="text-blue-600 w-5 h-5" />
             </div>
             <h2 className="text-xl font-bold text-gray-800">All Students Roster</h2>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/80 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Full Name</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Student ID</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Assigned Class</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-gray-800 font-medium">{s.profiles?.full_name || "N/A"}</td>
                    <td className="py-4 px-6 text-gray-500 text-sm">{s.student_id}</td>
                    <td className="py-4 px-6">
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {s.classes?.class_name || "Unassigned"}
                      </span>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr><td colSpan="3" className="py-8 text-center text-gray-400">No students enrolled yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e5e7eb; border-radius: 10px; }
      `}} />
    </div>
  );
};

export default TeacherDashboard;
