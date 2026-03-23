import React, { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { useNavigate } from "react-router-dom";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [teacherProfile, setTeacherProfile] = useState(null);

  // New assignment form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // New notification form
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/signin");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "teacher") {
        navigate("/");
        return;
      }
      setTeacherProfile(profile);

      // Fetch classes for assignment dropdown
      const { data: clsData } = await supabase.from("classes").select("*");
      if (clsData) setClasses(clsData);

      // Fetch teacher's assignments
      const { data: asgData } = await supabase
        .from("assignments")
        .select("*, classes(class_name)")
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: false });
      if (asgData) setAssignments(asgData);

      // Fetch global notifications
      const { data: notifData } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });
      if (notifData) setNotifications(notifData);

      setLoading(false);
    };
    init();
  }, [navigate]);

  useEffect(() => {
    if (selectedClass) {
      const fetchStudents = async () => {
        const { data } = await supabase
          .from("students")
          .select("*, profiles(full_name)")
          .eq("class_id", selectedClass);
        if (data) setStudents(data);
      };
      fetchStudents();
    } else {
      setStudents([]);
    }
  }, [selectedClass]);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!selectedClass) return alert("Select a class!");
    const { error } = await supabase.from("assignments").insert({
      teacher_id: teacherProfile.id,
      class_id: selectedClass,
      title,
      description
    });
    if (!error) {
      alert("Assignment Created!");
      setTitle(""); setDescription("");
      window.location.reload(); // naive reload to refresh data
    } else {
      alert(error.message);
    }
  };

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("notifications").insert({
      author_id: teacherProfile.id,
      target_role: "student",
      class_id: selectedClass || null,
      title: notifTitle,
      message: notifMessage
    });
    if (!error) {
      alert("Notification Sent!");
      setNotifTitle(""); setNotifMessage("");
      window.location.reload();
    } else {
      alert(error.message);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto mt-8 p-4">
      <h1 className="text-3xl font-bold mb-8">Teacher Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* ASSIGNMENTS */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Create Assignment</h2>
          <form onSubmit={handleCreateAssignment} className="flex flex-col gap-4">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="p-2 border rounded" required
            >
              <option value="">Select Class</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.class_name}</option>
              ))}
            </select>
            <input
              type="text" placeholder="Title" value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="p-2 border rounded" required
            />
            <textarea
              placeholder="Description" value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="p-2 border rounded" required
            />
            <button className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Assign</button>
          </form>

          <h3 className="font-bold mt-8 mb-2">My Assignments</h3>
          <ul className="space-y-3">
            {assignments.map(a => (
              <li key={a.id} className="p-3 border rounded bg-gray-50">
                <p className="font-semibold">{a.title} ({a.classes?.class_name})</p>
              </li>
            ))}
          </ul>
        </div>

        {/* NOTIFICATIONS & STUDENTS */}
        <div>
          <div className="bg-white p-6 rounded-xl shadow mb-8">
            <h2 className="text-xl font-bold mb-4">Post Notification</h2>
            <form onSubmit={handleCreateNotification} className="flex flex-col gap-4">
              <input
                type="text" placeholder="Notification Title" value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                className="p-2 border rounded" required
              />
              <textarea
                placeholder="Message" value={notifMessage}
                onChange={(e) => setNotifMessage(e.target.value)}
                className="p-2 border rounded" required
              />
              <button className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Send Notification</button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Students in Selected Class</h2>
            {students.length === 0 ? (
              <p className="text-gray-500">Select a class on the left to view students.</p>
            ) : (
              <ul className="space-y-2">
                {students.map(s => (
                  <li key={s.id} className="p-2 border-b">
                    {s.profiles?.full_name} <span className="text-gray-500 text-sm">({s.student_id})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeacherDashboard;
