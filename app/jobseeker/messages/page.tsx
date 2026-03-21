import { Suspense } from "react";
import ApplicationMessagingScreen from "@/components/messages/ApplicationMessagingScreen";

function JobSeekerMessagesPageContent() {
	return <ApplicationMessagingScreen audience="JOB_SEEKER" />;
}

export default function JobSeekerMessagesPage() {
	return (
		<Suspense fallback={<div className="mt-[80px] h-[calc(100vh-80px)] bg-[#f9fafb]" />}>
			<JobSeekerMessagesPageContent />
		</Suspense>
	);
}
