import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Chatbot from '../components/Chatbot';
import Kundali from '../components/Kundali';
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
  FiInfo,
  FiUser,
  FiHome,
  FiBriefcase,
  FiUsers,
  FiLogOut,
  FiSend,
  FiChevronDown,
  FiChevronUp,
  FiPlusCircle
} from "react-icons/fi";
import {
  MdOutlineWorkspacePremium,
  MdOutlineContactSupport,
  MdPublishedWithChanges,
  MdOutlineRemoveCircle,
  MdWarning,
  MdDateRange,
  MdLocationOn,
  MdSchool,
  MdWork,
  MdFamilyRestroom
} from "react-icons/md";
import axios from "axios";

// Jeewansathi inspired color theme
const PRIMARY_COLOR = "#dc2626";
const SECONDARY_COLOR = "#fecaca";
const BG_COLOR = "#fef2f2";
const TEXT_COLOR = "#374151";
const LIGHT_TEXT = "#6b7280";

// OKLCH Theme Color
const THEME = "oklch(70.4% 0.191 22.216)";
const THEME_LIGHT = "oklch(85% 0.12 22.216)";
const THEME_SOFT = "oklch(95% 0.05 22.216)";

const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "#fff",
    borderColor: state.isFocused ? THEME : "#d1d5db",
    borderRadius: "0.375rem",
    padding: "0.3rem 0.5rem",
    minHeight: "2.75rem",
    boxShadow: state.isFocused
      ? "0 0 0 2px oklch(70.4% 0.191 22.216 / 0.2)"
      : "none",
    "&:hover": {
      borderColor: THEME
    },
    fontSize: "0.875rem",
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? THEME
      : state.isFocused
        ? THEME_SOFT
        : "#fff",
    color: state.isSelected ? "#fff" : "#111827",
    padding: "0.625rem 1rem",
    fontSize: "0.875rem",
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    cursor: "pointer",
    "&:active": {
      backgroundColor: THEME_LIGHT
    }
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "0.375rem",
    boxShadow:
      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    zIndex: 9999
  }),
  menuList: (base) => ({
    ...base,
    padding: "0.5rem"
  }),
  placeholder: (base) => ({
    ...base,
    color: "#6b7280",
    fontSize: "0.875rem"
  }),
  singleValue: (base) => ({
    ...base,
    color: "#111827",
    fontSize: "0.875rem"
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "#6b7280",
    "&:hover": {
      color: THEME
    }
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999
  })
};

// Enhanced Input component with trim functionality
const Input = ({ label, type = "text", value, onChange, options = [], placeholder = "", isEditing = true, onBlur, isProtected = false, icon: Icon }) => {
  if (type === "select") {
    const selectOptions = options.map(opt => ({ value: opt, label: opt }));
    const currentValue = selectOptions.find(opt => opt.value === value) || null;

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <div className="relative">
          {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />}
          <Select
            styles={customSelectStyles}
            options={selectOptions}
            value={currentValue}
            onChange={(selected) => onChange(selected?.value || "")}
            placeholder={`Select ${label}`}
            isDisabled={!isEditing || isProtected}
            isSearchable={true}
            className={`react-select-container ${Icon ? 'pl-10' : ''}`}
            classNamePrefix="react-select"
          />
        </div>
        {isProtected && (
          <p className="text-xs text-amber-600 mt-1">
            <FiInfo className="inline mr-1" size={12} />
            This field cannot be changed
          </p>
        )}
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
            className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[${PRIMARY_COLOR}] focus:border-transparent transition text-gray-700 ${Icon ? 'pl-10' : ''}`}
            disabled={!isEditing || isProtected}
            maxDate={new Date()}
            showYearDropdown
            showMonthDropdown
            dropdownMode="select"
            yearDropdownItemNumber={50}
            scrollableYearDropdown
          />
          {Icon ? <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /> : <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />}
        </div>
        {isProtected && (
          <p className="text-xs text-amber-600 mt-1">
            <FiInfo className="inline mr-1" size={12} />
            This field cannot be changed
          </p>
        )}
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
      const limitedDigits = digitsOnly.slice(0, 10);

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
        <div className="relative">
          <input
            type="tel"
            className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[${PRIMARY_COLOR}] focus:border-transparent transition text-gray-700 ${Icon ? 'pl-10' : ''}`}
            value={formatPhoneNumber(value)}
            onChange={handlePhoneChange}
            placeholder="987-654-3210"
            disabled={!isEditing}
            maxLength={12}
            onBlur={() => onBlur && onBlur(value)}
          />
          {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />}
        </div>
        <p className="mt-1 text-xs text-gray-500">Enter 10-digit Indian mobile number</p>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[${PRIMARY_COLOR}] focus:border-transparent transition text-gray-700 placeholder-gray-400 ${Icon ? 'pl-10' : ''}`}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => {
            const trimmedValue = e.target.value.trim();
            if (trimmedValue !== e.target.value) {
              onChange(trimmedValue);
            }
            onBlur && onBlur(trimmedValue);
          }}
          disabled={!isEditing || isProtected}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          step={type === "number" ? "any" : undefined}
        />
        {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />}
      </div>
      {isProtected && (
        <p className="text-xs text-amber-600 mt-1">
          <FiInfo className="inline mr-1" size={12} />
          This field cannot be changed
        </p>
      )}
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
          className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[${PRIMARY_COLOR}] focus:border-transparent transition text-gray-700 placeholder-gray-400"
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
          {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>
      </div>
    </div>
  );
};

// Textarea component with trim functionality
const Textarea = ({ label, value, onChange, rows = 4, placeholder = "", isEditing = true, icon: Icon }) => (
  <div className="col-span-2">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="relative">
      <textarea
        className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[${PRIMARY_COLOR}] focus:border-transparent transition text-gray-700 placeholder-gray-400 resize-y ${Icon ? 'pl-10' : ''}`}
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
      {Icon && <Icon className="absolute left-3 top-3 text-gray-400" />}
    </div>
  </div>
);

// Section component with Jeewansathi style
const Section = ({ title, children, icon: Icon }) => (
  <div className="mb-6 bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
    <div className="flex items-center gap-2 mb-4">
      {Icon && <Icon className="text-red-500" size={20} />}
      <h3 className="text-lg font-semibold text-gray-800">
        {title}
      </h3>
    </div>
    {children}
  </div>
);

