const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'app/auth/register/job-seeker/page.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// Replacement 1: Add State
const stateTarget = `    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);`;

const stateReplacement = `    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);`;

content = content.replace(stateTarget, stateReplacement);

// Replacement 2: Add Handlers and handleSubmit validation
const handlerTarget = `    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        if (!formData.termsAccepted) {`;

const handlerReplacement = `    const handleSendOtp = async () => {
        if (!formData.email) {
            alert("Please enter your email first.");
            return;
        }
        setOtpLoading(true);
        try {
            const res = await apiFetch("/api/auth/send-otp", {
                method: "POST",
                body: JSON.stringify({ email: formData.email }),
                headers: { "Content-Type": "application/json" }
            });
            setIsOtpSent(true);
            alert("Verification code sent to your email!");
        } catch (error: any) {
            console.error("Failed to send OTP:", error);
            alert(error.message || "Failed to send verification code.");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            alert("Please enter the verification code.");
            return;
        }
        setOtpLoading(true);
        try {
            const res = await apiFetch("/api/auth/verify-otp", {
                method: "POST",
                body: JSON.stringify({ email: formData.email, otp }),
                headers: { "Content-Type": "application/json" }
            });
            setIsOtpVerified(true);
            alert("Email verified successfully!");
        } catch (error: any) {
            console.error("Failed to verify OTP:", error);
            alert(error.message || "Invalid verification code.");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        if (!isOtpVerified) {
            alert("Please verify your email address before registering.");
            return;
        }
        if (!formData.termsAccepted) {`;

content = content.replace(handlerTarget, handlerReplacement);

// Replacement 3: Add JSX
const jsxTarget = `                            {/* Email */}
                            <div>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="Email *"
                                    className="block w-full rounded-md border-0 bg-[#E0E0E0] py-3.5 pl-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#6B8BFF] sm:text-[15px] sm:leading-6"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>`;

const jsxReplacement = `                            {/* Email */}
                            <div>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="Email *"
                                    className="block w-full rounded-md border-0 bg-[#E0E0E0] py-3.5 pl-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#6B8BFF] sm:text-[15px] sm:leading-6 disabled:opacity-60"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={isOtpVerified}
                                />
                            </div>

                            {/* OTP Section */}
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                <div className="flex-1 w-full relative">
                                    <input
                                        type="text"
                                        placeholder="Verification Code"
                                        className="block w-full rounded-md border-0 bg-[#E0E0E0] py-3.5 pl-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#6B8BFF] sm:text-[15px] sm:leading-6 disabled:opacity-60"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        disabled={!isOtpSent || isOtpVerified}
                                    />
                                </div>
                                <div className="shrink-0 w-full sm:w-auto">
                                    {!isOtpSent || (!isOtpVerified && !isOtpSent) ? (
                                        <button
                                            type="button"
                                            onClick={handleSendOtp}
                                            disabled={otpLoading || isOtpVerified || !formData.email}
                                            className="w-full sm:w-auto rounded-md bg-[#6B8BFF] px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#5A75D9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B8BFF] disabled:opacity-70 transition-colors"
                                        >
                                            {otpLoading ? "SENDING..." : "SEND CODE"}
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleVerifyOtp}
                                            disabled={otpLoading || isOtpVerified || !otp}
                                            className={\`w-full sm:w-auto rounded-md px-6 py-3.5 text-sm font-bold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-70 transition-colors \${isOtpVerified ? 'bg-green-500 hover:bg-green-600 focus-visible:outline-green-500' : 'bg-[#6B8BFF] hover:bg-[#5A75D9] focus-visible:outline-[#6B8BFF]'}\`}
                                        >
                                            {isOtpVerified ? "VERIFIED ✓" : (otpLoading ? "VERIFYING..." : "VERIFY")}
                                        </button>
                                    )}
                                </div>
                            </div>`;

content = content.replace(jsxTarget, jsxReplacement);

fs.writeFileSync(targetFile, content, 'utf8');
console.log("Successfully replaced file chunks in job-seeker page.");
