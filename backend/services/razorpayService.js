import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order with coupon support
export const createRazorpayOrder = async (amount, courseId, userId, couponData = null) => {
  try {
    console.log("💳 Creating Razorpay order with data:", {
      amount,
      courseId: courseId.toString(),
      userId: userId.toString(),
      couponData
    });

    // Validate Razorpay configuration
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay configuration missing. Please check environment variables.");
    }

    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error("Invalid amount provided");
    }

    // Generate short receipt (max 40 chars)
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits
    const courseShort = courseId.toString().slice(-8); // Last 8 chars of courseId
    const userShort = userId.toString().slice(-8); // Last 8 chars of userId
    const receipt = `c${courseShort}_u${userShort}_${timestamp}`; // Format: c12345678_u87654321_12345678

    // Ensure receipt is within 40 character limit
    const finalReceipt = receipt.length > 40 ? receipt.substring(0, 40) : receipt;

    // Prepare notes object
    const notes = {
      courseId: courseId.toString(),
      userId: userId.toString(),
      type: "course_enrollment"
    };

    // Add coupon data to notes if provided
    if (couponData) {
      notes.couponId = couponData.couponId;
      notes.couponCode = couponData.couponCode;
      notes.originalAmount = couponData.originalAmount.toString();
      notes.discountAmount = couponData.discountAmount.toString();
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise and round to avoid decimal issues
      currency: "INR",
      receipt: finalReceipt,
      notes
    };

    console.log("💳 Razorpay order options:", options);

    const order = await razorpay.orders.create(options);
    console.log("✅ Razorpay order created:", order.id, "Receipt:", finalReceipt);
    return order;
  } catch (error) {
    console.error("❌ Error creating Razorpay order:", error);
    
    // Provide more specific error messages
    if (error.message.includes('Invalid key')) {
      throw new Error("Invalid Razorpay credentials");
    } else if (error.message.includes('amount')) {
      throw new Error("Invalid payment amount");
    } else {
      throw new Error(`Failed to create payment order: ${error.message}`);
    }
  }
};

// Verify Razorpay payment signature
export const verifyRazorpayPayment = (orderId, paymentId, signature) => {
  try {
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isValid = expectedSignature === signature;
    console.log(isValid ? "✅ Payment signature verified" : "❌ Invalid payment signature");
    return isValid;
  } catch (error) {
    console.error("❌ Error verifying payment:", error);
    return false;
  }
};

// Fetch payment details from Razorpay
export const getPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    console.log("✅ Payment details fetched:", payment.id);
    return payment;
  } catch (error) {
    console.error("❌ Error fetching payment details:", error);
    throw new Error("Failed to fetch payment details");
  }
};

export default razorpay;
