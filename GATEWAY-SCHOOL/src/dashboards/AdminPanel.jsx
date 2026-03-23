import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabase";
import { FiUsers, FiBook, FiBell, FiPlus, FiTrash2, FiUserPlus, FiMessageSquare } from "react-icons/fi";

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

const AdminPanel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // DATA STATES
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // FORM STATES
  const [newClass, setNewClass] = useState("");
  const [newNotification, setNewNotification] = useState("");

  // STUDENT FORM
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentClassId, setStudentClassId] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [studentMessage, setStudentMessage] = useState("");

  // TEACHER FORM
  const [teacherName, setTeacherName] = useState("");
  const [teacherCode, setTeacherCode] = useState("");
  const [teacherSubject, setTeacherSubject] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [teacherMessage, setTeacherMessage] = useState("");

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return navigate("/signin");

      // check if admin
      if (user.email !== "apdilaahiapdi143@gmail.com") {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role !== "admin") return navigate("/dashboard");
      }

      await fetchAllData();
      setLoading(false);
    };

    checkAdmin();
  }, []);

  const fetchAllData = async () => {
    const { data: studentData } = await supabase
      .from("students")
      .select("*, profiles(full_name), classes(class_name)");
    const { data: teacherData } = await supabase
      .from("teachers")
      .select("*, profiles(full_name)");
    const { data: classData } = await supabase
      .from("classes")
      .select("*")
      .order("class_name");
    const { data: notifData } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    setStudents(studentData || []);
    setTeachers(teacherData || []);
    setClasses(classData || []);
    setNotifications(notifData || []);
  };

  // CREATE CLASS
  const handleCreateClass = async () => {
    if (!newClass) return;
    await supabase.from("classes").insert({ class_name: newClass });
    setNewClass("");
    fetchAllData();
  };

  const handleDeleteClass = async (id) => {
    await supabase.from("classes").delete().eq("id", id);
    fetchAllData();
  };

  // CREATE NOTIFICATION
  const handleCreateNotification = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!newNotification) return;
    await supabase.from("notifications").insert({
      title: "Announcement",
      message: newNotification,
      created_by: user.id
    });
    setNewNotification("");
    fetchAllData();
  };

  const handleDeleteNotification = async (id) => {
    await supabase.from("notifications").delete().eq("id", id);
    fetchAllData();
  };

  // CREATE STUDENT
  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!studentId || !studentPassword) return;

    const autoEmail = `${studentId}@student.gatewayschool.com`;
    const { data, error } = await supabase.auth.signUp({
      email: autoEmail,
      password: studentPassword,
    });
    if (error) return setStudentMessage(error.message);
    const userId = data.user.id;

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      full_name: studentName,
      role: "student",
    });
    if (profileError) return setStudentMessage(profileError.message);

    const { error: studentError } = await supabase.from("students").insert({
      id: userId,
      student_id: studentId,
      class_id: studentClassId || null
    });
    if (studentError) return setStudentMessage(studentError.message);

    setStudentMessage("Student created successfully!");
    setStudentName("");
    setStudentId("");
    setStudentClassId("");
    setStudentPassword("");
    fetchAllData();
  };

  // CREATE TEACHER
  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    if (!teacherCode || !teacherPassword) return;

    const autoEmail = `${teacherCode}@teacher.gatewayschool.com`;
    const { data, error } = await supabase.auth.signUp({
      email: autoEmail,
      password: teacherPassword,
    });
    if (error) return setTeacherMessage(error.message);

    const userId = data.user.id;

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      full_name: teacherName,
      role: "teacher",
    });
    if (profileError) return setTeacherMessage(profileError.message);

    const { error: teacherError } = await supabase.from("teachers").insert({
      id: userId,
      teacher_code: teacherCode,
      subject: teacherSubject
    });
    if (teacherError) return setTeacherMessage(teacherError.message);

    setTeacherMessage("Teacher created successfully!");
    setTeacherName("");
    setTeacherCode("");
    setTeacherSubject("");
    setTeacherPassword("");
    fetchAllData();
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
        <div className="max-w-7xl mx-auto px-6 py-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Admin Control Center
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Manage your school securely and efficiently.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-10">
        
        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard 
            title="Total Students" 
            value={students.length} 
            icon={<FiUsers className="w-6 h-6 text-blue-600" />} 
            colorClass="bg-blue-50"
          />
          <StatCard 
            title="Total Teachers" 
            value={teachers.length} 
            icon={<FiBook className="w-6 h-6 text-purple-600" />} 
            colorClass="bg-purple-50"
          />
          <StatCard 
            title="Active Classes" 
            value={classes.length} 
            icon={<FiBook className="w-6 h-6 text-emerald-600" />} 
            colorClass="bg-emerald-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* CREATE STUDENT */}
          <div className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/40 border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FiUserPlus className="text-blue-600 w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Enroll New Student</h2>
              </div>
              <form onSubmit={handleCreateStudent} className="flex flex-col gap-4">
                <input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Full Name" className="border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"/>
                <input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="Student ID" className="border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"/>
                <select value={studentClassId} onChange={(e) => setStudentClassId(e.target.value)} className="border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white">
                  <option value="">Select Class (Optional)</option>
                  {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.class_name}</option>)}
                </select>
                <input value={studentPassword} onChange={(e) => setStudentPassword(e.target.value)} type="password" placeholder="Password" className="border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"/>
                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 flex items-center justify-center gap-2 rounded-lg mt-2 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  <FiPlus /> Enroll Student
                </button>
                {studentMessage && <p className="text-emerald-600 mt-2 text-sm font-medium">{studentMessage}</p>}
              </form>
            </div>
          </div>

          {/* CREATE TEACHER */}
          <div className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/40 border border-gray-100 flex flex-col justify-between">
             <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <FiUserPlus className="text-purple-600 w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Add New Teacher</h2>
              </div>
              <form onSubmit={handleCreateTeacher} className="flex flex-col gap-4">
                <input value={teacherName} onChange={(e) => setTeacherName(e.target.value)} placeholder="Full Name" className="border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"/>
                <input value={teacherCode} onChange={(e) => setTeacherCode(e.target.value)} placeholder="Teacher Code" className="border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"/>
                <input value={teacherSubject} onChange={(e) => setTeacherSubject(e.target.value)} placeholder="Subject" className="border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"/>
                <input value={teacherPassword} onChange={(e) => setTeacherPassword(e.target.value)} type="password" placeholder="Password" className="border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"/>
                <button className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold flex items-center justify-center gap-2 py-3 rounded-lg mt-2 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  <FiPlus /> Register Teacher
                </button>
                {teacherMessage && <p className="text-emerald-600 mt-2 text-sm font-medium">{teacherMessage}</p>}
              </form>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          
          {/* MANAGE CLASSES */}
          <div className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/40 border border-gray-100 flex flex-col max-h-[500px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <FiBook className="text-emerald-600 w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Manage Classes</h2>
            </div>
            <div className="flex gap-3 mb-6">
              <input
                value={newClass}
                onChange={(e) => setNewClass(e.target.value)}
                placeholder="New Class Name"
                className="border border-gray-200 py-2 px-3 focus:ring-2 focus:ring-emerald-500 outline-none flex-1 rounded-lg transition-all"
              />
              <button onClick={handleCreateClass} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 rounded-lg flex justify-center items-center gap-2 transition-colors font-medium">
                <FiPlus /> Add
              </button>
            </div>
            <div className="overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {classes.map(c => (
                <div key={c.id} className="flex justify-between items-center p-4 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-gray-700">{c.class_name}</span>
                  <button onClick={() => handleDeleteClass(c.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors">
                    <FiTrash2 className="w-5 h-5"/>
                  </button>
                </div>
              ))}
              {classes.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No classes created yet.</p>}
            </div>
          </div>

          {/* NOTIFICATIONS */}
          <div className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/40 border border-gray-100 flex flex-col max-h-[500px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-100 p-2 rounded-lg">
                <FiBell className="text-amber-600 w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Global Announcements</h2>
            </div>
            <div className="flex gap-3 mb-6">
              <input 
                value={newNotification} 
                onChange={(e) => setNewNotification(e.target.value)} 
                placeholder="Write message..." 
                className="border border-gray-200 py-2 px-3 focus:ring-2 focus:ring-amber-500 outline-none flex-1 rounded-lg transition-all"
              />
              <button onClick={handleCreateNotification} className="bg-amber-500 hover:bg-amber-600 text-white px-5 rounded-lg flex justify-center items-center gap-2 transition-colors font-medium">
                <FiMessageSquare /> Send
              </button>
            </div>
            <div className="overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {notifications.map(n => (
                <div key={n.id} className="flex justify-between items-start p-4 bg-amber-50/50 border border-amber-100/50 rounded-xl">
                  <span className="text-gray-700 text-sm leading-relaxed">{n.message}</span>
                  <button onClick={() => handleDeleteNotification(n.id)} className="text-red-400 hover:text-red-600 ml-4 p-1 hover:bg-red-50 rounded-md transition-colors flex-shrink-0">
                    <FiTrash2 className="w-4 h-4"/>
                  </button>
                </div>
              ))}
               {notifications.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No announcements sent yet.</p>}
            </div>
          </div>
        </div>

        {/* LISTINGS */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden mb-10">
          <div className="p-8 border-b border-gray-100 flex items-center gap-3">
             <div className="bg-blue-100 p-2 rounded-lg">
                <FiUsers className="text-blue-600 w-5 h-5" />
             </div>
             <h2 className="text-xl font-bold text-gray-800">Enrolled Students Overview</h2>
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
                  <tr><td colSpan="3" className="py-8 text-center text-gray-400">No students found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex items-center gap-3">
             <div className="bg-purple-100 p-2 rounded-lg">
                <FiUsers className="text-purple-600 w-5 h-5" />
             </div>
             <h2 className="text-xl font-bold text-gray-800">Teachers Overview</h2>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/80 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Full Name</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Teacher Code</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Subject</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {teachers.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-gray-800 font-medium">{t.profiles?.full_name || "N/A"}</td>
                    <td className="py-4 px-6 text-gray-500 text-sm">{t.teacher_code}</td>
                    <td className="py-4 px-6">
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {t.subject || "Not set"}
                      </span>
                    </td>
                  </tr>
                ))}
                 {teachers.length === 0 && (
                  <tr><td colSpan="3" className="py-8 text-center text-gray-400">No teachers found.</td></tr>
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

export default AdminPanel;