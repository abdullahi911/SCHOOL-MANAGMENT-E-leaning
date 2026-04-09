import React, { useState, useEffect } from 'react';
import supabase from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { IoPlayCircleOutline, IoCloseOutline, IoAddCircleOutline } from 'react-icons/io5';
import gatewayLogo from '../images/gatewaylogo.jpeg';

// Unique standard YouTube embedded videos for each subject
const FALLBACK_COURSES = [
  {
    id: '1',
    title: 'IT Learning',
    instructor: 'Ustaad Mohamed',
    price: 18,
    video_url: 'https://www.youtube.com/embed/tVzUXW6nD8I', // Tech/IT
    image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '2',
    title: 'English',
    instructor: 'Ustaad Dubbad',
    price: 18,
    video_url: 'https://www.youtube.com/embed/J_EQDtpYSNM', // English/Speaking
    image_url: 'https://images.unsplash.com/photo-1546410531-bea5aadcb6ce?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '3',
    title: 'Mathematics and English',
    instructor: 'Ustaad Abdullahi',
    price: 18,
    video_url: 'https://www.youtube.com/embed/RnbAOSf3R20', // Math
    image_url: 'https://images.unsplash.com/photo-1632516643720-e7f0d7e6a739?q=80&w=600&auto=format&fit=crop'
  }
];

