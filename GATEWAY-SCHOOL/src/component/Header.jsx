
import { Link } from "react-router-dom";
import gatewayLogo from "../images/gatewayLogo.jpeg";

function Header() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
     
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">

<div className="flex-shrink-0">
  <Link to="/">  
    <img
      src={gatewayLogo}
      alt="Gateway School Logo"
      className="h-14 w-14 object-contain cursor-pointer"
    />
  </Link>
</div>

     
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">
            Gateway Schools
          </h1>
          <p className="text-sm text-gray-600 font-medium">
            Primary & Secondary | E-Learning Platform
          </p>
        </div>


        <div className="hidden sm:flex">
          <Link
            to="#contact"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            Contact Us
          </Link>
        </div>
      </div>


      <nav className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 overflow-x-auto">
   
            <div className="flex gap-1 sm:gap-8 m-">
              <Link
                to="/"
                className="px-3 sm:px-4 py-2 text-sm sm:text-base font-medium hover:bg-blue-700 rounded-md transition-colors duration-200 whitespace-nowrap"
              >
                Home
              </Link>
              <Link
                to="/dashboard"
                className="px-3 sm:px-4 py-2 text-sm sm:text-base font-medium hover:bg-blue-700 rounded-md transition-colors duration-200 whitespace-nowrap"
              >
                Dashboard
              </Link>
              <Link
                to="/elearning"
                className="px-3 sm:px-4 py-2 text-sm sm:text-base font-medium hover:bg-blue-700 rounded-md transition-colors duration-200 whitespace-nowrap"
              >
                E-Learning
              </Link>
         
             
            </div>

    
            <div className="flex gap-3 ml-auto whitespace-nowrap">
              <Link
                to="/signin"
                className="px-3 sm:px-4 py-2 text-sm sm:text-base font-medium hover:bg-blue-700 rounded-md transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-3 sm:px-4 py-2 text-sm sm:text-base font-medium bg-yellow-500 text-blue-900 rounded-md hover:bg-yellow-400 transition-colors duration-200 font-semibold"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;