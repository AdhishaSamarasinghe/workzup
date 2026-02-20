"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { signIn } from "next-auth/react";

import Logo from "@/components/Logo";
import SuccessModal from "@/components/SuccessModal";

export default function JobSeekerRegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        gender: "",
        homeTown: "",
        termsAccepted: false,
        emailNotifications: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };
    const handleGenderChange = (gender: string) => {
        setFormData((prev) => ({ ...prev, gender }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        if (!formData.termsAccepted) {
            alert("Please accept the Privacy Policy and Terms");
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            data.append("firstName", formData.firstName);
            data.append("lastName", formData.lastName);
            data.append("email", formData.email);
            data.append("password", formData.password);
            data.append("gender", formData.gender);
            data.append("homeTown", formData.homeTown);
            data.append("role", "JOB_SEEKER");
            data.append("termsAccepted", String(formData.termsAccepted));
            data.append("emailNotifications", String(formData.emailNotifications));

            await apiFetch("/api/auth/register", {
                method: "POST",
                body: data,
            });

            // Show success modal instead of redirecting immediately
            setShowSuccessModal(true);

        } catch (error: any) {
            console.error("Registration failed:", error);
            alert(error.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Success Modal */}
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
            />
            {/* Header */}
            <header className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <Logo textSize="text-2xl" />
                </div>
                <div className="flex gap-4">
                    <Link
                        href="/auth/login"
                        className="rounded-md bg-[#586CB6] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
                    >
                        RECRUITERS LOGIN
                    </Link>
                    <Link
                        href="/auth/login"
                        className="rounded-md bg-[#6C8BFF] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
                    >
                        JOB SEEKER LOGIN
                    </Link>
                </div>
            </header>

            <div className="flex min-h-[calc(100vh-80px)]">
                {/* Left Side - Placeholder/Image */}
                <div className="hidden w-1/3 bg-gray-200 lg:block"></div>

                {/* Right Side - Form */}
                <div className="flex w-full flex-col justify-center bg-white p-8 lg:w-2/3 lg:p-12">
                    <div className="mx-auto w-full max-w-2xl">
                        <h1 className="mb-2 text-3xl font-bold text-gray-900">
                            Job Seeker Account
                        </h1>
                        <h2 className="mb-8 text-2xl font-bold text-gray-400">Register</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <h3 className="mb-4 text-sm font-semibold text-gray-900">
                                    Job Seeker Register
                                </h3>

                                {/* Name Fields */}
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <div className="relative rounded-md shadow-sm">
                                            <input
                                                type="text"
                                                name="firstName"
                                                required
                                                placeholder="First Name *"
                                                className="block w-full rounded-md border-0 bg-gray-200 py-3 pl-4 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                                                className="block w-full rounded-md border-0 bg-gray-200 py-3 pl-4 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="Email *"
                                    className="block w-full rounded-md border-0 bg-gray-200 py-3 pl-4 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Password Fields */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        required
                                        placeholder="Password *"
                                        className="block w-full rounded-md border-0 bg-gray-200 py-3 pl-4 pr-10 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
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
                                        className="block w-full rounded-md border-0 bg-gray-200 py-3 pl-4 pr-10 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
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


                            {/* Gender and Hometown */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-center">
                                <div className="flex items-center space-x-4 rounded-md border border-gray-300 px-4 py-3">
                                    <span className="text-sm font-medium text-gray-900">Your Gender</span>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="Male"
                                            checked={formData.gender === "Male"}
                                            onChange={() => handleGenderChange("Male")}
                                            className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                        />
                                        <span className="text-sm text-gray-900">Male</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="Female"
                                            checked={formData.gender === "Female"}
                                            onChange={() => handleGenderChange("Female")}
                                            className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                        />
                                        <span className="text-sm text-gray-900">Female</span>
                                    </label>
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        name="homeTown"
                                        required
                                        placeholder="Home Town *"
                                        className="block w-full rounded-md border-0 bg-gray-200 py-3 pl-4 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        value={formData.homeTown}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>



                            {/* Terms */}
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="termsAccepted"
                                        checked={formData.termsAccepted}
                                        onChange={handleChange}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                    />
                                    <span className="ml-2 text-gray-500">I agree to <a href="#" className="font-bold text-gray-900">Privacy Policy</a> & <Link href="/terms-and-conditions" target="_blank" className="font-bold text-gray-900">Terms/Conditions</Link></span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="emailNotifications"
                                        checked={formData.emailNotifications}
                                        onChange={handleChange}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                    />
                                    <span className="ml-2 text-gray-500">Recieve jobs by Email</span>
                                </label>
                            </div>

                            {/* Submit & Socials */}
                            <div className="flex items-center justify-between pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-1/2 rounded-md bg-[#6B8BFF] px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#5A75D9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B8BFF] disabled:opacity-70"
                                >
                                    {loading ? "REGISTERING..." : "REGISTER"}
                                </button>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-900">Or Register Using</span>
                                    <div className="flex gap-2">
                                        {/* Google */}
                                        <button
                                            type="button"
                                            onClick={() => signIn("google")}
                                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                        >
                                            <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                                                <path
                                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                    fill="#4285F4"
                                                />
                                                <path
                                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                    fill="#34A853"
                                                />
                                                <path
                                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                    fill="#FBBC05"
                                                />
                                                <path
                                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                    fill="#EA4335"
                                                />
                                            </svg>
                                        </button>

                                        {/* Facebook */}
                                        <button
                                            type="button"
                                            onClick={() => signIn("facebook")}
                                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                        >
                                            <svg className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                            </svg>
                                        </button>

                                        {/* LinkedIn */}
                                        <button
                                            type="button"
                                            onClick={() => signIn("linkedin")}
                                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                        >
                                            <svg className="h-5 w-5 text-[#0077b5]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div >
    );
}
