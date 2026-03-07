import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import LinkedInProvider from "next-auth/providers/linkedin";

console.log("--------------------------------------------------");
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("--------------------------------------------------");

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID || "",
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
        }),
        LinkedInProvider({
            clientId: process.env.LINKEDIN_CLIENT_ID || "",
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
        }),
    ],
    pages: {
        signIn: "/auth/login",
    },
    callbacks: {
        async session({ session, token, user }) {
            // Add custom session logic here if needed
            return session;
        }
    }
});

export { handler as GET, handler as POST };
