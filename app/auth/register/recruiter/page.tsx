/* eslint-disable */
"use client";

import { useState } from "react";
import { useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

import Logo from "@/components/Logo";
import SuccessModal from "@/components/SuccessModal";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import AuthVisualPanel from "@/components/AuthVisualPanel";
import { startSupabaseOAuth } from "@/lib/auth/workzupAuth";

const LocationMap = dynamic(() => import("@/components/LocationMap"), {
  ssr: false,
  loading: () => <div className="w-full rounded-md border-0 bg-[#E0E0E0] flex items-center justify-center text-gray-500 h-[250px]">Loading Map...</div>
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const REQUIRED_FIELD_LABELS: Record<string, string> = {
    companyName: "Company",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    gender: "Gender",
    companyAddress: "Company Location",
};

export default function RecruiterRegisterPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [verificationMsg, setVerificationMsg] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [otp, setOtp] = useState("");
    const [sentVerificationCode, setSentVerificationCode] = useState("");
    const [isCodeVerified, setIsCodeVerified] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);
    const [formData, setFormData] = useState({
        companyName: "",
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
        gender: "",
        companyAddress: "",
        termsAccepted: false,
        emailNotifications: false,
    });
    const [companyLogo, setCompanyLogo] = useState<File | null>(null);

    const [selectedLocation, setSelectedLocation] = useState({ lat: 6.9271, lng: 79.8612 });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => {
            const next = {
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            };

            // If email changes after a code is sent, force re-send/verification.
            if (name === "email" && value !== prev.email) {
                setSentVerificationCode("");
                setOtp("");
                setIsCodeVerified(false);
                setResendCountdown(0);
            }

            return next;
        });
    };

    const handleGenderChange = (gender: string) => {
        setFormData((prev) => ({ ...prev, gender }));
    };

    useEffect(() => {
        if (resendCountdown <= 0) {
            return;
        }

        const timer = window.setInterval(() => {
            setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => {
            window.clearInterval(timer);
        };
    }, [resendCountdown]);

    const getMissingRequiredFields = () => {
        const missing = Object.entries(REQUIRED_FIELD_LABELS)
            .filter(([field]) => !formData[field as keyof typeof formData])
            .map(([, label]) => label);

        return missing;
    };

    const handleSendOtp = async () => {
        setError("");
        setSuccessMsg("");
        setVerificationMsg("");
        const email = formData.email.trim();

        if (!email) {
            setError("Email is required before sending a verification code.");
            return;
        }

        if (!EMAIL_REGEX.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        setOtpLoading(true);
        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                body: JSON.stringify({ email }),
                headers: { "Content-Type": "application/json" }
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to send verification code");
            }

            // Dummy flag to wait for server verification since we no longer send code to client
            setSentVerificationCode("WAITING_FOR_SERVER_VERIFICATION");
            setResendCountdown(60);
            setIsCodeVerified(false);
            setVerificationMsg("Verification code sent");
        } catch (error: any) {
            console.error("Failed to send OTP:", error);
            setError(error.message || "Failed to send verification code.");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        setError("");

        if (!sentVerificationCode) {
            setError("Please send the verification code first.");
            return;
        }

        if (!otp.trim()) {
            setError("Please enter the verification code.");
            return;
        }

        setOtpLoading(true);
        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                body: JSON.stringify({ email: formData.email.trim(), otp: otp.trim() }),
                headers: { "Content-Type": "application/json" }
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Invalid verification code");
            }

            setIsCodeVerified(true);
            setVerificationMsg("Verification code verified successfully");
        } catch (error: any) {
            console.error("Verification failed:", error);
            setIsCodeVerified(false);
            setError(error.message || "Failed to verify code.");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMsg("");
        setVerificationMsg("");

        const missingRequiredFields = getMissingRequiredFields();
        if (missingRequiredFields.length > 0) {
            setError(`Please fill all required fields: ${missingRequiredFields.join(", ")}.`);
            return;
        }

        if (!EMAIL_REGEX.test(formData.email.trim())) {
            setError("Please enter a valid email address.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (!sentVerificationCode) {
            setError("Please send the verification code first.");
            return;
        }

        if (!otp.trim()) {
            setError("Please enter the verification code.");
            return;
        }

        if (!isCodeVerified) {
            setError("Please verify the code before registering.");
            return;
        }

        if (!formData.termsAccepted) {
            setError("Please accept the Privacy Policy and Terms");
            return;
        }

        setLoading(true);
        try {
            const submitData = new FormData();
            submitData.append("companyName", formData.companyName.trim());
            submitData.append("firstName", formData.firstName.trim());
            submitData.append("lastName", formData.lastName.trim());
            submitData.append("email", formData.email.trim());
            submitData.append("password", formData.password);
            submitData.append("role", "EMPLOYER");
            submitData.append("gender", formData.gender);
            submitData.append("companyAddress", formData.companyAddress.trim());
            submitData.append("termsAccepted", String(formData.termsAccepted));
            submitData.append("emailNotifications", String(formData.emailNotifications));
            if (formData.phone) submitData.append("phone", formData.phone.trim());

            if (companyLogo) {
                submitData.append("companyLogo", companyLogo);
            }

            const res = await fetch("/api/auth/register", {
                method: "POST",
                body: submitData,
            });

            const textData = await res.text();
            let data;
            try {
                data = JSON.parse(textData);
            } catch (err) {
                console.error("Non-JSON API response:", textData);
                throw new Error("Server returned an unexpected response. Please try again.");
            }

            if (!res.ok) {
                const backendMessage =
                    data?.message && data.message !== "Internal Server Error"
                        ? data.message
                        : data?.error;
                throw new Error(backendMessage || "Registration failed");
            }

            setSuccessMsg("Registration completed successfully");
            setShowSuccessModal(true);

        } catch (error: any) {
            console.error("Registration failed:", error);
            setError(error.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen auth-visual-panel relative flex flex-col font-sans overflow-hidden">
            {/* Background elements */}
            <div className="auth-visual-glow auth-visual-glow-top" />
            <div className="auth-visual-glow auth-visual-glow-mid" />
            <div className="auth-visual-grid" />

            {/* Success Modal */}
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="Recruiter Account Created!"
                loginHref="/auth/login/recruiter"
                message={
                    <>
                        <p>Your recruiter account has been created successfully.</p>
                        <p>Welcome to WorkzUp!</p>
                        <p className="mt-2">Start posting jobs and finding the best talent.</p>
                    </>
                }
            />

            {/* Floating Cards (Top Right) */}
            <div className="auth-floating-card auth-floating-card-sm hidden lg:block" style={{ top: '100px', right: '8%' }}>
                24k+ verified users
            </div>
            <div className="auth-floating-card auth-floating-card-lg hidden lg:block" style={{ top: '170px', right: '14%' }}>
                Smart hiring workflows
            </div>

            {/* Left Fixed Text */}
            <div className="absolute z-20 bottom-16 left-12 text-white hidden lg:block max-w-[400px]">
                <p className="text-[10px] uppercase tracking-[0.35em] text-blue-100/90 font-bold mb-1">WORKZUP</p>
                <h3 className="text-[32px] font-bold leading-tight tracking-tight">Build Your Dream Team</h3>
            </div>

            <div className="relative z-10 flex flex-1 w-full flex-col justify-center items-center p-4 sm:p-8 pt-0 pb-12 overflow-y-auto w-full">
                {/* The Card Form container */}
                <div className="w-full max-w-[700px] bg-white rounded-xl shadow-2xl shadow-blue-900/20 p-8 sm:p-10 relative my-auto shrink-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Tabs */}
                        <div className="flex justify-center mb-6">
                            <div className="flex w-fit">
                                <Link href="/auth/login/recruiter" className="px-8 py-2 bg-white text-gray-500 font-semibold rounded-l-md border border-gray-300 border-r-0 hover:bg-gray-50 transition-colors">
                                    Login
                                </Link>
                                <button className="px-8 py-2 bg-[#6B8BFF] text-white font-semibold rounded-r-md border border-[#6B8BFF] hover:bg-[#5A75D9] transition-colors cursor-default">
                                    Register
                                </button>
                            </div>
                        </div>

                        {/* Divider Line */}
                        <div className="w-full h-px bg-gray-400/50 mb-8 rounded-full"></div>

                        {/* Title */}
                        <h2 className="text-center text-[26px] font-bold text-gray-700 mb-8">
                            Recruiter Register
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Company Name */}
                            <div>
                                <div className="relative rounded-md shadow-sm">
                                    <input
                                        type="text"
                                        name="companyName"
                                        required
                                        placeholder="Company *"
                                        className="block w-full rounded-md border-0 bg-[#E0E0E0] py-3.5 pl-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#6B8BFF] sm:text-[15px] sm:leading-6 transition-all"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            
                            {/* Company Logo */}
                            <div>
                                <div className="flex items-center space-x-4">
                                    <label className="cursor-pointer">
                                        <span className="inline-flex items-center px-6 py-2 border border-gray-300 rounded-md text-[13px] font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6B8BFF] transition-colors">
                                            CHOOSE LOGO
                                        </span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setCompanyLogo(e.target.files[0]);
                                                }
                                            }}
                                        />
                                    </label>
                                    <span className="text-gray-500 text-[14px]">
                                        {companyLogo ? companyLogo.name : "No file chosen"}
                                    </span>
                                </div>
                            </div>

                            {/* Name Fields */}
                            <div>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <div className="relative rounded-md shadow-sm">
                                            <input
                                                type="text"
                                                name="firstName"
                                                required
                                                placeholder="First Name *"
                                                className="block w-full rounded-md border-0 bg-[#E0E0E0] py-3.5 pl-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#6B8BFF] sm:text-[15px] sm:leading-6 transition-all"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="relative rounded-md shadow-sm">
                                            <input
                                                type="text"
                                                name="lastName"
                                                required
                                                placeholder="Last Name *"
                                                className="block w-full rounded-md border-0 bg-[#E0E0E0] py-3.5 pl-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#6B8BFF] sm:text-[15px] sm:leading-6 transition-all"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Phone Number */}
                            <div>
                                <div className="relative rounded-md shadow-sm">
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Phone Number"
                                        className="block w-full rounded-md border-0 bg-[#E0E0E0] py-3.5 pl-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#6B8BFF] sm:text-[15px] sm:leading-6 transition-all"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="relative">
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="Email *"
                                    className="block w-full rounded-md border-0 bg-[#E0E0E0] py-3.5 pl-4 pr-20 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#6B8BFF] sm:text-[15px] sm:leading-6 transition-all disabled:opacity-60"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            {/* OTP Section */}
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                <div className="flex-1 w-full relative">
                                    <input
                                        type="text"
                                        placeholder="Verification Code"
                                        className="block w-full rounded-md border-0 bg-[#E0E0E0] py-3.5 pl-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#6B8BFF] sm:text-[15px] sm:leading-6 disabled:opacity-60 transition-all"
                                        value={otp}
                                        onChange={(e) => {
                                            setOtp(e.target.value);
                                            setIsCodeVerified(false);
                                        }}
                                        disabled={!sentVerificationCode || loading}
                                    />
                                </div>
                                <div className="shrink-0 w-full sm:w-auto flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={otpLoading || loading || resendCountdown > 0}
                                        className="w-full sm:w-auto rounded-md bg-[#6B8BFF] px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#5A75D9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B8BFF] disabled:opacity-70 transition-colors"
                                    >
                                        {otpLoading ? "Sending..." : resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "SEND CODE"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleVerifyCode}
                                        disabled={loading || !sentVerificationCode || !otp.trim()}
                                        className={`w-full sm:w-auto rounded-md px-6 py-3.5 text-sm font-bold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-70 transition-colors ${isCodeVerified ? "bg-green-600 hover:bg-green-700 focus-visible:outline-green-600" : "bg-[#6B8BFF] hover:bg-[#5A75D9] focus-visible:outline-[#6B8BFF]"}`}
                                    >
                                        {isCodeVerified ? "VERIFIED" : "VERIFY"}
                                    </button>
                                </div>
                            </div>

                            {resendCountdown > 0 && (
                                <p className="-mt-2 text-xs text-gray-500">
                                    You can request a new verification code in {resendCountdown}s.
                                </p>
                            )}

                            {verificationMsg && (
                                <p className="-mt-2 text-sm text-green-600 font-medium">
                                    {verificationMsg}
                                </p>
                            )}

                            {/* Password Fields */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        required
                                        placeholder="Password *"
                                        className="block w-full rounded-md border-0 bg-[#E0E0E0] py-3.5 pl-4 pr-10 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#6B8BFF] sm:text-[15px] sm:leading-6 transition-all"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        required
                                        placeholder="Confirm Password *"
                                        className="block w-full rounded-md border-0 bg-[#E0E0E0] py-3.5 pl-4 pr-10 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#6B8BFF] sm:text-[15px] sm:leading-6 transition-all"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showConfirmPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Gender */}
                            <div>
                                <div className="flex items-center space-x-4 rounded-md border border-gray-200 px-4 py-3.5 bg-[#ffffff] w-full md:w-1/2">
                                    <span className="text-sm font-semibold text-gray-900">Your Gender</span>
                                    <label className="flex items-center space-x-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="Male"
                                            checked={formData.gender === "Male"}
                                            onChange={() => handleGenderChange("Male")}
                                            className="h-4 w-4 border-gray-300 text-[#6B8BFF] focus:ring-[#6B8BFF]"
                                        />
                                        <span className="text-sm text-gray-700 group-hover:text-black">Male</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="Female"
                                            checked={formData.gender === "Female"}
                                            onChange={() => handleGenderChange("Female")}
                                            className="h-4 w-4 border-gray-300 text-[#6B8BFF] focus:ring-[#6B8BFF]"
                                        />
                                        <span className="text-sm text-gray-700 group-hover:text-black">Female</span>
                                    </label>
                                </div>
                            </div>

                            {/* Company Location with Map */}
                            <div className="space-y-3 relative z-10 w-full mb-6">
                                <LocationAutocomplete
                                  value={formData.companyAddress}
                                  onChange={(val) => setFormData(p => ({...p, companyAddress: val}))}
                                  onSelect={(lat, lng, address) => {
                                      setSelectedLocation({ lat, lng });
                                      setFormData(p => ({...p, companyAddress: address}));
                                  }}
                                />
                                
                                <div className="w-full rounded-md overflow-hidden border border-gray-200 shadow-sm mt-3 relative z-0">
                                    <LocationMap 
                                        position={selectedLocation} 
                                        onLocationSelect={(lat, lng, address) => {
                                            setSelectedLocation({ lat, lng });
                                            if (address) {
                                                setFormData(p => ({...p, companyAddress: address}));
                                            }
                                        }} 
                                    />
                                </div>
                            </div>

                            {/* Terms */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="termsAccepted"
                                        checked={formData.termsAccepted}
                                        onChange={handleChange}
                                        className="h-4 w-4 rounded border-gray-400 text-[#6B8BFF] focus:ring-[#6B8BFF]"
                                    />
                                    <span className="ml-2 text-gray-600">I agree to <Link href="/privacy" className="font-bold text-gray-900 hover:underline">Privacy Policy</Link> & <Link href="/terms-and-conditions" target="_blank" className="font-bold text-gray-900 hover:underline">Terms/Conditions</Link></span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="emailNotifications"
                                        checked={formData.emailNotifications}
                                        onChange={handleChange}
                                        className="h-4 w-4 rounded border-gray-400 text-[#6B8BFF] focus:ring-[#6B8BFF]"
                                    />
                                    <span className="ml-2 text-gray-600">Receive jobs by Email</span>
                                </label>
                            </div>


                            {/* Feedback Messages Display */}
                            {error && (
                                <div className="text-sm text-red-500 font-medium text-center bg-red-50 py-2 rounded">
                                    {error}
                                </div>
                            )}
                            {successMsg && (
                                <div className="text-sm text-green-600 font-medium text-center bg-green-50 py-2 rounded">
                                    {successMsg}
                                </div>
                            )}

                            {/* Login Container (with gray background wrapping form controls as in design) */}
                            <div className="bg-[#f2f4f7] rounded-xl p-4 sm:p-5 mt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-md bg-[#6B8BFF] py-3.5 text-[15px] font-bold tracking-wide text-white shadow-sm hover:bg-[#5A75D9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B8BFF] disabled:opacity-70 transition-colors"
                                >
                                    {loading ? "REGISTERING..." : "REGISTER"}
                                </button>
                            </div>

                            {/* Register text */}
                            <div className="text-center pt-2">
                                <span className="text-sm text-gray-500 font-medium">Already have an account? </span>
                                <Link href="/auth/login/recruiter" className="text-sm font-bold text-black hover:underline">
                                    Login now
                                </Link>
                            </div>

                            {/* Divider with Line */}
                            <div className="pt-2 pb-1 relative">
                                <div className="absolute inset-x-0 top-1/2 h-px bg-gray-300"></div>
                            </div>

                            {/* Social Logins */}
                            <div className="flex flex-col items-center pt-2">
                                <span className="text-sm font-semibold text-black mb-4 bg-white px-2">Or Register Using</span>
                                <div className="flex gap-4">
                                    {/* Google */}
                                    <button
                                        type="button"
                                        onClick={() => void startSupabaseOAuth("EMPLOYER", "google")}
                                        className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                                    >
                                        <svg className="h-[22px] w-[22px]" aria-hidden="true" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#D2D6DC" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#D2D6DC" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#D2D6DC" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#D2D6DC" />
                                        </svg>
                                    </button>

                                    {/* Facebook */}
                                    <button
                                        type="button"
                                        onClick={() => void startSupabaseOAuth("EMPLOYER", "facebook")}
                                        className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                                    >
                                        <svg className="h-[22px] w-[22px] text-gray-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                        </svg>
                                    </button>

                                    {/* LinkedIn */}
                                    <button
                                        type="button"
                                        onClick={() => void startSupabaseOAuth("EMPLOYER", "linkedin_oidc")}
                                        className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                                    >
                                        <svg className="h-[22px] w-[22px] text-gray-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                        </form>
                    </div>
            </div>
        </div>
    );
}
