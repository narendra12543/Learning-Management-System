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
  contactEmail: "mernprogram@ecerasystem.com", // change me
};

function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 md:px-12">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
          Refund Policy
        </h1>

        <p className="text-gray-600 mb-6">
          The following Refund Policy applies to all participants of the{" "}
          <span className="font-medium">{PROGRAM.name}</span>. By enrolling in
          the Program, you acknowledge and agree to the refund terms below.
        </p>

        <Section title="Eligibility for Refunds">
          <ul className="list-disc pl-6 space-y-2">
            <li>Full refund available within 7 days of purchase.</li>
            <li>
              No refund if more than 20% of the course has been completed.
            </li>
            <li>No refunds will be provided after 7 days of enrollment.</li>
          </ul>
        </Section>

        <Section title="Deferral Policy">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Participants may request a one-time deferral to a future batch
              within 6 months if they cannot continue with their current batch.
            </li>
            <li>
              Deferral requests must be submitted in writing to program support
              before the completion of 20% of the course.
            </li>
          </ul>
        </Section>

        <Section title="Refund Request Process">
          <p>
            To request a refund or deferral, please email{" "}
            <a
              href={`mailto:${PROGRAM.contactEmail}`}
              className="text-blue-600 hover:underline"
            >
              {PROGRAM.contactEmail}
            </a>{" "}
            with your name, enrollment details, and reason for the request.
          </p>
        </Section>

        <Section title="Processing Time">
          <p>
            Approved refunds are typically processed within 7–10 business days
            by the payment provider after confirmation from the Program team.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            For questions regarding this Refund Policy, contact us at{" "}
            <a
              href={`mailto:${PROGRAM.contactEmail}`}
              className="text-blue-600 hover:underline"
            >
              {PROGRAM.contactEmail}
            </a>
            .
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

export default RefundPolicy;
