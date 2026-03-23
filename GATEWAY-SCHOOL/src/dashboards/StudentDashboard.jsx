import React, { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [studentRecord, setStudentRecord] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/signin");
        return;
      }
      
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (prof?.role !== "student") {
        navigate("/");
        return;
      }
      setProfile(prof);

      const { data: stud } = await supabase
        .from("students")
        .select("*, classes(class_name)")
        .eq("id", user.id)
        .single();
      
      setStudentRecord(stud);

      if (stud?.class_id) {
        // Fetch class assignments
        const { data: asgData } = await supabase
          .from("assignments")
          .select("*, profiles(full_name)") /* profiles is the teacher */
          .eq("class_id", stud.class_id)
          .order("created_at", { ascending: false });
        if (asgData) setAssignments(asgData);

        // Fetch notifications for the class + general notifications
        const { data: notifData } = await supabase
          .from("notifications")
          .select("*")
          .or(`class_id.eq.${stud.class_id},class_id.is.null`)
          .order("created_at", { ascending: false });
        if (notifData) setNotifications(notifData);
      } else {
        // No class assigned yet, just fetch general notifications
        const { data: notifData } = await supabase
          .from("notifications")
          .select("*")
          .is("class_id", null)
          .order("created_at", { ascending: false });
        if (notifData) setNotifications(notifData);
      }

      setLoading(false);
    };
    init();
  }, [navigate]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto mt-8 p-4">
      <div className="bg-white p-6 rounded-xl shadow mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {profile.full_name}</h1>
          <p className="text-gray-600 mt-1">ID: {studentRecord?.student_id}</p>
        </div>
        <div className="text-right">
          {studentRecord?.classes ? (
            <p className="text-green-600 font-bold bg-green-50 p-3 rounded-lg">
              {studentRecord.classes.class_name}
            </p>
          ) : (
            <p className="text-red-500 font-bold bg-red-50 p-3 rounded-lg">No Class Assigned</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* ASSIGNMENTS */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">My Assignments</h2>
          {assignments.length === 0 ? (
            <p className="text-gray-500">No assignments yet.</p>
          ) : (
            <ul className="space-y-4">
              {assignments.map(a => (
                <li key={a.id} className="p-4 border border-blue-100 bg-blue-50 rounded-lg">
                  <h3 className="font-bold text-lg">{a.title}</h3>
                  <p className="text-sm text-gray-700 mt-1">{a.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* NOTIFICATIONS */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Notifications</h2>
          {notifications.length === 0 ? (
            <p className="text-gray-500">No new notifications.</p>
          ) : (
            <ul className="space-y-4">
              {notifications.map(n => (
                <li key={n.id} className="p-4 border border-amber-100 bg-amber-50 rounded-lg">
                  <h3 className="font-bold text-lg text-amber-900">{n.title}</h3>
                  <p className="text-gray-800 mt-2">{n.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
