import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// User APIs
export const getUserPaymentHistory = async (token) => {
  const response = await axios.get(`${API_URL}/api/v1/payments/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const requestRefund = async (token, paymentId, reason) => {
  const response = await axios.post(
    `${API_URL}/api/v1/payments/refund`,
    { paymentId, reason },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const requestDeferral = async (token, courseId, batch, reason) => {
  const response = await axios.post(
    `${API_URL}/api/v1/payments/deferral`,
    { courseId, batch, reason },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const getPaymentDetails = async (token, paymentId) => {
  const response = await axios.get(`${API_URL}/api/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Admin APIs
export const getAllPayments = async (token) => {
  const response = await axios.get(`${API_URL}/api/v1/payments/admin/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getAllRefundRequests = async (token) => {
  const response = await axios.get(`${API_URL}/api/v1/payments/admin/refunds`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const approveRefund = async (token, refundId, adminReason) => {
  const response = await axios.post(
    `${API_URL}/api/v1/payments/admin/refunds/${refundId}/approve`,
    { adminReason },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const rejectRefund = async (token, refundId, adminReason) => {
  const response = await axios.post(
    `${API_URL}/api/v1/payments/admin/refunds/${refundId}/reject`,
    { adminReason },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const getAllDeferralRequests = async (token) => {
  const response = await axios.get(
    `${API_URL}/api/v1/payments/admin/deferrals`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const approveDeferral = async (token, deferralId) => {
  const response = await axios.post(
    `${API_URL}/api/v1/payments/admin/deferrals/${deferralId}/approve`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const rejectDeferral = async (token, deferralId) => {
  const response = await axios.post(
    `${API_URL}/api/v1/payments/admin/deferrals/${deferralId}/reject`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const downloadInvoice = async (token, paymentId) => {
  const response = await axios.get(
    `${API_URL}/api/v1/payments/${paymentId}/invoice`,
    {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob",
    }
  );
  return response.data;
};

// Admin advanced controls
export const adminDirectRefund = async (token, paymentId, reason) => {
  const response = await axios.post(
    `${API_URL}/api/v1/payments/admin/direct-refund`,
    { paymentId, reason },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const updatePaymentStatus = async (token, paymentId, status, reason) => {
  const response = await axios.put(
    `${API_URL}/api/v1/payments/admin/update-status`,
    { paymentId, status, reason },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const bulkPaymentActions = async (token, paymentIds, action, reason) => {
  const response = await axios.post(
    `${API_URL}/api/v1/payments/admin/bulk-actions`,
    { paymentIds, action, reason },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const getPaymentAnalytics = async (token, period = "30d") => {
  const response = await axios.get(
    `${API_URL}/api/v1/payments/admin/analytics?period=${period}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};
