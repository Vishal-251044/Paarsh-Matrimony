import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Chatbot from '../components/Chatbot';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ChevronUp, ChevronDown } from "lucide-react";

const theme = "text-[oklch(70.4%_0.191_22.216)]";
const bgTheme = "bg-[oklch(70.4%_0.191_22.216)]";

const FAQItem = ({ question, answer }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="border-b">
            <button
                onClick={() => setOpen(!open)}
                className="w-full text-left py-4 flex justify-between items-center font-medium"
            >
                <span>{question}</span>
                <span className={theme}>
                    {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
            </button>
            {open && (
                <p className="pb-4 text-gray-600 text-sm leading-relaxed">{answer}</p>
            )}
        </div>
    );
};

const Contact = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (isSubmitting) return;

        if (!formData.name || !formData.email || !formData.message) {
            toast.dismiss();
            toast.error("Please fill all required fields");
            return;
        }

        if (formData.phone.length !== 10) {
            toast.dismiss();
            toast.error("Phone number must be 10 digits");
            return;
        }

        setIsSubmitting(true);
        toast.dismiss();
        const toastId = toast.loading("Sending your message...");

        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/contact`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                }
            );

            const data = await res.json();

            toast.dismiss(toastId);

            if (res.ok) {
                toast.success("Message sent successfully!");
                setFormData({ name: "", email: "", phone: "", message: "" });
            } else {
                toast.error(data.message || "Failed to send message");
            }
        } catch (err) {
            toast.dismiss(toastId);
            toast.error("Server error. Try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Navbar />

            {/* ToastContainer must be rendered somewhere in your component */}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            <div className="bg-gray-50 min-h-screen pt-10">
                {/* HERO */}
                <section className="max-w-7xl mx-auto px-4 py-12 text-center">
                    <h2
                        className="text-[oklch(70.4%_0.191_22.216)] text-3xl sm:text-4xl font-bold mb-6 select-none relative"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                        <span className="relative inline-block">
                            Let's Connect – We're Here to Help
                            <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[oklch(70.4%_0.191_22.216)] to-transparent"></span>
                        </span>
                    </h2>
                    <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
                        We'd love to hear from you. Our team is ready to answer all your
                        questions.
                    </p>
                </section>

                {/* MAIN GRID */}
                <section className="max-w-7xl mx-auto px-4 pb-16 grid lg:grid-cols-3 gap-8">
                    {/* LEFT */}
                    <div className="space-y-6">
                        <h2 className={`text-xl font-semibold ${theme}`}>Get in Touch</h2>

                        {[
                            { title: "Phone", value: "+91 90752 01035" },
                            { title: "Primary Email", value: "info@paarshinfotech.com" },
                            { title: "Secondary Email", value: "paarshinfotech@gmail.com" },
                        ].map((item, i) => (
                            <div key={i} className="bg-white shadow-sm rounded-xl p-4 border">
                                <p className="font-semibold">{item.title}</p>
                                <p className="text-gray-600 text-sm mt-1">{item.value}</p>
                            </div>
                        ))}

                        <div className="bg-white shadow-sm rounded-xl p-4 border">
                            <p className="font-semibold">Working Hours</p>
                            <p className="text-sm text-gray-600 mt-2">
                                Monday – Friday : 09:30 AM – 07:30 PM
                            </p>
                            <p className="text-sm text-gray-600">Saturday – Sunday : Closed</p>
                        </div>
                    </div>

                    {/* FORM */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white shadow-sm rounded-xl border p-6">
                            <h3 className="font-semibold text-lg mb-4">Send us a Message</h3>

                            <div className="grid md:grid-cols-2 gap-4">
                                <input
                                    value={formData.name}
                                    placeholder="Your Name"
                                    className="border rounded-lg p-3 text-sm"
                                    onChange={(e) =>
                                        setFormData((p) => ({
                                            ...p,
                                            name: e.target.value
                                                .replace(/[^a-zA-Z\s]/g, "")
                                                .replace(/\s{2,}/g, " "),
                                        }))
                                    }
                                />
                                <input
                                    type="email"
                                    value={formData.email}
                                    placeholder="yourmail@example.com"
                                    className="border rounded-lg p-3 text-sm"
                                    onChange={(e) =>
                                        setFormData((p) => ({
                                            ...p,
                                            email: e.target.value.replace(/[^a-zA-Z0-9@._-]/g, ""),
                                        }))
                                    }
                                />
                            </div>
                            <input
                                value={formData.phone}
                                placeholder="Phone"
                                className="border rounded-lg p-3 text-sm mt-4 w-full"
                                maxLength={10}
                                onChange={(e) => {
                                    let val = e.target.value.replace(/\D/g, "");

                                    if (val.length === 1 && !/[6-9]/.test(val)) {
                                        val = "";
                                    }

                                    setFormData((p) => ({
                                        ...p,
                                        phone: val.slice(0, 10),
                                    }));
                                }}
                            />
                            <textarea
                                rows="5"
                                value={formData.message}
                                placeholder="How can we help you?"
                                className="border rounded-lg p-3 text-sm mt-4 w-full h-48"

                                onChange={(e) => {
                                    const safeValue = e.target.value
                                        .replace(/[^a-zA-Z0-9\s.,'-]/g, "")
                                        .replace(/\s{2,}/g, " ");

                                    setFormData({ ...formData, message: safeValue });
                                }}
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={`${bgTheme} text-white px-6 py-3 rounded-lg mt-4 text-sm font-medium hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed`}
                            >
                                {isSubmitting ? "Sending..." : "Send Message"}
                            </button>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="bg-white py-12 border-t">
                    <div className="max-w-4xl mx-auto px-4">
                        <h2 className={`text-2xl font-bold text-center ${theme}`}>
                            Frequently Asked Questions
                        </h2>

                        <div className="mt-8">
                            <FAQItem
                                question="How do I create and complete my profile?"
                                answer="Sign up, fill personal & partner details, upload photo."
                            />
                            <FAQItem
                                question="Is registration free?"
                                answer="No, registration is free but premium plan is paid."
                            />
                            <FAQItem
                                question="How can I search matches?"
                                answer="Use filters like age, location, education."
                            />
                            <FAQItem
                                question="Is my data safe?"
                                answer="Yes, privacy is our priority."
                            />
                            <FAQItem
                                question="How to contact support?"
                                answer="Use this form or email us."
                            />
                        </div>
                    </div>
                </section>
            </div>
            <Chatbot />
            <Footer />
        </>
    );
};

export default Contact;