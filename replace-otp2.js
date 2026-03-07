const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'app/auth/register/job-seeker/page.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// Replacement 1: Add State
const stateTarget = `    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({`;

const stateReplacement = `    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [formData, setFormData] = useState({`;

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

if (content.includes("    const handleSubmit = async (e: React.FormEvent) => {\n        e.preventDefault();\n        if (formData.password !== formData.confirmPassword) {\n            alert(\"Passwords do not match\");\n            return;\n        }\n        if (!formData.termsAccepted) {")) {
    content = content.replace(handlerTarget, handlerReplacement);
} else if (!content.includes("handleSendOtp")) {
    console.log("Could not find exact handleSubmit signature, target might be slightly different. Will not replace handler.");
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log("Successfully replaced state and handlers in job-seeker page.");
