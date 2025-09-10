import React from "react";

const PROGRAM = {
  name: "MERN Full Stack Development Training Program",
  mode: "Remote",
  duration: "6 months",
  timings: [
    { day: "Monday", hours: "8:00 PM – 9:00 PM IST" },
    { day: "Wednesday", hours: "7:00 PM – 10:00 PM IST" },
    { day: "Saturday", hours: "6:00 PM – 10:00 PM IST" },
  ],
  fee: "₹15,000 (one-time)",
  contactEmail: "mernprogram@ecerasystem.com",

  placementNote:
    "Eligible for full-time job opportunities upon successful completion; typical starting range ~INR 1.4 LPA to 6 LPA depending on role, location, and performance.",
};

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 md:px-12">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
          Privacy Policy
        </h1>

        <p className="text-gray-600 mb-6">
          This Privacy Policy explains how we handle your personal information
          while you participate in the{" "}
          <span className="font-medium">{PROGRAM.name}</span>. By enrolling or
          using Program services, you agree to the practices described below.
        </p>

        <Section title="Information we collect">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Identity & contact data:</strong> Name, email, phone,
              address (for enrollment and communication).
            </li>
            <li>
              <strong>Learning & performance data:</strong> Assignments,
              feedback, attendance, and project submissions.
            </li>
            <li>
              <strong>Payment data:</strong> Transaction IDs, billing details
              (processed securely by third parties).
            </li>
            <li>
              <strong>Technical data:</strong> Device info, IP, usage logs (to
              improve reliability and security).
            </li>
          </ul>
        </Section>

        <Section title="How we use your information">
          <ul className="list-disc pl-6 space-y-2">
            <li>Manage enrollment, batches, and student accounts.</li>
            <li>Deliver content, projects, and assessments.</li>
            <li>Communicate updates, schedules, and support.</li>
            <li>Process payments, invoices, and refunds.</li>
            <li>Improve program quality and prevent misuse.</li>
            <li>Issue certificates, letters, and job-related support.</li>
          </ul>
        </Section>

        <Section title="Sharing & disclosure">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              With service providers (payment, LMS, analytics) under strict
              contracts.
            </li>
            <li>
              With potential employers for job placement (when you opt in).
            </li>
            <li>As required by law or to protect rights.</li>
          </ul>
        </Section>

        <Section title="Data retention">
          <p>
            We retain data only as long as necessary for the purposes above or
            to meet legal and compliance requirements. You may request deletion,
            subject to retention obligations.
          </p>
        </Section>

        <Section title="Your rights">
          <ul className="list-disc pl-6 space-y-2">
            <li>Access, update, or correct your information.</li>
            <li>Request deletion (subject to limits).</li>
            <li>Opt out of non-essential communications.</li>
          </ul>
        </Section>

        <Section title="Security">
          <p>
            We implement administrative, technical, and physical safeguards to
            protect your data. However, no system is 100% secure, so please
            follow good security practices for your accounts.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            For privacy questions or requests, email{" "}
            <a
              href={`mailto:${PROGRAM.contactEmail}`}
              className="text-blue-600 hover:underline"
            >
              {PROGRAM.contactEmail}
            </a>
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-3">{title}</h2>
      <div className="text-gray-600 leading-relaxed">{children}</div>
    </div>
  );
}

export default PrivacyPolicy;
