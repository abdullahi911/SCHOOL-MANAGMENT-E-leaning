import React from "react";
import { Link } from "react-router-dom";
import hero from "../images/gatewayherro.jpg";
import learning from "../images/gatway learning.jpg";
import students from "../images/gatewaystudents.jpg";
import sports from "../images/gatewaysport.jpg";

const Home = () => {
  return (
    <div className="bg-gray-50">

      <section
        className="relative h-[90vh] flex items-center justify-center text-center text-white"
        style={{
          backgroundImage: `url(${hero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 max-w-2xl px-6">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to Gateway School
          </h1>
          <p className="text-lg md:text-xl mb-6 text-gray-200">
            Empowering students with quality education, modern learning, and future-ready skills.
          </p>
          <div className="flex justify-center gap-4">
            {/* Get Started → E-Learning */}
            <Link
              to="/elearning"
              className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition"
            >
              Get Started
            </Link>

            {/* Join Gateway → Signup */}
            <Link
              to="/signup"
              className="border border-white px-6 py-3 rounded-lg hover:bg-white hover:text-black transition"
            >
              Join Gateway
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
        <img src={learning} alt="learning" className="rounded-xl shadow-lg" />
        <div>
          <h2 className="text-3xl font-bold mb-4 text-blue-900">Modern E-Learning</h2>
          <p className="text-gray-600 mb-4">
            Our platform provides students with digital learning tools, interactive courses, and access to quality education anytime, anywhere.
          </p>
          <Link
            to="/elearning"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            E-Learning
          </Link>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4 text-blue-900">Student Life</h2>
            <p className="text-gray-600 mb-4">
              We create a supportive environment where students grow, collaborate, and achieve their academic goals.
            </p>
          </div>
          <img src={students} alt="students" className="rounded-xl shadow-lg" />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
        <img src={sports} alt="sports" className="rounded-xl shadow-lg" />
        <div>
          <h2 className="text-3xl font-bold mb-4 text-blue-900">Sports & Activities</h2>
          <p className="text-gray-600 mb-4">
            We encourage physical fitness and teamwork through sports, helping students develop discipline and confidence.
          </p>
        </div>
      </section>

    </div>
  );
};

export default Home;