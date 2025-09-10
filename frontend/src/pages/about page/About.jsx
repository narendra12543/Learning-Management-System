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

function About() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 md:px-12">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
          About the Program
        </h1>

        <p className="text-gray-600 mb-6">
          The <span className="font-medium">{PROGRAM.name}</span> is a hands-on,
          outcome-focused training designed to build practical engineering
          skills for real projects. You will learn the MERN stack end-to-end and
          graduate with portfolio-ready work and collaborative experience.
        </p>

        <Section title="What you will learn">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Frontend with React:</strong> UI patterns, state
              management, forms, routing, accessibility, and component design.
            </li>
            <li>
              <strong>Backend with Node & Express:</strong> REST APIs, auth,
              file handling, error management, and production-ready patterns.
            </li>
            <li>
              <strong>Database with MongoDB:</strong> schema design, validation,
              indexing, and performance-minded queries.
            </li>
            <li>
              <strong>Version Control & Collaboration:</strong> Git/GitHub
              workflows, pull requests, code reviews, and teamwork.
            </li>
            <li>
              <strong>Agile delivery:</strong> stand-ups, sprint
              planning/review, and retrospectives.
            </li>
            <li>
              <strong>UI/UX fundamentals:</strong> design principles, usability,
              and user-centric experiences.
            </li>
          </ul>
        </Section>

        <Section title="Program format">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Mode:</strong> {PROGRAM.mode}
            </li>
            <li>
              <strong>Duration:</strong> {PROGRAM.duration}
            </li>
            <li>
              <strong>Weekly schedule:</strong>
              <ul className="list-disc pl-6 mt-2">
                {PROGRAM.timings.map((t) => (
                  <li key={t.day}>
                    {t.day}: {t.hours}
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <strong>Fee:</strong> {PROGRAM.fee}
            </li>
          </ul>
        </Section>

        <Section title="Career outcomes">
          <p>{PROGRAM.placementNote}</p>
        </Section>

        <Section title="Who this is for">
          <ul className="list-disc pl-6 space-y-2">
            <li>Beginners who want a structured path into full-stack dev.</li>
            <li>Developers aiming to switch stacks or modernize skills.</li>
            <li>Anyone who prefers learning by building real projects.</li>
          </ul>
        </Section>

        <Section title="Internship tracks">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Paid internship (performance-based):</strong> Stipend tied
              to assessments and project performance.
            </li>
            <li>
              <strong>Unpaid internship:</strong> Focus on learning, portfolio,
              and experience with the same standards and timelines.
            </li>
          </ul>
        </Section>

        <Section title="Contact">
          <p>
            Email:{" "}
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

export default About;
