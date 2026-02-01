import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4 bg-[oklch(97%_0.02_22.216)]">
      
      <h1 className="text-7xl font-extrabold mb-4 text-[oklch(70.4%_0.191_22.216)]">
        404
      </h1>

      <p className="text-xl mb-8 text-gray-600">
        Page Not Found
      </p>

      <Link
        to="/"
        className="
          px-6 py-3 
          bg-[oklch(70.4%_0.191_22.216)] 
          text-white 
          rounded-xl 
          shadow-md 
          hover:scale-105 
          hover:shadow-lg 
          transition
        "
      >
        Go Home
      </Link>

    </div>
  );
}

export default NotFound;
