import { Suspense } from "react";
import ApplicationMessagingScreen from "@/components/messages/ApplicationMessagingScreen";

function RecruiterMessagesPageContent() {
	return <ApplicationMessagingScreen audience="RECRUITER" />;
}

export default function RecruiterMessagesPage() {
	return (
		<Suspense fallback={<div className="mt-[80px] h-[calc(100vh-80px)] bg-[#f9fafb]" />}>
			<RecruiterMessagesPageContent />
		</Suspense>
	);
}
