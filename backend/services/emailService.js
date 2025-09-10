import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import handlebars from "handlebars";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createTransporter = () => {
  const { EMAIL_USER, EMAIL_PASSWORD, EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE } =
    process.env;

  if (!EMAIL_USER || !EMAIL_PASSWORD) {
    console.error("Email credentials not configured");
    throw new Error("Email service not configured");
  }

  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_SECURE === "true",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });
};

let masterTemplate;
const loadMasterTemplate = async () => {
  if (masterTemplate) return masterTemplate;
  try {
    const templatePath = path.join(
      __dirname,
      "..",
      "templates",
      "master-template.html"
    );
    const source = await fs.readFile(templatePath, "utf-8");
    masterTemplate = handlebars.compile(source);
    console.log("Master email template loaded successfully.");
    return masterTemplate;
  } catch (error) {
    console.error("Failed to load master email template:", error);
    throw new Error("Could not load email template.");
  }
};

const sendEmail = async (to, subject, title, bodyContent) => {
  try {
    const transporter = createTransporter();
    const getTemplate = await loadMasterTemplate();

    const html = getTemplate({
      subject,
      title,
      body: bodyContent,
      year: new Date().getFullYear(),
    });

    const mailOptions = {
      from: `"BitWise LMS" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}. Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${to}: ${error.message}`);
    throw error;
  }
};

export const sendWelcomeEmail = (email, firstName) => {
  const title = "Welcome to BitWise!";
  const body = `
    <h2>Hi ${firstName},</h2>
    <p>Welcome to BitWise - Your Gateway to Knowledge and Success! 🎓</p>
    <p>We're thrilled to have you join our learning community where thousands of students are advancing their careers and skills every day.</p>
    
    <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #3b82f6;">
      <h3 style="color: #1e40af; margin: 0 0 15px 0;">🚀 What's Next?</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li>Browse our extensive course catalog</li>
        <li>Complete your learning profile for personalized recommendations</li>
        <li>Join study groups and connect with fellow learners</li>
        <li>Track your progress and earn certificates</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.CLIENT_URL}/dashboard" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; display: inline-block;">Start Learning Now</a>
    </div>
    
    <p><strong>💡 Pro Tip:</strong> Students who complete their profiles are 3x more likely to successfully finish their courses!</p>
    <p>Happy Learning! 📚</p>
  `;
  return sendEmail(
    email,
    "Welcome to BitWise - Start Your Learning Journey!",
    title,
    body
  );
};

export const sendVerificationEmail = (
  email,
  verificationToken,
  verificationUrl
) => {
  const title = "Verify Your BitWise Account";
  const body = `
    <h2>Welcome to BitWise! 🎓</h2>
    <p>To complete your registration and start accessing our courses, please verify your email address.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationUrl}" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; display: inline-block;">Verify My Account</a>
    </div>
    
    <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
      <h3 style="color: #1e40af; margin: 0 0 15px 0;">🌟 Why verify?</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li>Access to all courses and learning materials</li>
        <li>Progress tracking and certificates</li>
        <li>Community features and study groups</li>
        <li>Personalized learning recommendations</li>
      </ul>
    </div>
    
    <p>If the button doesn't work, copy and paste this URL into your browser:</p>
    <p style="background: #f5f5f5; padding: 10px; border-radius: 5px; font-family: monospace; word-break: break-all;">${verificationUrl}</p>
    <p>Need help? Reply to this email and our support team will assist you.</p>
  `;
  return sendEmail(
    email,
    "Verify Your BitWise Account - Almost There!",
    title,
    body
  );
};

export const sendPasswordResetEmail = (email, resetToken, resetUrl) => {
  const title = "Reset Your BitWise Password";
  const body = `
    <h2>Password Reset Request</h2>
    <p>We received a request to reset your BitWise account password. Click the button below to create a new password and get back to learning.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; display: inline-block;">Reset My Password</a>
    </div>
    
    <p><strong>🔒 Security Note:</strong> This link will expire in 1 hour for your security.</p>
    <p>If you didn't request this password reset, you can safely ignore this email. Your account remains secure.</p>
    
    <p>If the button doesn't work, copy and paste this URL into your browser:</p>
    <p style="background: #f5f5f5; padding: 10px; border-radius: 5px; font-family: monospace; word-break: break-all;">${resetUrl}</p>
  `;
  return sendEmail(email, "Reset Your BitWise Password", title, body);
};

// Load specific email templates
const loadEmailTemplate = async (templateName) => {
  try {
    const templatePath = path.join(
      __dirname,
      "..",
      "templates",
      `${templateName}.html`
    );
    const source = await fs.readFile(templatePath, "utf-8");
    return handlebars.compile(source);
  } catch (error) {
    console.error(`Failed to load ${templateName} template:`, error);
    throw new Error(`Could not load ${templateName} template.`);
  }
};

// Send OTP verification email
export const sendOTPVerificationEmail = async (email, userName, otpCode) => {
  try {
    const transporter = createTransporter();
    const template = await loadEmailTemplate("otp-verification");

    const html = template({
      userName,
      otpCode,
      year: new Date().getFullYear(),
    });

    const mailOptions = {
      from: `"Learning Management System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Email Verification - OTP Code",
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}. Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error(`Failed to send OTP email to ${email}: ${error.message}`);
    throw error;
  }
};

// Send welcome email after verification
export const sendWelcomeEmailAfterVerification = async (email, userName) => {
  try {
    const transporter = createTransporter();
    const template = await loadEmailTemplate("welcome-email");

    const html = template({
      userName,
      dashboardUrl: `${process.env.CLIENT_URL}/dashboard`,
      year: new Date().getFullYear(),
    });

    const mailOptions = {
      from: `"Learning Management System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to Learning Management System!",
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(
      `Welcome email sent to ${email}. Message ID: ${result.messageId}`
    );
    return true;
  } catch (error) {
    console.error(`Failed to send welcome email to ${email}: ${error.message}`);
    throw error;
  }
};
