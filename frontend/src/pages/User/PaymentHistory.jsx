import React, { useEffect, useState } from "react";
import { useTheme } from "../../contexts/Theme/ThemeContext";
import { useAuth } from "../../contexts/Auth/AuthContext";
import {
  getUserPaymentHistory,
  requestRefund,
  requestDeferral,
  downloadInvoice,
} from "../../services/User/PaymentService";
import RefundRequestModal from "../../components/User/Payment/RefundRequestModal";
import DeferralRequestModal from "../../components/User/Payment/DeferralRequestModal";
import toast from "react-hot-toast";

function PaymentHistory() {
  const { theme } = useTheme();
  const { user, token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [deferralModalOpen, setDeferralModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [pending, setPending] = useState(new Set());
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    async function fetchPayments() {
      setLoading(true);
      setError("");
      try {
        const res = await getUserPaymentHistory(token);
        setPayments(res);
      } catch (err) {
        setError(
          err.response?.data?.error || "Failed to fetch payment history."
        );
      } finally {
        setLoading(false);
      }
    }
    if (token) {
      fetchPayments();
    }
  }, [token]);

  const handleRefundRequest = async (paymentId, reason) => {
    setActionLoading((s) => ({ ...s, [paymentId]: "refund" }));
    try {
      await requestRefund(token, paymentId, reason);
      toast.success(
        "Refund request submitted. We'll notify you once reviewed."
      );
      setPending((prev) => new Set(prev).add(paymentId));
      setRefundModalOpen(false);
      // Optionally refresh list
      const res = await getUserPaymentHistory(token);
      setPayments(res);
    } catch (e) {
      toast.error(
        e?.response?.data?.error || "Failed to submit refund request."
      );
    } finally {
      setActionLoading((s) => ({ ...s, [paymentId]: null }));
    }
  };

  const handleDeferralRequest = async (courseId, batch, reason) => {
    if (!selectedPayment) return;
    const paymentId = selectedPayment._id;
    setActionLoading((s) => ({ ...s, [paymentId]: "deferral" }));
    try {
      await requestDeferral(token, courseId, batch, reason);
      toast.success(
        "Deferral request submitted. We'll notify you once reviewed."
      );
      setPending((prev) => new Set(prev).add(paymentId));
      setDeferralModalOpen(false);
      // Optionally refresh list
      const res = await getUserPaymentHistory(token);
      setPayments(res);
    } catch (e) {
      toast.error(
        e?.response?.data?.error || "Failed to submit deferral request."
      );
    } finally {
      setActionLoading((s) => ({ ...s, [paymentId]: null }));
    }
  };

  const isEligibleForRefund = (payment) => {
    const daysSincePayment =
      (Date.now() - new Date(payment.createdAt)) / (1000 * 60 * 60 * 24);
    return (
      daysSincePayment <= 7 &&
      payment.percentCompleted <= 20 &&
      payment.status === "success"
    );
  };

  const isEligibleForDeferral = (payment) => {
    return payment.percentCompleted <= 20 && payment.status === "success";
  };

  const handleDownloadInvoice = async (paymentId, transactionId) => {
    try {
      const blob = await downloadInvoice(token, paymentId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${transactionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download invoice.");
    }
  };

  return (
    <div
      className={`min-h-screen py-8 px-4 sm:px-8 transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gray-900 text-gray-100"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      <h1 className="text-2xl font-bold mb-6">Payment History</h1>
      {loading ? (
        <div className="text-center py-8 text-lg">Loading...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : payments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No payments found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <thead>
              <tr className="bg-green-100 dark:bg-green-900/40">
                <th className="py-3 px-4 text-left">Course</th>
                <th className="py-3 px-4 text-left">Amount</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Transaction ID</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr
                  key={p._id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-gray-700/40"
                >
                  <td className="py-2 px-4 font-semibold">
                    {p.course?.title || p.course?.name || "-"}
                  </td>
                  <td className="py-2 px-4">₹{p.amount}</td>
                  <td className="py-2 px-4">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        p.status === "success"
                          ? "bg-green-200 text-green-800"
                          : p.status === "refunded"
                          ? "bg-red-200 text-red-800"
                          : p.status === "deferred"
                          ? "bg-yellow-200 text-yellow-800"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-xs">
                    {p.transactionId || "-"}
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          handleDownloadInvoice(p._id, p.transactionId)
                        }
                        className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600"
                      >
                        Invoice
                      </button>
                      {isEligibleForRefund(p) && !pending.has(p._id) && (
                        <button
                          onClick={() => {
                            setSelectedPayment(p);
                            setRefundModalOpen(true);
                          }}
                          disabled={actionLoading[p._id] === "refund"}
                          className={`px-3 py-1 text-white text-xs rounded-lg transition-colors ${
                            actionLoading[p._id] === "refund"
                              ? "bg-blue-300 cursor-not-allowed"
                              : "bg-blue-500 hover:bg-blue-600"
                          }`}
                        >
                          {actionLoading[p._id] === "refund"
                            ? "Sending..."
                            : "Refund"}
                        </button>
                      )}
                      {/* {isEligibleForDeferral(p) && !pending.has(p._id) && (
                        <button
                          onClick={() => {
                            setSelectedPayment(p);
                            setDeferralModalOpen(true);
                          }}
                          disabled={actionLoading[p._id] === "deferral"}
                          className={`px-3 py-1 text-white text-xs rounded-lg transition-colors ${
                            actionLoading[p._id] === "deferral"
                              ? "bg-yellow-300 cursor-not-allowed"
                              : "bg-yellow-500 hover:bg-yellow-600"
                          }`}
                        >
                          {actionLoading[p._id] === "deferral"
                            ? "Sending..."
                            : "Defer"}
                        </button>
                      )} */}
                      {pending.has(p._id) && (
                        <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-lg">
                          Pending review
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <RefundRequestModal
        isOpen={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        payment={selectedPayment}
        onSubmit={handleRefundRequest}
      />
      <DeferralRequestModal
        isOpen={deferralModalOpen}
        onClose={() => setDeferralModalOpen(false)}
        payment={selectedPayment}
        onSubmit={handleDeferralRequest}
      />
    </div>
  );
}

export default PaymentHistory;
