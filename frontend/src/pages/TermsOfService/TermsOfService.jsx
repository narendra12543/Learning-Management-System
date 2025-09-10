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

function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 md:px-12">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
          Terms of Service
        </h1>

        <p className="text-gray-600 mb-6">
          These Terms govern participation in the{" "}
          <span className="font-medium">{PROGRAM.name}</span>. By enrolling,
          accessing Program resources, or submitting assignments, you agree to
          these Terms.
        </p>

        {/* Section */}
        <Section title="Enrollment & Eligibility">
          <ul className="list-disc pl-6 space-y-2">
            <li>You must provide accurate information during enrollment.</li>
            <li>Access credentials are personal; do not share your account.</li>
            <li>
              The Program may adjust batch schedules, trainers, or content to
              improve learning outcomes.
            </li>
          </ul>
        </Section>

        <Section title="Program Delivery">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Mode & Duration:</strong> {PROGRAM.mode},{" "}
              {PROGRAM.duration}.
            </li>
            <li>
              <strong>Working Days & Timings:</strong>
              <ul className="list-disc pl-6 mt-2">
                {PROGRAM.timings.map((t) => (
                  <li key={t.day}>
                    {t.day}: {t.hours}
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <strong>Internships:</strong> Tracks may include unpaid or
              performance-linked paid options.
            </li>
          </ul>
        </Section>

        <Section title="Payments & Fees">
          <ul className="list-disc pl-6 space-y-2">
            <li>Program fee: {PROGRAM.fee}. Taxes may apply.</li>
            <li>
              Payments are due as communicated during enrollment and are
              processed via approved payment partners.
            </li>
          </ul>
        </Section>

        <Section title="Refunds & Deferrals">
          <ul className="list-disc pl-6 space-y-2">
            <li>Full refund available within 7 days of purchase.</li>
            <li>No refund if more than 20% of the course is completed.</li>
            <li>No refunds after 7 days for any reason.</li>
            <li>
              One-time deferral to a future batch is allowed within 6 months.
            </li>
            <li>
              To request a refund or deferral, email{" "}
              <a
                href={`mailto:${PROGRAM.contactEmail}`}
                className="text-blue-600 hover:underline"
              >
                {PROGRAM.contactEmail}
              </a>
              . Refunds are processed within 7–10 business days.
            </li>
          </ul>
        </Section>

        <Section title="Academic Integrity & Conduct">
          <ul className="list-disc pl-6 space-y-2">
            <li>Do your own work; plagiarism may lead to removal.</li>
            <li>Be respectful in sessions, chats, and repos.</li>
            <li>Follow security best practices for code and credentials.</li>
          </ul>
        </Section>

        <Section title="IP & Portfolio">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              You own the IP for personal projects; anonymized work may be used
              for educational or marketing purposes with permission.
            </li>
            <li>
              Code created in team/client simulations may have shared or
              restricted licensing.
            </li>
          </ul>
        </Section>

        <Section title="Placement Support">
          <p>
            Placement assistance (mock interviews, resume reviews, and job
            guidance) may be offered upon successful completion. Offers depend
            on employer needs, market conditions, and your performance.
          </p>
        </Section>

        <Section title="Changes to Terms">
          <p>
            We may update these Terms to reflect improvements or legal changes.
            If updates are material, we will notify enrolled learners via your
            registered contact details.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions? Email{" "}
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

export default TermsOfService;
