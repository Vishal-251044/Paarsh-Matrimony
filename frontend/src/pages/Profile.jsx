import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import Swal from 'sweetalert2';
import { useUserContext } from '../context/UserContext';

import {
  FiSettings,
  FiEdit2,
  FiEye,
  FiHeart,
  FiCheckCircle,
  FiDollarSign,
  FiUpload,
  FiCamera,
  FiX,
  FiStar,
  FiMessageSquare,
  FiSave,
  FiCalendar,
  FiLoader,
  FiEyeOff,
  FiTrash2,
  FiInfo
} from "react-icons/fi";
import {
  MdOutlineWorkspacePremium,
  MdOutlineContactSupport,
  MdPublishedWithChanges,
  MdOutlineRemoveCircle,
  MdWarning
} from "react-icons/md";
import axios from "axios";

// Custom styles for react-select
const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "#fff",
    borderColor: state.isFocused ? "#f97316" : "#d1d5db",
    borderRadius: "0.5rem",
    padding: "0.3rem 0.5rem",
    minHeight: "3rem",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(249, 115, 22, 0.1)" : "none",
    "&:hover": {
      borderColor: "#f97316"
    },
    fontSize: "0.875rem",
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? "#f97316" : state.isFocused ? "#fed7aa" : "#fff",
    color: state.isSelected ? "#fff" : "#374151",
    padding: "0.75rem 1rem",
    fontSize: "0.875rem",
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    cursor: "pointer",
    "&:active": {
      backgroundColor: "#ea580c"
    }
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "0.5rem",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    zIndex: 9999
  }),
  menuList: (base) => ({
    ...base,
    padding: "0.5rem"
  }),
  placeholder: (base) => ({
    ...base,
    color: "#9ca3af",
    fontSize: "0.875rem"
  }),
  singleValue: (base) => ({
    ...base,
    color: "#374151",
    fontSize: "0.875rem"
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "#9ca3af",
    "&:hover": {
      color: "#f97316"
    }
  })
};

// Enhanced Input component with trim functionality
const Input = ({ label, type = "text", value, onChange, options = [], placeholder = "", isEditing = true, onBlur }) => {
  if (type === "select") {
    const selectOptions = options.map(opt => ({ value: opt, label: opt }));
    const currentValue = selectOptions.find(opt => opt.value === value) || null;

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <Select
          styles={customSelectStyles}
          options={selectOptions}
          value={currentValue}
          onChange={(selected) => onChange(selected?.value || "")}
          placeholder={`Select ${label}`}
          isDisabled={!isEditing}
          isSearchable={true}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>
    );
  }

  if (type === "date") {
    const dateValue = value ? new Date(value) : null;

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <div className="relative">
          <DatePicker
            selected={dateValue}
            onChange={(date) => onChange(date ? date.toISOString().split('T')[0] : "")}
            dateFormat="dd/MM/yyyy"
            placeholderText="DD/MM/YYYY"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[oklch(70.4%_0.191_22.216)] focus:border-transparent transition text-gray-700 pl-10"
            disabled={!isEditing}
            maxDate={new Date()}
            showYearDropdown
            showMonthDropdown
            dropdownMode="select"
            yearDropdownItemNumber={50}
            scrollableYearDropdown
          />
          <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>
    );
  }

  if (type === "tel") {
    const formatPhoneNumber = (phone) => {
      if (!phone) return "";
      const cleaned = phone.replace(/\D/g, '');
      const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
      if (match) {
        const parts = [match[1], match[2], match[3]].filter(Boolean);
        return parts.join('-');
      }
      return cleaned;
    };

    const handlePhoneChange = (e) => {
      const input = e.target.value;
      const digitsOnly = input.replace(/\D/g, '');

      // Limit to 10 digits
      const limitedDigits = digitsOnly.slice(0, 10);

      // Validate if complete number is entered
      if (limitedDigits.length === 10) {
        const firstDigit = limitedDigits[0];
        if (!['6', '7', '8', '9'].includes(firstDigit)) {
          toast.error("Mobile number should start with 6, 7, 8, or 9");
        }
      }

      onChange(limitedDigits);
    };

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <input
          type="tel"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[oklch(70.4%_0.191_22.216)] focus:border-transparent transition text-gray-700"
          value={formatPhoneNumber(value)}
          onChange={handlePhoneChange}
          placeholder="987-654-3210"
          disabled={!isEditing}
          maxLength={12} // Account for dashes
          onBlur={() => onBlur && onBlur(value)}
        />
        <p className="mt-1 text-xs text-gray-500">Enter 10-digit Indian mobile number</p>
      </div>
    );
  }

  // Regular text/number input with trim functionality
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[oklch(70.4%_0.191_22.216)] focus:border-transparent transition text-gray-700 placeholder-gray-400"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => {
          const trimmedValue = e.target.value.trim();
          if (trimmedValue !== e.target.value) {
            onChange(trimmedValue);
          }
          onBlur && onBlur(trimmedValue);
        }}
        disabled={!isEditing}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        step={type === "number" ? "any" : undefined}
      />
    </div>
  );
};

// Password Input with show/hide toggle
const PasswordInput = ({ label, value, onChange, placeholder = "", isEditing = true }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[oklch(70.4%_0.191_22.216)] focus:border-transparent transition text-gray-700 placeholder-gray-400"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={!isEditing}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          onClick={() => setShowPassword(!showPassword)}
          disabled={!isEditing}
        >
          {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
        </button>
      </div>
    </div>
  );
};

// Textarea component with trim functionality
const Textarea = ({ label, value, onChange, rows = 4, placeholder = "", isEditing = true }) => (
  <div className="col-span-2">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <textarea
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[oklch(70.4%_0.191_22.216)] focus:border-transparent transition text-gray-700 placeholder-gray-400 resize-y"
      rows={rows}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      onBlur={(e) => {
        const trimmedValue = e.target.value.trim();
        if (trimmedValue !== e.target.value) {
          onChange(trimmedValue);
        }
      }}
      disabled={!isEditing}
      placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
    />
  </div>
);

// Section component
const Section = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
      {title}
    </h3>
    {children}
  </div>
);

// FormBox component
const FormBox = ({ title, children, isEditing, setIsEditing, loadingSaveProfile, sectionProgress, requiredFields = [], optionalFields = [] }) => (
  <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6">
    <div className="flex justify-between items-start mb-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        {sectionProgress !== undefined && (
          <div className="mt-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-32 bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${sectionProgress >= 80 ? 'bg-green-500' : sectionProgress >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(sectionProgress, 100)}%` }}
                ></div>
              </div>
              <span className={`text-sm font-semibold ${sectionProgress >= 80 ? 'text-green-600' : sectionProgress >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {sectionProgress}%
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {sectionProgress >= 80 ? '✓ Ready to save' : `⚠ Need ${80 - sectionProgress}% more`}
            </p>
          </div>
        )}
      </div>
      <button
        onClick={() => setIsEditing(!isEditing)}
        className="flex items-center gap-2 px-4 py-2 text-[oklch(70.4%_0.191_22.216)] hover:bg-[oklch(70.4%_0.191_22.216)]/10 rounded-lg transition disabled:opacity-50"
        disabled={loadingSaveProfile}
      >
        {loadingSaveProfile ? (
          <FiLoader className="animate-spin" />
        ) : (
          <FiEdit2 />
        )}
        {isEditing ? "Cancel Editing" : "Edit"}
      </button>
    </div>
    {children}
  </div>
);

// SubmitButton component
const SubmitButton = ({ text, onClick, loading = false, disabled = false }) => (
  <div className="mt-4 flex justify-center">
    <button
      onClick={onClick}
      className="px-6 py-3 bg-[oklch(70.4%_0.191_22.216)] text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[180px]"
      disabled={loading || disabled}
    >
      {loading ? (
        <>
          <FiLoader className="animate-spin" />
          Saving...
        </>
      ) : (
        text
      )}
    </button>
  </div>
);

// LoadingButton component
const LoadingButton = ({ children, onClick, loading = false, disabled = false, className = "", variant = "primary" }) => {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2";
  const variantClasses = variant === "primary"
    ? "bg-[oklch(70.4%_0.191_22.216)] text-white hover:opacity-90"
    : variant === "secondary"
      ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
      : "bg-white text-gray-700 hover:bg-gray-50";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${className} ${disabled || loading ? 'opacity-70 cursor-not-allowed' : ''}`}
      disabled={disabled || loading}
    >
      {loading ? <FiLoader className="animate-spin" /> : children}
    </button>
  );
};