// ========== NEW ACCORDION FORM BOX ==========
const AccordionFormBox = ({ title, children, isOpen, onToggle, icon: Icon, sectionProgress }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5 md:p-6 mb-4 transition-all duration-200">
      <div
        className="flex justify-between items-center cursor-pointer group"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 flex-1">
          {Icon && <Icon className="text-red-500 text-xl" />}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800 group-hover:text-red-600 transition-colors">
              {title}
            </h2>
            {sectionProgress !== undefined && (
              <div className="mt-1 flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${sectionProgress >= 80 ? 'bg-green-500' : sectionProgress >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(sectionProgress, 100)}%` }}
                  ></div>
                </div>
                <span className={`text-xs font-semibold ${sectionProgress >= 80 ? 'text-green-600' : sectionProgress >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                  {sectionProgress}%
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="p-2 rounded-full bg-gray-100 group-hover:bg-red-100 transition-colors">
          {isOpen ? (
            <FiChevronUp className="text-gray-600 group-hover:text-red-600" size={20} />
          ) : (
            <FiChevronDown className="text-gray-600 group-hover:text-red-600" size={20} />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="mt-6 border-t border-gray-100 pt-6">
          {children}
        </div>
      )}
    </div>
  );
};

// ========== ENHANCED PREVIEW COMPONENTS ==========

// Helper function to check if value exists and is meaningful
const hasValue = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed !== '' && trimmed !== '0' && trimmed !== 'Select' && trimmed !== 'No Preference' && trimmed !== 'Any' && trimmed !== 'No' && trimmed !== 'Yes';
  }
  if (typeof value === 'number') return value > 0;
  return false;
};

// Helper function to format display value
const formatDisplayValue = (value) => {
  if (!hasValue(value)) return null;
  return value.toString().trim();
};

// Empty State Component
const EmptyStatePreview = ({ onEdit, title, icon: Icon }) => (
  <div className="flex flex-col items-center justify-center py-10 px-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-red-200">
    <div className="w-20 h-20 bg-gradient-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center mb-4">
      {Icon && <Icon className="text-red-500 text-4xl" />}
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">No {title} Added Yet</h3>
    <p className="text-gray-500 text-center mb-6 max-w-md">
      Add your {title.toLowerCase()} to help other members know you better and find the perfect match.
    </p>
    <button
      onClick={onEdit}
      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
    >
      <FiPlusCircle className="text-lg" />
      Add {title}
    </button>
  </div>
);

// Info Card Component for consistent styling
const InfoCard = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden ${className}`}>
    <div className="px-2 sm:px-4 py-2 sm:py-3">
      {children}
    </div>
  </div>
);

// Info Row Component for consistent field display
const InfoRow = ({ label, value, icon: Icon }) => {
  const displayValue = formatDisplayValue(value);
  if (!displayValue) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-2 px-2 sm:px-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
        <div className="flex-shrink-0 w-5 h-5">
          {Icon ? (
            <Icon className="text-red-500 text-sm sm:text-base" />
          ) : (
            <div className="w-1.5 h-1.5 mt-1.5 bg-red-500 rounded-full"></div>
          )}
        </div>
        <span className="text-xs sm:text-sm font-semibold text-gray-900 min-w-[100px] sm:min-w-[120px]">
          {label}:
        </span>
      </div>
      <span className="text-xs sm:text-sm text-gray-600 break-words pl-7 sm:pl-0 flex-1">
        {displayValue}
        {label.includes('Height') && value && ' cm'}
        {label.includes('Weight') && value && ' kg'}
      </span>
    </div>
  );
};

// Section Header Component
const SectionHeader = ({ title, icon: Icon, count }) => {
  if (!count) return null;
  return (
    <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3 pb-1 sm:pb-2 border-b border-gray-100">
      <div className="p-1 sm:p-1.5 bg-red-50 rounded-lg">
        {Icon && <Icon className="text-red-600 text-sm sm:text-lg" />}
      </div>
      <h4 className="text-sm sm:text-base font-semibold text-gray-800">
        {title}
      </h4>
    </div>
  );
};

// ========== SELF PREVIEW ==========
const SelfPreview = ({ personalInfo, locationInfo, religionInfo, educationInfo, careerInfo, aboutYourself, onEdit }) => {
  // Check if any data exists
  const hasAnyData = () => {
    const allFields = [
      personalInfo.profileImg,
      personalInfo.fullName,
      personalInfo.gender,
      personalInfo.dob,
      personalInfo.age,
      personalInfo.maritalStatus,
      personalInfo.height,
      personalInfo.weight,
      personalInfo.bloodGroup,
      personalInfo.disability,
      personalInfo.contactNumber,
      personalInfo.whatsappNumber,
      locationInfo.country,
      locationInfo.state,
      locationInfo.city,
      locationInfo.pinCode,
      locationInfo.currentLocation,
      locationInfo.permanentAddress,
      religionInfo.religion,
      religionInfo.caste,
      religionInfo.motherTongue,
      educationInfo.highestEducation,
      educationInfo.yearOfPassing,
      educationInfo.university,
      careerInfo.profession,
      careerInfo.jobTitle,
      careerInfo.companyName,
      careerInfo.employmentType,
      careerInfo.annualIncome,
      careerInfo.workLocation,
      aboutYourself
    ];
    return allFields.some(field => hasValue(field));
  };

  if (!hasAnyData()) {
    return <EmptyStatePreview onEdit={onEdit} title="Self Information" icon={FiUser} />;
  }

  // Collect all non-empty sections with their fields count
  const sections = [];

  // Personal Details Section
  const personalFields = [
    { label: "Full Name", value: personalInfo.fullName, icon: FiUser },
    { label: "Gender", value: personalInfo.gender, icon: FiUser },
    { label: "Date of Birth", value: personalInfo.dob ? new Date(personalInfo.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null, icon: MdDateRange },
    { label: "Age", value: personalInfo.age, icon: FiUser },
    { label: "Marital Status", value: personalInfo.maritalStatus, icon: FiHeart },
    { label: "Height", value: personalInfo.height, icon: FiUser },
    { label: "Weight", value: personalInfo.weight, icon: FiUser },
    { label: "Blood Group", value: personalInfo.bloodGroup, icon: FiInfo },
    { label: "Disability", value: personalInfo.disability === "Yes" ? "Yes" : null, icon: MdWarning },
    { label: "Contact Number", value: personalInfo.contactNumber, icon: FiMessageSquare },
    { label: "WhatsApp Number", value: personalInfo.whatsappNumber, icon: FiMessageSquare }
  ].filter(field => hasValue(field.value));

  if (personalFields.length > 0) {
    sections.push({
      title: "Personal Details",
      icon: FiUser,
      fields: personalFields,
      count: personalFields.length
    });
  }

  // Location Section
  const locationFields = [
    { label: "Country", value: locationInfo.country, icon: MdLocationOn },
    { label: "State", value: locationInfo.state, icon: MdLocationOn },
    { label: "City", value: locationInfo.city, icon: MdLocationOn },
    { label: "Pin Code", value: locationInfo.pinCode, icon: MdLocationOn },
    { label: "Current Town", value: locationInfo.currentLocation, icon: FiHome },
    { label: "Permanent Address", value: locationInfo.permanentAddress, icon: FiHome }
  ].filter(field => hasValue(field.value));

  if (locationFields.length > 0) {
    sections.push({
      title: "Location",
      icon: MdLocationOn,
      fields: locationFields,
      count: locationFields.length
    });
  }

  // Religion Section
  const religionFields = [
    { label: "Religion", value: religionInfo.religion, icon: MdFamilyRestroom },
    { label: "Caste", value: religionInfo.caste, icon: MdFamilyRestroom },
    { label: "Mother Tongue", value: religionInfo.motherTongue, icon: MdFamilyRestroom }
  ].filter(field => hasValue(field.value));

  if (religionFields.length > 0) {
    sections.push({
      title: "Religion & Caste",
      icon: MdFamilyRestroom,
      fields: religionFields,
      count: religionFields.length
    });
  }

  // Education Section
  const educationFields = [
    { label: "Highest Education", value: educationInfo.highestEducation, icon: MdSchool },
    { label: "Year of Passing", value: educationInfo.yearOfPassing ? new Date(educationInfo.yearOfPassing).getFullYear() : null, icon: MdDateRange },
    { label: "University/College", value: educationInfo.university, icon: MdSchool }
  ].filter(field => hasValue(field.value));

  if (educationFields.length > 0) {
    sections.push({
      title: "Education",
      icon: MdSchool,
      fields: educationFields,
      count: educationFields.length
    });
  }

  // Career Section
  const careerFields = [
    { label: "Profession", value: careerInfo.profession, icon: MdWork },
    { label: "Job Title", value: careerInfo.jobTitle, icon: MdWork },
    { label: "Company Name", value: careerInfo.companyName, icon: FiBriefcase },
    { label: "Employment Type", value: careerInfo.employmentType, icon: MdWork },
    { label: "Annual Income", value: careerInfo.annualIncome, icon: FiDollarSign },
    { label: "Work Location", value: careerInfo.workLocation, icon: MdLocationOn }
  ].filter(field => hasValue(field.value));

  if (careerFields.length > 0) {
    sections.push({
      title: "Career",
      icon: MdWork,
      fields: careerFields,
      count: careerFields.length
    });
  }

  // About Yourself Section
  const hasAbout = hasValue(aboutYourself);

  return (
    <div className="space-y-3 sm:space-y-5">
      {/* Profile Image Header - Only show if image exists */}
      {hasValue(personalInfo.profileImg) && (
        <InfoCard>
          <div className="flex items-center gap-4 p-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow">
                <img
                  src={personalInfo.profileImg}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = "/5.png"; }}
                />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {formatDisplayValue(personalInfo.fullName) || 'Your Name'}
              </h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {hasValue(personalInfo.age) && (
                  <span className="text-xs text-gray-600">
                    Age: {personalInfo.age} yrs
                  </span>
                )}
                {hasValue(personalInfo.gender) && (
                  <span className="text-xs text-gray-600">
                    • {personalInfo.gender}
                  </span>
                )}
                {hasValue(personalInfo.maritalStatus) && (
                  <span className="text-xs text-gray-600">
                    • {personalInfo.maritalStatus}
                  </span>
                )}
              </div>
            </div>
          </div>
        </InfoCard>
      )}

      {/* Dynamic Sections - Only render if they have fields */}
      {sections.map((section, idx) => (
        <InfoCard key={idx}>
          <div className="p-4">
            <SectionHeader title={section.title} icon={section.icon} count={section.count} />
            <div className="space-y-0.5">
              {section.fields.map((field, fieldIdx) => (
                <InfoRow key={fieldIdx} label={field.label} value={field.value} icon={field.icon} />
              ))}
            </div>
          </div>
        </InfoCard>
      ))}

      {/* About Yourself - Only if has content */}
      {hasAbout && (
        <InfoCard>
          <div className="p-4">
            <SectionHeader title="About Yourself" icon={FiUser} count={1} />
            <div className="mt-2">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {aboutYourself.trim()}
              </p>
            </div>
          </div>
        </InfoCard>
      )}

      {/* Profile Image Missing Warning */}
      {!hasValue(personalInfo.profileImg) && hasAnyData() && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
          <MdWarning className="text-amber-500 text-lg flex-shrink-0" />
          <p className="text-xs text-amber-700">
            Profile image missing
          </p>
          <button
            onClick={onEdit}
            className="ml-auto text-xs bg-amber-500 text-white px-3 py-1 rounded-md"
          >
            Upload
          </button>
        </div>
      )}
    </div>
  );
};

// ========== FAMILY PREVIEW ==========
const FamilyPreview = ({ familyInfo, aboutFamily, onEdit }) => {
  // Check if any data exists
  const hasAnyData = () => {
    const allFields = [
      familyInfo.fatherName,
      familyInfo.fatherOccupation,
      familyInfo.motherName,
      familyInfo.motherOccupation,
      familyInfo.brothers,
      familyInfo.sisters,
      familyInfo.familyType,
      familyInfo.familyStatus,
      familyInfo.familyLocation,
      familyInfo.nativePlace,
      aboutFamily
    ];
    return allFields.some(field => hasValue(field));
  };

  if (!hasAnyData()) {
    return <EmptyStatePreview onEdit={onEdit} title="Family Information" icon={MdFamilyRestroom} />;
  }

  // Collect all non-empty sections
  const sections = [];

  // Parents Information
  const parentsFields = [
    { label: "Father's Name", value: familyInfo.fatherName, icon: FiUser },
    { label: "Father's Occupation", value: familyInfo.fatherOccupation, icon: MdWork },
    { label: "Mother's Name", value: familyInfo.motherName, icon: FiUser },
    { label: "Mother's Occupation", value: familyInfo.motherOccupation, icon: MdWork }
  ].filter(field => hasValue(field.value));

  if (parentsFields.length > 0) {
    sections.push({
      title: "Parents",
      icon: MdFamilyRestroom,
      fields: parentsFields,
      count: parentsFields.length
    });
  }

  // Siblings Information
  const siblingsFields = [];
  if (hasValue(familyInfo.brothers) && familyInfo.brothers > 0) {
    siblingsFields.push({ label: "Brothers", value: familyInfo.brothers, icon: FiUsers });
  }
  if (hasValue(familyInfo.sisters) && familyInfo.sisters > 0) {
    siblingsFields.push({ label: "Sisters", value: familyInfo.sisters, icon: FiUsers });
  }

  if (siblingsFields.length > 0) {
    sections.push({
      title: "Siblings",
      icon: FiUsers,
      fields: siblingsFields,
      count: siblingsFields.length
    });
  }

  // Family Background
  const backgroundFields = [
    { label: "Family Type", value: familyInfo.familyType, icon: FiHome },
    { label: "Family Status", value: familyInfo.familyStatus, icon: FiHome },
    { label: "Family Location", value: familyInfo.familyLocation, icon: MdLocationOn },
    { label: "Native Place", value: familyInfo.nativePlace, icon: MdLocationOn }
  ].filter(field => hasValue(field.value));

  if (backgroundFields.length > 0) {
    sections.push({
      title: "Background",
      icon: FiHome,
      fields: backgroundFields,
      count: backgroundFields.length
    });
  }

  const hasAbout = hasValue(aboutFamily);

  return (
    <div className="space-y-5">
      {/* Dynamic Sections */}
      {sections.map((section, idx) => (
        <InfoCard key={idx}>
          <div className="p-4">
            <SectionHeader title={section.title} icon={section.icon} count={section.count} />
            <div className="space-y-0.5">
              {section.fields.map((field, fieldIdx) => (
                <InfoRow key={fieldIdx} label={field.label} value={field.value} icon={field.icon} />
              ))}
            </div>
          </div>
        </InfoCard>
      ))}

      {/* About Family */}
      {hasAbout && (
        <InfoCard>
          <div className="p-4">
            <SectionHeader title="About Family" icon={MdFamilyRestroom} count={1} />
            <div className="mt-2">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {aboutFamily.trim()}
              </p>
            </div>
          </div>
        </InfoCard>
      )}
    </div>
  );
};

// ========== PARTNER PREVIEW ==========
const PartnerPreview = ({ partnerInfo, onEdit }) => {
  // Check if any data exists
  const hasAnyData = () => {
    const allFields = [
      partnerInfo.preferredAgeRange,
      partnerInfo.preferredHeight,
      partnerInfo.preferredMaritalStatus,
      partnerInfo.preferredReligion,
      partnerInfo.preferredCaste,
      partnerInfo.preferredMotherTongue,
      partnerInfo.preferredEducation,
      partnerInfo.preferredProfession,
      partnerInfo.preferredIncome,
      partnerInfo.preferredLocation,
      partnerInfo.settledIn,
      partnerInfo.lookingFor
    ];
    return allFields.some(field => hasValue(field));
  };

  if (!hasAnyData()) {
    return <EmptyStatePreview onEdit={onEdit} title="Partner Preferences" icon={FiUsers} />;
  }

  // Collect all non-empty sections
  const sections = [];

  // Basic Preferences
  const basicFields = [
    { label: "Age Range", value: partnerInfo.preferredAgeRange, icon: FiUsers },
    { label: "Height", value: partnerInfo.preferredHeight, icon: FiUser },
    { label: "Marital Status", value: partnerInfo.preferredMaritalStatus, icon: FiHeart }
  ].filter(field => hasValue(field.value));

  if (basicFields.length > 0) {
    sections.push({
      title: "Basic",
      icon: FiUsers,
      fields: basicFields,
      count: basicFields.length
    });
  }

  // Background Preferences
  const backgroundFields = [
    { label: "Religion", value: partnerInfo.preferredReligion, icon: MdFamilyRestroom },
    { label: "Caste", value: partnerInfo.preferredCaste, icon: MdFamilyRestroom },
    { label: "Mother Tongue", value: partnerInfo.preferredMotherTongue, icon: MdFamilyRestroom }
  ].filter(field => hasValue(field.value));

  if (backgroundFields.length > 0) {
    sections.push({
      title: "Background",
      icon: MdFamilyRestroom,
      fields: backgroundFields,
      count: backgroundFields.length
    });
  }

  // Career & Education Preferences
  const careerFields = [
    { label: "Education", value: partnerInfo.preferredEducation, icon: MdSchool },
    { label: "Profession", value: partnerInfo.preferredProfession, icon: MdWork },
    { label: "Income", value: partnerInfo.preferredIncome, icon: FiDollarSign }
  ].filter(field => hasValue(field.value));

  if (careerFields.length > 0) {
    sections.push({
      title: "Career & Education",
      icon: MdSchool,
      fields: careerFields,
      count: careerFields.length
    });
  }

  // Location Preferences
  const locationFields = [
    { label: "Location", value: partnerInfo.preferredLocation, icon: MdLocationOn },
    { label: "Settled In", value: partnerInfo.settledIn, icon: MdLocationOn }
  ].filter(field => hasValue(field.value));

  if (locationFields.length > 0) {
    sections.push({
      title: "Location",
      icon: MdLocationOn,
      fields: locationFields,
      count: locationFields.length
    });
  }

  // Looking For
  const hasLookingFor = hasValue(partnerInfo.lookingFor);

  return (
    <div className="space-y-5">
      {/* Dynamic Sections */}
      {sections.map((section, idx) => (
        <InfoCard key={idx}>
          <div className="p-4">
            <SectionHeader title={section.title} icon={section.icon} count={section.count} />
            <div className="space-y-0.5">
              {section.fields.map((field, fieldIdx) => (
                <InfoRow key={fieldIdx} label={field.label} value={field.value} icon={field.icon} />
              ))}
            </div>
          </div>
        </InfoCard>
      ))}

      {/* Looking For */}
      {hasLookingFor && (
        <InfoCard>
          <div className="p-4">
            <SectionHeader title="Looking For" icon={FiUsers} count={1} />
            <div className="mt-2">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {partnerInfo.lookingFor.trim()}
              </p>
            </div>
          </div>
        </InfoCard>
      )}
    </div>
  );
};

