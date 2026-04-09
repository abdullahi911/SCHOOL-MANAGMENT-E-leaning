import React, { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { FiBook, FiBell, FiUsers, FiMessageSquare, FiInfo } from "react-icons/fi";
import gatewayLogo from "../images/gatewaylogo.jpeg";

const StatCard = ({ title, value, icon, colorClass }) => (
  <div className="bg-white dark:bg-slate-700 p-6 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 dark:border-slate-600 flex items-center justify-between hover:scale-[1.02] transition-transform duration-300">
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{value}</h3>
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
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user || error) {
          if (mounted) navigate("/signin");
          return;
        }

        const { data: prof, error: profErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!prof || prof.role?.trim()?.toLowerCase() !== "teacher") {
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

        // Fetch classes assigned to this teacher
        const { data: clsData, error: clsErr } = await supabase
          .from("classes")
          .select("*, teachers(profiles(full_name))")
          .eq("teacher_id", user.id)
          .order("class_name");
        
        if (clsErr) console.error("Error fetching classes:", clsErr);
        if (mounted && clsData) setClasses(clsData);

        // Fetch students assigned to this teacher's classes
        const classIds = clsData ? clsData.map(c => c.id) : [];
        let studData = [];
        if (classIds.length > 0) {
          const { data, error: studErr } = await supabase
            .from("students")
            .select("*, profiles(full_name), classes(class_name)")
            .in("class_id", classIds);
          if (studErr) console.error("Error fetching students:", studErr);
          studData = data || [];
        }
        if (mounted) setStudents(studData);

        // Fetch notifications sent to classes or global
        let query = supabase
          .from("notifications")
          .select("*, classes(class_name), profiles!created_by(full_name)")
          .order("created_at", { ascending: false });
        
        if (classIds.length > 0) {
          query = query.or(`class_id.in.(${classIds.join(',')}),class_id.is.null`);
        } else {
          query = query.is("class_id", null);
        }
        
        const { data: notifData, error: notifErr } = await query;
        if (notifErr) console.error("Error fetching notifications:", notifErr);
        if (mounted && notifData) setNotifications(notifData);
      } catch (err) {
        console.error("Dashboard initialization error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
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
    const classIds = classes.map(c => c.id);
    let query = supabase
      .from("notifications")
      .select("*, classes(class_name), profiles!created_by(full_name)")
      .order("created_at", { ascending: false });
    
    if (classIds.length > 0) {
      query = query.or(`class_id.in.(${classIds.join(',')}),class_id.is.null`);
    } else {
      query = query.is("class_id", null);
    }
    
    const { data: notifData } = await query;
    setNotifications(notifData || []);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-800">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800 font-sans pb-16">
      {/* BEAUTIFUL HERO SECTION */}
      <div className="bg-gradient-to-r from-purple-800 via-fuchsia-700 to-purple-900 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-12 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
            <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFFFFF" d="M42.7,-73.4C55.9,-65.7,67.6,-53.4,75.3,-39.1C83,-24.8,86.7,-8.5,83.9,6.5C81.1,21.5,71.8,35.2,60.6,45.8C49.4,56.4,36.4,63.9,21.9,70.9C7.4,77.9,-8.5,84.4,-23.4,81.3C-38.3,78.2,-52.1,65.5,-63.1,51.2C-74.1,36.9,-82.3,21,-85.2,4.1C-88.1,-12.8,-85.7,-30.7,-76.3,-44.6C-66.9,-58.5,-50.5,-68.4,-34.5,-73.6C-18.5,-78.8,-2.9,-79.3,13.2,-77.2C29.3,-75.1,45.9,-70.4,42.7,-73.4Z" transform="translate(100 100)" />
            </svg>
          </div>
          
          <div className="flex items-center gap-6 relative z-10">
            <img src={gatewayLogo} alt="Gateway Logo" className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-lg bg-white dark:bg-slate-700" />
            <div>
              <p className="text-purple-200 font-semibold tracking-wider text-sm uppercase mb-1">Teacher Portal</p>
              <h1 className="text-4xl font-extrabold tracking-tight mb-2">Welcome back, {profile?.full_name}</h1>
              <div className="flex gap-3 items-center mt-2">
                <span className="bg-white dark:bg-slate-700/20 backdrop-blur-md border border-white/30 text-white px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide shadow-sm">
                  Subject: {teacher?.subject || "Unassigned"}
                </span>
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${classes.length > 0 ? 'bg-emerald-400 text-emerald-900 border border-emerald-300' : 'bg-rose-400 text-rose-900 border border-rose-300'}`}>
                  {classes.length > 0 ? `${classes.length} Classes Assigned` : "No Classes Assigned"}
                </span>
              </div>
            </div>
          </div>
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
            title="Recent Announcements" 
            value={notifications.length} 
            icon={<FiBell className="w-6 h-6 text-amber-600" />} 
            colorClass="bg-amber-50"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
          
          {/* SEND NOTIFICATIONS */}
          <div className="bg-white dark:bg-slate-700 p-8 rounded-3xl shadow-xl shadow-purple-100 border border-purple-50 flex flex-col xl:col-span-1 border-t-4 border-t-purple-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-100 p-2.5 rounded-xl">
                <FiMessageSquare className="text-purple-700 w-5 h-5" />
              </div>
              <h2 className="text-xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">Post Announcement</h2>
            </div>
            
            <div className="flex flex-col gap-5">
              <textarea 
                value={notifMessage} 
                onChange={(e) => setNotifMessage(e.target.value)} 
                placeholder="What do you want to share?" 
                rows="5"
                className="border border-gray-200 dark:border-slate-600 p-4 focus:ring-2 focus:ring-purple-500 outline-none rounded-xl transition-all w-full resize-none text-gray-700 dark:text-gray-200 shadow-inner bg-gray-50 dark:bg-slate-700 dark:bg-slate-700"
              />
              <div className="relative">
                <select 
                  value={notifClassId} 
                  onChange={(e) => setNotifClassId(e.target.value)} 
                  required
                  className="border border-gray-200 dark:border-slate-600 p-4 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all bg-white dark:bg-slate-700 w-full text-gray-700 dark:text-gray-200 font-medium appearance-none shadow-sm cursor-pointer">
                  <option value="" disabled>Select Target Class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-300">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
              <button 
                onClick={handleCreateNotification} 
                disabled={classes.length === 0}
                className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold tracking-wide flex items-center justify-center gap-2 py-4 rounded-xl mt-2 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <FiMessageSquare /> Send Notification
              </button>
              {classes.length === 0 && <p className="text-xs text-rose-500 text-center font-medium mt-1">You must be assigned to a class to send announcements.</p>}
            </div>
          </div>

          {/* VIEW CLASSES */}
          <div className="bg-white dark:bg-slate-700 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 dark:border-slate-600 overflow-hidden xl:col-span-2 flex flex-col min-h-[450px]">
             {classes.length === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                    <FiInfo className="text-rose-400 w-12 h-12" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-3 tracking-tight">Not Assigned to Classes</h2>
                  <p className="text-gray-500 dark:text-gray-300 max-w-md text-lg leading-relaxed">
                    You currently have no classes assigned to your teaching schedule. Please contact a school administrator.
                  </p>
               </div>
             ) : (
                <>
                  <div className="p-8 border-b border-gray-50 flex items-center gap-4 bg-gray-50 dark:bg-slate-700">
                    <div className="bg-emerald-100 p-3 rounded-2xl shadow-inner">
                      <FiBook className="text-emerald-600 w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">Your Roster</h2>
                  </div>
                  <div className="overflow-y-auto pr-2 p-8 space-y-3 custom-scrollbar flex-1 bg-gray-50 dark:bg-slate-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {classes.map(c => {
                        const classStudents = students.filter(s => s.class_id === c.id);
                        return (
                        <div key={c.id} className="p-6 bg-white dark:bg-slate-700 rounded-3xl shadow-xl shadow-emerald-50 border border-emerald-100/50 hover:border-emerald-300 hover:shadow-emerald-100 transition-all group overflow-hidden relative">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-100/50 to-transparent rounded-bl-[100px] z-0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <h3 className="font-extrabold text-gray-800 dark:text-gray-100 text-2xl mb-1 relative z-10">{c.class_name}</h3>
                          <p className="text-sm font-semibold text-emerald-600 bg-emerald-50 inline-block px-3 py-1 rounded-full relative z-10">
                            {classStudents.length} Students
                          </p>
                        </div>
                      )})}
                    </div>
                  </div>
                </>
             )}
          </div>

        </div>

        {/* STUDENTS LISTING */}
        <div className="bg-white dark:bg-slate-700 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 dark:border-slate-600 overflow-hidden mb-10">
          <div className="p-8 border-b border-gray-50 flex items-center gap-4 bg-gray-50 dark:bg-slate-700">
             <div className="bg-blue-100 p-3 rounded-2xl shadow-inner">
                <FiUsers className="text-blue-600 w-6 h-6" />
             </div>
             <div>
               <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">Assigned Students</h2>
               <p className="text-gray-500 dark:text-gray-300 text-sm mt-1">A comprehensive list of students in ALL your classes.</p>
             </div>
          </div>
          <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-slate-700/90 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="py-5 px-8 font-bold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-widest">Full Name</th>
                  <th className="py-5 px-8 font-bold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-widest">Student ID</th>
                  <th className="py-5 px-8 font-bold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-widest">Enrolled Class</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="py-4 px-8 text-gray-800 dark:text-gray-100 font-bold group-hover:text-blue-700 transition-colors">{s.profiles?.full_name || "N/A"}</td>
                    <td className="py-4 px-8 text-gray-500 dark:text-gray-300 font-mono text-sm">{s.student_id}</td>
                    <td className="py-4 px-8">
                      <span className="bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm border border-emerald-200">
                        {s.classes?.class_name || "Unassigned"}
                      </span>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr><td colSpan="3" className="py-12 text-center text-gray-400 dark:text-gray-400 font-medium text-lg">No students allocated to your classes.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 12px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
      `}} />
    </div>
  );
};

export default TeacherDashboard;
