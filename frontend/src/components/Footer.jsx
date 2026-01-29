import {
    FaFacebookF,
    FaInstagram,
    FaTwitter,
    FaLinkedinIn,
    FaPhoneAlt,
    FaEnvelope,
    FaMapMarkerAlt
} from "react-icons/fa";
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="w-full bg-white border-t">
            <div className="max-w-7xl mx-auto px-4 py-10">

                {/* Top Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

                    {/* Logo & About */}
                    <div>
                        <h2
                            className="
              text-[oklch(70.4%_0.191_22.216)]
              text-2xl
              sm:text-3xl
              tracking-wide
              mb-3
              select-none"
                            style={{ fontFamily: "'Great Vibes', cursive" }}
                        >
                            Paarsh Matrimony
                        </h2>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Paarsh Matrimony is a trusted platform helping individuals
                            find meaningful and lifelong relationships with simplicity,
                            security, and care.
                        </p>
                    </div>

                    {/* Contact Details */}
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-3">
                            Contact Us
                        </h3>

                        <div className="flex items-center gap-3 text-gray-600 text-sm mb-2">
                            <FaPhoneAlt className="text-[oklch(70.4%_0.191_22.216)]" />
                            <span>+91 90752 01035</span>
                        </div>

                        <div className="flex items-center gap-3 text-gray-600 text-sm mb-2">
                            <FaEnvelope className="text-[oklch(70.4%_0.191_22.216)]" />
                            <span>info@paarshinfotech.com</span>
                        </div>

                        <div className="flex items-center gap-3 text-gray-600 text-sm">
                            <FaMapMarkerAlt className="text-[oklch(70.4%_0.191_22.216)]" />
                            <span>Maharashtra, India</span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-3">
                            Quick Links
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li>
                                <Link
                                    to="/"
                                    className="hover:text-[oklch(70.4%_0.191_22.216)] cursor-pointer"
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/about"
                                    className="hover:text-[oklch(70.4%_0.191_22.216)] cursor-pointer"
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/terms"
                                    className="hover:text-[oklch(70.4%_0.191_22.216)] cursor-pointer"
                                >
                                    Terms of Use
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/privacy"
                                    className="hover:text-[oklch(70.4%_0.191_22.216)] cursor-pointer"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-3">
                            Follow Us
                        </h3>
                        <div className="flex gap-4">
                            <a
                                href="#"
                                className="w-9 h-9 flex items-center justify-center rounded-full
                         bg-gray-100 hover:bg-[oklch(70.4%_0.191_22.216)]
                         text-gray-600 hover:text-white transition"
                            >
                                <FaFacebookF size={14} />
                            </a>

                            <a
                                href="https://www.instagram.com/paarsh_infotech?igsh=MWw3cmc2OG1oc3hwZw%3D%3D"
                                className="w-9 h-9 flex items-center justify-center rounded-full
                         bg-gray-100 hover:bg-[oklch(70.4%_0.191_22.216)]
                         text-gray-600 hover:text-white transition"
                            >
                                <FaInstagram size={15} />
                            </a>

                            <a
                                href="#"
                                className="w-9 h-9 flex items-center justify-center rounded-full
                         bg-gray-100 hover:bg-[oklch(70.4%_0.191_22.216)]
                         text-gray-600 hover:text-white transition"
                            >
                                <FaTwitter size={15} />
                            </a>

                            <a
                                href="https://www.linkedin.com/company/paarsh-infotech-private-limited/posts/?feedView=all"
                                className="w-9 h-9 flex items-center justify-center rounded-full
                 bg-gray-100 hover:bg-[oklch(70.4%_0.191_22.216)]
                 text-gray-600 hover:text-white transition"
                            >
                                <FaLinkedinIn size={15} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="mt-10 border-t pt-4 text-center">
                    <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} Paarsh Matrimony. All rights reserved.
                    </p>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