// MembershipCard component - simplified
const MembershipCard = ({
  type,
  features,
  popular = false,
  price,
  currentPlan,
  handlePayment,
  loadingPayment,
  handleSubmit,
  membershipDates = {}
}) => {

  // Check if user is premium (when current plan is premium)
  const isPremiumUser = currentPlan === "Premium Membership";

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className={`relative border rounded-xl p-6 ${popular ? 'border-[oklch(70.4%_0.191_22.216)]' : 'border-gray-200'}`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-[oklch(70.4%_0.191_22.216)] text-white px-4 py-1 rounded-full text-sm font-semibold">
            POPULAR
          </span>
        </div>
      )}
      {currentPlan === type && (
        <div className="absolute -top-3 right-4">
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            CURRENT
          </span>
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">{type}</h3>
        <div className="flex items-center justify-center gap-2">
          <FiDollarSign className="text-[oklch(70.4%_0.191_22.216)]" />
          <span className="text-2xl font-bold">
            {type === "Free Membership" ? "₹0" : `₹${price}`}
          </span>
          <span className="text-gray-500">/year</span>
        </div>
      </div>
      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <FiCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
            <span className="text-sm md:text-base">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Different button logic */}
      {type === "Free Membership" ? (
        // Free Membership Card
        <LoadingButton
          onClick={() => {
            handleSubmit("Membership Plan");
          }}
          loading={false}
          disabled={currentPlan === type || isPremiumUser} // Disable if premium user
          className="w-full py-2"
          variant={currentPlan === type ? "secondary" : "primary"}
        >
          {currentPlan === type ? "Current Plan" :
            isPremiumUser ? "Premium User" : "Select Free Plan"}
        </LoadingButton>
      ) : (
        // Premium Membership Card
        <LoadingButton
          onClick={() => {
            handlePayment("premium", price);
          }}
          loading={loadingPayment}
          disabled={currentPlan === type}
          className="w-full py-2"
          variant={currentPlan === type ? "secondary" : popular ? "primary" : "secondary"}
        >
          {currentPlan === type ? "Current Plan" : "Upgrade Now"}
        </LoadingButton>
      )}
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const { updateUserProfile } = useUserContext();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showPasswordBox, setShowPasswordBox] = useState(false);
  const [showFeedbackBox, setShowFeedbackBox] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [activeSection, setActiveSection] = useState("self");
  const [isEditing, setIsEditing] = useState(false);
  const [isProfilePublished, setIsProfilePublished] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [profileProgress, setProfileProgress] = useState({
    self: 0,
    family: 0,
    partner: 0
  });
  const [feedback, setFeedback] = useState({
    experience: "",
    rating: 0,
    suggestions: ""
  });

  // Loading states for all buttons
  const [loadingStates, setLoadingStates] = useState({
    saveProfile: false,
    imageUpload: false,
    passwordUpdate: false,
    feedbackSubmit: false,
    postProfile: false,
    removeProfile: false,
    deleteProfile: false,
    payment: false,
    logout: false,
    viewMatches: false,
    watchlist: false
  });

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    profileImg: "",
    fullName: "",
    gender: "",
    dob: "",
    age: "",
    maritalStatus: "",
    height: "",
    weight: "",
    bloodGroup: "",
    disability: "No",
    contactNumber: "",
    whatsappNumber: "",
  });

  const [locationInfo, setLocationInfo] = useState({
    country: "India",
    state: "",
    city: "",
    pinCode: "",
    currentLocation: "",
    permanentAddress: "",
  });

  const [religionInfo, setReligionInfo] = useState({
    religion: "",
    caste: "",
    motherTongue: "",
  });

  const [educationInfo, setEducationInfo] = useState({
    highestEducation: "",
    yearOfPassing: "",
    university: "",
  });

  const [careerInfo, setCareerInfo] = useState({
    profession: "",
    jobTitle: "",
    companyName: "",
    employmentType: "Private",
    annualIncome: "",
    workLocation: "",
  });

  const [familyInfo, setFamilyInfo] = useState({
    fatherName: "",
    fatherOccupation: "",
    motherName: "",
    motherOccupation: "",
    brothers: 0,
    sisters: 0,
    familyType: "Nuclear",
    familyStatus: "Middle",
    familyLocation: "",
    nativePlace: "",
  });

  const [partnerInfo, setPartnerInfo] = useState({
    preferredAgeRange: "",
    preferredHeight: "",
    preferredMaritalStatus: "Never Married",
    preferredReligion: "",
    preferredCaste: "",
    preferredMotherTongue: "",
    preferredEducation: "",
    preferredProfession: "",
    preferredLocation: "",
    preferredIncome: "",
    settledIn: "",
    lookingFor: "",
  });

  const [aboutYourself, setAboutYourself] = useState("");
  const [aboutFamily, setAboutFamily] = useState("");
  const [membershipPlan, setMembershipPlan] = useState("free");
  const [membershipDates, setMembershipDates] = useState({
    membershipStartDate: "",
    membershipExpiryDate: ""
  });

  // Function to calculate section completion
  const calculateSectionCompletion = (section) => {
    let filledFields = 0;
    let totalWeight = 0;

    // Define weights: required fields = 2, optional fields = 1
    const REQUIRED_WEIGHT = 2;
    const OPTIONAL_WEIGHT = 1;

    switch (section) {
      case 'self':
        // Self section fields with weights
        const selfFields = [
          { value: personalInfo.profileImg?.trim(), required: true, weight: REQUIRED_WEIGHT },
          { value: personalInfo.fullName?.trim(), required: true, weight: REQUIRED_WEIGHT },
          { value: personalInfo.gender, required: true, weight: REQUIRED_WEIGHT },
          { value: personalInfo.dob, required: true, weight: REQUIRED_WEIGHT },
          { value: personalInfo.age?.toString()?.trim(), required: true, weight: REQUIRED_WEIGHT },
          { value: personalInfo.maritalStatus, required: true, weight: REQUIRED_WEIGHT },
          { value: personalInfo.contactNumber?.toString()?.trim(), required: true, weight: REQUIRED_WEIGHT, validation: (val) => val?.length === 10 },
          { value: locationInfo.country, required: true, weight: REQUIRED_WEIGHT },
          { value: locationInfo.state?.trim(), required: true, weight: REQUIRED_WEIGHT },
          { value: locationInfo.city?.trim(), required: true, weight: REQUIRED_WEIGHT },
          { value: religionInfo.religion, required: true, weight: REQUIRED_WEIGHT },
          { value: religionInfo.caste?.trim(), required: true, weight: REQUIRED_WEIGHT },
          { value: educationInfo.highestEducation, required: true, weight: REQUIRED_WEIGHT },
          { value: careerInfo.profession, required: true, weight: REQUIRED_WEIGHT },
          { value: careerInfo.employmentType, required: true, weight: REQUIRED_WEIGHT },
          { value: careerInfo.annualIncome, required: true, weight: REQUIRED_WEIGHT },

          // Optional fields (weight = 1)
          { value: personalInfo.height?.toString()?.trim(), required: false, weight: OPTIONAL_WEIGHT },
          { value: personalInfo.weight?.toString()?.trim(), required: false, weight: OPTIONAL_WEIGHT },
          { value: personalInfo.bloodGroup, required: false, weight: OPTIONAL_WEIGHT },
          { value: personalInfo.disability, required: false, weight: OPTIONAL_WEIGHT },
          { value: personalInfo.whatsappNumber?.toString()?.trim(), required: false, weight: OPTIONAL_WEIGHT },
          { value: locationInfo.pinCode?.trim(), required: false, weight: OPTIONAL_WEIGHT },
          { value: locationInfo.currentLocation?.trim(), required: false, weight: OPTIONAL_WEIGHT },
          { value: locationInfo.permanentAddress?.trim(), required: false, weight: OPTIONAL_WEIGHT },
          { value: religionInfo.motherTongue, required: false, weight: OPTIONAL_WEIGHT },
          { value: educationInfo.yearOfPassing, required: false, weight: OPTIONAL_WEIGHT },
          { value: educationInfo.university?.trim(), required: false, weight: OPTIONAL_WEIGHT },
          { value: careerInfo.jobTitle?.trim(), required: false, weight: OPTIONAL_WEIGHT },
          { value: careerInfo.companyName?.trim(), required: false, weight: OPTIONAL_WEIGHT },
          { value: careerInfo.workLocation?.trim(), required: false, weight: OPTIONAL_WEIGHT },
          { value: aboutYourself?.trim(), required: false, weight: OPTIONAL_WEIGHT },
        ];

        selfFields.forEach(field => {
          totalWeight += field.weight;

          if (field.value && field.value !== '' && field.value !== '0') {
            if (field.validation) {
              if (field.validation(field.value)) filledFields += field.weight;
            } else {
              filledFields += field.weight;
            }
          }
        });
        break;

      case 'family':
        // Family section fields with weights
        const familyFields = [
          { value: familyInfo.fatherName?.trim(), required: true, weight: REQUIRED_WEIGHT },
          { value: familyInfo.fatherOccupation?.trim(), required: true, weight: REQUIRED_WEIGHT },
          { value: familyInfo.motherName?.trim(), required: true, weight: REQUIRED_WEIGHT },
          { value: familyInfo.familyType, required: true, weight: REQUIRED_WEIGHT },
          { value: familyInfo.familyStatus, required: true, weight: REQUIRED_WEIGHT },

          // Optional fields
          { value: familyInfo.motherOccupation?.trim(), required: false, weight: OPTIONAL_WEIGHT },
          { value: familyInfo.brothers?.toString()?.trim(), required: false, weight: OPTIONAL_WEIGHT },
          { value: familyInfo.sisters?.toString()?.trim(), required: false, weight: OPTIONAL_WEIGHT },
          { value: familyInfo.familyLocation?.trim(), required: false, weight: OPTIONAL_WEIGHT },
          { value: familyInfo.nativePlace?.trim(), required: false, weight: OPTIONAL_WEIGHT },
          { value: aboutFamily?.trim(), required: false, weight: OPTIONAL_WEIGHT },
        ];

        familyFields.forEach(field => {
          totalWeight += field.weight;
          if (field.value && field.value !== '') {
            filledFields += field.weight;
          }
        });
        break;

      case 'partner':
        // Partner section fields with weights
        const partnerFields = [
          { value: partnerInfo.preferredAgeRange, required: true, weight: REQUIRED_WEIGHT },
          { value: partnerInfo.preferredMaritalStatus, required: true, weight: REQUIRED_WEIGHT },
          { value: partnerInfo.preferredReligion, required: true, weight: REQUIRED_WEIGHT },
          { value: partnerInfo.preferredCaste?.trim(), required: true, weight: REQUIRED_WEIGHT },
          { value: partnerInfo.preferredEducation, required: true, weight: REQUIRED_WEIGHT },
          { value: partnerInfo.preferredProfession, required: true, weight: REQUIRED_WEIGHT },
          { value: partnerInfo.preferredIncome, required: true, weight: REQUIRED_WEIGHT },
          { value: partnerInfo.preferredLocation?.trim(), required: true, weight: REQUIRED_WEIGHT },

          // Optional fields
          { value: partnerInfo.preferredHeight?.toString()?.trim(), required: false, weight: OPTIONAL_WEIGHT },
          { value: partnerInfo.preferredMotherTongue, required: false, weight: OPTIONAL_WEIGHT },
          { value: partnerInfo.settledIn, required: false, weight: OPTIONAL_WEIGHT },
          { value: partnerInfo.lookingFor?.trim(), required: false, weight: OPTIONAL_WEIGHT },
        ];

        partnerFields.forEach(field => {
          totalWeight += field.weight;
          if (field.value && field.value !== '' && field.value !== '0') {
            filledFields += field.weight;
          }
        });
        break;
    }

    return totalWeight > 0 ? Math.round((filledFields / totalWeight) * 100) : 0;
  };

  // Calculate all section progress
  const calculateAllProgress = () => {
    const selfProgress = calculateSectionCompletion('self');
    const familyProgress = calculateSectionCompletion('family');
    const partnerProgress = calculateSectionCompletion('partner');

    const progress = {
      self: selfProgress,
      family: familyProgress,
      partner: partnerProgress
    };

    setProfileProgress(progress);

    // Check if all sections are at least 80% complete
    const allComplete = Object.values(progress).every(p => p >= 80);
    setProfileCompleted(allComplete);

    return { progress, allComplete };
  };

  // Update progress when form data changes
  useEffect(() => {
    if (user) {
      calculateAllProgress();
    }
  }, [
    personalInfo,
    locationInfo,
    religionInfo,
    educationInfo,
    careerInfo,
    familyInfo,
    partnerInfo,
    aboutYourself,
    aboutFamily
  ]);

  const checkMembershipStatus = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/payment/check-membership/${user.email}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data) {
        setMembershipPlan(response.data.membership_plan);
      }
    } catch (error) {
      console.error("Error checking membership:", error);
    }
  };

  // Call this when profile loads
  useEffect(() => {
    if (user) {
      checkMembershipStatus();
    }
  }, [user]);

  useEffect(() => {
    const hash = window.location.hash;

    if (hash === '#plan') {
      setActiveSection('plan');
      window.history.replaceState(null, '', '/profile');
    }
  }, []);

  // Simple function to update membership plan (just for switching to free plan)
  const updateMembershipPlanInProfile = async (planType) => {
    // Prevent downgrade from premium to free
    if (membershipPlan === "premium" && planType === "free") {
      toast.error("Cannot switch back to Free plan once upgraded to Premium.");
      return;
    }

    try {
      // Get current profile
      const profileResponse = await axios.get(
        `${BACKEND_URL}/profile/get/${user.email}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let profileData;

      if (profileResponse.data?.profile) {
        // Update existing profile
        profileData = {
          ...profileResponse.data.profile,
          membershipPlan: planType,
          lastUpdated: new Date().toISOString()
        };
      } else {
        // Create new profile with current form data
        profileData = {
          email: user.email,
          personalInfo,
          locationInfo,
          religionInfo,
          educationInfo,
          careerInfo,
          familyInfo,
          partnerInfo,
          aboutYourself: aboutYourself?.trim() || "",
          aboutFamily: aboutFamily?.trim() || "",
          membershipPlan: planType,
          lastUpdated: new Date().toISOString()
        };
      }

      // Save profile
      await axios.post(
        `${BACKEND_URL}/profile/save`,
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setMembershipPlan(planType);
      toast.success(`Plan updated to ${planType === "premium" ? "Premium" : "Free"}`);

    } catch (error) {
      console.error("Error updating plan:", error);
      toast.error("Failed to update plan");
    }
  };

  // Set loading state
  const setLoadingState = (key, value) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!storedUser || !token) {
          navigate("/login");
          return;
        }

        let parsedUser;
        try {
          parsedUser = JSON.parse(storedUser);
        } catch (parseError) {
          console.error("Failed to parse user data:", parseError);
          localStorage.clear();
          navigate("/login");
          return;
        }

        if (!parsedUser?.email) {
          navigate("/login");
          return;
        }

        setUser(parsedUser);

        // Load existing profile data
        try {
          const response = await axios.get(
            `${BACKEND_URL}/profile/get/${parsedUser.email}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (response.data && response.data.profile) {
            const profile = response.data.profile;

            // Set all form states with existing data
            setPersonalInfo(profile.personalInfo || personalInfo);
            setLocationInfo(profile.locationInfo || locationInfo);
            setReligionInfo(profile.religionInfo || religionInfo);
            setEducationInfo(profile.educationInfo || educationInfo);
            setCareerInfo(profile.careerInfo || careerInfo);
            setFamilyInfo(profile.familyInfo || familyInfo);
            setPartnerInfo(profile.partnerInfo || partnerInfo);
            setAboutYourself(profile.aboutYourself || "");
            setAboutFamily(profile.aboutFamily || "");
            setIsProfilePublished(profile.isPublished || false);
            setMembershipPlan(profile.membershipPlan || "free");

            if (profile.membershipStartDate) {
              setMembershipDates({
                membershipStartDate: profile.membershipStartDate,
                membershipExpiryDate: profile.membershipExpiryDate || ""
              });
            }

            // Calculate initial profile completion
            calculateAllProgress();
            // Update user context
            updateUserProfile({
              userEmail: parsedUser.email,
              isProfilePublished: profile.isPublished || false,
              membershipType: profile.membershipPlan === "premium" ? "premium" : "free"
            });
          }
        } catch (error) {
          console.log("No existing profile found, starting fresh");
        }
      } catch (err) {
        console.error("Profile load error:", err);
        localStorage.clear();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleFeedbackSubmit = async () => {
    // Trim all feedback fields
    const trimmedExperience = feedback.experience.trim();
    const trimmedSuggestions = feedback.suggestions.trim();

    if (!trimmedExperience) {
      toast.error("Please share your experience");
      return;
    }

    if (feedback.rating === 0) {
      toast.error("Please provide a rating");
      return;
    }

    setLoadingState('feedbackSubmit', true);
    try {
      await axios.post(
        `${BACKEND_URL}/feedback/submit`,
        {
          email: user.email,
          experience: trimmedExperience,
          rating: feedback.rating,
          suggestions: trimmedSuggestions
        }
      );
      toast.success("Thank you for your feedback!");
      setShowFeedbackBox(false);
      setFeedback({
        experience: "",
        rating: 0,
        suggestions: ""
      });
    } catch (err) {
      console.error("Feedback submission error:", err);

      // Check if it's a 400 error (rate limit - already submitted in last 24 hours)
      if (err.response && err.response.status === 400) {
        toast.error("You have already submitted feedback in the last 24 hours. Please try again tomorrow.");
      }
      // Check if it's a 500 server error
      else if (err.response && err.response.status === 500) {
        toast.error("Server error. Please try again later.");
      }
      // Network or other errors
      else if (err.message === "Network Error") {
        toast.error("Network error. Please check your connection and try again.");
      }
      // Default error message
      else {
        toast.error(err.response?.data?.detail || "Failed to submit feedback");
      }
    } finally {
      setLoadingState('feedbackSubmit', false);
    }
  };

  const handleLogout = async () => {
    setLoadingState('logout', true);
    setTimeout(() => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      toast.success("Logged out successfully!");
      navigate("/login");
    }, 500);
  };

  const handlePasswordUpdate = async () => {
    const trimmedPassword = newPassword.trim();

    if (trimmedPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoadingState('passwordUpdate', true);
    try {
      await axios.put(
        `${BACKEND_URL}/auth/set-password`,
        { email: user.email, new_password: trimmedPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Password updated successfully!");
      setShowPasswordBox(false);
      setNewPassword("");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to update password");
    } finally {
      setLoadingState('passwordUpdate', false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be less than 2MB");
        return;
      }

      setLoadingState('imageUpload', true);
      try {
        // Create form data for upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('email', user.email);

        const response = await axios.post(
          `${BACKEND_URL}/profile/upload-image`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (response.data.imageUrl) {
          setPersonalInfo(prev => ({ ...prev, profileImg: response.data.imageUrl }));
          toast.success("Profile image uploaded successfully!");
        }
      } catch (error) {
        console.error("Image upload error:", error);
        toast.error("Failed to upload image");
      } finally {
        setLoadingState('imageUpload', false);
      }
    }
  };

  // Validation functions for each section - returns true/false and error message
  const validateSelfInfo = () => {
    // Trim all fields before validation
    const trimmedPersonalInfo = {
      ...personalInfo,
      fullName: personalInfo.fullName?.trim(),
      contactNumber: personalInfo.contactNumber?.trim(),
      whatsappNumber: personalInfo.whatsappNumber?.trim()
    };

    const trimmedLocationInfo = {
      ...locationInfo,
      state: locationInfo.state?.trim(),
      city: locationInfo.city?.trim(),
      pinCode: locationInfo.pinCode?.trim(),
      currentLocation: locationInfo.currentLocation?.trim(),
      permanentAddress: locationInfo.permanentAddress?.trim()
    };

    const trimmedReligionInfo = {
      ...religionInfo,
      caste: religionInfo.caste?.trim(),
    };

    const trimmedEducationInfo = {
      ...educationInfo,
      university: educationInfo.university?.trim()
    };

    const trimmedCareerInfo = {
      ...careerInfo,
      jobTitle: careerInfo.jobTitle?.trim(),
      companyName: careerInfo.companyName?.trim(),
      workLocation: careerInfo.workLocation?.trim()
    };

    const requiredFields = [
      { field: trimmedPersonalInfo.fullName, name: "Full Name" },
      { field: trimmedPersonalInfo.gender, name: "Gender" },
      { field: trimmedPersonalInfo.dob, name: "Date of Birth" },
      { field: trimmedPersonalInfo.age, name: "Age" },
      { field: trimmedPersonalInfo.maritalStatus, name: "Marital Status" },
      { field: trimmedPersonalInfo.contactNumber, name: "Contact Number" },
      { field: trimmedLocationInfo.country, name: "Country" },
      { field: trimmedLocationInfo.state, name: "State" },
      { field: trimmedLocationInfo.city, name: "City" },
      { field: trimmedReligionInfo.religion, name: "Religion" },
      { field: trimmedReligionInfo.caste, name: "Caste" },
      { field: trimmedEducationInfo.highestEducation, name: "Highest Education" },
      { field: trimmedCareerInfo.profession, name: "Profession" },
      { field: trimmedCareerInfo.employmentType, name: "Employment Type" },
      { field: trimmedCareerInfo.annualIncome, name: "Annual Income" },
    ];

    const missingFields = requiredFields.filter(item => !item.field || item.field.toString().trim() === "");

    // Check if profile image is uploaded
    if (!personalInfo.profileImg ||
      personalInfo.profileImg.trim() === "" ||
      personalInfo.profileImg === "data:," ||
      personalInfo.profileImg.includes("data:image/") && personalInfo.profileImg.length < 100 ||
      personalInfo.profileImg.includes("placeholder")) {
      return { isValid: false, message: "Valid profile image is required. Please upload a clear profile picture." };
    }

    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(item => item.name).join(", ");
      return { isValid: false, message: `Missing required fields: ${fieldNames}` };
    }

    // Validate contact number
    if (!trimmedPersonalInfo.contactNumber || trimmedPersonalInfo.contactNumber.length !== 10) {
      return { isValid: false, message: "Contact number must be exactly 10 digits" };
    }

    // Validate whatsapp number if provided
    if (trimmedPersonalInfo.whatsappNumber && trimmedPersonalInfo.whatsappNumber.length !== 10) {
      return { isValid: false, message: "WhatsApp number must be 10 digits" };
    }

    if (trimmedPersonalInfo.contactNumber) {
      const firstDigit = trimmedPersonalInfo.contactNumber.charAt(0);
      if (!['6', '7', '8', '9'].includes(firstDigit)) {
        return { isValid: false, message: "Mobile number should start with 6, 7, 8, or 9" };
      }
    }

    // Validate age
    const ageNum = parseInt(trimmedPersonalInfo.age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
      return { isValid: false, message: "Age must be between 18 and 100" };
    }

    if (trimmedPersonalInfo.dob) {
      const dobDate = new Date(trimmedPersonalInfo.dob);
      const today = new Date();

      // Calculate age from DOB
      let calculatedAge = today.getFullYear() - dobDate.getFullYear();
      const monthDiff = today.getMonth() - dobDate.getMonth();

      // Adjust if birthday hasn't occurred this year yet
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
        calculatedAge--;
      }

      // Allow 1 year difference tolerance
      if (Math.abs(calculatedAge - ageNum) > 1) {
        return {
          isValid: false,
          message: `Age (${ageNum}) doesn't match Date of Birth (would be ${calculatedAge} years old)`
        };
      }
    }

    // Check if self section is at least 80% complete
    const selfProgress = calculateSectionCompletion('self');
    if (selfProgress < 80) {
      return { isValid: false, message: `Self information only ${selfProgress}% complete` };
    }

    return { isValid: true, message: "Validation successful" };
  };

  const validateFamilyInfo = () => {
    // Trim all fields
    const trimmedFamilyInfo = {
      ...familyInfo,
      fatherName: familyInfo.fatherName?.trim(),
      fatherOccupation: familyInfo.fatherOccupation?.trim(),
      motherName: familyInfo.motherName?.trim(),
      motherOccupation: familyInfo.motherOccupation?.trim(),
      familyLocation: familyInfo.familyLocation?.trim(),
      nativePlace: familyInfo.nativePlace?.trim()
    };

    const requiredFields = [
      { field: trimmedFamilyInfo.fatherName, name: "Father's Name" },
      { field: trimmedFamilyInfo.fatherOccupation, name: "Father's Occupation" },
      { field: trimmedFamilyInfo.motherName, name: "Mother's Name" },
      { field: trimmedFamilyInfo.familyType, name: "Family Type" },
      { field: trimmedFamilyInfo.familyStatus, name: "Family Status" },
    ];

    const missingFields = requiredFields.filter(item => !item.field || item.field.toString().trim() === "");

    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(item => item.name).join(", ");
      return { isValid: false, message: `Missing required fields: ${fieldNames}` };
    }

    // Validate brothers and sisters are numbers
    if (isNaN(trimmedFamilyInfo.brothers) || trimmedFamilyInfo.brothers < 0) {
      return { isValid: false, message: "Invalid number of brothers" };
    }

    if (isNaN(trimmedFamilyInfo.sisters) || trimmedFamilyInfo.sisters < 0) {
      return { isValid: false, message: "Invalid number of sisters" };
    }

    // Check if family section is at least 80% complete
    const familyProgress = calculateSectionCompletion('family');
    if (familyProgress < 80) {
      return { isValid: false, message: `Family information only ${familyProgress}% complete` };
    }

    return { isValid: true, message: "Validation successful" };
  };

  const validatePartnerInfo = () => {
    // Trim all fields
    const trimmedPartnerInfo = {
      ...partnerInfo,
      preferredCaste: partnerInfo.preferredCaste?.trim(),
      preferredLocation: partnerInfo.preferredLocation?.trim(),
      lookingFor: partnerInfo.lookingFor?.trim()
    };

    const requiredFields = [
      { field: trimmedPartnerInfo.preferredAgeRange, name: "Preferred Age Range" },
      { field: trimmedPartnerInfo.preferredMaritalStatus, name: "Preferred Marital Status" },
      { field: trimmedPartnerInfo.preferredReligion, name: "Preferred Religion" },
      { field: trimmedPartnerInfo.preferredCaste, name: "Preferred Caste" },
      { field: trimmedPartnerInfo.preferredEducation, name: "Preferred Education" },
      { field: trimmedPartnerInfo.preferredProfession, name: "Preferred Profession" },
      { field: trimmedPartnerInfo.preferredIncome, name: "Preferred Annual Income" },
      { field: trimmedPartnerInfo.preferredLocation, name: "Preferred Location" },
    ];

    const missingFields = requiredFields.filter(item => !item.field || item.field.toString().trim() === "");

    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(item => item.name).join(", ");
      return { isValid: false, message: `Missing required fields: ${fieldNames}` };
    }

    // Validate preferred height if provided
    if (trimmedPartnerInfo.preferredHeight && (isNaN(trimmedPartnerInfo.preferredHeight) || trimmedPartnerInfo.preferredHeight < 100 || trimmedPartnerInfo.preferredHeight > 250)) {
      return { isValid: false, message: "Preferred height must be between 100cm and 250cm" };
    }

    // Check if partner section is at least 80% complete
    const partnerProgress = calculateSectionCompletion('partner');
    if (partnerProgress < 80) {
      return { isValid: false, message: `Partner preferences only ${partnerProgress}% complete` };
    }

    return { isValid: true, message: "Validation successful" };
  };

  const handleSubmit = async (section) => {
    // Check if user is available
    if (!user || !user.email) {
      toast.error("User not found. Please log in again.");
      navigate("/login");
      return;
    }

    // Trim all text fields before submission
    const trimmedPersonalInfo = {
      ...personalInfo,
      fullName: personalInfo.fullName?.trim(),
      contactNumber: personalInfo.contactNumber?.trim(),
      whatsappNumber: personalInfo.whatsappNumber?.trim()
    };

    const trimmedLocationInfo = {
      ...locationInfo,
      state: locationInfo.state?.trim(),
      city: locationInfo.city?.trim(),
      pinCode: locationInfo.pinCode?.trim(),
      currentLocation: locationInfo.currentLocation?.trim(),
      permanentAddress: locationInfo.permanentAddress?.trim()
    };

    const trimmedReligionInfo = {
      ...religionInfo,
      caste: religionInfo.caste?.trim(),
    };

    const trimmedEducationInfo = {
      ...educationInfo,
      university: educationInfo.university?.trim()
    };

    const trimmedCareerInfo = {
      ...careerInfo,
      jobTitle: careerInfo.jobTitle?.trim(),
      companyName: careerInfo.companyName?.trim(),
      workLocation: careerInfo.workLocation?.trim()
    };

    const trimmedFamilyInfo = {
      ...familyInfo,
      fatherName: familyInfo.fatherName?.trim(),
      fatherOccupation: familyInfo.fatherOccupation?.trim(),
      motherName: familyInfo.motherName?.trim(),
      motherOccupation: familyInfo.motherOccupation?.trim(),
      familyLocation: familyInfo.familyLocation?.trim(),
      nativePlace: familyInfo.nativePlace?.trim()
    };

    const trimmedPartnerInfo = {
      ...partnerInfo,
      preferredCaste: partnerInfo.preferredCaste?.trim(),
      preferredLocation: partnerInfo.preferredLocation?.trim(),
      lookingFor: partnerInfo.lookingFor?.trim()
    };

    const trimmedAboutYourself = aboutYourself?.trim() || "";
    const trimmedAboutFamily = aboutFamily?.trim() || "";

    // Validate based on section
    let validationResult = { isValid: false, message: "" };

    if (section === "Self") {
      validationResult = validateSelfInfo();
    } else if (section === "Family") {
      validationResult = validateFamilyInfo();
    } else if (section === "Partner Preferences") {
      validationResult = validatePartnerInfo();
    } else if (section === "Membership Plan") {
      // No validation needed for membership plan
      validationResult = { isValid: true, message: "Validation successful" };
    }

    if (!validationResult.isValid) {
      toast.error(`Cannot save ${section}: ${validationResult.message}`);
      return; // Stop if validation fails
    }

    setLoadingState('saveProfile', true);
    try {
      // For Membership Plan section, use a simpler approach
      if (section === "Membership Plan") {
        // Get current profile data
        const profileResponse = await axios.get(
          `${BACKEND_URL}/profile/get/${user.email}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        let profileData;

        if (profileResponse.data && profileResponse.data.profile) {
          // Update existing profile
          profileData = {
            ...profileResponse.data.profile,
            membershipPlan: membershipPlan,
            lastUpdated: new Date().toISOString()
          };
        } else {
          // Create new profile with membership plan
          profileData = {
            email: user.email,
            personalInfo: trimmedPersonalInfo,
            locationInfo: trimmedLocationInfo,
            religionInfo: trimmedReligionInfo,
            educationInfo: trimmedEducationInfo,
            careerInfo: trimmedCareerInfo,
            familyInfo: trimmedFamilyInfo,
            partnerInfo: trimmedPartnerInfo,
            aboutYourself: trimmedAboutYourself,
            aboutFamily: trimmedAboutFamily,
            membershipPlan: membershipPlan,
            lastUpdated: new Date().toISOString()
          };
        }

        // Save the profile
        const response = await axios.post(
          `${BACKEND_URL}/profile/save`,
          profileData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success(`Membership plan updated to ${membershipPlan === "premium" ? "Premium" : "Free"} successfully!`);

        // Update local state
        setMembershipPlan(membershipPlan);

        if (membershipPlan === "free") {
          toast.info("You have switched to Free plan. Premium features are now disabled.");
        } else if (membershipPlan === "premium") {
          toast.success("Premium membership activated! You can now access all premium features.");
        }
      } else {
        // For other sections, use the existing logic
        // Combine all trimmed data
        const profileData = {
          email: user.email,
          personalInfo: trimmedPersonalInfo,
          locationInfo: trimmedLocationInfo,
          religionInfo: trimmedReligionInfo,
          educationInfo: trimmedEducationInfo,
          careerInfo: trimmedCareerInfo,
          familyInfo: trimmedFamilyInfo,
          partnerInfo: trimmedPartnerInfo,
          aboutYourself: trimmedAboutYourself,
          aboutFamily: trimmedAboutFamily,
          membershipPlan: membershipPlan, // Include current membership plan
          isPublished: isProfilePublished,
          lastUpdated: new Date().toISOString()
        };

        // Call backend API to save profile
        const response = await axios.post(
          `${BACKEND_URL}/profile/save`,
          profileData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success(`${section} information saved successfully!`);
        setIsEditing(false);

        // Update form states with trimmed values
        setPersonalInfo(trimmedPersonalInfo);
        setLocationInfo(trimmedLocationInfo);
        setReligionInfo(trimmedReligionInfo);
        setEducationInfo(trimmedEducationInfo);
        setCareerInfo(trimmedCareerInfo);
        setFamilyInfo(trimmedFamilyInfo);
        setPartnerInfo(trimmedPartnerInfo);
        setAboutYourself(trimmedAboutYourself);
        setAboutFamily(trimmedAboutFamily);

        // Recalculate completion status
        calculateAllProgress();
      }

    } catch (err) {
      console.error("Save profile error:", err);

      // Show specific error message for membership plan
      if (section === "Membership Plan") {
        toast.error(err.response?.data?.detail || "Failed to update membership plan. Please try again.");
      } else {
        toast.error(err.response?.data?.detail || "Failed to save profile information");
      }
    } finally {
      setLoadingState('saveProfile', false);
    }
  };

  const handlePostProfile = async () => {
    // Calculate current completion status
    const { progress, allComplete } = calculateAllProgress();

    // First check if all sections have enough data (at least 80%)
    if (!allComplete) {
      const incompleteSections = [];
      if (progress.self < 80) incompleteSections.push(`Self (${progress.self}%)`);
      if (progress.family < 80) incompleteSections.push(`Family (${progress.family}%)`);
      if (progress.partner < 80) incompleteSections.push(`Partner (${progress.partner}%)`);

      toast.error(`Profile is incomplete. The following sections need at least 80%: ${incompleteSections.join(', ')}`);
      return;
    }

    // Then validate required fields
    const selfValidation = validateSelfInfo();
    const familyValidation = validateFamilyInfo();
    const partnerValidation = validatePartnerInfo();

    if (!selfValidation.isValid || !familyValidation.isValid || !partnerValidation.isValid) {
      toast.error("Cannot publish profile. Please complete all required fields.");
      return;
    }

    // Double-check all sections are at least 80%
    if (progress.self < 80 || progress.family < 80 || progress.partner < 80) {
      toast.error(`Profile completion insufficient: Self ${progress.self}%, Family ${progress.family}%, Partner ${progress.partner}%. All sections need at least 80%.`);
      return;
    }

    setLoadingState('postProfile', true);
    try {
      // Show publishing message
      toast.info("Publishing profile...", { autoClose: false, toastId: "publishing" });

      // Final save before publishing
      const profileData = {
        email: user.email,
        personalInfo,
        locationInfo,
        religionInfo,
        educationInfo,
        careerInfo,
        familyInfo,
        partnerInfo,
        aboutYourself: aboutYourself.trim(),
        aboutFamily: aboutFamily.trim(),
        membershipPlan,
        isPublished: true,
        publishedDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      const response = await axios.post(
        `${BACKEND_URL}/profile/publish`,
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove the "publishing" toast
      toast.dismiss("publishing");

      setIsProfilePublished(true);
      toast.success("🎉 Profile published successfully! Now visible to other members.");

    } catch (err) {
      console.error("Publish error:", err);

      // Remove the "publishing" toast
      toast.dismiss("publishing");

      // Check if it's a validation error from backend
      if (err.response?.status === 400) {
        toast.error("Data is insufficient. Please check all required fields.");
      } else if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else if (err.message === "Network Error") {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Failed to publish profile. Please try again.");
      }
    } finally {
      setLoadingState('postProfile', false);
    }
  };

  const handleRemoveProfile = async () => {
    setLoadingState('removeProfile', true);
    try {
      await axios.post(
        `${BACKEND_URL}/profile/unpublish`,
        { email: user.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsProfilePublished(false);
      toast.success("Profile hidden successfully! Not visible to other members.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to hide profile");
    } finally {
      setLoadingState('removeProfile', false);
    }
  };

  const handleDeleteProfile = async () => {

    const result = await Swal.fire({
      title: 'Delete Profile?',
      text: 'This action cannot be undone and all your data will be lost.',
      icon: 'warning',
      iconColor: '#f97316',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      buttonsStyling: false,

      customClass: {
        popup: 'rounded-xl p-6',
        actions: 'gap-3 mt-4', // space between buttons
        confirmButton:
          'px-5 py-2.5 min-w-[120px] rounded-lg font-medium text-white ' +
          'bg-[oklch(70.4%_0.191_22.216)] hover:bg-[oklch(65%_0.191_22.216)] ' +
          'transition shadow-md',
        cancelButton:
          'px-5 py-2.5 min-w-[120px] rounded-lg font-medium text-gray-700 ' +
          'bg-gray-200 hover:bg-gray-300 transition shadow-sm'
      }
    });

    // If user cancels, do nothing
    if (!result.isConfirmed) {
      return;
    }

    setLoadingState('deleteProfile', true);
    try {
      await axios.delete(
        `${BACKEND_URL}/api/profile/delete/${user.email}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Profile permanently deleted successfully!");

      // Clear local storage and redirect to login
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete profile");
    } finally {
      setLoadingState('deleteProfile', false);
      setShowDeleteConfirm(false);
    }
  };

  // Razorpay payment integration
  const handlePayment = async (planType, amount) => {
    setLoadingState('payment', true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/payment/create-order`,
        {
          amount: amount * 100, // Convert to paise
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
          plan: planType,
          email: user.email
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const order = response.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SAV5YlU6Yyoefc",
        amount: order.amount,
        currency: order.currency,
        name: "Paarsh Matrimony",
        description: `${planType} Membership`,
        image: "/logo.png",
        order_id: order.id,
        handler: async function (response) {
          try {
            const paymentResponse = await axios.post(
              `${BACKEND_URL}/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: planType,
                email: user.email
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            );

            if (paymentResponse.data.success) {
              // Update local state first
              setMembershipPlan(planType);
              toast.success("🎉 Payment successful! Premium membership activated.");

              // Now update the profile with the new membership plan
              try {
                // Get current profile
                const profileResponse = await axios.get(
                  `${BACKEND_URL}/profile/get/${user.email}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );

                let profileData;

                if (profileResponse.data?.profile) {
                  // Update existing profile
                  profileData = {
                    ...profileResponse.data.profile,
                    membershipPlan: planType,
                    lastUpdated: new Date().toISOString()
                  };
                } else {
                  // Create new profile with current form data
                  profileData = {
                    email: user.email,
                    personalInfo,
                    locationInfo,
                    religionInfo,
                    educationInfo,
                    careerInfo,
                    familyInfo,
                    partnerInfo,
                    aboutYourself: aboutYourself?.trim() || "",
                    aboutFamily: aboutFamily?.trim() || "",
                    membershipPlan: planType,
                    lastUpdated: new Date().toISOString()
                  };
                }

                // Save profile
                await axios.post(
                  `${BACKEND_URL}/profile/save`,
                  profileData,
                  { headers: { Authorization: `Bearer ${token}` } }
                );

                // Update local state
                setMembershipPlan(planType);
                toast.success("Premium membership saved to your profile!");

              } catch (error) {
                console.error("Error saving premium membership:", error);
                toast.error("Payment successful but failed to save to profile. Please refresh the page.");
              }

            } else {
              toast.error("Payment verification failed. Please contact support.");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed. Please contact support.");
          } finally {
            setLoadingState('payment', false);
          }
        },
        prefill: {
          name: user.name || user.fullName || "",
          email: user.email,
          contact: personalInfo.contactNumber || ""
        },
        theme: {
          color: "#f97316"
        },
        modal: {
          ondismiss: function () {
            setLoadingState('payment', false);
            toast.info("Payment cancelled");
          }
        },
        notes: {
          plan: planType,
          email: user.email
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

      razorpay.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description || 'Unknown error'}`);
        setLoadingState('payment', false);
      });

    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error(error.response?.data?.detail || "Failed to initiate payment");
      setLoadingState('payment', false);
    }
  };

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex justify-center items-center pt-20">
          <div className="flex flex-col items-center gap-4">
            <FiLoader className="text-[oklch(70.4%_0.191_22.216)] animate-spin text-4xl" />
            <p className="text-gray-500">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <ToastContainer position="top-right" />
      <Navbar />

      <div className="min-h-screen bg-gray-50 pt-20 md:pt-24 pb-12">
        <div className="container mx-auto px-3 md:px-4">
          {/* User Profile Header - Responsive */}
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-8 mb-6 md:mb-8 relative">
            {/* Settings Icon - Top Right Corner */}
            <div className="absolute top-4 right-4 z-10">
              <FiSettings
                className="
    w-7 h-7
    cursor-pointer
    text-gray-600
    hover:text-[oklch(70.4%_0.191_22.216)]
    transition
    flex-shrink-0
  "
                onClick={() => setShowSettings(!showSettings)}
              />
              {showSettings && (
                <div className="absolute right-0 mt-2 w-56 bg-white border shadow-lg rounded-lg text-left z-50 overflow-hidden">
                  <button
                    className="flex items-center gap-2 w-full text-left px-4 py-3 hover:bg-gray-50 transition disabled:opacity-50"
                    onClick={() => {
                      setShowPasswordBox(true);
                      setShowFeedbackBox(false);
                      setShowDeleteConfirm(false);
                      setShowSettings(false);
                    }}
                    disabled={loadingStates.passwordUpdate}
                  >
                    <FiEdit2 /> Change Password
                  </button>
                  <button
                    className="flex items-center gap-2 w-full text-left px-4 py-3 hover:bg-gray-50 transition disabled:opacity-50"
                    onClick={() => {
                      setShowFeedbackBox(true);
                      setShowPasswordBox(false);
                      setShowDeleteConfirm(false);
                      setShowSettings(false);
                    }}
                    disabled={loadingStates.feedbackSubmit}
                  >
                    <FiMessageSquare /> Give Feedback
                  </button>
                  {isProfilePublished && (
                    <button
                      className="flex items-center gap-2 w-full text-left px-4 py-3 hover:bg-gray-50 transition disabled:opacity-50"
                      onClick={() => {
                        handleRemoveProfile();
                        setShowSettings(false);
                      }}
                      disabled={loadingStates.removeProfile}
                    >
                      <MdOutlineRemoveCircle /> Hide Profile
                    </button>
                  )}
                  <button
                    className="flex items-center gap-2 w-full text-left px-4 py-3 hover:bg-gray-50 text-red-600 transition disabled:opacity-50"
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setShowPasswordBox(false);
                      setShowFeedbackBox(false);
                      setShowSettings(false);
                    }}
                    disabled={loadingStates.deleteProfile}
                  >
                    <FiTrash2 /> Delete Profile
                  </button>
                  <div className="border-t">
                    <button
                      className="flex items-center gap-2 w-full text-left px-4 py-3 hover:bg-gray-50 text-red-600 transition disabled:opacity-50"
                      onClick={handleLogout}
                      disabled={loadingStates.logout}
                    >
                      {loadingStates.logout ? (
                        <FiLoader className="animate-spin" />
                      ) : (
                        <FiSettings />
                      )}
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-6">
              {/* Avatar */}
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto sm:mx-0 overflow-hidden">
                {personalInfo.profileImg ? (
                  <img
                    src={personalInfo.profileImg}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center
             text-5xl md:text-6xl font-black tracking-wide
             text-[oklch(70.4%_0.191_22.216)]
             bg-[oklch(70.4%_0.191_22.216)]/15
             border-2 border-[oklch(70.4%_0.191_22.216)]
             rounded-full"
                  >
                    {user.name[0].toUpperCase()}
                  </div>
                )}
              </div>

              {/* User Info - Centered on mobile */}
              <div className="flex-1 w-full text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  {user.name}
                </h1>
                <p className="text-gray-600 mb-3 md:mb-2">
                  {user.email}
                </p>

                {/* Profile Completion Status - Always shows real-time calculation */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      Profile Completion
                    </span>
                    <span className="text-sm font-semibold text-[oklch(70.4%_0.191_22.216)]">
                      {Math.round((Object.values(profileProgress).reduce((a, b) => a + b, 0) / 3))}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[oklch(70.4%_0.191_22.216)] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.round((Object.values(profileProgress).reduce((a, b) => a + b, 0) / 3))}%` }}
                    ></div>
                  </div>
                </div>

                {user.google_id && (
                  <div className="flex justify-center md:justify-start mb-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      <FiCheckCircle /> Google Account
                    </span>
                  </div>
                )}

                {/* Action Buttons - Centered on mobile */}
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <LoadingButton
                    onClick={() => {
                      setLoadingState('viewMatches', true);

                      // Prepare user data
                      const userData = {
                        userEmail: user.email,
                        isProfilePublished: isProfilePublished,
                        membershipType: membershipPlan === "premium" ? "premium" : "free"
                      };

                      // Save to global context
                      updateUserProfile(userData);

                      // Navigate with state
                      navigate("/matches", {
                        state: userData
                      });
                    }}
                    loading={loadingStates.viewMatches}
                    variant="secondary"
                  >
                    <FiEye className="flex-shrink-0" />
                    <span>View Matches</span>
                  </LoadingButton>
                  <LoadingButton
                    onClick={() => {
                      setLoadingState('watchlist', true);

                      // Prepare user data
                      const userData = {
                        userEmail: user.email,
                        isProfilePublished: isProfilePublished,
                        membershipType: membershipPlan === "premium" ? "premium" : "free"
                      };

                      // Save to global context
                      updateUserProfile(userData);

                      // Navigate with state
                      navigate("/watchlist", {
                        state: userData
                      });
                    }}
                    loading={loadingStates.watchlist}
                    variant="secondary"
                  >
                    <FiHeart className="flex-shrink-0" />
                    <span>Watchlist</span>
                  </LoadingButton>
                </div>
              </div>
            </div>

            {/* Profile Status Badge */}
            <div className="mt-6 flex items-center justify-center">
              <div
                className={`px-4 py-2 rounded-full text-sm font-medium ${isProfilePublished
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
                  }`}
              >
                {isProfilePublished ? (
                  <span className="flex items-center gap-2 justify-center text-center">
                    <MdPublishedWithChanges /> Profile Published
                  </span>
                ) : (
                  <span className="flex items-center gap-2 justify-center text-center">
                    <MdWarning /> Profile Not Published
                  </span>
                )}
              </div>
            </div>

            {/* Change Password Box */}
            {showPasswordBox && (
              <div className="mt-6 p-4 md:p-6 bg-gray-50 rounded-lg border">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Change Password</h3>
                  <button
                    onClick={() => { setShowPasswordBox(false); setNewPassword(""); }}
                    className="text-gray-500 hover:text-gray-700"
                    disabled={loadingStates.passwordUpdate}
                  >
                    <FiX size={20} />
                  </button>
                </div>
                <PasswordInput
                  label="New Password"
                  value={newPassword}
                  onChange={setNewPassword}
                  placeholder="Enter new password (min 8 characters)"
                  isEditing={true}
                />
                <p className="mt-1 text-xs text-gray-500 mb-3">
                  Password must be at least 8 characters long
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <LoadingButton
                    onClick={handlePasswordUpdate}
                    loading={loadingStates.passwordUpdate}
                    className="flex-1 py-2"
                    variant="primary"
                  >
                    Update Password
                  </LoadingButton>
                  <button
                    onClick={() => { setShowPasswordBox(false); setNewPassword(""); }}
                    className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition disabled:opacity-50"
                    disabled={loadingStates.passwordUpdate}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Delete Profile Confirmation */}
            {showDeleteConfirm && (
              <div className="mt-6 p-4 md:p-6 bg-red-50 rounded-lg border border-red-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-red-800">Permanently Delete Profile</h3>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="text-red-600 hover:text-red-800"
                    disabled={loadingStates.deleteProfile}
                  >
                    <FiX size={20} />
                  </button>
                </div>
                <div className="mb-4">
                  <div className="flex items-start gap-3 p-3 bg-red-100 rounded-lg mb-3">
                    <MdWarning className="text-red-600 text-2xl mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-red-800 mb-1">Warning: This action cannot be undone!</h4>
                      <p className="text-red-700 text-sm">
                        All your profile data, matches, plan, watchlist, and preferences will be permanently deleted.
                        You will need to create a new account if you want to use the service again.
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    {isProfilePublished ?
                      "If you only want to hide your profile from other members temporarily, use the \"Hide Profile\" option instead." :
                      "Your profile is currently hidden and not visible to other members. You can publish it anytime to make it visible."}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <LoadingButton
                    onClick={handleDeleteProfile}
                    loading={loadingStates.deleteProfile}
                    className="flex-1 py-2"
                    variant="primary"
                  >
                    {loadingStates.deleteProfile ? (
                      <>
                        <FiLoader className="animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <FiTrash2 />
                        Yes, Delete Permanently
                      </>
                    )}
                  </LoadingButton>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                    disabled={loadingStates.deleteProfile}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Feedback Form Box */}
            {showFeedbackBox && (
              <div className="mt-6 p-4 md:p-6 bg-purple-50 rounded-lg border border-purple-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Share Your Feedback</h3>
                  <button
                    onClick={() => {
                      setShowFeedbackBox(false);
                      setFeedback({
                        experience: "",
                        rating: 0,
                        suggestions: ""
                      });
                    }}
                    className="text-gray-500 hover:text-gray-700"
                    disabled={loadingStates.feedbackSubmit}
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Experience *
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      rows={3}
                      value={feedback.experience}
                      onChange={(e) => {
                        const safeValue = e.target.value
                          .replace(/[^a-zA-Z0-9\s.,'-]/g, "")
                          .replace(/\s{2,}/g, " ");
                        setFeedback({ ...feedback, experience: safeValue });
                      }}
                      onBlur={(e) => {
                        const trimmedValue = e.target.value.trim();
                        if (trimmedValue !== e.target.value) {
                          setFeedback({ ...feedback, experience: trimmedValue });
                        }
                      }}
                      placeholder="Tell us about your experience with our matrimony service..."
                      disabled={loadingStates.feedbackSubmit}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating *
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="text-2xl transition"
                          onClick={() => setFeedback({ ...feedback, rating: star })}
                          disabled={loadingStates.feedbackSubmit}
                        >
                          {star <= feedback.rating ? (
                            <FiStar className="fill-red-400 text-red-400" />
                          ) : (
                            <FiStar className="text-gray-300 hover:text-yellow-400" />
                          )}
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        {feedback.rating > 0 && `${feedback.rating}/5 stars`}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Suggestions for Improvement
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      rows={2}
                      value={feedback.suggestions}
                      onChange={(e) => {
                        const safeValue = e.target.value
                          .replace(/[^a-zA-Z0-9\s.,'-]/g, "")
                          .replace(/\s{2,}/g, " ");
                        setFeedback({ ...feedback, suggestions: safeValue });
                      }}
                      onBlur={(e) => {
                        const trimmedValue = e.target.value.trim();
                        if (trimmedValue !== e.target.value) {
                          setFeedback({ ...feedback, suggestions: trimmedValue });
                        }
                      }}
                      placeholder="Any suggestions to improve our service..."
                      disabled={loadingStates.feedbackSubmit}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <LoadingButton
                      onClick={handleFeedbackSubmit}
                      loading={loadingStates.feedbackSubmit}
                      className="flex-1 py-2"
                      variant="primary"
                    >
                      Submit Feedback
                    </LoadingButton>
                    <button
                      onClick={() => {
                        setShowFeedbackBox(false);
                        setFeedback({
                          experience: "",
                          rating: 0,
                          suggestions: ""
                        });
                      }}
                      className="flex-1 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                      disabled={loadingStates.feedbackSubmit}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Tabs - Responsive */}
          <div className="flex flex-wrap gap-2 mb-6 md:mb-8 overflow-x-auto pb-2">
            {["self", "family", "partner", "plan", "post"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveSection(tab);
                  // Update URL hash without page reload
                  window.location.hash = tab;
                }}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition whitespace-nowrap text-sm md:text-base ${activeSection === tab
                  ? "bg-[oklch(70.4%_0.191_22.216)] text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                disabled={loadingStates.saveProfile}
              >
                {tab === "self" && "Self Information"}
                {tab === "family" && "Family Information"}
                {tab === "partner" && "Partner Preferences"}
                {tab === "plan" && "Choose Plan"}
                {tab === "post" && "Post Profile"}
              </button>
            ))}
          </div>

          {/* Content Sections - Full Width on Laptop */}
          <div className="max-w-5xl mx-auto">
            {activeSection === "self" && (
              <FormBox
                title="Self Information"
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                loadingSaveProfile={loadingStates.saveProfile}
                sectionProgress={profileProgress.self}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Profile Image Upload */}
                  <div className="md:col-span-2">
                    <Section title="Profile Picture *">
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative w-32 h-32 rounded-full bg-[oklch(70.4%_0.191_22.216)]/20 flex items-center justify-center text-4xl font-bold text-[oklch(70.4%_0.191_22.216)] border border-[oklch(70.4%_0.191_22.216)]">
                          {personalInfo.profileImg ? (
                            <img
                              src={personalInfo.profileImg}
                              alt="Profile"
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            user.name[0].toUpperCase()
                          )}
                          {isEditing && (
                            <label className="absolute bottom-0 right-0 bg-[oklch(70.4%_0.191_22.216)] text-white p-2 rounded-full cursor-pointer hover:opacity-90 disabled:opacity-50">
                              {loadingStates.imageUpload ? (
                                <FiLoader className="animate-spin" size={20} />
                              ) : (
                                <FiCamera size={20} />
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                                disabled={!isEditing || loadingStates.imageUpload}
                              />
                            </label>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-600 mb-2">
                            <span className="font-semibold text-red-500">* Required:</span> Upload a clear profile picture for better matches (.jpg, .png).
                          </p>
                          <p className="text-sm text-gray-500 mb-4">
                            Recommended size: 500x500px, Max size: 2MB
                          </p>
                          {isEditing && (
                            <>
                              <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition disabled:opacity-50 mb-2">
                                {loadingStates.imageUpload ? (
                                  <FiLoader className="animate-spin" />
                                ) : (
                                  <FiUpload />
                                )}
                                Upload Image
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleImageUpload}
                                  disabled={!isEditing || loadingStates.imageUpload}
                                />
                              </label>
                              {!personalInfo.profileImg && (
                                <p className="text-sm text-red-500 mt-2">
                                  Profile image is required to save Self Information
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </Section>
                  </div>

                  {/* Personal Info */}
                  <Section title="Personal Details">
                    <div className="space-y-4">
                      <Input
                        label="Full Name *"
                        value={personalInfo.fullName}
                        onChange={(val) => {
                          const safeValue = val
                            .replace(/\s{2,}/g, " ")
                            .slice(0, 50);

                          setPersonalInfo(prev => ({ ...prev, fullName: safeValue }));
                        }}
                        placeholder="Enter your full name"
                        isEditing={isEditing}
                        maxLength={50}
                      />
                      <Input
                        label="Gender *"
                        type="select"
                        options={["Male", "Female", "Other"]}
                        value={personalInfo.gender}
                        onChange={(val) => setPersonalInfo(prev => ({ ...prev, gender: val }))}
                        isEditing={isEditing}
                      />
                      <Input
                        label="Date of Birth *"
                        type="date"
                        value={personalInfo.dob}
                        onChange={(val) => setPersonalInfo(prev => ({ ...prev, dob: val }))}
                        isEditing={isEditing}
                      />
                      <Input
                        label="Age *"
                        type="number"
                        value={personalInfo.age}
                        onChange={(val) => {
                          const safeValue = val.replace(/\D/g, "").slice(0, 3); // only digits, max 3
                          setPersonalInfo(prev => ({ ...prev, age: safeValue }));
                        }}
                        placeholder="Enter your age"
                        isEditing={isEditing}
                        min={0}
                        maxLength={3}
                      />
                      <Input
                        label="Marital Status *"
                        type="select"
                        options={["Never Married", "Divorced", "Widowed", "Separated"]}
                        value={personalInfo.maritalStatus}
                        onChange={(val) => setPersonalInfo(prev => ({ ...prev, maritalStatus: val }))}
                        isEditing={isEditing}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Height (cm)"
                          value={personalInfo.height}
                          onChange={(val) => {
                            const safeValue = val.replace(/\D/g, "").slice(0, 3); // only numbers, max 3 digits
                            setPersonalInfo(prev => ({ ...prev, height: safeValue }));
                          }}
                          placeholder="Height in cm"
                          isEditing={isEditing}
                          maxLength={3}
                        />
                        <Input
                          label="Weight (kg)"
                          value={personalInfo.weight}
                          onChange={(val) => {
                            const safeValue = val.replace(/\D/g, "").slice(0, 3); // only numbers, max 3 digits
                            setPersonalInfo(prev => ({ ...prev, weight: safeValue }));
                          }}
                          placeholder="Weight in kg"
                          isEditing={isEditing}
                          maxLength={3}
                        />
                      </div>
                      <Input
                        label="Blood Group"
                        type="select"
                        options={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "Other"]}
                        value={personalInfo.bloodGroup}
                        onChange={(val) => setPersonalInfo(prev => ({ ...prev, bloodGroup: val }))}
                        isEditing={isEditing}
                      />
                      <Input
                        label="Disability"
                        type="select"
                        options={["No", "Yes"]}
                        value={personalInfo.disability}
                        onChange={(val) => setPersonalInfo(prev => ({ ...prev, disability: val }))}
                        isEditing={isEditing}
                      />
                      <Input
                        label="Contact Number *"
                        type="tel"
                        value={personalInfo.contactNumber}
                        onChange={(val) => setPersonalInfo(prev => ({ ...prev, contactNumber: val }))}
                        isEditing={isEditing}
                      />
                      <Input
                        label="WhatsApp Number"
                        type="tel"
                        value={personalInfo.whatsappNumber}
                        onChange={(val) => setPersonalInfo(prev => ({ ...prev, whatsappNumber: val }))}
                        isEditing={isEditing}
                      />
                    </div>
                  </Section>

                  <div className="space-y-6">
                    {/* Location */}
                    <Section title="Location">
                      <div className="space-y-4">
                        <Input
                          label="Country *"
                          type="select"
                          options={["India", "USA", "UK", "Canada", "Australia", "Other"]}
                          value={locationInfo.country}
                          onChange={(val) => setLocationInfo(prev => ({ ...prev, country: val }))}
                          isEditing={isEditing}
                        />
                        <Input
                          label="State *"
                          value={locationInfo.state}
                          onChange={(val) => {
                            const safeValue = val
                              .replace(/[^a-zA-Z\s]/g, "")
                              .replace(/\s{2,}/g, " ");
                            setLocationInfo(prev => ({ ...prev, state: safeValue }));
                          }}
                          placeholder="Enter your state"
                          isEditing={isEditing}
                        />
                        <Input
                          label="City *"
                          value={locationInfo.city}
                          onChange={(val) => {
                            const safeValue = val
                              .replace(/[^a-zA-Z\s]/g, "")
                              .replace(/\s{2,}/g, " ");
                            setLocationInfo(prev => ({ ...prev, city: safeValue }));
                          }}
                          placeholder="Enter your city"
                          isEditing={isEditing}
                        />
                        <Input
                          label="Pin Code"
                          value={locationInfo.pinCode}
                          onChange={(val) => {
                            const safeValue = val.replace(/\D/g, "").slice(0, 6);
                            setLocationInfo(prev => ({ ...prev, pinCode: safeValue }));
                          }}
                          placeholder="Enter pin code"
                          isEditing={isEditing}
                          maxLength={6}
                        />
                        <Input
                          label="Current Town"
                          value={locationInfo.currentLocation}
                          onChange={(val) => {
                            const safeValue = val
                              .replace(/[^a-zA-Z\s]/g, "")
                              .replace(/\s{2,}/g, " ");
                            setLocationInfo(prev => ({ ...prev, currentLocation: safeValue }));
                          }}
                          placeholder="Current location"
                          isEditing={isEditing}
                        />
                        <Textarea
                          label="Permanent Address"
                          value={locationInfo.permanentAddress}
                          onChange={(val) => {
                            const safeValue = val
                              .replace(/[^a-zA-Z0-9\s,./-]/g, "")
                              .replace(/\s{2,}/g, " ");
                            setLocationInfo(prev => ({ ...prev, permanentAddress: safeValue }));
                          }}
                          rows={3}
                          placeholder="Enter your permanent address..."
                          isEditing={isEditing}
                        />
                      </div>
                    </Section>

                    {/* Religion & Caste */}
                    <Section title="Religion & Caste">
                      <div className="space-y-4">
                        <Input
                          label="Religion *"
                          type="select"
                          options={["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist", "Other"]}
                          value={religionInfo.religion}
                          onChange={(val) => setReligionInfo(prev => ({ ...prev, religion: val }))}
                          isEditing={isEditing}
                        />
                        <Input
                          label="Caste *"
                          value={religionInfo.caste}
                          onChange={(val) => {
                            const safeValue = val
                              .replace(/[^a-zA-Z\s]/g, "")
                              .replace(/\s{2,}/g, " ");

                            setReligionInfo(prev => ({ ...prev, caste: safeValue }));
                          }}
                          placeholder="Enter your caste"
                          isEditing={isEditing}
                        />

                        <Input
                          label="Mother Tongue"
                          type="select"
                          options={["Marathi", "Hindi", "English", "Gujarati", "Tamil", "Telugu", "Bengali", "Other"]}
                          value={religionInfo.motherTongue}
                          onChange={(val) => setReligionInfo(prev => ({ ...prev, motherTongue: val }))}
                          isEditing={isEditing}
                        />
                      </div>
                    </Section>
                  </div>

                  {/* Education */}
                  <Section title="Education">
                    <div className="space-y-4">
                      <Input
                        label="Highest Education *"
                        type="select"
                        options={[
                          "High School",
                          "Diploma",
                          "Bachelor's Degree",
                          "Master's Degree",
                          "PhD",
                          "Post Doctorate"
                        ]}
                        value={educationInfo.highestEducation}
                        onChange={(val) => setEducationInfo(prev => ({ ...prev, highestEducation: val }))}
                        isEditing={isEditing}
                      />
                      <Input
                        label="Year of Passing"
                        type="date"
                        value={educationInfo.yearOfPassing}
                        onChange={(val) => setEducationInfo(prev => ({ ...prev, yearOfPassing: val }))}
                        isEditing={isEditing}
                      />
                      <Input
                        label="University/College"
                        value={educationInfo.university}
                        onChange={(val) => {
                          const safeValue = val
                            .replace(/[^a-zA-Z\s.&-]/g, "")
                            .replace(/\s{2,}/g, " ");

                          setEducationInfo(prev => ({ ...prev, university: safeValue }));
                        }}
                        placeholder="Enter university/college name"
                        isEditing={isEditing}
                      />

                    </div>
                  </Section>

                  {/* Career */}
                  <Section title="Career">
                    <div className="space-y-4">
                      <Input
                        label="Profession *"
                        type="select"
                        options={[
                          "Engineer",
                          "Doctor",
                          "Teacher",
                          "Business",
                          "Government Employee",
                          "Private Employee",
                          "Student",
                          "Other"
                        ]}
                        value={careerInfo.profession}
                        onChange={(val) => setCareerInfo(prev => ({ ...prev, profession: val }))}
                        isEditing={isEditing}
                      />
                      <Input
                        label="Job Title"
                        value={careerInfo.jobTitle}
                        onChange={(val) => {
                          const safeValue = val
                            .replace(/[^a-zA-Z\s.&/-]/g, "")
                            .replace(/\s{2,}/g, " ");
                          setCareerInfo(prev => ({ ...prev, jobTitle: safeValue }));
                        }}
                        placeholder="Enter your job title"
                        isEditing={isEditing}
                      />
                      <Input
                        label="Company Name"
                        value={careerInfo.companyName}
                        onChange={(val) => {
                          const safeValue = val
                            .replace(/[^a-zA-Z\s.&/-]/g, "")
                            .replace(/\s{2,}/g, " ");
                          setCareerInfo(prev => ({ ...prev, companyName: safeValue }));
                        }}
                        placeholder="Enter company name"
                        isEditing={isEditing}
                      />
                      <Input
                        label="Employment Type *"
                        type="select"
                        options={["Private", "Government", "Business", "Self-employed", "Unemployed"]}
                        value={careerInfo.employmentType}
                        onChange={(val) => setCareerInfo(prev => ({ ...prev, employmentType: val }))}
                        isEditing={isEditing}
                      />
                      <Input
                        label="Annual Income (₹) *"
                        type="select"
                        options={["1-3 LPA", "3-5 LPA", "5-10 LPA", "10-20 LPA", "20-50 LPA", "50+ LPA"]}
                        value={careerInfo.annualIncome}
                        onChange={(val) => setCareerInfo(prev => ({ ...prev, annualIncome: val }))}
                        isEditing={isEditing}
                      />
                      <Input
                        label="Work Location"
                        value={careerInfo.workLocation}
                        onChange={(val) => {
                          const safeValue = val
                            .replace(/[^a-zA-Z\s.-]/g, "")
                            .replace(/\s{2,}/g, " ");
                          setCareerInfo(prev => ({ ...prev, workLocation: safeValue }));
                        }}
                        placeholder="Enter work location"
                        isEditing={isEditing}
                      />
                    </div>
                  </Section>

                  {/* About Yourself */}
                  <div className="md:col-span-2">
                    <Textarea
                      label="About Yourself"
                      value={aboutYourself}
                      onChange={(val) => {
                        const safeValue = val
                          .replace(/[^a-zA-Z0-9\s.,'-]/g, "")
                          .replace(/\s{2,}/g, " ");
                        setAboutYourself(safeValue);
                      }}
                      rows={5}
                      placeholder="Tell us about yourself, your interests, hobbies, and personality..."
                      isEditing={isEditing}
                    />
                  </div>
                </div>
                <SubmitButton
                  text="Save Self Information"
                  onClick={() => handleSubmit("Self")}
                  loading={loadingStates.saveProfile}
                  disabled={profileProgress.self < 80}
                />
                {profileProgress.self < 80 && (
                  <p className="text-center text-red-500 text-sm mt-2">
                    Self information must be at least 80% complete to save. Current: {profileProgress.self}%
                  </p>
                )}
              </FormBox>
            )}

            {activeSection === "family" && (
              <FormBox
                title="Family Information"
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                loadingSaveProfile={loadingStates.saveProfile}
                sectionProgress={profileProgress.family}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <Section title="Parents Information">
                      <div className="space-y-4">
                        <Input
                          label="Father's Name *"
                          value={familyInfo.fatherName}
                          onChange={(val) => {
                            const safeValue = val
                              .replace(/[^a-zA-Z\s.'-]/g, "")
                              .replace(/\s{2,}/g, " ");
                            setFamilyInfo(prev => ({ ...prev, fatherName: safeValue }));
                          }}
                          placeholder="Enter father's name"
                          isEditing={isEditing}
                        />
                        <Input
                          label="Father's Occupation *"
                          value={familyInfo.fatherOccupation}
                          onChange={(val) => {
                            const safeValue = val
                              .replace(/[^a-zA-Z\s.'-]/g, "")
                              .replace(/\s{2,}/g, " ");
                            setFamilyInfo(prev => ({ ...prev, fatherOccupation: safeValue }));
                          }}
                          placeholder="Enter father's occupation"
                          isEditing={isEditing}
                        />
                        <Input
                          label="Mother's Name *"
                          value={familyInfo.motherName}
                          onChange={(val) => {
                            const safeValue = val
                              .replace(/[^a-zA-Z\s.'-]/g, "")
                              .replace(/\s{2,}/g, " ");
                            setFamilyInfo(prev => ({ ...prev, motherName: safeValue }));
                          }}
                          placeholder="Enter mother's name"
                          isEditing={isEditing}
                        />
                        <Input
                          label="Mother's Occupation"
                          value={familyInfo.motherOccupation}
                          onChange={(val) => {
                            const safeValue = val
                              .replace(/[^a-zA-Z\s.'-]/g, "")
                              .replace(/\s{2,}/g, " ");
                            setFamilyInfo(prev => ({ ...prev, motherOccupation: safeValue }));
                          }}
                          placeholder="Enter mother's occupation"
                          isEditing={isEditing}
                        />
                      </div>
                    </Section>

                    <Section title="Siblings">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Number of Brothers"
                            type="number"
                            value={familyInfo.brothers}
                            onChange={(val) => {
                              const safeValue = val.replace(/\D/g, "").slice(0, 2); // only digits, max 2
                              setFamilyInfo(prev => ({ ...prev, brothers: safeValue }));
                            }}
                            placeholder="0"
                            isEditing={isEditing}
                            min={0}
                            maxLength={2}
                          />
                          <Input
                            label="Number of Sisters"
                            type="number"
                            value={familyInfo.sisters}
                            onChange={(val) => {
                              const safeValue = val.replace(/\D/g, "").slice(0, 2); // only digits, max 2
                              setFamilyInfo(prev => ({ ...prev, sisters: safeValue }));
                            }}
                            placeholder="0"
                            isEditing={isEditing}
                            min={0}
                            maxLength={2}
                          />
                        </div>
                      </div>
                    </Section>
                  </div>

                  <div className="space-y-6">
                    <Section title="Family Background">
                      <div className="space-y-4">
                        <Input
                          label="Family Type *"
                          type="select"
                          options={["Joint", "Nuclear", "Extended"]}
                          value={familyInfo.familyType}
                          onChange={(val) => setFamilyInfo(prev => ({ ...prev, familyType: val }))}
                          isEditing={isEditing}
                        />
                        <Input
                          label="Family Status *"
                          type="select"
                          options={["Middle Class", "Upper Middle Class", "Affluent", "Wealthy"]}
                          value={familyInfo.familyStatus}
                          onChange={(val) => setFamilyInfo(prev => ({ ...prev, familyStatus: val }))}
                          isEditing={isEditing}
                        />
                        <Input
                          label="Family Location"
                          value={familyInfo.familyLocation}
                          onChange={(val) => {
                            const safeValue = val
                              .replace(/[^a-zA-Z\s]/g, "")
                              .replace(/\s{2,}/g, " ");
                            setFamilyInfo(prev => ({ ...prev, familyLocation: safeValue }));
                          }}
                          placeholder="Enter family location"
                          isEditing={isEditing}
                        />
                        <Input
                          label="Native Place"
                          value={familyInfo.nativePlace}
                          onChange={(val) => {
                            const safeValue = val
                              .replace(/[^a-zA-Z\s]/g, "")
                              .replace(/\s{2,}/g, " ");
                            setFamilyInfo(prev => ({ ...prev, nativePlace: safeValue }));
                          }}
                          placeholder="Enter native place"
                          isEditing={isEditing}
                        />
                      </div>
                    </Section>
                  </div>

                  <div className="md:col-span-2">
                    <Textarea
                      label="About Family"
                      value={aboutFamily}
                      onChange={(val) => {
                        const safeValue = val
                          .replace(/[^a-zA-Z0-9\s.,'-]/g, "")
                          .replace(/\s{2,}/g, " ");
                        setAboutFamily(safeValue);
                      }}
                      rows={5}
                      placeholder="Tell us about your family background, values, and traditions..."
                      isEditing={isEditing}
                    />
                  </div>
                </div>
                <SubmitButton
                  text="Save Family Information"
                  onClick={() => handleSubmit("Family")}
                  loading={loadingStates.saveProfile}
                  disabled={profileProgress.family < 80}
                />
                {profileProgress.family < 80 && (
                  <p className="text-center text-red-500 text-sm mt-2">
                    Family information must be at least 80% complete to save. Current: {profileProgress.family}%
                  </p>
                )}
              </FormBox>
            )}

            {activeSection === "partner" && (
              <FormBox
                title="Partner Preferences"
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                loadingSaveProfile={loadingStates.saveProfile}
                sectionProgress={profileProgress.partner}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <Section title="Basic Preferences">
                      <div className="space-y-4">
                        <Input
                          label="Preferred Age Range *"
                          type="select"
                          options={["18-25", "26-30", "31-35", "36-40", "41-45", "46-50"]}
                          value={partnerInfo.preferredAgeRange}
                          onChange={(val) => setPartnerInfo(prev => ({ ...prev, preferredAgeRange: val }))}
                          isEditing={isEditing}
                        />
                        <Input
                          label="Preferred Height (cm)"
                          value={partnerInfo.preferredHeight}
                          onChange={(val) => {
                            const safeValue = val.replace(/\D/g, "").slice(0, 3);
                            setPartnerInfo(prev => ({ ...prev, preferredHeight: safeValue }));
                          }}
                          placeholder="Preferred height in cm"
                          isEditing={isEditing}
                          maxLength={3}
                          min={0}
                        />
                        <Input
                          label="Preferred Marital Status *"
                          type="select"
                          options={["Never Married", "Divorced", "Widowed", "No Preference"]}
                          value={partnerInfo.preferredMaritalStatus}
                          onChange={(val) => setPartnerInfo(prev => ({ ...prev, preferredMaritalStatus: val }))}
                          isEditing={isEditing}
                        />
                      </div>
                    </Section>

                    <Section title="Background Preferences">
                      <div className="space-y-4">
                        <Input
                          label="Preferred Religion *"
                          type="select"
                          options={["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist", "No Preference"]}
                          value={partnerInfo.preferredReligion}
                          onChange={(val) => setPartnerInfo(prev => ({ ...prev, preferredReligion: val }))}
                          isEditing={isEditing}
                        />
                        <Input
                          label="Preferred Caste *"
                          value={partnerInfo.preferredCaste}
                          onChange={(val) => {
                            const safeValue = val
                              .replace(/[^a-zA-Z\s]/g, "")
                              .replace(/\s{2,}/g, " ");
                            setPartnerInfo(prev => ({ ...prev, preferredCaste: safeValue }));
                          }}
                          placeholder="Enter preferred caste"
                          isEditing={isEditing}
                        />
                        <Input
                          label="Preferred Mother Tongue"
                          type="select"
                          options={["Marathi", "Hindi", "English", "Gujarati", "No Preference", "Other"]}
                          value={partnerInfo.preferredMotherTongue}
                          onChange={(val) => setPartnerInfo(prev => ({ ...prev, preferredMotherTongue: val }))}
                          isEditing={isEditing}
                        />
                      </div>
                    </Section>
                  </div>

                  <div className="space-y-6">
                    <Section title="Career & Education">
                      <div className="space-y-4">
                        <Input
                          label="Preferred Education *"
                          type="select"
                          options={[
                            "High School",
                            "Diploma",
                            "Bachelor's Degree",
                            "Master's Degree",
                            "PhD",
                            "No Preference"
                          ]}
                          value={partnerInfo.preferredEducation}
                          onChange={(val) => setPartnerInfo(prev => ({ ...prev, preferredEducation: val }))}
                          isEditing={isEditing}
                        />
                        <Input
                          label="Preferred Profession *"
                          type="select"
                          options={[
                            "Engineer",
                            "Doctor",
                            "Teacher",
                            "Business",
                            "Government Employee",
                            "No Preference",
                            "Other"
                          ]}
                          value={partnerInfo.preferredProfession}
                          onChange={(val) => setPartnerInfo(prev => ({ ...prev, preferredProfession: val }))}
                          isEditing={isEditing}
                        />
                        <Input
                          label="Preferred Annual Income *"
                          type="select"
                          options={[
                            "Any",
                            "1-3 LPA",
                            "3-5 LPA",
                            "5-10 LPA",
                            "10-20 LPA",
                            "20+ LPA"
                          ]}
                          value={partnerInfo.preferredIncome}
                          onChange={(val) => setPartnerInfo(prev => ({ ...prev, preferredIncome: val }))}
                          isEditing={isEditing}
                        />
                      </div>
                    </Section>

                    <Section title="Location Preferences">
                      <div className="space-y-4">
                        <Input
                          label="Preferred Location *"
                          value={partnerInfo.preferredLocation}
                          onChange={(val) => {
                            const safeValue = val
                              .replace(/[^a-zA-Z\s.-]/g, "")
                              .replace(/\s{2,}/g, " ");
                            setPartnerInfo(prev => ({ ...prev, preferredLocation: safeValue }));
                          }}
                          placeholder="Enter preferred location"
                          isEditing={isEditing}
                        />
                        <Input
                          label="Settled In"
                          type="select"
                          options={["India", "Abroad", "Any"]}
                          value={partnerInfo.settledIn}
                          onChange={(val) => setPartnerInfo(prev => ({ ...prev, settledIn: val }))}
                          isEditing={isEditing}
                        />
                      </div>
                    </Section>
                  </div>

                  <div className="md:col-span-2">
                    <Textarea
                      label="What are you looking for in a partner?"
                      value={partnerInfo.lookingFor}
                      onChange={(val) => {
                        const safeValue = val
                          .replace(/[^a-zA-Z0-9\s.,'-]/g, "")
                          .replace(/\s{2,}/g, " ");
                        setPartnerInfo(prev => ({ ...prev, lookingFor: safeValue }));
                      }}
                      rows={5}
                      placeholder="Describe the qualities and characteristics you are looking for in a partner..."
                      isEditing={isEditing}
                    />
                  </div>
                </div>
                <SubmitButton
                  text="Save Partner Preferences"
                  onClick={() => handleSubmit("Partner Preferences")}
                  loading={loadingStates.saveProfile}
                  disabled={profileProgress.partner < 80}
                />
                {profileProgress.partner < 80 && (
                  <p className="text-center text-red-500 text-sm mt-2">
                    Partner preferences must be at least 80% complete to save. Current: {profileProgress.partner}%
                  </p>
                )}
              </FormBox>
            )}

            {activeSection === "plan" && (
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <MdOutlineWorkspacePremium className="text-2xl text-[oklch(70.4%_0.191_22.216)]" />
                  <h2 className="text-xl font-bold text-gray-800">Choose Your Plan</h2>
                </div>

                {/* Show warning if user is premium */}
                {membershipPlan === "premium" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <FiInfo className="text-blue-600 text-xl mt-1 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-blue-800 font-medium">You are a Premium Member</p>
                        <p className="text-blue-700">You have access to all premium features. Free plan is no longer available.</p>
                        {/* ADD THIS SECTION to show membership dates */}
                        {membershipDates.membershipStartDate && (
                          <div className="mt-2 text-blue-800 bg-blue-100/50 p-2 rounded-lg">
                            <p className="font-medium">Your Membership Details:</p>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mt-1 text-xs">
                              <div className="flex items-center gap-1">
                                <FiCalendar className="text-green-500" size={12} />
                                <span>Started: {new Date(membershipDates.membershipStartDate).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}</span>
                              </div>
                              {membershipDates.membershipExpiryDate && (
                                <div className="flex items-center gap-1">
                                  <FiCalendar className="text-orange-500" size={12} />
                                  <span>Expires: {new Date(membershipDates.membershipExpiryDate).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  })}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  <MembershipCard
                    type="Free Membership"
                    features={[
                      "Manage Profile",
                      "Partner Recommendations",
                      "View Limited Partner Details",
                      "Apply Filters",
                      "Give feedbacks",
                      "Limited Features Access",
                    ]}
                    price="0"
                    currentPlan={membershipPlan === "free" ? "Free Membership" :
                      membershipPlan === "premium" ? "Premium Membership" : null}
                    handlePayment={handlePayment}
                    loadingPayment={loadingStates.payment}
                    handleSubmit={() => {
                      setMembershipPlan("free");
                      updateMembershipPlanInProfile("free");
                    }}
                    membershipDates={membershipDates}
                  />
                  <MembershipCard
                    type="Premium Membership"
                    features={[
                      "All Free Membership Features",
                      "Contact Partner Directly",
                      "Plan Meetings and Dates",
                      "Add to Watchlist for Shortlisting",
                      "View all Partner Data",
                      "Marriage Planning Assistance",
                    ]}
                    price="1999"
                    popular={true}
                    currentPlan={membershipPlan === "premium" ? "Premium Membership" : null}
                    handlePayment={handlePayment}
                    loadingPayment={loadingStates.payment}
                    handleSubmit={() => {
                      // Not used for premium - handled by handlePayment
                    }}
                    membershipDates={membershipDates}
                  />
                </div>
              </div>
            )}

            {activeSection === "post" && (
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <MdPublishedWithChanges className="text-2xl text-[oklch(70.4%_0.191_22.216)]" />
                  <h2 className="text-xl font-bold text-gray-800">Profile Publishing</h2>
                </div>

                {/* Always show completion status, even if published */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <FiInfo className="text-blue-600 text-2xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Profile Completion Status
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">Self Information</span>
                            <span className={`text-sm font-semibold ${profileProgress.self >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                              {profileProgress.self}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${profileProgress.self >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
                              style={{ width: `${profileProgress.self}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">Family Information</span>
                            <span className={`text-sm font-semibold ${profileProgress.family >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                              {profileProgress.family}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${profileProgress.family >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
                              style={{ width: `${profileProgress.family}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">Partner Preferences</span>
                            <span className={`text-sm font-semibold ${profileProgress.partner >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                              {profileProgress.partner}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${profileProgress.partner >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
                              style={{ width: `${profileProgress.partner}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="pt-3 border-t">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-800">Overall Progress</span>
                            <span className={`font-bold ${profileCompleted ? 'text-green-600' : 'text-yellow-600'}`}>
                              {Math.round((profileProgress.self + profileProgress.family + profileProgress.partner) / 3)}%
                            </span>
                          </div>
                          <p className={`text-sm mt-1 ${profileCompleted ? 'text-green-700' : 'text-yellow-700'}`}>
                            {profileCompleted
                              ? "✓ All sections have at least 80% completion. Ready to publish!"
                              : `⚠ Need at least 80% in all sections. Current: Self ${profileProgress.self}%, Family ${profileProgress.family}%, Partner ${profileProgress.partner}%`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Information Section */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <MdOutlineContactSupport className="text-blue-600 text-2xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Important Information
                      </h3>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-2">
                          <FiCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                          <span>Complete all profile sections before publishing</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <FiCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                          <span>Published profiles are visible to all registered members</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <FiCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                          <span>You can edit your profile anytime</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <FiCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                          <span>Use "Hide Profile" to temporarily hide your profile</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <FiCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                          <span>Use "Delete Profile" to permanently remove all your data</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Publish/Unpublish Button */}
                <div className="flex justify-center">
                  {isProfilePublished ? (
                    <div className="text-center">
                      <p className="text-green-600 font-medium mb-4">
                        ✓ Your profile is currently published and visible to other members.
                      </p>
                      <div className="flex gap-4 justify-center">
                        <button
                          onClick={handleRemoveProfile}
                          disabled={loadingStates.removeProfile}
                          className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {loadingStates.removeProfile ? (
                            <>
                              <FiLoader className="animate-spin inline mr-2" />
                              Hiding...
                            </>
                          ) : (
                            "Hide Profile"
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handlePostProfile}
                      disabled={!profileCompleted || loadingStates.postProfile}
                      className={`px-6 py-3 rounded-lg font-medium transition ${!profileCompleted || loadingStates.postProfile
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[oklch(70.4%_0.191_22.216)] text-white hover:opacity-90'
                        }`}
                    >
                      {loadingStates.postProfile ? (
                        <>
                          <FiLoader className="animate-spin inline mr-2" />
                          Publishing...
                        </>
                      ) : (
                        "Publish Profile"
                      )}
                    </button>
                  )}
                </div>
                {!profileCompleted && !isProfilePublished && (
                  <p className="text-center text-red-500 text-sm mt-4">
                    Cannot publish profile. All sections must be at least 80% complete.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Profile;