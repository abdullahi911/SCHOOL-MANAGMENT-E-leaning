import { Link } from "react-router-dom";
import { FaFacebookF, FaTiktok } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

export default function Footer() {
  const navLinks = [
    { name: "Home", to: "/" },
    { name: "E-Learning", to: "/elearning" },
    { name: "Dashboard", to: "/dashboard" },
    { name: "Sign In", to: "/signin" },
    { name: "Sign Up", to: "/signup" },
  ];

  return (
    <footer className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold mb-3 text-yellow-400">
            Gateway School
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            Empowering students with modern education, digital learning,
            and future-ready skills.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="font-semibold mb-4 text-lg">Quick Links</h3>
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.to}
                  className="text-gray-300 hover:text-yellow-400 transition duration-300"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold mb-4 text-lg">Contact</h3>
          <p className="text-gray-300 text-sm mb-2">
            📍 SOOL,WAQOYI-BARI,SOMALI
          </p>
          <p className="text-gray-300 text-sm">
            ✉ hello@gatewayschool.com
          </p>
        </div>

        {/* Social */}
        <div>
          <h3 className="font-semibold mb-4 text-lg">Follow Us</h3>
          <div className="flex gap-4">

            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-white/10 hover:bg-blue-600 transition duration-300 transform hover:scale-110"
            >
              <FaFacebookF className="text-white text-lg" />
            </a>

            {/* TikTok */}
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-white/10 hover:bg-black transition duration-300 transform hover:scale-110"
            >
              <FaTiktok className="text-white text-lg" />
            </a>

            {/* Email */}
            <a
              href="mailto:hello@gatewayschool.com"
              className="p-3 rounded-full bg-white/10 hover:bg-red-500 transition duration-300 transform hover:scale-110"
            >
              <MdEmail className="text-white text-lg" />
            </a>

          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10 text-center py-4 text-sm text-gray-400">
        © {new Date().getFullYear()} Gateway School. All rights reserved.
      </div>
    </footer>
  );
}