// Custom Button Components with consistent styles
const PrimaryButton = ({ children, onClick, loading = false, disabled = false, className = "", icon: Icon }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className={`
      relative overflow-hidden group
      px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 
      text-white font-semibold rounded-lg
      shadow-md hover:shadow-lg 
      transform transition-all duration-200
      hover:scale-[1.02] active:scale-[0.98]
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
      focus:outline-none
      ${className}
    `}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
    <div className="relative flex items-center justify-center gap-2">
      {loading ? (
        <>
          <FiLoader className="animate-spin" size={18} />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={18} />}
          {children}
        </>
      )}
    </div>
  </button>
);

const SecondaryButton = ({ children, onClick, loading = false, disabled = false, className = "", icon: Icon }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className={`
      relative overflow-hidden group
      px-6 py-2.5 bg-white text-gray-700 font-semibold rounded-lg
      border-2 border-red-200 hover:border-red-500
      shadow-sm hover:shadow-md
      transform transition-all duration-200
      hover:scale-[1.02] active:scale-[0.98]
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
      focus:outline-none
      ${className}
    `}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="relative flex items-center justify-center gap-2">
      {loading ? (
        <>
          <FiLoader className="animate-spin" size={18} />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={18} className="text-red-500" />}
          {children}
        </>
      )}
    </div>
  </button>
);

const OutlineButton = ({ children, onClick, loading = false, disabled = false, className = "", icon: Icon }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className={`
      px-4 py-2 bg-transparent text-gray-600 font-medium rounded-lg
      border border-gray-300 hover:border-red-500 hover:text-red-600
      transform transition-all duration-200
      hover:scale-[1.02] active:scale-[0.98]
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
      focus:outline-none
      ${className}
    `}
  >
    <div className="flex items-center justify-center gap-2">
      {loading ? (
        <FiLoader className="animate-spin" size={18} />
      ) : (
        <>
          {Icon && <Icon size={18} />}
          {children}
        </>
      )}
    </div>
  </button>
);

const IconButton = ({ children, onClick, loading = false, disabled = false, className = "" }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className={`
      p-2 rounded-lg bg-gray-100 hover:bg-red-100 
      text-gray-600 hover:text-red-600
      transform transition-all duration-200
      hover:scale-110 active:scale-95
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
      focus:outline-none
      ${className}
    `}
  >
    {loading ? <FiLoader className="animate-spin" size={18} /> : children}
  </button>
);

const SubmitButton = ({ text, onClick, loading = false, disabled = false, icon: Icon = FiSave }) => (
  <PrimaryButton onClick={onClick} loading={loading} disabled={disabled} icon={Icon}>
    {text}
  </PrimaryButton>
);

const LoadingButton = ({ children, onClick, loading = false, disabled = false, className = "", variant = "primary" }) => {
  if (variant === "primary") {
    return (
      <PrimaryButton onClick={onClick} loading={loading} disabled={disabled} className={className}>
        {children}
      </PrimaryButton>
    );
  }
  if (variant === "secondary") {
    return (
      <SecondaryButton onClick={onClick} loading={loading} disabled={disabled} className={className}>
        {children}
      </SecondaryButton>
    );
  }
  return (
    <OutlineButton onClick={onClick} loading={loading} disabled={disabled} className={className}>
      {children}
    </OutlineButton>
  );
};

