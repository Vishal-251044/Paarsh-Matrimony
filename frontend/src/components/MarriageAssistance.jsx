import { FiHeart, FiCheckCircle } from "react-icons/fi";

const Marriage = () => {
  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-pink-100 p-2 rounded-lg">
          <FiHeart className="text-pink-600" size={22} />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">
          Marriage Help
        </h2>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Get AI-powered assistance for planning your marriage journey.
        We help you with partner communication, timelines, and planning.
      </p>

      <ul className="space-y-2 text-sm text-gray-700">
        <li className="flex gap-2 items-start">
          <FiCheckCircle className="text-green-600 mt-1" />
          Personalized marriage tips
        </li>
        <li className="flex gap-2 items-start">
          <FiCheckCircle className="text-green-600 mt-1" />
          Communication guidance
        </li>
        <li className="flex gap-2 items-start">
          <FiCheckCircle className="text-green-600 mt-1" />
          Timeline & checklist support
        </li>
      </ul>

      <div className="mt-5">
        <button className="w-full bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold py-2 rounded-lg transition">
          Start Planning
        </button>
      </div>
    </div>
  );
};

export default Marriage;
