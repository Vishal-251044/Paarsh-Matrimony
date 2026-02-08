import { FiTag, FiCheckCircle } from "react-icons/fi";

const WeddingServices = () => {
  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-orange-100 p-2 rounded-lg">
          <FiTag className="text-orange-600" size={22} />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">
          Wedding Services
        </h2>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Access exclusive discounts and trusted vendors for your big day.
        Save money while getting premium quality services.
      </p>

      <ul className="space-y-2 text-sm text-gray-700">
        <li className="flex gap-2 items-start">
          <FiCheckCircle className="text-green-600 mt-1" />
          Up to 15% vendor discounts
        </li>
        <li className="flex gap-2 items-start">
          <FiCheckCircle className="text-green-600 mt-1" />
          Photographer & venue deals
        </li>
        <li className="flex gap-2 items-start">
          <FiCheckCircle className="text-green-600 mt-1" />
          Makeup & decoration packages
        </li>
      </ul>

      <div className="mt-5">
        <button className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold py-2 rounded-lg transition">
          View Offers
        </button>
      </div>
    </div>
  );
};

export default WeddingServices;
