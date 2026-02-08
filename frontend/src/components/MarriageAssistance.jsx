import { useState } from "react";
import axios from "axios";
import {
    FiHeart,
    FiCheckCircle,
    FiMapPin,
    FiDollarSign,
    FiShoppingBag,
    FiCalendar,
    FiCamera,
    FiGift,
    FiMusic,
    FiGlobe,
    FiHome,
    FiSmile,
    FiBriefcase,
    FiShield,
    FiStar,
    FiTrendingUp,
    FiChevronDown,
    FiChevronUp,
} from "react-icons/fi";
import {
    FaRing,
    FaUtensils,
    FaUserTie,
    FaPlane,
    FaRegHospital,
    FaCar,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Marriage = () => {
    const [form, setForm] = useState({
        budget: "",
        location: "",
        expenses: [],
    });

    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);
    const [showExpenses, setShowExpenses] = useState(false);

    /* ------------------ FORMAT AI RESPONSE ------------------ */
    const formatAIResponse = (text) => {
        if (!text) return "";

        let clean = text
            .replace(/[#*]/g, "")
            .replace(/---/g, "")
            .replace(/\n{2,}/g, "\n");

        const sections = clean.split("\n").filter((l) => l.trim() !== "");

        let html = "";
        let count = 1;

        sections.forEach((line) => {
            if (line.match(/^\d+\./)) {
                html += `<p class="mt-3 font-semibold text-[#9E3B3B]">${line}</p>`;
            } else if (line.endsWith(":")) {
                html += `<p class="mt-3 font-semibold text-gray-800">${line}</p>`;
            } else {
                html += `<p class="text-gray-700 leading-relaxed">${line}</p>`;
            }
        });

        return `<div class="space-y-2">${html}</div>`;
    };

    /* ------------------ OPTIONS ------------------ */

    const budgetOptions = [
        { value: "2 – 5 Lakh", label: "Economy" },
        { value: "5 – 8 Lakh", label: "Standard" },
        { value: "8 – 12 Lakh", label: "Premium" },
        { value: "12 – 20 Lakh", label: "Luxury" },
        { value: "20+ Lakh", label: "Grand" },
    ];

    const expenseOptions = [
        { name: "Engagement / Rings", icon: <FaRing /> },
        { name: "Venue & Catering", icon: <FaUtensils /> },
        { name: "Clothes & Jewelry", icon: <FiShoppingBag /> },
        { name: "Photography / Video", icon: <FiCamera /> },
        { name: "Invitations & Gifts", icon: <FiGift /> },
        { name: "Decoration & DJ", icon: <FiMusic /> },
        { name: "Travel & Accommodation", icon: <FaPlane /> },
        { name: "Ritual / Priest", icon: <FaUserTie /> },
        { name: "Honeymoon", icon: <FiGlobe /> },
        { name: "Marriage Registration", icon: <FiBriefcase /> },
        { name: "After Marriage Costs", icon: <FiHome /> },
        { name: "Furniture & Appliances", icon: <FaCar /> },
        { name: "Health Insurance", icon: <FaRegHospital /> },
        { name: "Emergency Fund", icon: <FiShield /> },
        { name: "Savings / Investments", icon: <FiTrendingUp /> },
    ];

    const handleExpenseChange = (item) => {
        setForm((prev) => ({
            ...prev,
            expenses: prev.expenses.includes(item)
                ? prev.expenses.filter((i) => i !== item)
                : [...prev.expenses, item],
        }));
    };

    /* ------------------ SUBMIT ------------------ */

    const handleSubmit = async () => {
        if (!form.budget || !form.location.trim()) return;

        setLoading(true);
        setResult("");

        try {
            const res = await axios.post(
                `${BACKEND_URL}/api/marriage-assistance`,
                form
            );

            setResult(formatAIResponse(res.data.answer));
        } catch {
            setResult("<p class='text-red-500'>Server error</p>");
        }

        setLoading(false);
    };

    /* ------------------ UI ------------------ */

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
            {/* HEADER */}
            <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-[#EA7B7B] to-[#D25353] p-3 rounded-xl shadow-lg">
                    <FiHeart className="text-white text-xl" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Marriage Financial Planner
                    </h2>
                    <p className="text-gray-500 text-sm">
                        Smart AI Budget Guidance for Your Wedding
                    </p>
                </div>
            </div>

            {/* BUDGET */}
            <div className="card">
                <h3 className="title">
                    <FiDollarSign /> Budget Range
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {budgetOptions.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setForm({ ...form, budget: opt.value })}
                            className={`btn ${form.budget === opt.value ? "btn-active" : ""
                                }`}
                        >
                            {opt.label}
                            <span className="text-xs text-gray-500">{opt.value}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* LOCATION */}
            <div className="card">
                <h3 className="title">
                    <FiMapPin /> Location
                </h3>
                <input
                    className="input"
                    placeholder="Enter City"
                    value={form.location}
                    onChange={(e) => {
                        let val = e.target.value;

                        val = val.replace(/[^a-zA-Z\s]/g, ""); 
                        val = val.replace(/\s{2,}/g, " ");     
                        val = val.replace(/^\s/, "");          

                        setForm({ ...form, location: val });
                    }}
                    onBlur={(e) => {
                        setForm({ ...form, location: e.target.value.trim() }); 
                    }}
                />

            </div>

            {/* EXPENSES */}
            <div className="card">
                <div className="flex justify-between items-center">
                    <h3 className="title">
                        <FiCalendar /> Expenses
                    </h3>
                    <button onClick={() => setShowExpenses(!showExpenses)}>
                        {showExpenses ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                </div>

                <div
                    className={`grid sm:grid-cols-2 gap-2 overflow-y-auto ${showExpenses ? "max-h-96" : "max-h-40"
                        }`}
                >
                    {expenseOptions.map((item) => (
                        <label
                            key={item.name}
                            className={`expense ${form.expenses.includes(item.name) ? "expense-active" : ""
                                }`}
                        >
                            {item.icon}
                            {item.name}
                            <input
                                type="checkbox"
                                hidden
                                onChange={() => handleExpenseChange(item.name)}
                            />
                        </label>
                    ))}
                </div>
            </div>

            {/* BUTTON */}
            <button
                onClick={handleSubmit}
                disabled={loading}
                className="submit-btn"
            >
                {loading ? "Generating..." : "Get Financial Plan"}
            </button>

            {/* RESULT */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="card border-2"
                    >
                        <h3 className="title">
                            <FiStar /> Financial Guidance
                        </h3>
                        <div dangerouslySetInnerHTML={{ __html: result }} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TAILWIND STYLES */}
            <style>{`
        .card{background:white;border-radius:1rem;padding:1.25rem;border:1px solid #FFEAD3;box-shadow:0 4px 12px rgba(0,0,0,0.05)}
        .title{display:flex;gap:8px;align-items:center;font-weight:600;color:#333;margin-bottom:1rem}
        .btn{padding:10px;border:2px solid #eee;border-radius:12px;display:flex;flex-direction:column}
        .btn-active{border-color:#EA7B7B;background:#FFF5F5}
        .input{width:100%;border:2px solid #FFEAD3;padding:12px;border-radius:12px}
        .expense{display:flex;gap:8px;padding:10px;border:2px solid #eee;border-radius:10px;cursor:pointer}
        .expense-active{border-color:#EA7B7B;background:#FFF5F5}
        .submit-btn{width:100%;background:linear-gradient(90deg,#EA7B7B,#D25353);color:white;padding:14px;border-radius:12px;font-weight:600}
      `}</style>
        </div>
    );
};

export default Marriage;
