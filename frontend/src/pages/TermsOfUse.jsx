import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FiCheckCircle,
  FiUser,
  FiLock,
  FiShield,
  FiCreditCard,
  FiFileText,
  FiXCircle,
  FiAlertTriangle,
  FiRefreshCw,
  FiMapPin,
  FiMail,
} from "react-icons/fi";

const TermsOfUse = () => {
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 pt-24 pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-12">
            <h1
              className="text-[oklch(70.4%_0.191_22.216)] text-4xl sm:text-5xl mb-4 select-none"
              style={{ fontFamily: "'Great Vibes', cursive" }}
            >
              Terms of Use
            </h1>
            <p className="text-gray-600">
              Last Updated:{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-8">

            {/* Introduction */}
            <section>
              <p className="text-gray-600 leading-relaxed">
                Welcome to Paarsh Matrimony. These Terms of Use govern your use
                of our website and services. By accessing or using our platform,
                you agree to be bound by these terms.
              </p>
            </section>

            {/* Sections */}
            <section>
              <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-3">
                <FiUser className="text-[oklch(70.4%_0.191_22.216)]" />
                1. Eligibility
              </h2>
              <p className="text-gray-600">
                You must be at least 18 years old and legally eligible for
                matrimony under applicable laws to use our services.
              </p>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-3">
                <FiLock className="text-[oklch(70.4%_0.191_22.216)]" />
                2. Account Registration
              </h2>
              <p className="text-gray-600">
                You are responsible for maintaining accurate information and
                safeguarding your login credentials.
              </p>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-3">
                <FiAlertTriangle className="text-[oklch(70.4%_0.191_22.216)]" />
                3. User Conduct
              </h2>
              <p className="text-gray-600">
                Users must behave respectfully and refrain from harassment,
                impersonation, fraud, or unlawful activity.
              </p>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-3">
                <FiFileText className="text-[oklch(70.4%_0.191_22.216)]" />
                4. Profile Information
              </h2>
              <p className="text-gray-600">
                All profile details must be truthful. We reserve the right to
                verify or suspend accounts with misleading information.
              </p>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-3">
                <FiShield className="text-[oklch(70.4%_0.191_22.216)]" />
                5. Privacy
              </h2>
              <p className="text-gray-600">
                Your data is handled as per our Privacy Policy, which governs
                information collection and protection.
              </p>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-3">
                <FiCreditCard className="text-[oklch(70.4%_0.191_22.216)]" />
                6. Subscription Plans
              </h2>
              <p className="text-gray-600">
                Paid features are subject to plan pricing. Fees are
                non-refundable unless stated otherwise.
              </p>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-3">
                <FiFileText className="text-[oklch(70.4%_0.191_22.216)]" />
                7. Intellectual Property
              </h2>
              <p className="text-gray-600">
                All platform content belongs to Paarsh Infotech Pvt. Ltd. and is
                protected by copyright laws.
              </p>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-3">
                <FiXCircle className="text-[oklch(70.4%_0.191_22.216)]" />
                8. Termination
              </h2>
              <p className="text-gray-600">
                We may suspend or terminate accounts violating these terms or
                harming the platform or users.
              </p>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-3">
                <FiAlertTriangle className="text-[oklch(70.4%_0.191_22.216)]" />
                9. Limitation of Liability
              </h2>
              <p className="text-gray-600">
                We do not guarantee matches or offline interactions between
                users.
              </p>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-3">
                <FiRefreshCw className="text-[oklch(70.4%_0.191_22.216)]" />
                10. Changes to Terms
              </h2>
              <p className="text-gray-600">
                Continued use of the platform implies acceptance of updated
                terms.
              </p>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-3">
                <FiMapPin className="text-[oklch(70.4%_0.191_22.216)]" />
                11. Governing Law
              </h2>
              <p className="text-gray-600">
                These terms are governed by the laws of India, with jurisdiction
                in Maharashtra.
              </p>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-3">
                <FiMail className="text-[oklch(70.4%_0.191_22.216)]" />
                12. Contact Information
              </h2>
              <p className="text-gray-600">
                Email: info@paarshinfotech.com | Phone: +91 90752 01035
              </p>
            </section>

            {/* Acceptance */}
            <section className="bg-gray-50 p-6 rounded-lg">
              <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-3">
                <FiCheckCircle className="text-[oklch(70.4%_0.191_22.216)]" />
                Acceptance of Terms
              </h2>
              <p className="text-gray-600">
                By using Paarsh Matrimony, you confirm that you have read and
                agreed to these Terms of Use.
              </p>
            </section>

          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default TermsOfUse;