// MembershipCard component - Jeewansathi style
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
  const isPremiumUser = currentPlan === "Premium Membership";
  const isCurrentPlan = currentPlan === type;

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
    <div className={`relative border rounded-xl p-6 transition-all duration-300 ${popular ? 'border-red-500 shadow-lg ring-2 ring-red-500 ring-opacity-20' : 'border-gray-200 hover:border-red-300'}`}>
      {popular && (
        <div className="absolute -top-2 sm:-top-3 left-1/2 -translate-x-1/2">
          <span className="
      bg-gradient-to-r from-red-500 to-red-600 text-white
      px-2 sm:px-3 md:px-4
      py-0.5 sm:py-1
      rounded-full
      text-[10px] sm:text-xs md:text-sm
      font-semibold
      shadow-md sm:shadow-lg
      whitespace-nowrap
    ">
            MOST POPULAR
          </span>
        </div>
      )}

      <div className="text-center mb-6 pt-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{type}</h3>
        <div className="flex items-center justify-center gap-1">
          <span className="text-3xl font-bold text-gray-900">
            {type === "Free Membership" ? "₹0" : `₹${price}`}
          </span>
          <span className="text-gray-500 text-sm">/year</span>
        </div>
      </div>

      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <FiCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
            <span className="text-sm text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      {type === "Free Membership" ? (
        <LoadingButton
          onClick={() => handleSubmit("Membership Plan")}
          loading={false}
          disabled={isCurrentPlan || isPremiumUser}
          className="w-full py-3"
          variant={isCurrentPlan ? "secondary" : "primary"}
          icon={isCurrentPlan ? FiCheckCircle : null}
        >
          {isCurrentPlan ? (
            "Current Plan"
          ) : isPremiumUser ? (
            "Premium User"
          ) : (
            "Select Free Plan"
          )}
        </LoadingButton>
      ) : (
        <LoadingButton
          onClick={() => handlePayment("premium", price)}
          loading={loadingPayment}
          disabled={isCurrentPlan}
          className="w-full py-3"
          variant={isCurrentPlan ? "secondary" : "primary"}
          icon={isCurrentPlan ? FiCheckCircle : MdOutlineWorkspacePremium}
        >
          {isCurrentPlan ? (
            "Current Plan"
          ) : (
            "Upgrade Now"
          )}
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
  const sidebarRef = useRef(null);
  const [showFeedbackBox, setShowFeedbackBox] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [activeSection, setActiveSection] = useState("self");
  const [showKundali, setShowKundali] = useState(false);

  // ========== NEW EDIT STATES ==========
  const [isEditingSelf, setIsEditingSelf] = useState(false);
  const [isEditingFamily, setIsEditingFamily] = useState(false);
  const [isEditingPartner, setIsEditingPartner] = useState(false);

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

  // ========== ACCORDION STATE ==========
  const [openSections, setOpenSections] = useState({
    self: true,
    family: false,
    partner: false,
    plan: false,
    post: false
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const [coreFieldsSet, setCoreFieldsSet] = useState(false);

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
    disability: "",
    contactNumber: "",
    whatsappNumber: "",
  });

  const [locationInfo, setLocationInfo] = useState({
    country: "",
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
    employmentType: "",
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
    familyType: "",
    familyStatus: "",
    familyLocation: "",
    nativePlace: "",
  });

  const [partnerInfo, setPartnerInfo] = useState({
    preferredAgeRange: "",
    preferredHeight: "",
    preferredMaritalStatus: "",
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

  const calculateSectionCompletion = (section) => {
    let filledFields = 0;
    let totalWeight = 0;

    const REQUIRED_WEIGHT = 2;
    const OPTIONAL_WEIGHT = 1;

    switch (section) {
      case 'self':
        const selfFields = [
          {
            value: personalInfo.profileImg?.trim(),
            required: true,
            weight: REQUIRED_WEIGHT,
            validation: (val) => {
              if (!val || val.trim() === "") return false;
              if (val === "data:,") return false;
              if (val.includes("placeholder")) return false;
              if (val.includes("data:image/") && val.length < 100) return false;
              return true;
            }
          },
          { value: personalInfo.fullName?.trim(), required: true, weight: REQUIRED_WEIGHT },
          { value: personalInfo.gender, required: true, weight: REQUIRED_WEIGHT },
          { value: personalInfo.dob, required: true, weight: REQUIRED_WEIGHT },
          { value: personalInfo.age?.toString()?.trim(), required: true, weight: REQUIRED_WEIGHT },
          { value: personalInfo.maritalStatus, required: true, weight: REQUIRED_WEIGHT },
          {
            value: personalInfo.contactNumber?.toString()?.trim(), required: true, weight: REQUIRED_WEIGHT,
            validation: (val) => val?.length === 10 && ['6', '7', '8', '9'].includes(val[0])
          },
          { value: locationInfo.country, required: true, weight: REQUIRED_WEIGHT },
          { value: locationInfo.state?.trim(), required: true, weight: REQUIRED_WEIGHT },
          { value: locationInfo.city?.trim(), required: true, weight: REQUIRED_WEIGHT },
          { value: religionInfo.religion, required: true, weight: REQUIRED_WEIGHT },
          { value: religionInfo.caste?.trim(), required: true, weight: REQUIRED_WEIGHT },
          { value: educationInfo.highestEducation, required: true, weight: REQUIRED_WEIGHT },
          { value: careerInfo.profession, required: true, weight: REQUIRED_WEIGHT },
          { value: careerInfo.employmentType, required: true, weight: REQUIRED_WEIGHT },
          { value: careerInfo.annualIncome, required: true, weight: REQUIRED_WEIGHT },
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
        const familyFields = [
          { value: familyInfo.fatherName?.trim(), required: true, weight: REQUIRED_WEIGHT },
          { value: familyInfo.fatherOccupation?.trim(), required: true, weight: REQUIRED_WEIGHT },
          { value: familyInfo.motherName?.trim(), required: true, weight: REQUIRED_WEIGHT },
          { value: familyInfo.familyType, required: true, weight: REQUIRED_WEIGHT },
          { value: familyInfo.familyStatus, required: true, weight: REQUIRED_WEIGHT },
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
        const partnerFields = [
          { value: partnerInfo.preferredAgeRange, required: true, weight: REQUIRED_WEIGHT },
          { value: partnerInfo.preferredMaritalStatus, required: true, weight: REQUIRED_WEIGHT },
          { value: partnerInfo.preferredReligion, required: true, weight: REQUIRED_WEIGHT },
          { value: partnerInfo.preferredCaste?.trim(), required: true, weight: REQUIRED_WEIGHT },
          { value: partnerInfo.preferredEducation, required: true, weight: REQUIRED_WEIGHT },
          { value: partnerInfo.preferredProfession, required: true, weight: REQUIRED_WEIGHT },
          { value: partnerInfo.preferredIncome, required: true, weight: REQUIRED_WEIGHT },
          { value: partnerInfo.preferredLocation?.trim(), required: true, weight: REQUIRED_WEIGHT },
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

    const allComplete = Object.values(progress).every(p => p >= 80);
    setProfileCompleted(allComplete);

    return { progress, allComplete };
  };

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
      const paymentResponse = await axios.get(
        `${BACKEND_URL}/payment/check-membership/${user.email}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (paymentResponse.data) {
        setMembershipPlan(paymentResponse.data.membership_plan);
        setMembershipDates({
          membershipStartDate: paymentResponse.data.membershipStartDate || "",
          membershipExpiryDate: paymentResponse.data.membershipExpiryDate || ""
        });

        if (paymentResponse.data.membership_plan === "free" &&
          paymentResponse.data.membershipExpiryDate) {
          const expiryDate = new Date(paymentResponse.data.membershipExpiryDate);
          const today = new Date();

          if (expiryDate < today) {
            toast.info("Your Premium membership has expired. You are now on Free plan.");
          }
        }
      }
    } catch (error) {
      // Only log error if it's not a 500 for new users
      if (error.response?.status !== 500) {
        console.error("Error checking membership:", error);
      }
    }
  };

  useEffect(() => {
    if (user) {
      // Calculate overall profile completion percentage
      const calculateOverallProgress = () => {
        const selfProgress = calculateSectionCompletion('self');
        const familyProgress = calculateSectionCompletion('family');
        const partnerProgress = calculateSectionCompletion('partner');
        return Math.round((selfProgress + familyProgress + partnerProgress) / 3);
      };

      const overallProgress = calculateOverallProgress();

      // Only check membership status if profile is at least 80% complete
      if (overallProgress >= 80) {
        checkMembershipStatus();
      } else {
        // Set default values for incomplete profiles
        setMembershipPlan("free");
        setMembershipDates({
          membershipStartDate: "",
          membershipExpiryDate: ""
        });
      }
    }
  }, [user, personalInfo, locationInfo, religionInfo, educationInfo, careerInfo, familyInfo, partnerInfo, aboutYourself, aboutFamily]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#plan') {
      setActiveSection('plan');
      window.history.replaceState(null, '', '/profile');
    }
  }, []);

  const updateMembershipPlanInProfile = async (planType) => {
    if (membershipPlan === "premium" && planType === "free") {
      toast.error("Cannot switch back to Free plan once upgraded to Premium.");
      return;
    }

    try {
      const profileData = {
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

      await axios.post(
        `${BACKEND_URL}/profile/save`,
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMembershipPlan(planType);
      toast.success(`Plan updated to ${planType === "premium" ? "Premium" : "Free"}`);
    } catch (error) {
      console.error("Error updating plan:", error);
      toast.error("Failed to update plan");
    }
  };

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

        try {
          const response = await axios.get(
            `${BACKEND_URL}/profile/get/${parsedUser.email}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              timeout: 10000
            }
          );

          if (response.data && response.data.profile) {
            const profile = response.data.profile;
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

            const hasCoreFields = profile.personalInfo?.fullName &&
              profile.personalInfo?.dob &&
              profile.personalInfo?.gender;
            setCoreFieldsSet(!!hasCoreFields);

            if (profile.membershipStartDate || profile.membershipExpiryDate) {
              setMembershipDates({
                membershipStartDate: profile.membershipStartDate || "",
                membershipExpiryDate: profile.membershipExpiryDate || ""
              });
            }

            calculateAllProgress();
            updateUserProfile({
              userEmail: parsedUser.email,
              isProfilePublished: profile.isPublished || false,
              membershipType: profile.membershipPlan === "premium" ? "premium" : "free"
            });
          }
        } catch (error) {
          console.log("No existing profile found or error loading profile:", error.message);
          setCoreFieldsSet(false);
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
      if (err.response && err.response.status === 400) {
        toast.error("You have already submitted feedback in the last 24 hours. Please try again tomorrow.");
      } else if (err.response && err.response.status === 500) {
        toast.error("Server error. Please try again later.");
      } else if (err.message === "Network Error") {
        toast.error("Network error. Please check your connection and try again.");
      } else {
        toast.error(err.response?.data?.detail || "Failed to submit feedback");
      }
    } finally {
      setLoadingState('feedbackSubmit', false);
    }
  };

  const handleLogout = async () => {
    setLoadingState('logout', true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.id) {
        await axios.post(`${BACKEND_URL}/auth/logout`, {
          user_id: user.id,
        });
      }
    } catch (err) {
      console.error("Logout API error:", err);
    }

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

  // ✅ FIXED: validateSelfInfo function with proper image validation
  const validateSelfInfo = () => {
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

    // ✅ FIXED: Better profile image validation
    const hasValidProfileImage = () => {
      if (!personalInfo.profileImg || personalInfo.profileImg.trim() === "") {
        return false;
      }

      // Check for placeholder or empty data URL
      if (personalInfo.profileImg === "data:," ||
        personalInfo.profileImg.includes("placeholder") ||
        (personalInfo.profileImg.includes("data:image/") && personalInfo.profileImg.length < 100)) {
        return false;
      }

      return true;
    };

    if (!hasValidProfileImage()) {
      return { isValid: false, message: "Profile image is required. Please upload a clear profile picture." };
    }

    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(item => item.name).join(", ");
      return { isValid: false, message: `Missing required fields: ${fieldNames}` };
    }

    if (!trimmedPersonalInfo.contactNumber || trimmedPersonalInfo.contactNumber.length !== 10) {
      return { isValid: false, message: "Contact number must be exactly 10 digits" };
    }

    if (trimmedPersonalInfo.whatsappNumber && trimmedPersonalInfo.whatsappNumber.length !== 10) {
      return { isValid: false, message: "WhatsApp number must be 10 digits" };
    }

    if (trimmedPersonalInfo.contactNumber) {
      const firstDigit = trimmedPersonalInfo.contactNumber.charAt(0);
      if (!['6', '7', '8', '9'].includes(firstDigit)) {
        return { isValid: false, message: "Mobile number should start with 6, 7, 8, or 9" };
      }
    }

    const ageNum = parseInt(trimmedPersonalInfo.age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
      return { isValid: false, message: "Age must be between 18 and 100" };
    }

    if (trimmedPersonalInfo.dob) {
      const dobDate = new Date(trimmedPersonalInfo.dob);
      const today = new Date();
      let calculatedAge = today.getFullYear() - dobDate.getFullYear();
      const monthDiff = today.getMonth() - dobDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
        calculatedAge--;
      }

      if (Math.abs(calculatedAge - ageNum) > 1) {
        return {
          isValid: false,
          message: `Age (${ageNum}) doesn't match Date of Birth (would be ${calculatedAge} years old)`
        };
      }
    }

    const selfProgress = calculateSectionCompletion('self');
    if (selfProgress < 80) {
      return { isValid: false, message: `Self information only ${selfProgress}% complete` };
    }

    return { isValid: true, message: "Validation successful" };
  };

  const validateFamilyInfo = () => {
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

    if (isNaN(trimmedFamilyInfo.brothers) || trimmedFamilyInfo.brothers < 0) {
      return { isValid: false, message: "Invalid number of brothers" };
    }

    if (isNaN(trimmedFamilyInfo.sisters) || trimmedFamilyInfo.sisters < 0) {
      return { isValid: false, message: "Invalid number of sisters" };
    }

    const familyProgress = calculateSectionCompletion('family');
    if (familyProgress < 80) {
      return { isValid: false, message: `Family information only ${familyProgress}% complete` };
    }

    return { isValid: true, message: "Validation successful" };
  };

  const validatePartnerInfo = () => {
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

    if (trimmedPartnerInfo.preferredHeight && (isNaN(trimmedPartnerInfo.preferredHeight) || trimmedPartnerInfo.preferredHeight < 100 || trimmedPartnerInfo.preferredHeight > 250)) {
      return { isValid: false, message: "Preferred height must be between 100cm and 250cm" };
    }

    const partnerProgress = calculateSectionCompletion('partner');
    if (partnerProgress < 80) {
      return { isValid: false, message: `Partner preferences only ${partnerProgress}% complete` };
    }

    return { isValid: true, message: "Validation successful" };
  };

  const handleSubmit = async (section) => {
    if (!user || !user.email) {
      toast.error("User not found. Please log in again.");
      navigate("/login");
      return;
    }

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

    let validationResult = { isValid: false, message: "" };

    if (section === "Self") {
      validationResult = validateSelfInfo();
    } else if (section === "Family") {
      validationResult = validateFamilyInfo();
    } else if (section === "Partner Preferences") {
      validationResult = validatePartnerInfo();
    } else if (section === "Membership Plan") {
      validationResult = { isValid: true, message: "Validation successful" };
    }

    if (!validationResult.isValid) {
      toast.error(`Cannot save ${section}: ${validationResult.message}`);
      return;
    }

    setLoadingState('saveProfile', true);

    // ✅ FIXED: Add retry mechanism for network errors
    const maxRetries = 2;
    let retryCount = 0;
    let lastError = null;

    while (retryCount < maxRetries) {
      try {
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
          membershipPlan: membershipPlan,
          lastUpdated: new Date().toISOString()
        };

        if (isProfilePublished) {
          profileData.isPublished = true;
        }

        console.log(`Attempt ${retryCount + 1}: Saving profile data...`);

        const response = await axios.post(
          `${BACKEND_URL}/profile/save`,
          profileData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 second timeout
          }
        );

        console.log("Save response:", response.data);
        toast.success(`${section} information saved successfully!`);

        // Turn off edit mode after save
        if (section === "Self") {
          setIsEditingSelf(false);
        } else if (section === "Family") {
          setIsEditingFamily(false);
        } else if (section === "Partner Preferences") {
          setIsEditingPartner(false);
        }

        // Update state with trimmed values
        setPersonalInfo(trimmedPersonalInfo);
        setLocationInfo(trimmedLocationInfo);
        setReligionInfo(trimmedReligionInfo);
        setEducationInfo(trimmedEducationInfo);
        setCareerInfo(trimmedCareerInfo);
        setFamilyInfo(trimmedFamilyInfo);
        setPartnerInfo(trimmedPartnerInfo);
        setAboutYourself(trimmedAboutYourself);
        setAboutFamily(trimmedAboutFamily);

        if (section === "Self" && !coreFieldsSet) {
          setCoreFieldsSet(true);
        }

        calculateAllProgress();

        // ✅ Success - break the retry loop
        setLoadingState('saveProfile', false);
        return;

      } catch (err) {
        lastError = err;
        retryCount++;

        console.error(`Attempt ${retryCount} failed:`, err);

        // If it's not a network error, don't retry
        if (err.message !== "Network Error" && !err.code === 'ECONNABORTED') {
          break;
        }

        // Wait before retrying (exponential backoff)
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    }

    // ✅ All retries failed
    console.error("Save profile error after retries:", lastError);

    if (lastError?.message === "Network Error") {
      toast.error("Unable to connect to server. Please check your internet connection and try again.");
    } else if (lastError?.code === 'ECONNABORTED') {
      toast.error("Request timeout. Please try again.");
    } else if (lastError?.response?.status === 401) {
      toast.error("Session expired. Please login again.");
      navigate("/login");
    } else if (lastError?.response?.status === 400) {
      toast.error(lastError.response.data?.detail || "Invalid data. Please check all fields.");
    } else {
      toast.error(lastError?.response?.data?.detail || "Failed to save profile information. Please try again.");
    }

    setLoadingState('saveProfile', false);
  };

  // ✅ FIXED: handlePostProfile function with proper image validation
  const handlePostProfile = async () => {
    const { progress, allComplete } = calculateAllProgress();

    if (!allComplete) {
      const incompleteSections = [];
      if (progress.self < 80) incompleteSections.push(`Self (${progress.self}%)`);
      if (progress.family < 80) incompleteSections.push(`Family (${progress.family}%)`);
      if (progress.partner < 80) incompleteSections.push(`Partner (${progress.partner}%)`);
      toast.error(`Profile is incomplete. The following sections need at least 80%: ${incompleteSections.join(', ')}`);
      return;
    }

    // ✅ FIXED: Better profile image validation for publishing
    const hasValidProfileImage = () => {
      if (!personalInfo.profileImg || personalInfo.profileImg.trim() === "") {
        return false;
      }

      if (personalInfo.profileImg === "data:," ||
        personalInfo.profileImg.includes("placeholder") ||
        (personalInfo.profileImg.includes("data:image/") && personalInfo.profileImg.length < 100)) {
        return false;
      }

      return true;
    };

    if (!hasValidProfileImage()) {
      toast.error("Please upload a valid profile image before publishing");
      return;
    }

    const selfValidation = validateSelfInfo();
    const familyValidation = validateFamilyInfo();
    const partnerValidation = validatePartnerInfo();

    if (!selfValidation.isValid || !familyValidation.isValid || !partnerValidation.isValid) {
      toast.error("Cannot publish profile. Please complete all required fields.");
      return;
    }

    setLoadingState('postProfile', true);
    try {
      toast.info("Publishing profile...", { autoClose: false, toastId: "publishing" });

      const profileData = {
        email: user.email,
        personalInfo: {
          ...personalInfo,
          fullName: personalInfo.fullName?.trim(),
          contactNumber: personalInfo.contactNumber?.trim(),
          whatsappNumber: personalInfo.whatsappNumber?.trim()
        },
        locationInfo: {
          ...locationInfo,
          state: locationInfo.state?.trim(),
          city: locationInfo.city?.trim()
        },
        religionInfo: {
          ...religionInfo,
          caste: religionInfo.caste?.trim()
        },
        educationInfo: {
          ...educationInfo,
          highestEducation: educationInfo.highestEducation,
          university: educationInfo.university?.trim()
        },
        careerInfo: {
          ...careerInfo,
          profession: careerInfo.profession,
          employmentType: careerInfo.employmentType,
          annualIncome: careerInfo.annualIncome,
          jobTitle: careerInfo.jobTitle?.trim(),
          companyName: careerInfo.companyName?.trim()
        },
        familyInfo: {
          ...familyInfo,
          fatherName: familyInfo.fatherName?.trim(),
          fatherOccupation: familyInfo.fatherOccupation?.trim(),
          motherName: familyInfo.motherName?.trim(),
          motherOccupation: familyInfo.motherOccupation?.trim(),
          familyType: familyInfo.familyType,
          familyStatus: familyInfo.familyStatus
        },
        partnerInfo: {
          ...partnerInfo,
          preferredAgeRange: partnerInfo.preferredAgeRange,
          preferredMaritalStatus: partnerInfo.preferredMaritalStatus,
          preferredReligion: partnerInfo.preferredReligion,
          preferredCaste: partnerInfo.preferredCaste?.trim(),
          preferredEducation: partnerInfo.preferredEducation,
          preferredProfession: partnerInfo.preferredProfession,
          preferredIncome: partnerInfo.preferredIncome,
          preferredLocation: partnerInfo.preferredLocation?.trim(),
          lookingFor: partnerInfo.lookingFor?.trim()
        },
        aboutYourself: aboutYourself?.trim() || "",
        aboutFamily: aboutFamily?.trim() || "",
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

      toast.dismiss("publishing");
      setIsProfilePublished(true);
      toast.success("🎉 Profile published successfully! Now visible to other members.");
    } catch (err) {
      console.error("Publish error:", err);
      toast.dismiss("publishing");

      if (err.response?.status === 400) {
        const errorDetail = err.response.data.detail;
        if (errorDetail?.completion?.sectionCompletion) {
          const incomplete = Object.entries(errorDetail.completion.sectionCompletion)
            .filter(([_, percentage]) => percentage < 80)
            .map(([section, percentage]) => `${section}: ${percentage}%`);

          toast.error(`Profile incomplete: ${incomplete.join(', ')}`);
        } else {
          toast.error(errorDetail?.message || "Data is insufficient. Please check all required fields.");
        }
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
      iconColor: '#dc2626',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      buttonsStyling: false,
      customClass: {
        popup: 'rounded-xl p-6',
        actions: 'gap-3 mt-4',
        confirmButton:
          'px-5 py-2.5 min-w-[120px] rounded-lg font-medium text-white ' +
          'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 ' +
          'transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]',
        cancelButton:
          'px-5 py-2.5 min-w-[120px] rounded-lg font-medium text-gray-700 ' +
          'bg-gray-200 hover:bg-gray-300 transition-all duration-200 shadow-sm hover:shadow-md'
      }
    });

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

  const handlePayment = async (planType, amount) => {
    setLoadingState('payment', true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/payment/create-order`,
        {
          amount: amount * 100,
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
              setMembershipPlan(planType);
              toast.success("🎉 Payment successful! Premium membership activated.");

              try {
                const profileResponse = await axios.get(
                  `${BACKEND_URL}/profile/get/${user.email}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );

                let profileData;

                if (profileResponse.data?.profile) {
                  profileData = {
                    ...profileResponse.data.profile,
                    membershipPlan: planType,
                    lastUpdated: new Date().toISOString()
                  };
                } else {
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

                await axios.post(
                  `${BACKEND_URL}/profile/save`,
                  profileData,
                  { headers: { Authorization: `Bearer ${token}` } }
                );

                setMembershipPlan(planType);
                toast.success("Premium membership saved to your profile!");
                checkMembershipStatus();
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
          color: "#dc2626"
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
        <div className="min-h-screen flex justify-center items-center pt-20 bg-gray-50">
          <div className="flex flex-col items-center gap-4">
            <FiLoader className="text-red-500 animate-spin text-4xl" />
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
      <ToastContainer
        position="top-right"
        toastClassName="rounded-lg shadow-lg"
      />
      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 md:pt-24 pb-12">
        <div className="container mx-auto px-3 md:px-4">
          {/* ========== NEW 1.5:3 LAYOUT ========== */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* LEFT SIDEBAR: PROFILE BOX (1.5 ratio on desktop) */}
            <div className="lg:w-[30%] w-full lg:h-[calc(100vh-80px)] lg:sticky lg:top-20">              <div ref={sidebarRef} className="bg-gradient-to-br from-white via-white to-red-50/30 rounded-2xl shadow-xl p-4 md:p-6 relative border border-red-100/80 backdrop-blur-sm h-full overflow-y-auto scrollbar-hide">
              <div className="absolute top-4 right-4 z-20">
                <div className="relative">
                  <IconButton
                    onClick={() => setShowSettings(!showSettings)}
                    loading={false}
                  >
                    <FiSettings className="w-5 h-5" />
                  </IconButton>
                  {showSettings && (
                    <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-sm border border-red-100 shadow-xl rounded-xl text-left z-50 overflow-hidden animate-fadeIn">
                      <div className="py-1">
                        <button
                          className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-red-50/50 hover:to-transparent transition-all duration-200 disabled:opacity-50 group"
                          onClick={() => {
                            setShowPasswordBox(true);
                            setShowFeedbackBox(false);
                            setShowDeleteConfirm(false);
                            setShowSettings(false);
                            sidebarRef.current?.scrollTo({ top: 500, behavior: "smooth" });
                          }}
                          disabled={loadingStates.passwordUpdate}
                        >
                          <div className="p-1.5 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
                            <FiEdit2 className="w-4 h-4 text-red-500" />
                          </div>
                          <span className="font-medium text-gray-700">Change Password</span>
                        </button>
                        <button
                          className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-red-50/50 hover:to-transparent transition-all duration-200 disabled:opacity-50 group"
                          onClick={() => {
                            setShowFeedbackBox(true);
                            setShowPasswordBox(false);
                            setShowDeleteConfirm(false);
                            setShowSettings(false);
                            sidebarRef.current?.scrollTo({ top: 500, behavior: "smooth" });
                          }}
                          disabled={loadingStates.feedbackSubmit}
                        >
                          <div className="p-1.5 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
                            <FiMessageSquare className="w-4 h-4 text-red-500" />
                          </div>
                          <span className="font-medium text-gray-700">Give Feedback</span>
                        </button>
                        {isProfilePublished && (
                          <button
                            className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-red-50/50 hover:to-transparent transition-all duration-200 disabled:opacity-50 group"
                            onClick={() => {
                              handleRemoveProfile();
                              setShowSettings(false);
                            }}
                            disabled={loadingStates.removeProfile}
                          >
                            <div className="p-1.5 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
                              <MdOutlineRemoveCircle className="w-4 h-4 text-red-500" />
                            </div>
                            <span className="font-medium text-gray-700">Hide Profile</span>
                          </button>
                        )}
                        <button
                          className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-red-50/50 hover:to-transparent transition-all duration-200 disabled:opacity-50 group"
                          onClick={() => {
                            setShowDeleteConfirm(true);
                            setShowPasswordBox(false);
                            setShowFeedbackBox(false);
                            setShowSettings(false);
                            sidebarRef.current?.scrollTo({ top: 600, behavior: "smooth" });
                          }}
                          disabled={loadingStates.deleteProfile}
                        >
                          <div className="p-1.5 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
                            <FiTrash2 className="w-4 h-4 text-red-500" />
                          </div>
                          <span className="font-medium text-red-500">Delete Profile</span>
                        </button>
                      </div>
                      <div className="border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-transparent">
                        <button
                          className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-red-50/50 hover:to-transparent transition-all duration-200 disabled:opacity-50 group"
                          onClick={handleLogout}
                          disabled={loadingStates.logout}
                        >
                          <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-red-100 transition-colors">
                            {loadingStates.logout ? (
                              <FiLoader className="animate-spin w-4 h-4 text-gray-600" />
                            ) : (
                              <FiLogOut className="w-4 h-4 text-gray-600 group-hover:text-red-500" />
                            )}
                          </div>
                          <span className="font-medium text-gray-700">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Image & Basic Info */}
              <div className="flex flex-col items-center text-center mt-4">
                <div className="relative w-36 h-36 md:w-40 md:h-40 mb-4">
                  <div className="w-full h-full overflow-hidden rounded-xl border-4 border-white shadow-lg">
                    <img
                      src={personalInfo.profileImg ? personalInfo.profileImg : "/5.png"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {isProfilePublished && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white rounded-full p-1.5">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>

                <h1 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {user.name}
                </h1>

                <p className="text-sm text-gray-500 flex items-center gap-2 justify-center mt-1">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  {user.email}
                </p>

                {/* Profile Strength */}
                <div className="mt-6 w-full bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-red-100/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      Profile Strength
                    </span>
                    <span className="text-lg font-bold text-red-500">
                      {Math.round((Object.values(profileProgress).reduce((a, b) => a + b, 0) / 3))}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${Math.round(
                          Object.values(profileProgress).reduce((a, b) => a + b, 0) / 3
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {profileCompleted ? '✓ Ready to publish!' : '⚠ Complete all sections to 80%'}
                  </p>
                </div>

                {user.google_id && (
                  <div className="mt-4 animate-fadeIn">
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-lg text-sm font-medium border border-green-200/50 shadow-sm">
                      <FiCheckCircle className="w-4 h-4" />
                      Connected with Google
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 justify-center mt-6 w-full">
                  <PrimaryButton
                    onClick={() => {
                      setLoadingState('viewMatches', true);
                      const userData = {
                        userEmail: user.email,
                        isProfilePublished: isProfilePublished,
                        membershipType: membershipPlan === "premium" ? "premium" : "free"
                      };
                      updateUserProfile(userData);
                      navigate("/matches", { state: userData });
                    }}
                    loading={loadingStates.viewMatches}
                    disabled={loadingStates.viewMatches}
                    className="flex-1 min-w-[130px]"
                    icon={FiEye}
                  >
                    Matches
                  </PrimaryButton>
                  <SecondaryButton
                    onClick={() => {
                      setLoadingState('watchlist', true);
                      const userData = {
                        userEmail: user.email,
                        isProfilePublished: isProfilePublished,
                        membershipType: membershipPlan === "premium" ? "premium" : "free"
                      };
                      updateUserProfile(userData);
                      navigate("/watchlist", { state: userData });
                    }}
                    loading={loadingStates.watchlist}
                    disabled={loadingStates.watchlist}
                    className="flex-1 min-w-[130px]"
                    icon={FiHeart}
                  >
                    Watchlist
                  </SecondaryButton>
                </div>

                {/* Profile Status Badge */}
                <div className="mt-6 w-full">
                  <div
                    className={`px-4 py-3 rounded-xl text-sm font-medium shadow-md backdrop-blur-sm flex items-center justify-center gap-2
                        ${isProfilePublished
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200/50"
                        : "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200/50"
                      }`}
                  >
                    {isProfilePublished ? (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <MdPublishedWithChanges className="w-5 h-5" />
                        <span className="font-semibold">Published & Visible</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                        <MdWarning className="w-5 h-5" />
                        <span className="font-semibold">Not Published</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Change Password Box - inside sidebar */}
              {showPasswordBox && (
                <div className="mt-6 p-5 bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-sm rounded-xl border border-red-100 shadow-lg animate-slideDown">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent flex items-center gap-2">
                      <FiEdit2 className="text-red-500" />
                      Change Password
                    </h3>
                    <IconButton
                      onClick={() => { setShowPasswordBox(false); setNewPassword(""); }}
                      disabled={loadingStates.passwordUpdate}
                    >
                      <FiX size={18} />
                    </IconButton>
                  </div>
                  <div className="space-y-4">
                    <PasswordInput
                      label="New Password"
                      value={newPassword}
                      onChange={setNewPassword}
                      placeholder="Enter new password"
                      isEditing={true}
                    />
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      Minimum 8 characters required
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <PrimaryButton
                        onClick={handlePasswordUpdate}
                        loading={loadingStates.passwordUpdate}
                        disabled={loadingStates.passwordUpdate}
                        className="flex-1"
                      >
                        Update
                      </PrimaryButton>
                      <SecondaryButton
                        onClick={() => { setShowPasswordBox(false); setNewPassword(""); }}
                        disabled={loadingStates.passwordUpdate}
                        className="flex-1"
                      >
                        Cancel
                      </SecondaryButton>
                    </div>
                  </div>
                </div>
              )}

              {/* Delete Profile Confirmation - inside sidebar */}
              {showDeleteConfirm && (
                <div className="mt-6 p-5 bg-gradient-to-br from-red-50/90 to-red-50/70 backdrop-blur-sm rounded-xl border border-red-200 shadow-lg animate-slideDown">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
                      <FiTrash2 className="w-5 h-5" />
                      Delete Profile
                    </h3>
                    <IconButton
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={loadingStates.deleteProfile}
                    >
                      <FiX size={18} />
                    </IconButton>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-red-200 shadow-sm">
                      <div className="p-2 bg-red-100 rounded-full flex-shrink-0">
                        <MdWarning className="text-red-500 text-lg" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-red-600 text-sm mb-1">Warning: Permanent Action!</h4>
                        <p className="text-gray-600 text-sm">
                          All your data will be permanently deleted. This cannot be undone.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-white/50 backdrop-blur-sm rounded-lg border border-amber-200">
                      <p className="text-gray-700 text-sm flex items-start gap-2">
                        <FiInfo className="text-amber-500 w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>
                          {isProfilePublished ?
                            "Use 'Hide Profile' to temporarily hide instead of permanent deletion." :
                            "Profile is currently hidden. You can publish it anytime."}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <PrimaryButton
                        onClick={handleDeleteProfile}
                        loading={loadingStates.deleteProfile}
                        disabled={loadingStates.deleteProfile}
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                      >
                        Yes
                      </PrimaryButton>
                      <SecondaryButton
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={loadingStates.deleteProfile}
                        className="flex-1"
                      >
                        Cancel
                      </SecondaryButton>
                    </div>
                  </div>
                </div>
              )}

              {/* Feedback Form Box - inside sidebar */}
              {showFeedbackBox && (
                <div className="mt-6 p-5 bg-gradient-to-br from-purple-50/90 via-white to-red-50/30 backdrop-blur-sm rounded-xl border border-purple-100 shadow-lg animate-slideDown">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent flex items-center gap-2">
                      <FiMessageSquare className="text-red-500" />
                      Share Feedback
                    </h3>
                    <IconButton
                      onClick={() => {
                        setShowFeedbackBox(false);
                        setFeedback({
                          experience: "",
                          rating: 0,
                          suggestions: ""
                        });
                      }}
                      disabled={loadingStates.feedbackSubmit}
                    >
                      <FiX size={18} />
                    </IconButton>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        Your Experience <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className="w-full px-4 py-2.5 bg-white/70 backdrop-blur-sm border border-gray-200 focus:border-red-500 rounded-lg focus:ring-2 focus:ring-red-100 transition-all duration-300 resize-none"
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
                        placeholder="Share your experience with Paarsh Matrimony..."
                        disabled={loadingStates.feedbackSubmit}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        Rating <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-2 p-2 bg-white/50 backdrop-blur-sm rounded-lg inline-flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className="p-1.5 hover:scale-110 transition-all duration-200 focus:outline-none group"
                            onClick={() => setFeedback({ ...feedback, rating: star })}
                            disabled={loadingStates.feedbackSubmit}
                          >
                            {star <= feedback.rating ? (
                              <FiStar className="w-6 h-6 fill-red-500 text-red-500 filter drop-shadow" />
                            ) : (
                              <FiStar className="w-6 h-6 text-gray-300 group-hover:text-red-300 transition-colors" />
                            )}
                          </button>
                        ))}
                        <span className="ml-2 text-sm font-medium text-gray-600 bg-white px-3 py-1.5">
                          {feedback.rating > 0 ? `${feedback.rating}/5` : null}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        Suggestions
                      </label>
                      <textarea
                        className="w-full px-4 py-2.5 bg-white/70 backdrop-blur-sm border border-gray-200 focus:border-red-500 rounded-lg focus:ring-2 focus:ring-red-100 transition-all duration-300 resize-none"
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
                        placeholder="Suggestions to improve our service..."
                        disabled={loadingStates.feedbackSubmit}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <PrimaryButton
                        onClick={handleFeedbackSubmit}
                        loading={loadingStates.feedbackSubmit}
                        disabled={loadingStates.feedbackSubmit}
                        className="flex-1"
                        icon={FiSend}
                      >
                        Submit
                      </PrimaryButton>
                      <SecondaryButton
                        onClick={() => {
                          setShowFeedbackBox(false);
                          setFeedback({
                            experience: "",
                            rating: 0,
                            suggestions: ""
                          });
                        }}
                        disabled={loadingStates.feedbackSubmit}
                        className="flex-1"
                      >
                        Cancel
                      </SecondaryButton>
                    </div>
                  </div>
                </div>
              )}
            </div>
            </div>

            {/* RIGHT CONTENT: FORM SECTIONS (70% width on desktop) */}
            <div className="lg:w-[70%] w-full">
              {/* ========== SELF SECTION ========== */}
              <AccordionFormBox
                title="Self Information"
                isOpen={openSections.self}
                onToggle={() => toggleSection('self')}
                icon={FiUser}
                sectionProgress={profileProgress.self}
              >
                {isEditingSelf ? (
                  /* ========== EDIT MODE - SHOW FORM ========== */
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Profile Image Upload */}
                      <div className="md:col-span-2">
                        <Section title="Profile Picture *" icon={FiCamera}>
                          <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center text-4xl font-bold text-red-500 border-4 border-white shadow-lg">
                              {personalInfo.profileImg ? (
                                <img
                                  src={personalInfo.profileImg}
                                  alt="Profile"
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                user.name[0].toUpperCase()
                              )}
                              <label className="absolute bottom-0 right-0 bg-gradient-to-r from-red-500 to-red-600 text-white p-2 rounded-full cursor-pointer hover:scale-110 transition-all duration-200 shadow-lg">
                                {loadingStates.imageUpload ? (
                                  <FiLoader className="animate-spin" size={18} />
                                ) : (
                                  <FiCamera size={18} />
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleImageUpload}
                                  disabled={!isEditingSelf || loadingStates.imageUpload}
                                />
                              </label>
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                              <p className="text-gray-600 mb-2">
                                <span className="font-semibold text-red-500">* Required:</span> Upload a clear profile picture for better matches
                              </p>
                              <p className="text-sm text-gray-500 mb-3">
                                Recommended: 500x500px, Max size: 2MB
                              </p>
                              <>
                                <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-all duration-200 border border-gray-300 hover:border-red-500 group">
                                  {loadingStates.imageUpload ? (
                                    <FiLoader className="animate-spin" />
                                  ) : (
                                    <FiUpload className="group-hover:text-red-500" />
                                  )}
                                  <span className="group-hover:text-red-500">Upload Image</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                    disabled={!isEditingSelf || loadingStates.imageUpload}
                                  />
                                </label>
                                {!personalInfo.profileImg && (
                                  <p className="text-sm text-red-500 mt-2 font-medium">
                                    Profile image is required
                                  </p>
                                )}
                              </>
                            </div>
                          </div>
                        </Section>
                      </div>

                      {/* Personal Info */}
                      <Section title="Personal Details" icon={FiUser}>
                        <div className="space-y-4">
                          <Input
                            label="Full Name *"
                            value={personalInfo.fullName}
                            onChange={(val) => {
                              let safeValue = val
                                .replace(/[^a-zA-Z\s]/g, "")
                                .replace(/\s{2,}/g, " ")
                                .trimStart()
                                .slice(0, 50);
                              setPersonalInfo(prev => ({ ...prev, fullName: safeValue }));
                            }}
                            placeholder="Enter your full name"
                            isEditing={isEditingSelf}
                            isProtected={coreFieldsSet && personalInfo.fullName}
                            icon={FiUser}
                          />
                          <Input
                            label="Gender *"
                            type="select"
                            options={["Male", "Female", "Other"]}
                            value={personalInfo.gender}
                            onChange={(val) => setPersonalInfo(prev => ({ ...prev, gender: val }))}
                            isEditing={isEditingSelf}
                            isProtected={coreFieldsSet && personalInfo.gender}
                            icon={FiUser}
                          />
                          <Input
                            label="Date of Birth *"
                            type="date"
                            value={personalInfo.dob}
                            onChange={(val) => setPersonalInfo(prev => ({ ...prev, dob: val }))}
                            isEditing={isEditingSelf}
                            isProtected={coreFieldsSet && personalInfo.dob}
                            icon={MdDateRange}
                          />
                          <Input
                            label="Age *"
                            type="number"
                            value={personalInfo.age}
                            onChange={(val) => {
                              const safeValue = val.replace(/\D/g, "").slice(0, 3);
                              setPersonalInfo(prev => ({ ...prev, age: safeValue }));
                            }}
                            placeholder="Enter your age"
                            isEditing={isEditingSelf}
                          />
                          <Input
                            label="Marital Status *"
                            type="select"
                            options={["Never Married", "Divorced", "Widowed", "Separated"]}
                            value={personalInfo.maritalStatus}
                            onChange={(val) => setPersonalInfo(prev => ({ ...prev, maritalStatus: val }))}
                            isEditing={isEditingSelf}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <Input
                              label="Height (cm)"
                              value={personalInfo.height}
                              onChange={(val) => {
                                const safeValue = val.replace(/\D/g, "").slice(0, 3);
                                setPersonalInfo(prev => ({ ...prev, height: safeValue }));
                              }}
                              placeholder="Height in cm"
                              isEditing={isEditingSelf}
                            />
                            <Input
                              label="Weight (kg)"
                              value={personalInfo.weight}
                              onChange={(val) => {
                                const safeValue = val.replace(/\D/g, "").slice(0, 3);
                                setPersonalInfo(prev => ({ ...prev, weight: safeValue }));
                              }}
                              placeholder="Weight in kg"
                              isEditing={isEditingSelf}
                            />
                          </div>
                          <Input
                            label="Blood Group"
                            type="select"
                            options={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "Other"]}
                            value={personalInfo.bloodGroup}
                            onChange={(val) => setPersonalInfo(prev => ({ ...prev, bloodGroup: val }))}
                            isEditing={isEditingSelf}
                          />
                          <Input
                            label="Disability"
                            type="select"
                            options={["No", "Yes"]}
                            value={personalInfo.disability}
                            onChange={(val) => setPersonalInfo(prev => ({ ...prev, disability: val }))}
                            isEditing={isEditingSelf}
                          />
                          <Input
                            label="Contact Number *"
                            type="tel"
                            value={personalInfo.contactNumber}
                            onChange={(val) => setPersonalInfo(prev => ({ ...prev, contactNumber: val }))}
                            isEditing={isEditingSelf}
                          />
                          <Input
                            label="WhatsApp Number"
                            type="tel"
                            value={personalInfo.whatsappNumber}
                            onChange={(val) => setPersonalInfo(prev => ({ ...prev, whatsappNumber: val }))}
                            isEditing={isEditingSelf}
                          />
                        </div>
                      </Section>

                      <div className="space-y-6">
                        {/* Location */}
                        <Section title="Location" icon={MdLocationOn}>
                          <div className="space-y-4">
                            <Input
                              label="Country *"
                              type="select"
                              options={["India", "USA", "UK", "Canada", "Australia", "Other"]}
                              value={locationInfo.country}
                              onChange={(val) => setLocationInfo(prev => ({ ...prev, country: val }))}
                              isEditing={isEditingSelf}
                              icon={MdLocationOn}
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
                              isEditing={isEditingSelf}
                              icon={MdLocationOn}
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
                              isEditing={isEditingSelf}
                              icon={MdLocationOn}
                            />
                            <Input
                              label="Pin Code"
                              value={locationInfo.pinCode}
                              onChange={(val) => {
                                const safeValue = val.replace(/\D/g, "").slice(0, 6);
                                setLocationInfo(prev => ({ ...prev, pinCode: safeValue }));
                              }}
                              placeholder="Enter pin code"
                              isEditing={isEditingSelf}
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
                              isEditing={isEditingSelf}
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
                              isEditing={isEditingSelf}
                              icon={FiHome}
                            />
                          </div>
                        </Section>

                        {/* Religion & Caste */}
                        <Section title="Religion & Caste" icon={MdFamilyRestroom}>
                          <div className="space-y-4">
                            <Input
                              label="Religion *"
                              type="select"
                              options={["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist", "Other"]}
                              value={religionInfo.religion}
                              onChange={(val) => setReligionInfo(prev => ({ ...prev, religion: val }))}
                              isEditing={isEditingSelf}
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
                              isEditing={isEditingSelf}
                            />
                            <Input
                              label="Mother Tongue"
                              type="select"
                              options={["Marathi", "Hindi", "English", "Gujarati", "Tamil", "Telugu", "Bengali", "Other"]}
                              value={religionInfo.motherTongue}
                              onChange={(val) => setReligionInfo(prev => ({ ...prev, motherTongue: val }))}
                              isEditing={isEditingSelf}
                            />
                          </div>
                        </Section>
                      </div>

                      {/* Education */}
                      <Section title="Education" icon={MdSchool}>
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
                            isEditing={isEditingSelf}
                            icon={MdSchool}
                          />
                          <Input
                            label="Year of Passing"
                            type="date"
                            value={educationInfo.yearOfPassing}
                            onChange={(val) => setEducationInfo(prev => ({ ...prev, yearOfPassing: val }))}
                            isEditing={isEditingSelf}
                            icon={MdDateRange}
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
                            isEditing={isEditingSelf}
                            icon={MdSchool}
                          />
                        </div>
                      </Section>

                      {/* Career */}
                      <Section title="Career" icon={MdWork}>
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
                            isEditing={isEditingSelf}
                            icon={MdWork}
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
                            isEditing={isEditingSelf}
                            icon={MdWork}
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
                            isEditing={isEditingSelf}
                          />
                          <Input
                            label="Employment Type *"
                            type="select"
                            options={["Private", "Government", "Business", "Self-employed", "Unemployed"]}
                            value={careerInfo.employmentType}
                            onChange={(val) => setCareerInfo(prev => ({ ...prev, employmentType: val }))}
                            isEditing={isEditingSelf}
                          />
                          <Input
                            label="Annual Income (₹) *"
                            type="select"
                            options={["1-3 LPA", "3-5 LPA", "5-10 LPA", "10-20 LPA", "20-50 LPA", "50+ LPA"]}
                            value={careerInfo.annualIncome}
                            onChange={(val) => setCareerInfo(prev => ({ ...prev, annualIncome: val }))}
                            isEditing={isEditingSelf}
                            icon={FiDollarSign}
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
                            isEditing={isEditingSelf}
                            icon={MdLocationOn}
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
                          isEditing={isEditingSelf}
                          icon={FiUser}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <SecondaryButton
                        onClick={() => setIsEditingSelf(false)}
                        disabled={loadingStates.saveProfile}
                        icon={FiX}
                      >
                        Cancel
                      </SecondaryButton>
                      <PrimaryButton
                        onClick={() => handleSubmit("Self")}
                        loading={loadingStates.saveProfile}
                        disabled={profileProgress.self < 80}
                        icon={FiSave}
                      >
                        Save
                      </PrimaryButton>
                    </div>
                    {profileProgress.self < 80 && (
                      <p className="text-center text-red-500 text-sm mt-3 font-medium">
                        Self information must be at least 80% complete to save. Current: {profileProgress.self}%
                      </p>
                    )}
                  </div>
                ) : (
                  /* ========== PREVIEW MODE - ENHANCED PREVIEW ========== */
                  <div>
                    <SelfPreview
                      personalInfo={personalInfo}
                      locationInfo={locationInfo}
                      religionInfo={religionInfo}
                      educationInfo={educationInfo}
                      careerInfo={careerInfo}
                      aboutYourself={aboutYourself}
                      onEdit={() => setIsEditingSelf(true)}
                    />
                    <div className="flex justify-end mt-6">
                      <PrimaryButton
                        onClick={() => setIsEditingSelf(true)}
                        icon={FiEdit2}
                      >
                        Edit Self Information
                      </PrimaryButton>
                    </div>
                  </div>
                )}
              </AccordionFormBox>

              {/* ========== FAMILY SECTION ========== */}
              <AccordionFormBox
                title="Family Information"
                isOpen={openSections.family}
                onToggle={() => toggleSection('family')}
                icon={MdFamilyRestroom}
                sectionProgress={profileProgress.family}
              >
                {isEditingFamily ? (
                  /* ========== EDIT MODE - SHOW FORM ========== */
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-6">
                        <Section title="Parents Information" icon={MdFamilyRestroom}>
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
                              isEditing={isEditingFamily}
                              icon={FiUser}
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
                              isEditing={isEditingFamily}
                              icon={MdWork}
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
                              isEditing={isEditingFamily}
                              icon={FiUser}
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
                              isEditing={isEditingFamily}
                              icon={MdWork}
                            />
                          </div>
                        </Section>

                        <Section title="Siblings" icon={FiUsers}>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <Input
                                label="Number of Brothers"
                                type="number"
                                value={familyInfo.brothers}
                                onChange={(val) => {
                                  const safeValue = val.replace(/\D/g, "").slice(0, 2);
                                  setFamilyInfo(prev => ({ ...prev, brothers: safeValue }));
                                }}
                                placeholder="0"
                                isEditing={isEditingFamily}
                              />
                              <Input
                                label="Number of Sisters"
                                type="number"
                                value={familyInfo.sisters}
                                onChange={(val) => {
                                  const safeValue = val.replace(/\D/g, "").slice(0, 2);
                                  setFamilyInfo(prev => ({ ...prev, sisters: safeValue }));
                                }}
                                placeholder="0"
                                isEditing={isEditingFamily}
                              />
                            </div>
                          </div>
                        </Section>
                      </div>

                      <div className="space-y-6">
                        <Section title="Family Background" icon={FiHome}>
                          <div className="space-y-4">
                            <Input
                              label="Family Type *"
                              type="select"
                              options={["Joint", "Nuclear", "Extended"]}
                              value={familyInfo.familyType}
                              onChange={(val) => setFamilyInfo(prev => ({ ...prev, familyType: val }))}
                              isEditing={isEditingFamily}
                            />
                            <Input
                              label="Family Status *"
                              type="select"
                              options={["Middle Class", "Upper Middle Class", "Affluent", "Wealthy"]}
                              value={familyInfo.familyStatus}
                              onChange={(val) => setFamilyInfo(prev => ({ ...prev, familyStatus: val }))}
                              isEditing={isEditingFamily}
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
                              isEditing={isEditingFamily}
                              icon={MdLocationOn}
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
                              isEditing={isEditingFamily}
                              icon={MdLocationOn}
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
                          isEditing={isEditingFamily}
                          icon={MdFamilyRestroom}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <SecondaryButton
                        onClick={() => setIsEditingFamily(false)}
                        disabled={loadingStates.saveProfile}
                        icon={FiX}
                      >
                        Cancel
                      </SecondaryButton>
                      <PrimaryButton
                        onClick={() => handleSubmit("Family")}
                        loading={loadingStates.saveProfile}
                        disabled={profileProgress.family < 80}
                        icon={FiSave}
                      >
                        Save
                      </PrimaryButton>
                    </div>
                    {profileProgress.family < 80 && (
                      <p className="text-center text-red-500 text-sm mt-3 font-medium">
                        Family information must be at least 80% complete to save. Current: {profileProgress.family}%
                      </p>
                    )}
                  </div>
                ) : (
                  /* ========== PREVIEW MODE - ENHANCED PREVIEW ========== */
                  <div>
                    <FamilyPreview
                      familyInfo={familyInfo}
                      aboutFamily={aboutFamily}
                      onEdit={() => setIsEditingFamily(true)}
                    />
                    <div className="flex justify-end mt-6">
                      <PrimaryButton
                        onClick={() => setIsEditingFamily(true)}
                        icon={FiEdit2}
                      >
                        Edit Family Information
                      </PrimaryButton>
                    </div>
                  </div>
                )}
              </AccordionFormBox>

              {/* ========== PARTNER SECTION ========== */}
              <AccordionFormBox
                title="Partner Preferences"
                isOpen={openSections.partner}
                onToggle={() => toggleSection('partner')}
                icon={FiUsers}
                sectionProgress={profileProgress.partner}
              >
                {isEditingPartner ? (
                  /* ========== EDIT MODE - SHOW FORM ========== */
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-6">
                        <Section title="Basic Preferences" icon={FiUsers}>
                          <div className="space-y-4">
                            <Input
                              label="Preferred Age Range *"
                              type="select"
                              options={["18-25", "26-30", "31-35", "36-40", "41-45", "46-50"]}
                              value={partnerInfo.preferredAgeRange}
                              onChange={(val) => setPartnerInfo(prev => ({ ...prev, preferredAgeRange: val }))}
                              isEditing={isEditingPartner}
                            />
                            <Input
                              label="Preferred Height (cm)"
                              value={partnerInfo.preferredHeight}
                              onChange={(val) => {
                                const safeValue = val.replace(/\D/g, "").slice(0, 3);
                                setPartnerInfo(prev => ({ ...prev, preferredHeight: safeValue }));
                              }}
                              placeholder="Preferred height in cm"
                              isEditing={isEditingPartner}
                            />
                            <Input
                              label="Preferred Marital Status *"
                              type="select"
                              options={["Never Married", "Divorced", "Widowed", "No Preference"]}
                              value={partnerInfo.preferredMaritalStatus}
                              onChange={(val) => setPartnerInfo(prev => ({ ...prev, preferredMaritalStatus: val }))}
                              isEditing={isEditingPartner}
                            />
                          </div>
                        </Section>

                        <Section title="Background Preferences" icon={MdFamilyRestroom}>
                          <div className="space-y-4">
                            <Input
                              label="Preferred Religion *"
                              type="select"
                              options={["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist", "No Preference"]}
                              value={partnerInfo.preferredReligion}
                              onChange={(val) => setPartnerInfo(prev => ({ ...prev, preferredReligion: val }))}
                              isEditing={isEditingPartner}
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
                              isEditing={isEditingPartner}
                            />
                            <Input
                              label="Preferred Mother Tongue"
                              type="select"
                              options={["Marathi", "Hindi", "English", "Gujarati", "No Preference", "Other"]}
                              value={partnerInfo.preferredMotherTongue}
                              onChange={(val) => setPartnerInfo(prev => ({ ...prev, preferredMotherTongue: val }))}
                              isEditing={isEditingPartner}
                            />
                          </div>
                        </Section>
                      </div>

                      <div className="space-y-6">
                        <Section title="Career & Education" icon={MdSchool}>
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
                              isEditing={isEditingPartner}
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
                              isEditing={isEditingPartner}
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
                              isEditing={isEditingPartner}
                            />
                          </div>
                        </Section>

                        <Section title="Location Preferences" icon={MdLocationOn}>
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
                              isEditing={isEditingPartner}
                              icon={MdLocationOn}
                            />
                            <Input
                              label="Settled In"
                              type="select"
                              options={["India", "Abroad", "Any"]}
                              value={partnerInfo.settledIn}
                              onChange={(val) => setPartnerInfo(prev => ({ ...prev, settledIn: val }))}
                              isEditing={isEditingPartner}
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
                          isEditing={isEditingPartner}
                          icon={FiUsers}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <SecondaryButton
                        onClick={() => setIsEditingPartner(false)}
                        disabled={loadingStates.saveProfile}
                        icon={FiX}
                      >
                        Cancel
                      </SecondaryButton>
                      <PrimaryButton
                        onClick={() => handleSubmit("Partner Preferences")}
                        loading={loadingStates.saveProfile}
                        disabled={profileProgress.partner < 80}
                        icon={FiSave}
                      >
                        Save
                      </PrimaryButton>
                    </div>
                    {profileProgress.partner < 80 && (
                      <p className="text-center text-red-500 text-sm mt-3 font-medium">
                        Partner preferences must be at least 80% complete to save. Current: {profileProgress.partner}%
                      </p>
                    )}
                  </div>
                ) : (
                  /* ========== PREVIEW MODE - ENHANCED PREVIEW ========== */
                  <div>
                    <PartnerPreview
                      partnerInfo={partnerInfo}
                      onEdit={() => setIsEditingPartner(true)}
                    />
                    <div className="flex justify-end mt-6">
                      <PrimaryButton
                        onClick={() => setIsEditingPartner(true)}
                        icon={FiEdit2}
                      >
                        Edit Partner Preferences
                      </PrimaryButton>
                    </div>
                  </div>
                )}
              </AccordionFormBox>

              {/* PLAN SECTION */}
              <AccordionFormBox
                title="Choose Your Plan"
                isOpen={openSections.plan}
                onToggle={() => toggleSection('plan')}
                icon={MdOutlineWorkspacePremium}
                sectionProgress={undefined}
              >
                {/* Premium Member Info with Dates */}
                {membershipPlan === "premium" && (
                  <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-5 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-red-500 text-white rounded-lg shadow-md">
                        <MdOutlineWorkspacePremium className="text-xl" />
                      </div>
                      <div className="flex-1">
                        <p className="text-red-600 font-bold flex items-center gap-2 mb-1">
                          Premium Member
                        </p>
                        <p className="text-red-500 text-sm mb-3">
                          You have access to all premium features. Free plan is no longer available.
                        </p>

                        {membershipDates.membershipStartDate && (
                          <div className="mt-2 bg-white rounded-lg p-3 border border-red-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <FiCalendar className="text-gray-500" size={14} />
                              <span className="text-xs font-semibold text-gray-700">Membership Details:</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 text-xs">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-gray-600">Started:</span>
                                <span className="font-semibold text-gray-900">
                                  {new Date(membershipDates.membershipStartDate).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                              {membershipDates.membershipExpiryDate && (
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                  <span className="text-gray-600">Expires:</span>
                                  <span className="font-semibold text-gray-900">
                                    {new Date(membershipDates.membershipExpiryDate).toLocaleDateString('en-IN', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Free Member Info */}
                {membershipPlan === "free" && !membershipDates.membershipStartDate && (
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-500 text-white rounded-lg shadow-md">
                        <FiInfo className="text-xl" />
                      </div>
                      <div>
                        <p className="text-blue-700 font-bold mb-1">You are on Free Plan</p>
                        <p className="text-blue-600 text-sm">
                          Upgrade to Premium to unlock all features including direct contact, unlimited matches, and more!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  <MembershipCard
                    type="Free Membership"
                    features={[
                      "Manage Profile",
                      "Partner Recommendations",
                      "View Limited Partner Details",
                      "Interest Sending and Chatting",
                      "Apply Filters",
                      "Give feedbacks",
                      "Chatbot Support",
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
                      "Add to Watchlist for Shortlisting",
                      "View all Partner Data",
                      "View your Kundali details",
                      "Marriage Planning Assistance",
                      "Extra Discounts on Wedding Services",
                    ]}
                    price="1999"
                    popular={true}
                    currentPlan={membershipPlan === "premium" ? "Premium Membership" : null}
                    handlePayment={handlePayment}
                    loadingPayment={loadingStates.payment}
                    handleSubmit={() => { }}
                    membershipDates={membershipDates}
                  />
                </div>
              </AccordionFormBox>

              {/* POST SECTION */}
              <AccordionFormBox
                title="Profile Publishing"
                isOpen={openSections.post}
                onToggle={() => toggleSection('post')}
                icon={MdPublishedWithChanges}
                sectionProgress={undefined}
              >
                {/* Completion Status */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md">
                      <FiInfo className="text-2xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">
                        Profile Completion Status
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                              <FiUser className="text-gray-500" /> Self Data
                            </span>
                            <span className={`text-sm font-bold ${profileProgress.self >= 80 ? 'text-green-600' : 'text-amber-600'}`}>
                              {profileProgress.self}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full transition-all duration-300 ${profileProgress.self >= 80 ? 'bg-green-500' : 'bg-amber-500'}`}
                              style={{ width: `${profileProgress.self}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                              <MdFamilyRestroom className="text-gray-500" /> Family Data
                            </span>
                            <span className={`text-sm font-bold ${profileProgress.family >= 80 ? 'text-green-600' : 'text-amber-600'}`}>
                              {profileProgress.family}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full transition-all duration-300 ${profileProgress.family >= 80 ? 'bg-green-500' : 'bg-amber-500'}`}
                              style={{ width: `${profileProgress.family}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                              <FiUsers className="text-gray-500" /> Partner Preferences
                            </span>
                            <span className={`text-sm font-bold ${profileProgress.partner >= 80 ? 'text-green-600' : 'text-amber-600'}`}>
                              {profileProgress.partner}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full transition-all duration-300 ${profileProgress.partner >= 80 ? 'bg-green-500' : 'bg-amber-500'}`}
                              style={{ width: `${profileProgress.partner}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-blue-200">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-800">Overall Progress</span>
                            <span className={`font-bold text-lg ${profileCompleted ? 'text-green-600' : 'text-amber-600'}`}>
                              {Math.round((profileProgress.self + profileProgress.family + profileProgress.partner) / 3)}%
                            </span>
                          </div>
                          <div className={`text-sm mt-3 p-3 rounded-lg font-medium ${profileCompleted
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                            {profileCompleted ? (
                              <div className="flex items-center gap-2">
                                <FiCheckCircle className="text-green-600" />
                                ✓ All sections have at least 80% completion. Ready to publish!
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <MdWarning className="text-amber-600" />
                                ⚠ Need at least 80% in all sections. Current: Self {profileProgress.self}%, Family {profileProgress.family}%, Partner {profileProgress.partner}%
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Information Section */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-600 text-white rounded-lg shadow-md">
                      <MdOutlineContactSupport className="text-2xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-3">
                        Important Information
                      </h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-600">
                        <li className="flex items-start gap-2">
                          <FiCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Complete all profile sections before publishing</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <FiCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Published profiles are visible to all registered members</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <FiCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">You can edit your profile anytime</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <FiCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Use "Hide Profile" to temporarily hide your profile</span>
                        </li>
                        <li className="flex items-start gap-2 md:col-span-2">
                          <FiCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Use "Delete Profile" to permanently remove all your data</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Publish/Unpublish Button */}
                <div className="flex justify-center">
                  {isProfilePublished ? (
                    <div className="text-center w-full">
                      <div className="flex items-center gap-2 text-green-600 font-medium mb-4 p-4 bg-green-50 rounded-xl border border-green-200">
                        <FiCheckCircle className="text-xl" />
                        <span>✓ Your profile is currently published and visible to other members.</span>
                      </div>
                      <div className="flex gap-4 justify-center">
                        <SecondaryButton
                          onClick={handleRemoveProfile}
                          loading={loadingStates.removeProfile}
                          disabled={loadingStates.removeProfile}
                          icon={MdOutlineRemoveCircle}
                          className="px-8 py-3"
                        >
                          Hide Profile
                        </SecondaryButton>
                      </div>
                    </div>
                  ) : (
                    <PrimaryButton
                      onClick={handlePostProfile}
                      loading={loadingStates.postProfile}
                      disabled={!profileCompleted || loadingStates.postProfile}
                      icon={MdPublishedWithChanges}
                      className="px-10 py-3 text-lg"
                    >
                      Publish Profile
                    </PrimaryButton>
                  )}
                </div>
                {!profileCompleted && !isProfilePublished && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                    <p className="text-red-500 text-sm font-medium">
                      Cannot publish profile. All sections must be at least 80% complete.
                    </p>
                  </div>
                )}
              </AccordionFormBox>
            </div>
          </div>
        </div>
      </div>
      <Chatbot />
      <Footer />
      {/* Kundali Section - Auto display based on profile data */}
      {showKundali && personalInfo.dob && personalInfo.fullName && (
        <Kundali
          name={personalInfo.fullName?.trim() || user?.name || ""}
          dob={personalInfo.dob || ""}
          gender={personalInfo.gender || "male"}
        />
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        /* Hide scrollbar but keep functionality */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </>
  );
};

export default Profile;