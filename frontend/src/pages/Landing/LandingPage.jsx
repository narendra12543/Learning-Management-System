import React, { useState, useEffect, useRef } from "react";
import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
  NavLink,
} from "react-router-dom";
import {
  
  BookOpen,

  Users,
  Award,
  Target,
  TrendingUp,
  Shield,
  Menu,
  Star ,
  Quote ,
  X,
  Sun,
  Moon,
  ChevronRight,
  CheckCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
 

  User,
  Phone,
  UserPlus,
  Check,
  ArrowRight,
  ArrowLeft,
  UserX,
  UserCheck,
  Briefcase,
  Layers,
  Code,
  Globe,
  MessageCircle,
  IndianRupeeIcon,
  FileText,
} from "lucide-react";
import { useAuth } from "../../contexts/Auth/AuthContext";
import { useTheme } from "../../contexts/Theme/ThemeContext";
import ReCAPTCHA from "react-google-recaptcha";
import toast from "react-hot-toast";
import OTPVerification from "../../components/Auth/OTPVerification";

const LandingPage = () => {

  const [searchParams] = useSearchParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    phone: "",
    password: "",
    terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [showCaptchaError, setShowCaptchaError] = useState(false);
  const [showEmailVerificationModal, setShowEmailVerificationModal] =
    useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [showSuspendedAccountModal, setShowSuspendedAccountModal] =
    useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [showLearningDemo, setShowLearningDemo] = useState(false);
  const [demoStep, setDemoStep] = useState(1);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [demoMessages, setDemoMessages] = useState([]);

  const recaptchaRef = useRef(null);

  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const success = params.get("success");
    const error = params.get("error");
    const message = params.get("message");

    if (error) {
      setError(
        decodeURIComponent(
          message || "Google authentication failed. Please try again."
        )
      );
      return;
    }

    if (token && success) {
      console.log("🔍 Landing page OAuth callback detected, processing...");
      localStorage.setItem("token", token);

      fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch user data");
          }
          return res.json();
        })
        .then((data) => {
          console.log(
            "✅ User data fetched from landing page:",
            data.user?.email
          );
          if (data.user) {
            login(null, null, data.user, token);
            window.history.replaceState({}, document.title, "/");
            navigate("/dashboard", { replace: true });
          } else {
            throw new Error("Invalid user data received");
          }
        })
        .catch((err) => {
          console.error("❌ Google login error from landing page:", err);
          localStorage.removeItem("token");
          setError("Google authentication failed. Please try again.");
        });
    }
  }, [location.search, login, navigate]);

  useEffect(() => {
    const error = searchParams.get("error");
    const message = searchParams.get("message");

    if (error) {
      console.log("❌ OAuth error detected on landing page:", error, message);

      if (error === "account_suspended") {
        toast.error(
          "Your account has been suspended. Please contact support for assistance."
        );
      } else if (error === "oauth_failed") {
        toast.error(message || "Authentication failed. Please try again.");
      } else {
        toast.error(message || "An error occurred during authentication.");
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);



 
  // Program highlights and takeaways
  const programHighlights = [
    {
      icon: "Award",
      title: "Experience Letter",
      description: "Official work experience certificate to boost your resume"
    },
    {
      icon: "FileText",
      title: "Recommendation Letter",
      description: "Personalized recommendation from industry mentors"
    },
    {
      icon: "Briefcase",
      title: "Job Offer Opportunity",
      description: "Direct placement opportunity with Ecera System"
    },
    {
      icon: "Users",
      title: "Mentorship & Guidance",
      description: "1-on-1 support from senior developers"
    },
    {
      icon: "Target",
      title: "Structured Learning Path",
      description: "Progressive skill development with clear milestones"
    },
    {
      icon: "Code",
      title: "Portfolio Development",
      description: "Build impressive projects for your GitHub portfolio"
    },
    {
      icon: "TrendingUp",
      title: "Career Support",
      description: "Interview prep, resume review, and job placement assistance"
    },
    {
      icon: "Award",
      title: "Program Certificate",
      description: "Industry-recognized completion certificate"
    }
  ];




  const careerPrepItems = [
    "Crafting your elevator pitch",
    "LinkedIn profile tips",
    "Resumes/cover letters",
    "Navigating your job search",
    "Interview tips and preparation",
    "Negotiating salary",
    "Building confidence and being assertive",
    "Advancing in your career",
  ];
  const toolsAndTech = [
    {
      name: "MongoDB",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/MongoDB_Logo.svg/2560px-MongoDB_Logo.svg.png",
    },
    {
      name: "Express.js",
      logo: "https://upload.wikimedia.org/wikipedia/commons/6/64/Expressjs.png",
    },
    {
      name: "React",
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
    },
    {
      name: "Node.js",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Node.js_logo.svg/2560px-Node.js_logo.svg.png",
    },
    {
      name: "JavaScript",
      logo: "https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png",
    },
    {
      name: "HTML5",
      logo: "https://upload.wikimedia.org/wikipedia/commons/6/61/HTML5_logo_and_wordmark.svg",
    },
    {
      name: "CSS3",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d5/CSS3_logo_and_wordmark.svg",
    },
    {
      name: "Git",
      logo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Git_icon.svg",
    },
    {
      name: "GitHub",
      logo: "https://upload.wikimedia.org/wikipedia/commons/c/c2/GitHub_Invertocat_Logo.svg",
    },
  ];
  const successStories = [
    {
      name: "Ananya Sharma",
      role: "MERN Stack Developer at Innovatech Solutions",
      story:
        "The hands-on projects at RemoteJobs gave me a solid portfolio. I built a full-stack e-commerce app and landed my dream job straight out of the program!",
      image: "https://placehold.co/100x100/F5D7B7/000000?text=AS",
    },
    {
      name: "Rohan Patel",
      role: "Backend Engineer at Global FinTech",
      story:
        "RemoteJobs's focus on Node.js and Express.js was a game-changer. I mastered creating scalable APIs, which was exactly what my employer was looking for.",
      image: "https://placehold.co/100x100/A1C4FD/000000?text=RP",
    },
    {
      name: "Priya Singh",
      role: "Frontend Developer at Creative Co.",
      story:
        "The React curriculum at RemoteJobs was top-notch. I not only learned the framework but also how to build beautiful, user-centric UIs that stand out. I'm now a lead developer on a major project.",
      image: "https://placehold.co/100x100/98DD6A/000000?text=PS",
    },
  ];
  const faqs = [
    {
      question: "What is the MERN stack?",
      answer: (
        <div>
          <p className="mb-3">MERN is a JavaScript-based technology stack for building full-stack web applications. It consists of:</p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>MongoDB:</strong> NoSQL database for flexible data storage</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>Express.js:</strong> Web application framework for Node.js</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>React:</strong> Frontend library for building user interfaces</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>Node.js:</strong> JavaScript runtime for server-side development</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      question: "What is the program duration and structure?",
      answer: (
        <div>
          <p className="mb-3">Our comprehensive 6-month program is designed for maximum learning efficiency:</p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>Duration:</strong> 6 months intensive training</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>Format:</strong> Live interactive sessions + hands-on projects</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>Commitment:</strong> 8-12 hours per week</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>Projects:</strong> 3+ real-world applications in your portfolio</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      question: "What are the working days and timings?",
      answer: (
        <div>
          <p className="mb-3">Our live sessions are scheduled to accommodate working professionals:</p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>Monday:</strong> 8:00 PM – 9:00 PM IST (Theory & Concepts)</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>Wednesday:</strong> 7:00 PM – 10:00 PM IST (Hands-on Coding)</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>Saturday:</strong> 6:00 PM - 10:00 PM IST (Project Work & Review)</span>
            </li>
          </ul>
          <p className="mt-3 text-sm bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
            <strong>Note:</strong> All sessions are recorded and available for later review if you miss any live session.
          </p>
        </div>
      ),
    },
    {
      question: "What is the program fee and payment options?",
      answer: (
        <div>
          <p className="mb-3">Transparent pricing with flexible payment options:</p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>Total Fee:</strong> ₹14,000/- INR (One-time payment)</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>EMI Option:</strong> Available in 3-6 month installments</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>Early Bird:</strong> 10% discount for first 50 enrollments</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>Includes:</strong> All materials, projects, mentorship & job support</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      question: "What is the refund policy?",
      answer: (
        <div>
          <p className="mb-3">We offer a fair and transparent refund policy:</p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>7-Day Guarantee:</strong> Full refund within 7 days of purchase</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>Progress Limit:</strong> No refund if you've completed more than 20% of the course</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>After 7 Days:</strong> No refund for any reason</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>Deferral Option:</strong> Can defer to future batch once (valid for 6 months)</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      question: "Will I get a job offer after completion?",
      answer: (
        <div>
          <p className="mb-3">We provide comprehensive job placement support:</p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>Job Guarantee:</strong> Full-time job opportunity after successful completion</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>Placement Rate:</strong> 88% of graduates placed within 9 months</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>Average Package:</strong> 10 LPA for dream job placements</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>Support Includes:</strong> Resume building, interview prep, and direct company referrals</span>
            </li>
          </ul>
          <p className="mt-3 text-sm bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
            <strong>Requirements:</strong> Complete all projects, maintain 80%+ attendance, and pass final assessment.
          </p>
        </div>
      ),
    },
    {
      question: "What technologies and skills will I learn?",
      answer: (
        <div>
          <p className="mb-3">Comprehensive curriculum covering modern web development:</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Frontend Technologies:</h4>
              <ul className="space-y-1 ml-4">
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                  <span className="text-sm">React.js & Hooks</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                  <span className="text-sm">HTML5, CSS3, JavaScript ES6+</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                  <span className="text-sm">Tailwind CSS & Bootstrap</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                  <span className="text-sm">Redux & Context API</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Backend Technologies:</h4>
              <ul className="space-y-1 ml-4">
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                  <span className="text-sm">Node.js & Express.js</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                  <span className="text-sm">MongoDB & Mongoose</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                  <span className="text-sm">RESTful APIs & GraphQL</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                  <span className="text-sm">Authentication & Security</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      question: "What kind of projects will I build?",
      answer: (
        <div>
          <p className="mb-3">Build real-world applications that showcase your skills:</p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start">
              <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>E-commerce Platform:</strong> Full-featured online store with payment integration</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>Social Media App:</strong> Real-time chat, posts, and user interactions</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>Task Management Tool:</strong> Collaborative project management system</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span><strong>Portfolio Website:</strong> Professional showcase of your work and skills</span>
            </li>
          </ul>
          <p className="mt-3 text-sm bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
            All projects include deployment, testing, and are added to your GitHub portfolio.
          </p>
        </div>
      ),
    },
  ];



 

  const resetForm = () => {
    setFormData({
      firstName: "",
      email: "",
      phone: "",
      password: "",
      terms: false,
    });
    setError("");
    setErrors({});
    setRecaptchaToken("");
    setShowCaptchaError(false);
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const onReCAPTCHAChange = (token) => {
    setRecaptchaToken(token);
    setShowCaptchaError(false);
    if (errors.captcha) {
      setErrors((prev) => ({ ...prev, captcha: "" }));
    }
  };

  const validateLoginForm = () => {
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return false;
    }
    if (!recaptchaToken) {
      setShowCaptchaError(true);
      return false;
    }
    return true;
  };

  const handleOTPVerificationSuccess = (user) => {
    console.log("handleOTPVerificationSuccess called with user:", user);
    setShowOTPVerification(false);
    navigate("/dashboard", { replace: true });
  };

  const validateSignupForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "Name is required";
    else if (formData.firstName.trim().length < 2)
      newErrors.firstName = "Name must be at least 2 characters";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Please enter a valid email";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Phone number must be exactly 10 digits";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!formData.terms)
      newErrors.terms = "You must accept the terms and conditions";
    if (!recaptchaToken) newErrors.captcha = "Please verify you are human";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      if (!validateLoginForm()) return;
    } else {
      if (!validateSignupForm()) return;
    }
    setIsLoading(true);
    setError("");
    try {
      if (isLogin) {
        await login(formData.email, formData.password, recaptchaToken);
        navigate("/dashboard", { replace: true });
      } else {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/auth/register`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...formData, recaptchaToken }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          if (!data.user || !data.token)
            throw new Error("Invalid response from server");
          await login(null, null, data.user, data.token);
          setRegisteredEmail(data.user.email);
          setShowEmailVerificationModal(true);
        } else {
          setError(
            data.error ||
              data.message ||
              "Registration failed. Please try again."
          );
          if (data.recaptchaError && recaptchaRef.current) {
            recaptchaRef.current.reset();
            setRecaptchaToken("");
          }
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.data?.accountSuspended) {
        setShowSuspendedAccountModal(true);
        resetForm();
      } else {
        setError(
          err.response?.data?.error ||
            err.message ||
            "Authentication failed. Please try again."
        );
      }
      if (err.response?.data?.recaptchaError && recaptchaRef.current) {
        recaptchaRef.current.reset();
        setRecaptchaToken("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    const backendUrl = import.meta.env.VITE_API_URL?.replace("/api/v1", "");
    const redirectUrl = encodeURIComponent(window.location.origin + "/");
    console.log(
      "🔗 Initiating Google OAuth from landing page with redirect:",
      redirectUrl
    );
    window.location.href = `${backendUrl}/api/v1/auth/google?redirect=${redirectUrl}`;
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendMessage("");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/auth/resend-verification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: registeredEmail }),
        }
      );
      const data = await response.json();
      setResendMessage(
        response.ok
          ? "Verification email sent successfully!"
          : data.error || "Failed to send verification email."
      );
    } catch (err) {
      setResendMessage("Network error. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      setShowAuthForm(true);
      setIsLogin(false);
    }
  };

  const handleExperienceLearning = () => {
    setShowLearningDemo(true);
    setDemoStep(1);
    setCompletedTasks([]);
    setDemoMessages([]);
    // Simulate initial meeting messages
    setTimeout(() => {
      setDemoMessages([
        { id: 1, sender: "Mentor Sarah", message: "Welcome to today's project meeting! We'll be working on the E-commerce API.", time: "2:00 PM", avatar: "bg-emerald-500" },
        { id: 2, sender: "You", message: "Hi everyone! Excited to get started.", time: "2:01 PM", avatar: "bg-blue-500" },
        { id: 3, sender: "Alex (Peer)", message: "I've already set up the database schema. Ready to work on the endpoints!", time: "2:02 PM", avatar: "bg-purple-500" }
      ]);
    }, 1000);
  };

  const handleDemoTaskComplete = (taskId) => {
    setCompletedTasks(prev => [...prev, taskId]);
    if (taskId === 1) {
      setTimeout(() => {
        setDemoMessages(prev => [...prev, 
          { id: prev.length + 1, sender: "Mentor Sarah", message: "Great job on the user authentication! Moving to the next task.", time: "3:15 PM", avatar: "bg-emerald-500" }
        ]);
      }, 500);
    }
  };

  const nextDemoStep = () => {
    setDemoStep(prev => Math.min(prev + 1, 4));
  };

  const prevDemoStep = () => {
    setDemoStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <>
      {/* Learning Experience Demo Modal */}
      {showLearningDemo && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white ml-4">
                  Live Learning Experience Demo
                </h2>
              </div>
              <button
                onClick={() => setShowLearningDemo(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Demo Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Step Indicator */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center space-x-4">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        step <= demoStep 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-500'
                      }`}>
                        {step < demoStep ? <CheckCircle className="w-6 h-6" /> : step}
                      </div>
                      {step < 4 && (
                        <div className={`w-16 h-1 mx-2 ${
                          step < demoStep ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-600'
                        }`}></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 1: Join Meeting */}
              {demoStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      Step 1: Join Live Team Meeting
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                      Connect with your mentor and peers for today's project discussion
                    </p>
                  </div>

                  {/* Meeting Interface */}
                  <div className="bg-gray-900 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-white font-semibold">E-commerce API Project - Team Meeting</div>
                      <div className="flex items-center space-x-2 text-green-400">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm">Live</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gray-700 rounded-lg p-4 text-center">
                        <div className="w-12 h-12 bg-emerald-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-white text-sm font-medium">Sarah (Mentor)</div>
                        <div className="text-gray-400 text-xs">Senior Developer</div>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-4 text-center border-2 border-blue-500">
                        <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-white text-sm font-medium">You</div>
                        <div className="text-blue-400 text-xs">Learning</div>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-4 text-center">
                        <div className="w-12 h-12 bg-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-white text-sm font-medium">Alex</div>
                        <div className="text-gray-400 text-xs">Peer Learner</div>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-4 text-center">
                        <div className="w-12 h-12 bg-pink-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-white text-sm font-medium">Maya</div>
                        <div className="text-gray-400 text-xs">Peer Learner</div>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="bg-gray-800 rounded-lg p-4 h-48 overflow-y-auto">
                      {demoMessages.map((msg) => (
                        <div key={msg.id} className="flex items-start space-x-3 mb-3">
                          <div className={`w-8 h-8 ${msg.avatar} rounded-full flex items-center justify-center`}>
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-white text-sm font-medium">{msg.sender}</span>
                              <span className="text-gray-400 text-xs">{msg.time}</span>
                            </div>
                            <p className="text-gray-300 text-sm">{msg.message}</p>
                          </div>
                        </div>
                      ))}
                      {demoMessages.length === 0 && (
                        <div className="text-center text-gray-400 mt-16">
                          <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>Connecting to meeting...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Get Project Assignment */}
              {demoStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      Step 2: Receive Real Project Assignment
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                      Get assigned actual industry tasks that build your portfolio
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-700">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          Project: E-commerce API Development
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                          Build a complete REST API for an e-commerce platform with user authentication, 
                          product management, and order processing.
                        </p>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <h5 className="font-semibold text-gray-900 dark:text-white">Your Tasks:</h5>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                                <div className="w-6 h-6 border-2 border-emerald-500 rounded-full flex items-center justify-center">
                                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                </div>
                                <span className="text-gray-700 dark:text-gray-300">User Authentication System</span>
                              </div>
                              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                <div className="w-6 h-6 border-2 border-gray-400 rounded-full"></div>
                                <span className="text-gray-500">Product CRUD Operations</span>
                              </div>
                              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                <div className="w-6 h-6 border-2 border-gray-400 rounded-full"></div>
                                <span className="text-gray-500">Order Management</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <h5 className="font-semibold text-gray-900 dark:text-white">Tech Stack:</h5>
                            <div className="flex flex-wrap gap-2">
                              {['Node.js', 'Express', 'MongoDB', 'JWT', 'Bcrypt'].map((tech) => (
                                <span key={tech} className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-full text-sm font-medium">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Work on Tasks */}
              {demoStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      Step 3: Complete Tasks Progressively
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                      Work through each task with mentor guidance and peer collaboration
                    </p>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Task List */}
                    <div className="space-y-4">
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white">Current Tasks</h4>
                      
                      <div className="space-y-3">
                        <div className={`p-4 rounded-xl border-2 transition-all ${
                          completedTasks.includes(1) 
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' 
                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {completedTasks.includes(1) ? (
                                <CheckCircle className="w-6 h-6 text-green-600" />
                              ) : (
                                <div className="w-6 h-6 border-2 border-blue-600 rounded-full flex items-center justify-center">
                                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                </div>
                              )}
                              <div>
                                <h5 className="font-semibold text-gray-900 dark:text-white">
                                  Task 1: User Authentication
                                </h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Implement JWT-based authentication system
                                </p>
                              </div>
                            </div>
                            {!completedTasks.includes(1) && (
                              <button
                                onClick={() => handleDemoTaskComplete(1)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="p-4 rounded-xl border-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 border-2 border-gray-400 rounded-full"></div>
                            <div>
                              <h5 className="font-semibold text-gray-500">Task 2: Product CRUD</h5>
                              <p className="text-sm text-gray-400">Unlocks after Task 1</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl border-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 border-2 border-gray-400 rounded-full"></div>
                            <div>
                              <h5 className="font-semibold text-gray-500">Task 3: Order Management</h5>
                              <p className="text-sm text-gray-400">Unlocks after Task 2</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Code Example */}
                    <div className="space-y-4">
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white">Your Work</h4>
                      <div className="bg-gray-900 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-gray-300 text-sm">auth.js</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-green-400 text-xs">Saved</span>
                          </div>
                        </div>
                        <pre className="text-green-400 text-sm overflow-x-auto">
{`const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const authenticateUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user in database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }
    
    // Verify password
    const isValid = await bcrypt.compare(
      password, 
      user.password
    );
    
    if (isValid) {
      const token = jwt.sign(
        { userId: user._id }, 
        process.env.JWT_SECRET
      );
      res.json({ token, user });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Results */}
              {demoStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      Step 4: See Your Progress & Results
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                      Track your achievements and build an impressive portfolio
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Portfolio Project */}
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-700">
                      <div className="flex items-center space-x-3 mb-4">
                        <Award className="w-8 h-8 text-emerald-600" />
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">Project Completed!</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-gray-700 dark:text-gray-300">E-commerce API with full authentication</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-gray-700 dark:text-gray-300">Complete CRUD operations</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-gray-700 dark:text-gray-300">Order management system</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-gray-700 dark:text-gray-300">Deployed to production</span>
                        </div>
                      </div>
                    </div>

                    {/* Skills Gained */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center space-x-3 mb-4">
                        <TrendingUp className="w-8 h-8 text-blue-600" />
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">Skills Gained</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'Node.js', 'Express.js', 'MongoDB', 'JWT Authentication', 
                          'RESTful APIs', 'Error Handling', 'Database Design', 
                          'Team Collaboration', 'Git Workflow', 'Code Reviews'
                        ].map((skill) => (
                          <span key={skill} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div className="text-center bg-gray-50 dark:bg-gray-700 rounded-2xl p-8">
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Ready to Start Your Real Learning Journey?
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                      This is just a preview. Join our program to work on real projects with live mentorship!
                    </p>
                    <button
                      onClick={() => {
                        setShowLearningDemo(false);
                        setShowAuthForm(true);
                        setIsLogin(false);
                        // Scroll to hero section
                        setTimeout(() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }, 100);
                      }}
                      className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-3 rounded-xl font-bold hover:from-emerald-600 hover:to-green-700 transition-all duration-300 hover:scale-105"
                    >
                      Start Learning Now
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={prevDemoStep}
                  disabled={demoStep === 1}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="text-center">
                  <span className="text-gray-500 dark:text-gray-400">
                    Step {demoStep} of 4
                  </span>
                </div>

                <button
                  onClick={nextDemoStep}
                  disabled={demoStep === 4}
                  className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOTPVerification && (
        <OTPVerification
          email={registeredEmail}
          onVerificationSuccess={handleOTPVerificationSuccess}
          onBack={() => setShowOTPVerification(false)}
        />
      )}
      {/* Suspended Account Modal */}
      {showSuspendedAccountModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserX className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Account Suspended
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Your account has been temporarily suspended.
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 dark:text-red-300 mb-3">
                <strong>Why was my account suspended?</strong>
              </p>
              <ul className="text-sm text-red-700 dark:text-red-400 text-left list-disc list-inside space-y-1">
                <li>Violation of terms of service</li>
                <li>Suspicious account activity</li>
                <li>Administrative review in progress</li>
                <li>Payment or billing issues</li>
              </ul>
            </div>
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
              <p>
                If you believe this is an error or would like to appeal this
                decision, please contact our support team.
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="font-semibold text-gray-900 dark:text-white">
                  Contact Support:
                </p>
                <p>Email: mernprogram@ecerasystem.com</p>
                <p>Phone: +1 2486771972</p>
              </div>
            </div>
            <div className="mt-8">
              <button
                onClick={() => setShowSuspendedAccountModal(false)}
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Email Verification Modal */}
      {showEmailVerificationModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Check Your Email
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                We've sent a verification link to:
              </p>
              <p className="text-green-600 dark:text-green-400 font-semibold mt-1">
                {registeredEmail}
              </p>
            </div>
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
              <p>
                Please check your email and click the verification link to
                activate your account.
              </p>
              <p>
                You must verify your email before you can access your learning
                dashboard.
              </p>
            </div>
            <div className="mt-8 space-y-3">
              <button
                onClick={() => {
                  setShowEmailVerificationModal(false);
                  navigate("/dashboard");
                }}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
              >
                Go to Dashboard
              </button>
              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 disabled:opacity-50"
              >
                {resendLoading ? "Sending..." : "Resend Verification Email"}
              </button>
              {resendMessage && (
                <div
                  className={`text-sm p-3 rounded-lg ${
                    resendMessage.includes("successfully")
                      ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                      : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                  }`}
                >
                  {resendMessage}
                </div>
              )}
              <button
                onClick={() => setShowEmailVerificationModal(false)}
                className="w-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/90 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative mr-[-40px]">
                <img
                  src="/assets/logo.png"
                  alt="RemoteJobs Logo"
                  className="h-[100px] object-contain brightness-110"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                RemoteJobs
              </span>
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="/programs"
                className="text-gray-300 hover:text-blue-400 font-medium transition-colors"
              >
                Programs
              </a>
              <a
                href="/projects"
                className="text-gray-300 hover:text-purple-400 font-medium transition-colors"
              >
                Projects
              </a>
              <a
                href="/blogs"
                className="text-gray-300 hover:text-pink-400 font-medium transition-colors"
              >
                Blogs
              </a>
              
              <a
                href="#faqs"
                className="text-gray-300 hover:text-indigo-400 font-medium transition-colors"
              >
                FAQs
              </a>
            </div>
            {/* Action Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Dashboard
                </Link>
              ) : (
                <button
                  onClick={() => setShowAuthForm(true)}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Sign In
                </button>
              )}
            </div>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-300" />
              )}
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 shadow-2xl z-50 animate-slide-down">
            <div className="px-6 py-6 space-y-4">
              {/* Navigation Links */}
              <div className="space-y-3">
                <a
                  href="/programs"
                  className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-blue-400/30 hover:bg-blue-500/10 transition-all duration-300 group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-gray-300 group-hover:text-blue-400 font-medium transition-colors">Programs</span>
                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300" />
                </a>
                
                <a
                  href="/projects"
                  className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-purple-400/30 hover:bg-purple-500/10 transition-all duration-300 group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-gray-300 group-hover:text-purple-400 font-medium transition-colors">Projects</span>
                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-300" />
                </a>
                
                <a
                  href="/blogs"
                  className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-pink-400/30 hover:bg-pink-500/10 transition-all duration-300 group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-gray-300 group-hover:text-pink-400 font-medium transition-colors">Blogs</span>
                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-pink-400 group-hover:translate-x-1 transition-all duration-300" />
                </a>
                
                <a
                  href="#faqs"
                  className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-indigo-400/30 hover:bg-indigo-500/10 transition-all duration-300 group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-gray-300 group-hover:text-indigo-400 font-medium transition-colors">FAQs</span>
                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-300" />
                </a>
              </div>
              
              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="flex items-center justify-center w-full py-4 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>Dashboard</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setShowAuthForm(true);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center justify-center w-full py-4 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
      
      {/* In the News - Top Banner */}
      <section className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 dark:from-emerald-700 dark:via-green-700 dark:to-teal-700 py-4 relative overflow-hidden z-40">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-white font-semibold text-sm uppercase tracking-wide">
                In the News
              </span>
            </div>
            <div className="hidden md:block w-px h-6 bg-white/30 flex-shrink-0"></div>
            <div className="flex-1 overflow-hidden">
              <div className="flex animate-scroll">
                <div className="flex whitespace-nowrap">
                  <span className="text-white text-sm font-medium px-8">
                    🎉 EdTech Firm Achieves Over 2,000 Placements in Top Tech Companies
                  </span>
                  <span className="text-white text-sm font-medium px-8">
                    📰 Featured in Education News: August 29, 2024
                  </span>
                  <span className="text-white text-sm font-medium px-8">
                    🤝 Partnership with Foundation For Excellence to empower disadvantaged engineers
                  </span>
                  <span className="text-white text-sm font-medium px-8">
                    🚀 88% placement rate within 9 months of program completion
                  </span>
                  <span className="text-white text-sm font-medium px-8">
                    💼 Average salary package of 10 LPA for dream job placements
                  </span>
                </div>
                <div className="flex whitespace-nowrap">
                  <span className="text-white text-sm font-medium px-8">
                    🎉 EdTech Firm Achieves Over 2,000 Placements in Top Tech Companies
                  </span>
                  <span className="text-white text-sm font-medium px-8">
                    📰 Featured in Education News: August 29, 2024
                  </span>
                  <span className="text-white text-sm font-medium px-8">
                    🤝 Partnership with Foundation For Excellence to empower disadvantaged engineers
                  </span>
                  <span className="text-white text-sm font-medium px-8">
                    🚀 88% placement rate within 9 months of program completion
                  </span>
                  <span className="text-white text-sm font-medium px-8">
                    💼 Average salary package of 10 LPA for dream job placements
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <style jsx>{`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .animate-scroll {
            animation: scroll 25s linear infinite;
          }
        `}</style>
      </section>

      {/* Modern Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Dynamic Background */}
        <div className="absolute inset-0">
          {/* Animated gradient orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/30 to-purple-600/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/30 to-pink-600/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400/30 to-blue-600/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
          
          {/* Floating particles */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400 rounded-full animate-bounce opacity-60"></div>
            <div className="absolute top-40 right-32 w-1 h-1 bg-purple-400 rounded-full animate-bounce delay-300 opacity-70"></div>
            <div className="absolute bottom-32 left-1/3 w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-700 opacity-50"></div>
            <div className="absolute bottom-20 right-1/4 w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-1000 opacity-60"></div>
            <div className="absolute top-1/2 left-10 w-1 h-1 bg-blue-300 rounded-full animate-bounce delay-200 opacity-80"></div>
            <div className="absolute top-3/4 right-10 w-2 h-2 bg-purple-300 rounded-full animate-bounce delay-800 opacity-40"></div>
          </div>

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`transition-all duration-700 ease-in-out ${
              !isAuthenticated && showAuthForm
                ? "grid lg:grid-cols-2 gap-16 items-center"
                : "flex flex-col items-center text-center max-w-6xl mx-auto"
            }`}
          >
            {/* Hero Content */}
            <div
              className={`transition-all duration-700 ease-in-out ${
                !isAuthenticated && showAuthForm
                  ? "space-y-8"
                  : "space-y-12 w-full"
              }`}
            >
              <div className="space-y-8">
                {/* Badge */}
                <div
                  className={`inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-xl rounded-full border border-blue-400/30 shadow-2xl transition-all duration-700 ${
                    !isAuthenticated && showAuthForm ? "text-sm" : "text-base"
                  }`}
                >
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-pulse"></div>
                  <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent font-bold">
                    EXPERIENCE-DRIVEN LEARNING
                  </span>
                  <div className="w-2 h-2 bg-purple-400 rounded-full ml-3 animate-pulse delay-500"></div>
                </div>

                {/* Main Heading */}
                <h1
                  className={`font-black leading-tight transition-all duration-700 ${
                    !isAuthenticated && showAuthForm
                      ? "text-4xl lg:text-5xl"
                      : "text-6xl lg:text-8xl"
                  }`}
                >
                  <span className="block text-white mb-4">
                    Learn Like You're
                  </span>
                  <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent relative">
                    Already Hired
                    <div className="absolute -bottom-4 left-0 w-full h-2 bg-gradient-to-r from-blue-400/50 via-purple-400/50 to-pink-400/50 rounded-full blur-sm"></div>
                  </span>
                </h1>

                {/* Subtitle */}
                <p
                  className={`text-gray-300 leading-relaxed font-medium transition-all duration-700 ${
                    !isAuthenticated && showAuthForm
                      ? "text-lg max-w-lg"
                      : "text-2xl max-w-4xl mx-auto"
                  }`}
                >
                  Join live team meetings, collaborate on real projects, and build professional experience 
                  that gets you hired. No boring lectures—just real work that matters.
                </p>

                {/* Interactive Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
                  <div className="group cursor-pointer transform hover:scale-105 transition-all duration-300">
                    <div className="text-center p-6 bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-xl rounded-3xl border border-blue-400/30 shadow-2xl hover:shadow-blue-500/25">
                      <div className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                        75%
                      </div>
                      <div className="text-white font-semibold mb-1">Job Placement</div>
                      <div className="text-gray-400 text-sm">Within 6 months</div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                        <div className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full w-[95%] animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group cursor-pointer transform hover:scale-105 transition-all duration-300">
                    <div className="text-center p-6 bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-xl rounded-3xl border border-purple-400/30 shadow-2xl hover:shadow-purple-500/25">
                      <div className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                        3+
                      </div>
                      <div className="text-white font-semibold mb-1">Live Projects</div>
                      <div className="text-gray-400 text-sm">Real company work</div>
                      <div className="flex justify-center mt-3 space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce" style={{animationDelay: `${i * 0.1}s`}}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="group cursor-pointer transform hover:scale-105 transition-all duration-300">
                    <div className="text-center p-6 bg-gradient-to-br from-pink-500/20 to-indigo-600/20 backdrop-blur-xl rounded-3xl border border-pink-400/30 shadow-2xl hover:shadow-pink-500/25">
                      <div className="text-4xl font-black bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                      ₹6L+
                      </div>
                      <div className="text-white font-semibold mb-1">Avg Salary</div>
                      <div className="text-gray-400 text-sm">Starting package</div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                        <div className="bg-gradient-to-r from-pink-400 to-indigo-400 h-2 rounded-full w-[80%] animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div
                className={`flex gap-6 transition-all duration-700 ${
                  !isAuthenticated && showAuthForm
                    ? "flex-col sm:flex-row"
                    : "flex-col sm:flex-row justify-center"
                }`}
              >
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className={`group relative overflow-hidden bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white rounded-2xl font-bold shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:scale-105 ${
                      !isAuthenticated && showAuthForm
                        ? "text-lg px-8 py-4"
                        : "text-xl px-12 py-6"
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10 flex items-center justify-center">
                      <span className="mr-3">Go to Dashboard</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ) : (
                  <button
                    onClick={() => setShowAuthForm(true)}
                    className={`group relative overflow-hidden bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white rounded-2xl font-bold shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:scale-105 ${
                      !isAuthenticated && showAuthForm
                        ? "text-lg px-8 py-4"
                        : "text-xl px-12 py-6"
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10 flex items-center justify-center">
                      <span className="mr-3">Start Your Journey</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                )}
                <button
                  onClick={() =>
                    document
                      .getElementById("who-is-this-for")
                      .scrollIntoView({ behavior: "smooth" })
                  }
                  className={`group relative overflow-hidden bg-white/10 backdrop-blur-xl text-white rounded-2xl font-bold border border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105 shadow-xl ${
                    !isAuthenticated && showAuthForm
                      ? "text-lg px-8 py-4"
                      : "text-xl px-12 py-6"
                  }`}
                >
                  <div className="relative z-10 flex items-center justify-center">
                    <span className="mr-3">Explore Program</span>
                    <Target className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </div>
                </button>
              </div>

              
            </div>
            {/* Enhanced Auth Form */}
            {!isAuthenticated && showAuthForm && (
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl relative overflow-hidden border border-white/20 transform transition-all duration-700 ease-in-out animate-slide-in-right">
                  {/* Enhanced gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10 rounded-3xl"></div>
                  {/* Enhanced Close Button */}
                  <button
                    onClick={() => setShowAuthForm(false)}
                    className="absolute top-4 right-4 z-20 p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 group shadow-lg border border-white/20"
                  >
                    <X className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                  </button>
                  {/* Enhanced Toggle Tabs */}
                  <div className="relative z-10 p-3">
                    <div className="flex bg-white/10 backdrop-blur-sm rounded-2xl p-1 shadow-inner border border-white/20">
                      <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 flex items-center justify-center py-4 px-6 rounded-xl font-bold transition-all duration-300 ${
                          isLogin
                            ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg transform scale-105"
                            : "text-gray-300 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <LogIn className="w-5 h-5 mr-2" />
                        <span>Sign In</span>
                        {!isLogin && (
                          <ArrowLeft className="w-4 h-4 ml-2 opacity-50" />
                        )}
                      </button>
                      <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 flex items-center justify-center py-4 px-6 rounded-xl font-bold transition-all duration-300 ${
                          !isLogin
                            ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg transform scale-105"
                            : "text-gray-300 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {isLogin && (
                          <ArrowRight className="w-4 h-4 mr-2 opacity-50" />
                        )}
                        <UserPlus className="w-5 h-5 mr-2" />
                        <span>Sign Up</span>
                      </button>
                    </div>
                  </div>
                  {/* Form Content - keeping existing form structure but enhanced styling */}
                  <div className="relative z-10 p-8 pt-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Conditional Fields for Signup */}
                      {!isLogin && (
                        <div className="group">
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Full Name
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                            </div>
                            <input
                              type="text"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              placeholder="Enter your full name"
                              className={`w-full pl-12 pr-4 py-3 border rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all border-white/20 ${
                                errors.firstName
                                  ? "border-red-400 focus:ring-red-400"
                                  : "hover:border-white/40"
                              }`}
                              required={!isLogin}
                            />
                          </div>
                          {errors.firstName && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.firstName}
                            </p>
                          )}
                        </div>
                      )}
                      {/* Email Field */}
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                          </div>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email"
                            className={`w-full pl-12 pr-4 py-3 border rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all border-white/20 ${
                              errors.email
                                ? "border-red-400 focus:ring-red-400"
                                : "hover:border-white/40"
                            }`}
                            required
                          />
                        </div>
                        {errors.email && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.email}
                          </p>
                        )}
                      </div>
                      {/* Phone Field (Signup only) */}
                      {!isLogin && (
                        <div className="group">
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Phone Number
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                            </div>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="Enter your phone number"
                              className={`w-full pl-12 pr-4 py-3 border rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all border-white/20 ${
                                errors.phone
                                  ? "border-red-400 focus:ring-red-400"
                                  : "hover:border-white/40"
                              }`}
                              required
                            />
                          </div>
                          {errors.phone && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.phone}
                            </p>
                          )}
                        </div>
                      )}
                      {/* Password Field */}
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder={
                              isLogin
                                ? "Enter your password"
                                : "Create a password"
                            }
                            className={`w-full pl-12 pr-14 py-3 border rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all border-white/20 ${
                              errors.password
                                ? "border-red-400 focus:ring-red-400"
                                : "hover:border-white/40"
                            }`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-white/10 rounded-r-xl transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400 hover:text-white" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400 hover:text-white" />
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.password}
                          </p>
                        )}
                      </div>
                      {/* Terms Checkbox (Signup only) */}
                      {!isLogin && (
                        <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-pink-500/10 backdrop-blur-sm rounded-xl border border-white/20">
                          <div className="flex items-center h-5 mt-0.5">
                            <input
                              type="checkbox"
                              name="terms"
                              checked={formData.terms}
                              onChange={handleInputChange}
                              className={`h-4 w-4 text-blue-400 focus:ring-blue-400 border-white/30 rounded transition-colors ${
                                errors.terms ? "border-red-400" : ""
                              }`}
                              required
                            />
                            {formData.terms && (
                              <Check className="absolute h-3 w-3 text-white ml-0.5 mt-0.5 pointer-events-none" />
                            )}
                          </div>
                          <div className="text-xs">
                            <label className="text-gray-300 font-medium">
                              I agree to the{" "}
                              <button
                                type="button"
                                className="text-blue-400 hover:text-blue-300 font-semibold hover:underline"
                              >
                                Terms & Conditions
                              </button>{" "}
                              and{" "}
                              <button
                                type="button"
                                className="text-blue-400 hover:text-blue-300 font-semibold hover:underline"
                              >
                                Privacy Policy
                              </button>
                            </label>
                          </div>
                        </div>
                      )}
                      {errors.terms && (
                        <p className="text-xs text-red-600">{errors.terms}</p>
                      )}
                      {/* reCAPTCHA */}
                      <div className="flex justify-center">
                        <ReCAPTCHA
                          ref={recaptchaRef}
                          sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                          onChange={onReCAPTCHAChange}
                          onExpired={() => setRecaptchaToken("")}
                          onErrored={() => setRecaptchaToken("")}
                          size="compact"
                        />
                      </div>
                      {(showCaptchaError || errors.captcha) && (
                        <p className="text-sm text-red-600 font-medium text-center">
                          Please verify you are human
                        </p>
                      )}
                      {/* Error Message */}
                      {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl p-3">
                          <p className="text-red-800 dark:text-red-300 text-sm font-medium">
                            {error}
                          </p>
                        </div>
                      )}
                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg relative overflow-hidden group disabled:opacity-50"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        {isLoading ? (
                          <div className="flex items-center justify-center relative z-10">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            {isLogin ? "Signing in..." : "Creating Account..."}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center relative z-10">
                            {isLogin ? (
                              <LogIn className="w-5 h-5 mr-2" />
                            ) : (
                              <UserPlus className="w-5 h-5 mr-2" />
                            )}
                            {isLogin ? "Sign In" : "Create Account"}
                          </div>
                        )}
                      </button>
                    </form>
                    {/* Google Auth */}
                    <div className="mt-6">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-white/20" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-white/10 backdrop-blur-sm text-gray-300 font-medium rounded-full border border-white/20">
                            Or continue with
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleGoogleAuth}
                        className="w-full mt-4 flex items-center justify-center py-3 px-4 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-gray-300 font-medium hover:bg-white/20 hover:text-white transition-all duration-300 hover:scale-105"
                      >
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Continue with Google
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Enhanced custom CSS */}
        <style jsx>{`
          @keyframes slide-in-right {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          .animate-slide-in-right {
            animation: slide-in-right 0.7s ease-out;
          }
          @keyframes float {
            0%,
            100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
        `}</style>
      </section>

     

   


      {/* Unique Learning Process Section */}
      <section id="learning-process" className="py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-10 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-indigo-400/10 to-blue-600/10 rounded-full blur-2xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-xl rounded-full border border-blue-400/30 shadow-2xl mb-6">
              <MessageCircle className="w-5 h-5 mr-2 text-blue-400" />
              <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent font-bold">
                REVOLUTIONARY LEARNING APPROACH
              </span>
            </div>
            <h2 className="text-4xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              Experience Real Work Environment
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Not Traditional Classes
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Forget boring videos and lectures. Our programs work like real internships where you join live meetings, 
              collaborate with teams, and complete real-world projects step by step.
            </p>
          </div>

          {/* Interactive Process Flow */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
            {/* Left Side - Interactive Steps */}
            <div className="space-y-6">
              {[
                { 
                  icon: MessageCircle, 
                  title: "Live Meetings", 
                  desc: "Real team collaboration",
                  gradient: "from-blue-500 to-purple-600",
                  stat: "Daily",
                  delay: "0s"
                },
                { 
                  icon: Briefcase, 
                  title: "Real Projects", 
                  desc: "Industry-standard work",
                  gradient: "from-purple-500 to-pink-600",
                  stat: "3+",
                  delay: "0.2s"
                },
                { 
                  icon: Target, 
                  title: "Progressive Tasks", 
                  desc: "Step-by-step mastery",
                  gradient: "from-pink-500 to-indigo-600",
                  stat: "100%",
                  delay: "0.4s"
                },
                { 
                  icon: Users, 
                  title: "Team Growth", 
                  desc: "Collaborative learning",
                  gradient: "from-indigo-500 to-blue-600",
                  stat: "24/7",
                  delay: "0.6s"
                }
              ].map((step, index) => (
                <div key={index} className="group cursor-pointer transform hover:scale-105 transition-all duration-500" style={{animationDelay: step.delay}}>
                  <div className="flex items-center space-x-6 p-6 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-300">
                    <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-white">{step.title}</h3>
                        <span className={`text-2xl font-black bg-gradient-to-r ${step.gradient.replace('to-', 'via-purple-400 to-')} bg-clip-text text-transparent`}>
                          {step.stat}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">{step.desc}</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              ))}
            </div>

            {/* Right Side - Visual Representation */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
                {/* Meeting Interface Mockup */}
                <div className="bg-slate-800 rounded-2xl p-4 mb-6 border border-purple-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-white text-sm font-medium">Team Meeting - Project Discussion</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-700 rounded-lg p-3 text-center border border-blue-500/30">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-2"></div>
                      <div className="text-white text-xs">Mentor</div>
                    </div>
                    <div className="bg-slate-700 rounded-lg p-3 text-center border border-purple-500/30">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mx-auto mb-2"></div>
                      <div className="text-white text-xs">You</div>
                    </div>
                    <div className="bg-slate-700 rounded-lg p-3 text-center border border-pink-500/30">
                      <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-indigo-600 rounded-full mx-auto mb-2"></div>
                      <div className="text-white text-xs">Peer 1</div>
                    </div>
                    <div className="bg-slate-700 rounded-lg p-3 text-center border border-indigo-500/30">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full mx-auto mb-2"></div>
                      <div className="text-white text-xs">Peer 2</div>
                    </div>
                  </div>
                </div>

                {/* Project Tasks */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-blue-500/20 backdrop-blur-sm rounded-xl border border-blue-400/30">
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                    <span className="text-blue-300 font-medium">Task 1: Database Design - Completed</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-purple-500/20 backdrop-blur-sm rounded-xl border border-purple-400/30">
                    <div className="w-5 h-5 border-2 border-purple-400 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    </div>
                    <span className="text-purple-300 font-medium">Task 2: API Development - In Progress</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <div className="w-5 h-5 border-2 border-gray-400 rounded-full"></div>
                    <span className="text-gray-300 font-medium">Task 3: Frontend Integration - Pending</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Differentiators */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            <h3 className="text-3xl font-bold text-white text-center mb-8">
              Why This Approach Works Better
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <X className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Traditional Learning</h4>
                <ul className="text-gray-300 space-y-1 text-left">
                  <li>• Watch pre-recorded videos</li>
                  <li>• Complete isolated assignments</li>
                  <li>• Limited interaction with peers</li>
                  <li>• Theoretical knowledge only</li>
                </ul>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Our Approach</h4>
                <ul className="text-gray-300 space-y-1 text-left">
                  <li>• Live collaborative meetings</li>
                  <li>• Real-world project experience</li>
                  <li>• Constant peer interaction</li>
                  <li>• Practical skills development</li>
                </ul>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your Results</h4>
                <ul className="text-gray-600 dark:text-gray-300 space-y-1 text-left">
                  <li>• Job-ready portfolio</li>
                  <li>• Team collaboration skills</li>
                  <li>• Industry connections</li>
                  <li>• Confidence to perform</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <button
              onClick={handleExperienceLearning}
              className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 text-white rounded-2xl font-bold hover:shadow-2xl transition-all duration-500 hover:scale-105 text-xl px-12 py-5"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-green-700 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 flex items-center justify-center">
                <span className="mr-2">Experience This Learning Style</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
            <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg">
              Join thousands who've transformed their careers through real work experience
            </p>
          </div>
        </div>
      </section>

      {/* Modern Work‑Experience Based Learning */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full mix-blend-multiply filter blur-xl"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full mix-blend-multiply filter blur-xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-pink-300/10 to-indigo-500/10 rounded-full mix-blend-multiply filter blur-2xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-xl rounded-full border border-blue-400/30 shadow-2xl text-sm font-medium mb-6">
              <Briefcase className="w-4 h-4 mr-2 text-blue-400" />
              <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent font-bold">
                Work-Experience Based Learning
              </span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Learn Like You're
              </span>
              <br />
              <span className="text-white">
                Already Employed
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Master modern full-stack development through real work experience. Build professional projects, 
              collaborate with teams, and develop skills that employers actually need.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
            {/* Left Side - Key Features */}
            <div className="space-y-8">
              <div className="flex items-start space-x-6 group">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Layers className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3">Project-Led Curriculum</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    Hands-on, project-focused learning that mirrors real development workflows. 
                    Build applications that solve actual business problems.
                  </p>
                  <ul className="mt-4 space-y-2 text-gray-300">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-blue-400 mr-2" />
                      <span>3+ Full-stack applications</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-blue-400 mr-2" />
                      <span>Industry-standard tools & practices</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start space-x-6 group">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3">Expert Mentorship</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    Learn from seasoned industry professionals who guide you through real-world challenges 
                    and share practical insights from their experience.
                  </p>
                  <ul className="mt-4 space-y-2 text-gray-300">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-purple-400 mr-2" />
                      <span>1-on-1 mentoring sessions</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-purple-400 mr-2" />
                      <span>Code reviews & feedback</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start space-x-6 group">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-pink-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3">Career-Focused Training</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    Every aspect of our program is designed to make you job-ready. From technical skills 
                    to professional communication and teamwork.
                  </p>
                  <ul className="mt-4 space-y-2 text-gray-300">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-pink-400 mr-2" />
                      <span>Interview preparation</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-pink-400 mr-2" />
                      <span>Portfolio development</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Side - Skills Grid */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-8 text-center">
                  Master These Skills
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="group p-6 rounded-2xl bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Code className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-white mb-2">Full-Stack Development</h4>
                    <p className="text-sm text-gray-300">MERN stack, APIs, databases, deployment</p>
                  </div>

                  <div className="group p-6 rounded-2xl bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-white mb-2">Team Collaboration</h4>
                    <p className="text-sm text-gray-300">Git workflows, code reviews, Agile methods</p>
                  </div>

                  <div className="group p-6 rounded-2xl bg-pink-500/20 backdrop-blur-sm border border-pink-400/30 hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-white mb-2">Problem Solving</h4>
                    <p className="text-sm text-gray-300">Debugging, optimization, system design</p>
                  </div>

                  <div className="group p-6 rounded-2xl bg-indigo-500/20 backdrop-blur-sm border border-indigo-400/30 hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-white mb-2">Professional Skills</h4>
                    <p className="text-sm text-gray-300">Communication, presentation, leadership</p>
                  </div>
                </div>

                
              </div>
            </div>
          </div>

          {/* Success Metrics
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            <h3 className="text-3xl font-bold text-white text-center mb-8">
              Proven Results
            </h3>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">88%</div>
                <div className="text-gray-300">Job Placement Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">10 LPA</div>
                <div className="text-gray-300">Average Package</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent mb-2">77%</div>
                <div className="text-gray-300">Salary Increase</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent mb-2">6 Months</div>
                <div className="text-gray-300">To Job Ready</div>
              </div>
            </div>
          </div> */}

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-8 bg-white/10 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20">
              <div className="text-center sm:text-left">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Ready to Start Your Journey?
                </h3>
                <p className="text-gray-300">
                  Join our next cohort and transform your career in 6 months
                </p>
              </div>
              <button
                      onClick={() => {
                        setShowLearningDemo(false);
                        setShowAuthForm(true);
                        setIsLogin(false);
                        // Scroll to hero section
                        setTimeout(() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }, 100);
                      }}
                      className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-3 rounded-xl font-bold hover:from-emerald-600 hover:to-green-700 transition-all duration-300 hover:scale-105"
                    >
                      Enroll Now
                    </button>
            </div>
          </div>
        </div>
      </section>

    



    



      {/* Final CTA */}
      
      {/* Programs Section (inspired by crio.do) */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full mix-blend-multiply filter blur-xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full mix-blend-multiply filter blur-xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Immersive Work‑Ex Programs
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Gain real work experience via project‑led learning with mentor
              support and structured career services.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Program 1 */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 flex flex-col">
              <h3 className="text-2xl font-bold text-white mb-3">
                Software Development with GenAI
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                Project‑led MERN specialization with Gen‑AI applications, DSA &
                System Design, externship, and assured placement support.
              </p>
              <ul className="space-y-2 text-gray-300 mb-6 text-sm">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-blue-400 mt-1 mr-2" />7
                  professional projects
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-purple-400 mt-1 mr-2" />
                  Gen‑AI integrations
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-pink-400 mt-1 mr-2" />
                  Career services & referrals
                </li>
              </ul>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  Duration: 9 months
                </span>
                <button
                  onClick={handleGetStarted}
                  className="px-5 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all"
                >
                  Explore
                </button>
              </div>
            </div>
            {/* Program 2 */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 flex flex-col">
              <h3 className="text-2xl font-bold text-white mb-3">
                QA Automation (SDET)
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                Master web automation, APIs & performance testing with Java,
                Selenium, TestNG, CI/CD, and real test automation projects.
              </p>
              <ul className="space-y-2 text-gray-300 mb-6 text-sm">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-blue-400 mt-1 mr-2" />
                  3+ large‑scale projects
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-purple-400 mt-1 mr-2" />
                  DevOps & SDLC best practices
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-pink-400 mt-1 mr-2" />
                  Career referrals
                </li>
              </ul>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  Duration: 9 months
                </span>
                <button
                  onClick={handleGetStarted}
                  className="px-5 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all"
                >
                  Explore
                </button>
              </div>
            </div>
            {/* Program 3 */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 flex flex-col">
              <h3 className="text-2xl font-bold text-white mb-3">
                NextGen Data Analytics with AI
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                Excel, SQL, Python, PowerBI/Tableau, AI tools, GenAI & ML, Big
                Data & MLOps with industry‑grade datasets and projects.
              </p>
              <ul className="space-y-2 text-gray-300 mb-6 text-sm">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-blue-400 mt-1 mr-2" />
                  10+ industry projects
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-purple-400 mt-1 mr-2" />
                  Large real‑world datasets
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-pink-400 mt-1 mr-2" />
                  Career services
                </li>
              </ul>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  Duration: 9 months
                </span>
                <button
                  onClick={handleGetStarted}
                  className="px-5 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all"
                >
                  Explore
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Program Highlights Section */}
      <section id="highlights" className="py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-10 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-xl rounded-full border border-blue-400/30 shadow-2xl font-semibold mb-6">
              <Award className="w-5 h-5 mr-2 text-blue-400" />
              <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent font-bold">
                PROGRAM BENEFITS
              </span>
            </div>
            <h2 className="text-4xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              What You'll Receive
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Upon Completion
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Our comprehensive program provides you with everything needed to launch your tech career
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Program Highlights Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              {programHighlights.map((highlight, index) => {
                const getIcon = (iconName) => {
                  const icons = {
                    Award: Award,
                    FileText: FileText,
                    Briefcase: Briefcase,
                    Users: Users,
                    Target: Target,
                    Code: Code,
                    TrendingUp: TrendingUp,
                    Certificate: Award
                  };
                  const IconComponent = icons[iconName] || Award;
                  return <IconComponent className="w-8 h-8 text-white" />;
                };

                return (
                  <div key={index} className="group relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        {getIcon(highlight.icon)}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {highlight.title}
                      </h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {highlight.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Demo Certificate */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-4 border-blue-400/30 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl"></div>
                <div className="relative z-10">
                  {/* Certificate Header */}
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                      CERTIFICATE OF COMPLETION
                    </h3>
                    <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full"></div>
                  </div>

                  {/* Certificate Body */}
                  <div className="text-center space-y-4">
                    <p className="text-gray-300 text-sm">
                      This is to certify that
                    </p>
                    <div className="text-2xl font-bold text-white border-b-2 border-blue-400/30 pb-2 mb-4">
                      [Your Name]
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      has successfully completed the
                    </p>
                    <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      MERN Stack Development Program
                    </div>
                    <p className="text-gray-300 text-sm">
                      demonstrating proficiency in full-stack web development
                    </p>
                  </div>

                  {/* Certificate Footer */}
                  <div className="flex justify-between items-end mt-8 pt-6 border-t border-blue-400/30">
                    <div className="text-center">
                      <div className="w-20 h-0.5 bg-gray-400 mb-2"></div>
                      <p className="text-xs text-gray-400">Date</p>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-0.5 bg-gray-400 mb-2"></div>
                      <p className="text-xs text-gray-400">Signature</p>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-blue-400"></div>
                  <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-blue-400"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-blue-400"></div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-blue-400"></div>
                </div>
              </div>
              
              {/* Certificate Badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg transform rotate-12">
                Sample Certificate
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools and Technologies Section (Horizontal Scroll) */}
     


      {/* Career Preparation and Guidance */}
      <section id="career-prep" className="py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full mix-blend-multiply filter blur-xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full mix-blend-multiply filter blur-xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-xl rounded-full border border-blue-400/30 shadow-2xl text-sm font-medium mb-6">
              <Briefcase className="w-4 h-4 mr-2 text-blue-400" />
              <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent font-bold">
                Career Success Program
              </span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Land Your Dream Job
              </span>
              <br />
              <span className="text-white">
                With Expert Guidance
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Get personalized career coaching, interview preparation, and job placement support 
              to transition into your ideal tech role with confidence.
            </p>
          </div>

      

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Career Preparation */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/20 h-full">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Career Roadmap
                  </h3>
                </div>
                <ul className="space-y-4">
                  {careerPrepItems.map((item, index) => (
                    <li key={index} className="flex items-start space-x-3 group">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-400/30 to-purple-400/30 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-200 border border-blue-400/40">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                      </div>
                      <span className="text-gray-300 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Career Exercises */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/20 h-full">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mr-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Hands-On Career Training
                  </h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl border border-blue-400/30">
                      <UserCheck className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-white mb-1">Personal Branding</h4>
                        <p className="text-sm text-gray-300">Build your professional online presence and showcase your skills effectively.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl border border-purple-400/30">
                      <MessageCircle className="h-6 w-6 text-purple-400 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-white mb-1">Technical Communication</h4>
                        <p className="text-sm text-gray-300">Master the art of explaining complex concepts to diverse audiences.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-pink-500/20 to-indigo-500/20 backdrop-blur-sm rounded-xl border border-pink-400/30">
                      <BookOpen className="h-6 w-6 text-pink-400 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-white mb-1">Agile Workflows</h4>
                        <p className="text-sm text-gray-300">Understand modern development practices and team collaboration.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl border border-indigo-400/30">
                      <Target className="h-6 w-6 text-indigo-400 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-white mb-1">Continuous Learning</h4>
                        <p className="text-sm text-gray-300">Develop skills for rapid problem-solving and self-improvement.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Success Guarantee */}
                <div className="mt-8 p-6 bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-sm rounded-2xl border border-emerald-400/30">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-emerald-300 mb-2">Career Success Commitment</h4>
                      <p className="text-emerald-200 text-sm leading-relaxed">
                        We're committed to your success with personalized mentorship, interview preparation, 
                        and job placement support. While we can't guarantee placement, our track record speaks for itself.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full mix-blend-multiply filter blur-xl"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full mix-blend-multiply filter blur-xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-pink-300/10 to-blue-500/10 rounded-full mix-blend-multiply filter blur-2xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-xl rounded-full border border-blue-400/30 shadow-2xl text-sm font-medium mb-6">
              <Star className="w-4 h-4 mr-2 fill-current text-blue-400" />
              <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent font-bold">
                Student Success Stories
              </span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Real Students,
              </span>
              <br />
              <span className="text-white">
                Real Success
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Discover how our students transformed their careers and landed their dream jobs 
              through our work-experience based learning approach.
            </p>
          </div>

         

          {/* Success Stories Carousel */}
          <div className="relative">
            <div className="overflow-hidden rounded-3xl">
              <div className="flex animate-success-scroll">
                {[...Array(2)].map((_, i) => (
                  <React.Fragment key={i}>
                    {successStories.map((story, idx) => (
                      <div
                        key={i + "-" + idx}
                        className="flex-shrink-0 w-80 md:w-96 p-4"
                      >
                        <div className="group bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 hover:scale-105">
                          {/* Quote Icon */}
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Quote className="w-6 h-6 text-white" />
                          </div>
                          
                          {/* Story Content */}
                          <blockquote className="text-gray-300 text-lg leading-relaxed mb-6 italic">
                            "{story.story}"
                          </blockquote>
                          
                          {/* Author Info */}
                          <div className="flex items-center">
                            <div className="relative">
                              <img
                                src={story.image}
                                alt={story.name}
                                className="h-14 w-14 rounded-full ring-4 ring-blue-400/30 object-cover"
                              />
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full border-2 border-slate-900 flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <p className="font-bold text-lg text-white">
                                {story.name}
                              </p>
                              <p className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-medium">
                                {story.role}
                              </p>
                              <div className="flex items-center mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
            
            {/* Gradient Overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-900 to-transparent pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none"></div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-8 bg-white/10 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20">
              <div className="text-center sm:text-left">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Ready to Write Your Success Story?
                </h3>
                <p className="text-gray-300">
                  Join thousands of students who transformed their careers
                </p>
              </div>
              <button className="px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold rounded-2xl hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                Start Your Journey
              </button>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes success-scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .animate-success-scroll {
            animation: success-scroll 45s linear infinite;
          }
          .animate-success-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>
      </section>

      {/* FAQs Section */}
      <section id="faqs" className="py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full mix-blend-multiply filter blur-xl"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full mix-blend-multiply filter blur-xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-xl rounded-full border border-blue-400/30 shadow-2xl text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4 mr-2 text-blue-400" />
              <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent font-bold">
                Got Questions? We Have Answers
              </span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Frequently Asked
              </span>
              <br />
              <span className="text-white">
                Questions
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Everything you need to know about our program, from curriculum to career support. 
              Can't find what you're looking for? Contact our team directly.
            </p>
          </div>

          {/* FAQ Grid */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 cursor-pointer"
              >
                <summary className="flex justify-between items-start text-xl font-bold text-white focus:outline-none list-none">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 group-open:scale-110 transition-transform duration-300">
                      <span className="text-white font-bold text-sm">{String(index + 1).padStart(2, '0')}</span>
                    </div>
                    <span className="leading-tight">{faq.question}</span>
                  </div>
                  <ChevronRight className="h-6 w-6 transform transition-transform duration-300 group-open:rotate-90 text-blue-400 flex-shrink-0 ml-4 mt-1" />
                </summary>
                <div className="mt-6 ml-12 text-gray-300 leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="text-center mt-16">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-8 bg-white/10 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20">
              <div className="text-center sm:text-left">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Still Have Questions?
                </h3>
                <p className="text-gray-300">
                  Our team is here to help you make the right decision
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold rounded-2xl hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                  Schedule a Call
                </button>
                <button className="px-6 py-3 border-2 border-blue-400 text-blue-400 font-semibold rounded-2xl hover:bg-blue-500/20 transform hover:scale-105 transition-all duration-300">
                  Chat with Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="relative mr-[-40px]">
                  <img
                    src="/assets/logo.png"
                    alt="RemoteJobs Logo"
                    className="h-[100px] object-contain"
                    style={{
                      filter: theme === "dark" ? "brightness(0.9)" : "none",
                    }}
                  />
                </div>
                <span className="text-xl font-bold">RemoteJobs</span>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400 mb-2">
                  Proudly developed by
                </p>
                <Link to="https://www.ecerasystem.com/">
                  <div className="flex items-center space-x-2">
                    <img
                      src="https://www.ecerasystem.com/Images/Nav_logo/ecera-logo.png"
                      alt="logo"
                      className="h-[60px]"
                    />
                    <div>
                      <p className="text-white font-semibold">
                        Ecera Systems LLC
                      </p>
                      <p className="text-xs text-gray-400">
                        Technology Solutions Partner
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
            {/* Features */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Website Designing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Mobile App Development
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Software Development
                  </a>
                </li>

                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Online Training
                  </a>
                </li>
              </ul>
            </div>
            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:mernprogram@ecerasystem.com"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="/refundpolicy"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Refund Policy
                  </a>
                </li>
              </ul>
            </div>
            {/* Company */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/about"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacypolicy"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/termsofservice"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 text-center">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <p className="text-gray-400">
                © 2025 Ecera System. All rights reserved.
              </p>
              <Link
                to="https://www.ecerasystem.com/"
                className="text-gray-500 text-sm"
              >
                Developed and maintained by
                <span className="text-blue-400 font-semibold">
                  Ecera Systems LLC
                </span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default LandingPage;
