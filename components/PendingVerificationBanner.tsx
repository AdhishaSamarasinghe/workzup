import { AlertCircle } from "lucide-react";

interface PendingVerificationBannerProps {
  isVerified?: boolean;
  verificationStatus?: string | null;
  action?: "apply" | "post";
}

export default function PendingVerificationBanner({
  isVerified,
  verificationStatus,
  action = "apply",
}: PendingVerificationBannerProps) {
  // Show banner only if user is not verified or verification is pending/rejected
  const showBanner =
    !isVerified ||
    (verificationStatus &&
      String(verificationStatus).toUpperCase() !== "APPROVED");

  if (!showBanner) {
    return null;
  }

  const isPending = !verificationStatus || String(verificationStatus).toUpperCase() === "PENDING";
  const isRejected = String(verificationStatus).toUpperCase() === "REJECTED";

  let title = "Account Verification Required";
  let message = "";
  let bgColor = "bg-amber-50 border-amber-200";
  let textColor = "text-amber-900";
  let iconColor = "text-amber-600";

  if (isPending) {
    title = "Account Verification Pending";
    message = `Your account is under admin review. You'll be able to ${action} jobs once your account is verified.`;
  } else if (isRejected) {
    title = "Account Verification Rejected";
    message = `Your account verification was not approved. Please contact support for more details.`;
    bgColor = "bg-rose-50 border-rose-200";
    textColor = "text-rose-900";
    iconColor = "text-rose-600";
  }

  return (
    <div
      className={`w-full rounded-lg border-l-4 border-l-current p-4 ${bgColor} mb-6`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
        <div className="flex-1">
          <h3 className={`font-semibold ${textColor}`}>{title}</h3>
          {message && <p className={`mt-1 text-sm ${textColor}`}>{message}</p>}
        </div>
      </div>
    </div>
  );
}
