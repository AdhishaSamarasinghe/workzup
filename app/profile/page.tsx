"use client";

import { useEffect, useState } from "react";
import { fetchProfile, updateProfile } from "@/lib/api";

export default function ProfilePage() {
    const userId = "current-user-123";
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [location, setLocation] = useState("");
    const [avatar, setAvatar] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetchProfile(userId);
                if (res.success && res.data) {
                    setName(res.data.name || "");
                    setBio(res.data.bio || "");
                    setLocation(res.data.location || "");
                    setAvatar(res.data.avatar || "");
                }
            } catch (error) {
                console.error("Failed to load profile:", error);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [userId]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateProfile(userId, { name, bio, location, avatar });
            alert("Profile saved successfully!");
        } catch (error) {
            console.error("Failed to save profile:", error);
            alert("Failed to save profile.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">

                {/* Header Cover */}
                <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 w-full relative"></div>

                <div className="px-6 sm:px-8 pb-8">
                    {/* Avatar Section */}
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="h-24 w-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-md">
                            {avatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={avatar} alt={name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-3xl text-gray-400 font-bold bg-gray-100">
                                    {name ? name.charAt(0).toUpperCase() : "?"}
                                </div>
                            )}
                        </div>
                    </div>

                    <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Profile</h1>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Avatar URL</label>
                            <input
                                type="text"
                                value={avatar}
                                onChange={(e) => setAvatar(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                placeholder="/avatars/default.svg or https://..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={4}
                                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-y"
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSaving ? "Saving..." : "Save Profile"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
