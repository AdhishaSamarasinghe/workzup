const fs = require('fs');

function processFile(file, roleText, loginLink, isRecruiter) {
    let content = fs.readFileSync(file, 'utf8');

    // Remove the <header> block entirely
    const headerStart = content.indexOf('            {/* Header */}');
    const headerEnd = content.indexOf('            </header>') + '            </header>\n'.length;
    if (headerStart !== -1 && headerEnd > headerStart) {
        content = content.substring(0, headerStart) + content.substring(headerEnd);
    }

    // Replace the outer div `bg-gray-50` or `bg-[#f7fafc]` with `bg-gray-50 flex flex-col font-sans`
    content = content.replace(/<div className="min-h-screen [^"]+">/, '<div className="min-h-screen bg-gray-50 flex flex-col font-sans">');

    // Replace `className="flex min-h-[calc(100vh-80px)]"` with `className="flex flex-1"`
    content = content.replace('className="flex min-h-[calc(100vh-80px)]"', 'className="flex flex-1"');

    // Replace placeholder left side gray block color
    content = content.replace('bg-gray-200 lg:block"', 'bg-[#D9D9D9] lg:block"');
    content = content.replace('bg-[#e2e8f0] lg:block"', 'bg-[#D9D9D9] lg:block"');

    // Reconstruct the right side form wrapper
    const rightSideWrapperStart = content.indexOf('{/* Right Side - Form */}');
    const formTagIdx = content.indexOf('<form onSubmit={handleSubmit}', rightSideWrapperStart);

    if (rightSideWrapperStart !== -1 && formTagIdx !== -1) {
        const layoutHTML = `
                {/* Right Side - Form */}
                <div className="flex w-full flex-col justify-center items-center bg-[#F9FAFB] p-8 lg:w-2/3 lg:p-12 relative overflow-y-auto">
                    {/* The Card Form container */}
                    <div className="w-full max-w-[500px] bg-white rounded-xl shadow-lg shadow-gray-200/50 p-8 sm:p-10 mb-auto mt-4 sm:mt-8 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Tabs */}
                        <div className="flex justify-center mb-6">
                            <div className="flex w-fit">
                                <Link href="${loginLink}" className="px-8 py-2 bg-white text-gray-500 font-semibold rounded-l-md border border-gray-300 border-r-0 hover:bg-gray-50 transition-colors">
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
                            ${roleText} Register
                        </h2>

                        `;
        content = content.substring(0, rightSideWrapperStart - 1) + layoutHTML + content.substring(formTagIdx);
    }

    // Specifically remove the inner `<h3>...</h3>` that is no longer needed:
    const h3start = content.indexOf('<h3 className="mb-4 text-sm font-semibold');
    if (h3start !== -1) {
        const h3end = content.indexOf('</h3>', h3start) + 5;
        content = content.substring(0, h3start) + content.substring(h3end);
    }

    // Fix the end tags for the wrappers we introduced:
    // the previous layout closed 2 divs: `</div></div></motion.div>` (jobseeker) or `</div></div></div>` (recruiter)
    // we still have 2 wrapper divs! `flex w-full ...` and `w-full max-w-[500px] ...`. So we don't need to touch the end tag counts!

    // Convert input classes universally format from:
    // className="block w-full rounded-md border-0 bg-gray-200 py-3 pl-4 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
    // to
    // className="block w-full rounded-lg border-0 bg-[#E0E0E0] py-3.5 px-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#6B8BFF] sm:text-[15px] sm:leading-6 font-medium transition-shadow"

    content = content.replace(/bg-gray-200/g, 'bg-[#E0E0E0]');
    content = content.replace(/bg-\[\#f1f5f9\]/g, 'bg-[#E0E0E0]');
    content = content.replace(/focus:ring-indigo-600/g, 'focus:ring-[#6B8BFF]');
    content = content.replace(/placeholder:text-gray-500/g, 'placeholder:text-gray-400');
    // For specific padding/text tweaks:
    content = content.replace(/py-3/g, 'py-3.5');
    content = content.replace(/sm:text-sm/g, 'sm:text-[15px]');

    // Now replace the entire footer block (Submit & Socials)
    const submitStartStr = '{/* Submit & Socials */}';
    const submitStart = content.indexOf(submitStartStr);
    const formEnd = content.indexOf('</form>', submitStart);

    if (submitStart !== -1 && formEnd !== -1) {
        const bottomHTML = `
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
                                <Link href="${loginLink}" className="text-sm font-bold text-black hover:underline">
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
                                        onClick={() => signIn("google")}
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
                                        onClick={() => signIn("facebook")}
                                        className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                                    >
                                        <svg className="h-[22px] w-[22px] text-gray-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                        </svg>
                                    </button>

                                    {/* LinkedIn */}
                                    <button
                                        type="button"
                                        onClick={() => signIn("linkedin")}
                                        className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                                    >
                                        <svg className="h-[22px] w-[22px] text-gray-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        `;
        content = content.substring(0, submitStart) + bottomHTML + "\n                        " + content.substring(formEnd);
    }

    fs.writeFileSync(file, content);
}

processFile('app/auth/register/job-seeker/page.tsx', 'Job Seeker', '/auth/login', false);
console.log('Processed job-seeker register page');
processFile('app/auth/register/recruiter/page.tsx', 'Recruiter', '/auth/login/recruiter', true);
console.log('Processed recruiter register page');