const Elearning = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  
  // Modals state
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activeCourse, setActiveCourse] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New course form state
  const [newCourse, setNewCourse] = useState({
    title: '',
    instructor: '',
    price: '',
    video_url: '',
    image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=600&auto=format&fit=crop' // default generic e-learning image
  });
  const [isCreating, setIsCreating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchSessionAndCourses();
  }, []);

  const fetchSessionAndCourses = async () => {
    // 1. Get Auth User & Role
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (profile) {
        setUserRole(profile.role);
      }
    }

    // 2. Fetch Courses
    const { data: fetchedCourses, error } = await supabase.from('courses').select('*');
    
    if (!error && fetchedCourses && fetchedCourses.length > 0) {
      setCourses(fetchedCourses);
    } else {
      setCourses(FALLBACK_COURSES);
    }
    setLoading(false);
  };

  // EVERYONE can now watch the intro video.
  const handleWatchIntro = (course) => {
    setActiveCourse(course);
    setShowVideoModal(true);
  };

  const handleEnrollClick = (e, course) => {
    if (e) e.stopPropagation();
    if (!user) {
      navigate('/signin');
    } else {
      alert(`Redirecting to secure checkout for ${course?.title || activeCourse?.title}...`);
      setShowVideoModal(false);
    }
  };

  // Simple, clean logic to create a course
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    const priceNum = parseFloat(newCourse.price) || 0;
    
    // Format the URL just like in AdminPanel
    let finalVideoUrl = newCourse.video_url || '';
    if (finalVideoUrl.includes('youtube.com/watch?v=')) {
      try {
        const videoId = new URL(finalVideoUrl).searchParams.get('v');
        if (videoId) finalVideoUrl = `https://www.youtube.com/embed/${videoId}`;
      } catch (e) {}
    } else if (finalVideoUrl.includes('youtu.be/')) {
      const videoId = finalVideoUrl.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) finalVideoUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    const { data: { user } } = await supabase.auth.getUser();

    const courseData = { 
      ...newCourse, 
      price: priceNum,
      video_url: finalVideoUrl,
      created_by: user?.id || null
    };

    // Try to insert cleanly into Supabase
    const { data, error } = await supabase.from('courses').insert([courseData]).select();

    if (error) {
      console.error('Error creating course in Supabase:', error);
      alert('Error creating course: ' + error.message + ' (Did you create the courses table properly?)');
      setIsCreating(false);
      return;
    } else if (data && data.length > 0) {
      setCourses([...courses, data[0]]);
    }

    // Reset form and close
    setNewCourse({
      title: '', instructor: '', price: '', video_url: '', image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=600&auto=format&fit=crop'
    });
    setShowCreateModal(false);
    setIsCreating(false);
    alert('Course successfully created!');
  };

  // Helper to render video or iframe safely
  const renderVideoPlayer = (rawUrl) => {
    if (!rawUrl) return <div className="text-white p-10">No video URL available</div>;
    
    // Automatically convert standard YouTube URLs to embed URLs
    let url = rawUrl;
    if (url.includes('youtube.com/watch?v=')) {
      try {
        const videoId = new URL(url).searchParams.get('v');
        if (videoId) url = `https://www.youtube.com/embed/${videoId}`;
      } catch (e) {
        console.error('Invalid URL format', e);
      }
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) url = `https://www.youtube.com/embed/${videoId}`;
    }

    // Check if it's a youtube embed
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return (
        <iframe 
          className="w-full h-full"
          src={url} 
          title="YouTube video player" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
        ></iframe>
      );
    }
    // Standard mp4 fallback
    return (
      <video src={url} controls autoPlay className="w-full h-full object-contain">
        Your browser does not support the video tag.
      </video>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Improved Hero Section with Logo */}
        <div className="flex flex-col items-center text-center mb-16 space-y-6">
          <img src={gatewayLogo} alt="Gateway School Logo" className="w-32 h-32 object-contain drop-shadow-lg rounded-2xl bg-white dark:bg-slate-700 p-2" />
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 tracking-tight drop-shadow-sm">
            Gateway School E-Learning
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-medium">
            Expand your knowledge with our premium courses led by expert instructors. 
            Enjoy high-quality, engaging video content.
          </p>

          {/* Admin / Teacher Create Course Button */}
          {(userRole === 'admin' || userRole === 'teacher') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <IoAddCircleOutline className="w-6 h-6" />
              Create / Add a Course
            </button>
          )}
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {courses.map((course) => (
              <div 
                key={course.id} 
                className="group flex flex-col bg-white dark:bg-slate-700 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 dark:border-slate-600"
              >
                {/* Image Section */}
                <div 
                  className="relative h-60 overflow-hidden cursor-pointer"
                  onClick={() => handleWatchIntro(course)}
                >
                  <img 
                    src={course.image_url} 
                    alt={course.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <IoPlayCircleOutline className="text-white w-20 h-20 drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  
                  {/* Price Tag (Hidden for Admins/Teachers) */}
                  {userRole !== 'admin' && userRole !== 'teacher' && (
                    <div className="absolute top-4 right-4 bg-white dark:bg-slate-700/95 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-lg">
                      <span className="text-xl font-black text-indigo-700">${course.price}</span>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-8 flex flex-col flex-1 relative bg-white dark:bg-slate-700">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 leading-tight">
                    {course.title}
                  </h3>
                  
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 font-bold text-lg">
                      {course.instructor.charAt(0)}
                    </div>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">{course.instructor}</span>
                  </div>

                  <div className="mt-auto flex flex-col gap-3">
                    {/* Watch Intro Button */}
                    <button
                      onClick={() => handleWatchIntro(course)}
                      className="w-full py-4 bg-indigo-50 dark:bg-slate-600 text-indigo-700 font-bold rounded-xl hover:bg-indigo-600 hover:text-white transition-colors duration-300 flex items-center justify-center gap-2"
                    >
                      <IoPlayCircleOutline className="w-6 h-6" />
                      Watch Intro Video
                    </button>

                    {/* Enroll Button on the Card for those who need to buy (or Signup) */}
                    {userRole !== 'admin' && userRole !== 'teacher' && (
                      <button
                        onClick={(e) => handleEnrollClick(e, course)}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-transform duration-300 transform hover:-translate-y-0.5"
                      >
                        {!user ? `Log In / Sign Up to Enroll ($${course.price})` : `Enroll Now - $${course.price}`}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Intro Video Modal */}
      {showVideoModal && activeCourse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-all">
          <div className="bg-white dark:bg-slate-700 rounded-3xl overflow-hidden shadow-2xl w-full max-w-5xl flex flex-col transform">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100 dark:border-slate-600 bg-white dark:bg-slate-700">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activeCourse.title} - Intro Video</h2>
                <p className="text-gray-500 dark:text-gray-300 font-medium">Instructor: {activeCourse.instructor}</p>
              </div>
              <button 
                onClick={() => setShowVideoModal(false)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                title="Cancel / Close"
              >
                <IoCloseOutline className="w-8 h-8" />
              </button>
            </div>

            {/* Video Player Box */}
            <div className="relative bg-black w-full aspect-video flex-shrink-0">
              {renderVideoPlayer(activeCourse.video_url)}
            </div>

            {/* Modal Footer (Enroll Action) */}
            <div className="px-8 py-6 bg-gray-50 dark:bg-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-gray-600 dark:text-gray-300 font-medium text-center sm:text-left">
                {userRole === 'admin' || userRole === 'teacher' 
                  ? "You have full access to this course." 
                  : "Did you like the intro? Enroll now to unlock the full course modules!"}
              </span>
              
              <div className="flex gap-4 w-full sm:w-auto">
                <button 
                  onClick={() => setShowVideoModal(false)}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 hover:bg-gray-100 hover:border-gray-300 dark:border-slate-500 transition-all"
                >
                  Close
                </button>

                {/* Enroll Button for Students / Guests */}
                {userRole !== 'admin' && userRole !== 'teacher' && (
                  <button 
                    onClick={(e) => handleEnrollClick(e, activeCourse)}
                    className="flex-1 sm:flex-none px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all"
                  >
                    {!user ? `Log In / Sign Up to Enroll ($${activeCourse.price})` : `Enroll Now - $${activeCourse.price}`}
                  </button>
                )}
                
                {/* Enter Course button for Admin / Teachers */}
                {(userRole === 'admin' || userRole === 'teacher') && (
                  <button 
                    onClick={() => {
                      alert('Opening full course modules...');
                      setShowVideoModal(false);
                    }}
                    className="flex-1 sm:flex-none px-8 py-3 rounded-xl font-bold bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition-all"
                  >
                    Go to Full Course
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COURSE CREATION MODAL */}
      {showCreateModal && (userRole === 'admin' || userRole === 'teacher') && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-700 rounded-3xl overflow-hidden shadow-2xl w-full max-w-xl">
            <div className="p-6 border-b border-gray-100 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Create New Course</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-red-500">
                <IoCloseOutline className="w-7 h-7" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Course Title</label>
                <input 
                  required
                  type="text" 
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="e.g. Advanced Mathematics"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Teacher / Instructor Name</label>
                <input 
                  required
                  type="text" 
                  value={newCourse.instructor}
                  onChange={(e) => setNewCourse({...newCourse, instructor: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="e.g. Ustaad Ali"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Cost ($)</label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    step="0.01"
                    value={newCourse.price}
                    onChange={(e) => setNewCourse({...newCourse, price: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="18"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Intro Video URL (YouTube Link)</label>
                <input 
                  required
                  type="url" 
                  value={newCourse.video_url}
                  onChange={(e) => setNewCourse({...newCourse, video_url: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="text-xs text-gray-500 dark:text-gray-300 mt-2">Example: https://www.youtube.com/watch?v=tVzUXW6nD8I</p>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-slate-600 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 rounded-xl font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isCreating}
                  className="px-8 py-3 rounded-xl font-bold bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 disabled:opacity-70 transition-all flex items-center justify-center"
                >
                  {isCreating ? 'Creating...' : 'Publish Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Elearning;