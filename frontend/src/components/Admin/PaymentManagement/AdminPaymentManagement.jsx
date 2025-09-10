import React, { useEffect, useState } from "react";
import { useTheme } from "../../../contexts/Theme/ThemeContext";
import { useAuth } from "../../../contexts/Auth/AuthContext";
import {
  getAllPayments,
  getAllRefundRequests,
  getAllDeferralRequests,
  approveRefund,
  rejectRefund,
  approveDeferral,
  rejectDeferral,
  downloadInvoice,
  adminDirectRefund,
  updatePaymentStatus,
  bulkPaymentActions,
  getPaymentAnalytics,
} from "../../../services/User/PaymentService";
import toast from "react-hot-toast";

const AdminPaymentManagement = () => {
  const { theme } = useTheme();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("payments");
  const [payments, setPayments] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [deferrals, setDeferrals] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalPayments: 0,
    totalRefunds: 0,
    totalDeferrals: 0,
    avgOrderValue: 0,
    successCount: 0,
    refundedCount: 0,
    topCourses: [],
  });
  const [filters, setFilters] = useState({
    query: "",
    status: "all",
    from: "",
    to: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [processing, setProcessing] = useState("");
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showDirectRefund, setShowDirectRefund] = useState(false);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [directRefundReason, setDirectRefundReason] = useState("");
  const [statusUpdateData, setStatusUpdateData] = useState({
    status: "",
    reason: "",
  });

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [paymentsRes, refundsRes, deferralsRes] = await Promise.all([
        getAllPayments(token),
        getAllRefundRequests(token),
        getAllDeferralRequests(token),
      ]);
      setPayments(paymentsRes);
      setRefunds(refundsRes);
      setDeferrals(deferralsRes);
      // compute analytics
      const totalRevenue = paymentsRes
        .filter((p) => p.status === "success")
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const successCount = paymentsRes.filter(
        (p) => p.status === "success"
      ).length;
      const refundedCount = paymentsRes.filter(
        (p) => p.status === "refunded"
      ).length;
      const avgOrderValue = successCount
        ? Math.round(totalRevenue / successCount)
        : 0;
      const courseTotals = new Map();
      paymentsRes.forEach((p) => {
        const name = p.course?.title || p.course?.name || "Unknown";
        courseTotals.set(
          name,
          (courseTotals.get(name) || 0) + (Number(p.amount) || 0)
        );
      });
      const topCourses = Array.from(courseTotals.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, total]) => ({ name, total }));
      setAnalytics({
        totalRevenue,
        totalPayments: paymentsRes.length,
        totalRefunds: refundsRes.length,
        totalDeferrals: deferralsRes.length,
        avgOrderValue,
        successCount,
        refundedCount,
        topCourses,
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRefund = async (id) => {
    try {
      setProcessing(id + "-approve");
      await approveRefund(token, id, adminNote);
      toast.success("Refund approved");
      fetchData();
    } catch (err) {
      setError("Failed to approve refund.");
    } finally {
      setProcessing("");
    }
  };

  const handleRejectRefund = async (id) => {
    try {
      setProcessing(id + "-reject");
      await rejectRefund(token, id, adminNote);
      toast.success("Refund rejected");
      fetchData();
    } catch (err) {
      setError("Failed to reject refund.");
    } finally {
      setProcessing("");
    }
  };

  const handleApproveDeferral = async (id) => {
    try {
      await approveDeferral(token, id);
      fetchData();
    } catch (err) {
      setError("Failed to approve deferral.");
    }
  };

  const handleRejectDeferral = async (id) => {
    try {
      await rejectDeferral(token, id);
      fetchData();
    } catch (err) {
      setError("Failed to reject deferral.");
    }
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

  // Admin advanced controls
  const handleDirectRefund = async (paymentId, reason) => {
    try {
      setProcessing(paymentId + "-direct-refund");
      await adminDirectRefund(token, paymentId, reason);
      toast.success("Payment refunded successfully");
      setShowDirectRefund(false);
      setDirectRefundReason("");
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to process refund");
    } finally {
      setProcessing("");
    }
  };

  const handleStatusUpdate = async (paymentId, status, reason) => {
    try {
      setProcessing(paymentId + "-status-update");
      await updatePaymentStatus(token, paymentId, status, reason);
      toast.success("Payment status updated");
      setShowStatusUpdate(false);
      setStatusUpdateData({ status: "", reason: "" });
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to update status");
    } finally {
      setProcessing("");
    }
  };

  const handleBulkAction = async (action, reason) => {
    if (selectedPayments.length === 0) {
      toast.error("Please select payments");
      return;
    }
    try {
      setProcessing("bulk-" + action);
      await bulkPaymentActions(token, selectedPayments, action, reason);
      toast.success(`Bulk ${action} completed`);
      setShowBulkActions(false);
      setSelectedPayments([]);
      fetchData();
    } catch (err) {
      toast.error(
        err?.response?.data?.error || "Failed to process bulk action"
      );
    } finally {
      setProcessing("");
    }
  };

  const togglePaymentSelection = (paymentId) => {
    setSelectedPayments((prev) =>
      prev.includes(paymentId)
        ? prev.filter((id) => id !== paymentId)
        : [...prev, paymentId]
    );
  };

  const filteredPayments = payments.filter((p) => {
    const q = filters.query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      `${p.user?.firstName || ""} ${p.user?.lastName || ""}`
        .toLowerCase()
        .includes(q) ||
      (p.course?.title || p.course?.name || "").toLowerCase().includes(q) ||
      (p.transactionId || "").toLowerCase().includes(q);
    const matchesStatus =
      filters.status === "all" || p.status === filters.status;
    const created = new Date(p.createdAt).getTime();
    const fromOk = !filters.from || created >= new Date(filters.from).getTime();
    const toOk = !filters.to || created <= new Date(filters.to).getTime();
    return matchesQuery && matchesStatus && fromOk && toOk;
  });

  const renderPaymentsTable = () => (
    <div className="overflow-x-auto">
      {/* Bulk Actions Bar */}
      {selectedPayments.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedPayments.length} payment(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBulkActions(true)}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
              >
                Bulk Actions
              </button>
              <button
                onClick={() => setSelectedPayments([])}
                className="px-3 py-1 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <thead>
          <tr className="bg-green-100 dark:bg-green-900/40">
            <th className="py-3 px-4 text-left">
              <input
                type="checkbox"
                checked={
                  selectedPayments.length === filteredPayments.length &&
                  filteredPayments.length > 0
                }
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedPayments(filteredPayments.map((p) => p._id));
                  } else {
                    setSelectedPayments([]);
                  }
                }}
                className="rounded"
              />
            </th>
            <th className="py-3 px-4 text-left">User</th>
            <th className="py-3 px-4 text-left">Course</th>
            <th className="py-3 px-4 text-left">Amount</th>
            <th className="py-3 px-4 text-left">Date</th>
            <th className="py-3 px-4 text-left">Status</th>
            <th className="py-3 px-4 text-left">Transaction ID</th>
            <th className="py-3 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPayments.map((p) => (
            <tr
              key={p._id}
              className="border-b border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-gray-700/40"
            >
              <td className="py-2 px-4">
                <input
                  type="checkbox"
                  checked={selectedPayments.includes(p._id)}
                  onChange={() => togglePaymentSelection(p._id)}
                  className="rounded"
                />
              </td>
              <td className="py-2 px-4">
                {p.user?.firstName} {p.user?.lastName}
              </td>
              <td className="py-2 px-4">{p.course?.title || p.course?.name}</td>
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
              <td className="py-2 px-4 text-xs">{p.transactionId || "-"}</td>
              <td className="py-2 px-4">
                <div className="flex gap-1">
                  <button
                    onClick={() =>
                      handleDownloadInvoice(p._id, p.transactionId)
                    }
                    className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                  >
                    Invoice
                  </button>
                  {p.status === "success" && (
                    <button
                      onClick={() => {
                        setSelectedPayment(p);
                        setShowDirectRefund(true);
                      }}
                      className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                    >
                      Refund
                    </button>
                  )}
                  {/* <button
                    onClick={() => {
                      setSelectedPayment(p);
                      setShowStatusUpdate(true);
                    }}
                    className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                  >
                    Edit Status
                  </button> */}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderRefundsTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <thead>
          <tr className="bg-green-100 dark:bg-green-900/40">
            <th className="py-3 px-4 text-left">User</th>
            <th className="py-3 px-4 text-left">Course</th>
            <th className="py-3 px-4 text-left">Amount</th>
            <th className="py-3 px-4 text-left">Reason</th>
            <th className="py-3 px-4 text-left">Status</th>
            <th className="py-3 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {refunds.map((r) => (
            <tr
              key={r._id}
              className="border-b border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-gray-700/40"
            >
              <td className="py-2 px-4">
                {r.user?.firstName} {r.user?.lastName}
              </td>
              <td className="py-2 px-4">
                {r.payment?.course?.title || r.payment?.course?.name}
              </td>
              <td className="py-2 px-4">₹{r.payment?.amount}</td>
              <td className="py-2 px-4">{r.reason}</td>
              <td className="py-2 px-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${
                    r.status === "pending"
                      ? "bg-yellow-200 text-yellow-800"
                      : r.status === "approved"
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                  }`}
                >
                  {r.status}
                </span>
              </td>
              <td className="py-2 px-4">
                {r.status === "pending" && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Admin note (optional)"
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      className="w-full px-2 py-1 border rounded-lg text-xs bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveRefund(r._id)}
                        disabled={processing === r._id + "-approve"}
                        className={`px-3 py-1 text-white text-xs rounded-lg ${
                          processing === r._id + "-approve"
                            ? "bg-green-300 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                      >
                        {processing === r._id + "-approve"
                          ? "Approving..."
                          : "Approve"}
                      </button>
                      <button
                        onClick={() => handleRejectRefund(r._id)}
                        disabled={processing === r._id + "-reject"}
                        className={`px-3 py-1 text-white text-xs rounded-lg ${
                          processing === r._id + "-reject"
                            ? "bg-red-300 cursor-not-allowed"
                            : "bg-red-500 hover:bg-red-600"
                        }`}
                      >
                        {processing === r._id + "-reject"
                          ? "Rejecting..."
                          : "Reject"}
                      </button>
                    </div>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderDeferralsTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <thead>
          <tr className="bg-green-100 dark:bg-green-900/40">
            <th className="py-3 px-4 text-left">User</th>
            <th className="py-3 px-4 text-left">Course</th>
            <th className="py-3 px-4 text-left">Batch</th>
            <th className="py-3 px-4 text-left">Reason</th>
            <th className="py-3 px-4 text-left">Status</th>
            <th className="py-3 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {deferrals.map((d) => (
            <tr
              key={d._id}
              className="border-b border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-gray-700/40"
            >
              <td className="py-2 px-4">
                {d.user?.firstName} {d.user?.lastName}
              </td>
              <td className="py-2 px-4">{d.course?.title || d.course?.name}</td>
              <td className="py-2 px-4">{d.batch}</td>
              <td className="py-2 px-4">{d.reason}</td>
              <td className="py-2 px-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${
                    d.status === "pending"
                      ? "bg-yellow-200 text-yellow-800"
                      : d.status === "approved"
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                  }`}
                >
                  {d.status}
                </span>
              </td>
              <td className="py-2 px-4">
                {d.status === "pending" && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApproveDeferral(d._id)}
                      className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectDeferral(d._id)}
                      className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div
      className={`min-h-screen py-8 px-4 sm:px-8 transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gray-900 text-gray-100"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      <h1 className="text-2xl font-bold mb-6">Payment Management</h1>
      {/* Analytics cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Revenue
          </div>
          <div className="text-2xl font-bold">₹{analytics.totalRevenue}</div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Payments
          </div>
          <div className="text-2xl font-bold">{analytics.totalPayments}</div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Refunds
          </div>
          <div className="text-2xl font-bold">{analytics.totalRefunds}</div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Deferrals
          </div>
          <div className="text-2xl font-bold">{analytics.totalDeferrals}</div>
        </div>
      </div>
      {/* More analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"></div>
      <div className="mb-6 p-4 rounded-xl bg-white dark:bg-gray-800 shadow">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Top Courses by Revenue
        </div>
        <ul className="space-y-1">
          {analytics.topCourses.map((c) => (
            <li key={c.name} className="flex justify-between text-sm">
              <span>{c.name}</span>
              <span>₹{c.total}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          type="text"
          placeholder="Search user, course, transaction"
          value={filters.query}
          onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
          className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        />
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters((f) => ({ ...f, status: e.target.value }))
          }
          className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        >
          <option value="all">All statuses</option>
          <option value="success">Success</option>
          <option value="refunded">Refunded</option>
          <option value="deferred">Deferred</option>
          <option value="failed">Failed</option>
        </select>
        <input
          type="date"
          value={filters.from}
          onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
          className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        />
        <input
          type="date"
          value={filters.to}
          onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
          className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        />
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "payments"
                ? "bg-green-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            All Payments
          </button>
          <button
            onClick={() => setActiveTab("refunds")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "refunds"
                ? "bg-green-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            Refund Requests (
            {refunds.filter((r) => r.status === "pending").length})
          </button>
          <button
            onClick={() => setActiveTab("deferrals")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "deferrals"
                ? "bg-green-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            Deferral Requests (
            {deferrals.filter((d) => d.status === "pending").length})
          </button>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-8 text-lg">Loading...</div>
      ) : (
        <>
          {activeTab === "payments" && renderPaymentsTable()}
          {activeTab === "refunds" && renderRefundsTable()}
          {activeTab === "deferrals" && renderDeferralsTable()}
        </>
      )}

      {/* Modals */}
      {/* Direct Refund Modal */}
      {showDirectRefund && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Direct Refund</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Refunding payment for {selectedPayment.user?.firstName}{" "}
                {selectedPayment.user?.lastName}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Amount: ₹{selectedPayment.amount}
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Reason (optional)
              </label>
              <textarea
                value={directRefundReason}
                onChange={(e) => setDirectRefundReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                rows="3"
                placeholder="Enter reason for refund..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDirectRefund(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleDirectRefund(selectedPayment._id, directRefundReason)
                }
                disabled={processing === selectedPayment._id + "-direct-refund"}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {processing === selectedPayment._id + "-direct-refund"
                  ? "Processing..."
                  : "Refund"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusUpdate && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Update Payment Status</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={statusUpdateData.status}
                onChange={(e) =>
                  setStatusUpdateData((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              >
                <option value="">Select status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
                <option value="deferred">Deferred</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Reason (optional)
              </label>
              <textarea
                value={statusUpdateData.reason}
                onChange={(e) =>
                  setStatusUpdateData((prev) => ({
                    ...prev,
                    reason: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                rows="3"
                placeholder="Enter reason for status change..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowStatusUpdate(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleStatusUpdate(
                    selectedPayment._id,
                    statusUpdateData.status,
                    statusUpdateData.reason
                  )
                }
                disabled={
                  !statusUpdateData.status ||
                  processing === selectedPayment._id + "-status-update"
                }
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {processing === selectedPayment._id + "-status-update"
                  ? "Updating..."
                  : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Modal */}
      {showBulkActions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Bulk Actions</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {selectedPayments.length} payment(s) selected
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => handleBulkAction("refund", adminNote)}
                  disabled={processing.startsWith("bulk-refund")}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                >
                  {processing.startsWith("bulk-refund")
                    ? "Processing..."
                    : "Refund All"}
                </button>
                <button
                  onClick={() => handleBulkAction("mark_failed", adminNote)}
                  disabled={processing.startsWith("bulk-mark_failed")}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
                >
                  {processing.startsWith("bulk-mark_failed")
                    ? "Processing..."
                    : "Mark as Failed"}
                </button>
                <button
                  onClick={() => handleBulkAction("mark_success", adminNote)}
                  disabled={processing.startsWith("bulk-mark_success")}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  {processing.startsWith("bulk-mark_success")
                    ? "Processing..."
                    : "Mark as Success"}
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Admin Note (optional)
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                rows="3"
                placeholder="Enter note for bulk action..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkActions(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentManagement;
