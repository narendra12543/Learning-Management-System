import React, { useState } from "react";
import { useTheme } from "../../../contexts/Theme/ThemeContext";

const DeferralRequestModal = ({ isOpen, onClose, payment, onSubmit }) => {
  const { theme } = useTheme();
  const [batch, setBatch] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!batch.trim() || !reason.trim()) {
      setError("Please provide batch and reason for the deferral request.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit(payment.course._id, batch, reason);
      onClose();
      setBatch("");
      setReason("");
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to submit deferral request."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`p-6 rounded-xl shadow-lg max-w-md w-full mx-4 ${
          theme === "dark"
            ? "bg-gray-800 text-gray-100"
            : "bg-white text-gray-900"
        }`}
      >
        <h2 className="text-xl font-bold mb-4">Request Deferral</h2>
        <p className="mb-4 text-sm">
          Course: <span className="font-semibold">{payment.course?.name}</span>
          <br />
          Amount: ₹{payment.amount}
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            placeholder="Batch (e.g., Batch 2024)"
            className={`w-full p-3 border rounded-lg mb-4 ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-gray-100"
                : "bg-gray-50 border-gray-300 text-gray-900"
            }`}
            required
          />
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for deferral..."
            className={`w-full p-3 border rounded-lg mb-4 ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-gray-100"
                : "bg-gray-50 border-gray-300 text-gray-900"
            }`}
            rows="4"
            required
          />
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeferralRequestModal;
