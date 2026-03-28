"use client";

import React, { useMemo, useState } from "react";
import { X, CheckCircle2, ChevronRight, LoaderCircle, Upload, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface ProfileCompletionData {
    phone?: string;
    aboutMe?: string;
    skills?: string[];
    languages?: string[];
    availableTimes?: string;
    cv?: string;
    idFront?: string;
    idBack?: string;
    isAvailable?: boolean;
}

type EducationItem = {
    level?: string;
    [key: string]: unknown;
};

export interface ProfileDataProp {
    phone?: string;
    aboutMe?: string;
    title?: string;
    skills?: string[];
    languages?: string[];
    availableTimes?: string;
    cv?: string;
    idFront?: string;
    idBack?: string;
    education?: EducationItem[];
    paymentDetails?: {
        paymentMethod?: 'bank' | 'card';
        accountName?: string;
        accountNumber?: string;
        bankName?: string;
        branchName?: string;
        cardNumber?: string;
        cardName?: string;
        expiryDate?: string;
        cvv?: string;
    };
}

type SaveUpdates =
    | { phone: string }
    | { title: string; aboutMe: string }
    | { skills: string[] }
    | { languages: string[] }
    | { availableTimes: string }
    | { education: EducationItem[] }
    | { paymentDetails: any };

interface ProfileCompletionWizardProps {
    profile: ProfileDataProp;
    onClose: () => void;
    onSaveStep: (updates: SaveUpdates) => Promise<boolean>;
    onUploadDocs: (cv: File | null, idFront: File | null, idBack: File | null) => Promise<boolean>;
}

export default function ProfileCompletionWizard({ profile, onClose, onSaveStep, onUploadDocs }: ProfileCompletionWizardProps) {
    const steps = useMemo(() => {
        const nextSteps: Array<{ id: string; label: string; desc: string }> = [];

        if (!profile.phone) nextSteps.push({ id: "phone", label: "Phone Number", desc: "How can employers reach you directly?" });
        if (!profile.aboutMe || profile.aboutMe.trim() === "" || !profile.title || profile.title.trim() === "") nextSteps.push({ id: "about", label: "Professional Headline & Summary", desc: "Tell employers about your expertise" });
        if (!profile.skills || profile.skills.length === 0) nextSteps.push({ id: "skills", label: "Skills", desc: "What are your top skills?" });
        if (!profile.languages || profile.languages.length === 0) nextSteps.push({ id: "languages", label: "Languages", desc: "What languages do you speak?" });
        if (!profile.cv || !profile.idFront || !profile.idBack) nextSteps.push({ id: "documents", label: "Documents", desc: "Upload your CV and ID for verification." });
        if (!profile.education || profile.education.length === 0) nextSteps.push({ id: "education", label: "Education", desc: "Add your highest level of education" });
        if (!profile.paymentDetails || (!profile.paymentDetails.accountNumber && !profile.paymentDetails.cardNumber)) nextSteps.push({ id: "payment", label: "Payment Details", desc: "Add a bank account or debit card to receive payouts securely." });

        return nextSteps;
    }, [profile]);

    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [saving, setSaving] = useState(false);

    // Form States
    const initialPhone = profile.phone ? profile.phone.replace(/^(\+94|0)/, '') : "";
    const [phone, setPhone] = useState(initialPhone);
    const [phoneError, setPhoneError] = useState("");
    const [title, setTitle] = useState(profile.title || "");
    const [aboutMe, setAboutMe] = useState(profile.aboutMe || "");
    const [skillsText, setSkillsText] = useState(profile.skills ? profile.skills.join(", ") : "");
    const [languagesText, setLanguagesText] = useState(profile.languages ? profile.languages.join(", ") : "");
    const [availability, setAvailability] = useState(profile.availableTimes || "");
    const [stepError, setStepError] = useState("");

    // Education State
    const [eduLevels, setEduLevels] = useState<string[]>([]);

    // Docs State
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
    const [idBackFile, setIdBackFile] = useState<File | null>(null);

    // Payment State
    const existingPayment = profile.paymentDetails || {};
    const [paymentMethod, setPaymentMethod] = useState<'bank' | 'card'>(existingPayment.paymentMethod || 'bank');
    const [accountName, setAccountName] = useState(existingPayment.accountName || "");
    const [accountNumber, setAccountNumber] = useState(existingPayment.accountNumber || "");
    const [bankName, setBankName] = useState(existingPayment.bankName || "");
    const [branchName, setBranchName] = useState(existingPayment.branchName || "");
    const [cardNumber, setCardNumber] = useState(existingPayment.cardNumber || "");
    const [cardName, setCardName] = useState(existingPayment.cardName || "");
    const [expiryDate, setExpiryDate] = useState(existingPayment.expiryDate || "");
    const [cvv, setCvv] = useState(existingPayment.cvv || "");

    if (steps.length === 0) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 max-w-sm w-full text-center relative overflow-hidden">
                     <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:bg-slate-100 rounded-full p-2 transition-colors"><X className="w-5 h-5"/></button>
                     <div className="w-16 h-16 bg-[#6b8bff]/10 text-[#6b8bff] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#6b8bff]/20">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Profile Complete!</h2>
                    <p className="text-slate-500 text-sm mb-6">You have completed all recommended profile details. Your profile is looking great!</p>
                    <button onClick={onClose} className="w-full bg-[#6b8bff] hover:bg-[#5a7af0] text-white py-3 rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-[#6b8bff]/20">Close Manager</button>
                </div>
            </div>
        );
    }

    const activeStep = steps[currentStepIndex];
    const isLast = currentStepIndex === steps.length - 1;

    const currentProgress = Math.round(((currentStepIndex) / steps.length) * 100);

    const handleNext = async () => {
        setSaving(true);
        setStepError("");
        let success = false;
        
        try {
            if (activeStep.id === "phone") {
                const cleanedPhone = phone.replace(/[\s-]/g, '');
                if (!cleanedPhone) {
                    setStepError("Phone number is required. Or click 'Skip for now'.");
                    setSaving(false);
                    return;
                }
                if (!/^\d{9}$/.test(cleanedPhone)) {
                    setStepError("Please enter exactly 9 digits without the leading 0 (e.g. 771234567).");
                    setSaving(false);
                    return;
                }
                success = await onSaveStep({ phone: `+94${cleanedPhone}` });
            } else if (activeStep.id === "about") {
                if (!title.trim() || !aboutMe.trim()) {
                    setStepError("Both Headline and Summary are required. Or click 'Skip for now'.");
                    setSaving(false);
                    return;
                }
                success = await onSaveStep({ title, aboutMe });
            } else if (activeStep.id === "skills") {
                const arr = skillsText.split(",").map((s: string) => s.trim()).filter(Boolean);
                if (arr.length === 0) {
                    setStepError("Please add at least one skill. Or click 'Skip for now'.");
                    setSaving(false);
                    return;
                }
                success = await onSaveStep({ skills: arr });
            } else if (activeStep.id === "languages") {
                const arr = languagesText.split(",").map((s: string) => s.trim()).filter(Boolean);
                if (arr.length === 0) {
                    setStepError("Please add at least one language. Or click 'Skip for now'.");
                    setSaving(false);
                    return;
                }
                success = await onSaveStep({ languages: arr });
            } else if (activeStep.id === "availability") {
                const arr = availability.split(",").map((s: string) => s.trim()).filter(Boolean);
                if (arr.length === 0) {
                    setStepError("Please select at least one available time. Or click 'Skip for now'.");
                    setSaving(false);
                    return;
                }
                success = await onSaveStep({ availableTimes: availability });
            } else if (activeStep.id === "documents") {
                if (!cvFile && !idFrontFile && !idBackFile && !profile.cv && (!profile.idFront || !profile.idBack)) {
                    setStepError("Please upload your required documents. Or click 'Skip for now'.");
                    setSaving(false);
                    return;
                }
                success = await onUploadDocs(cvFile, idFrontFile, idBackFile);
            } else if (activeStep.id === "education") {
                if (eduLevels.length === 0) {
                    setStepError("Please select at least one level of education. Or click 'Skip for now'.");
                    setSaving(false);
                    return;
                }
                const newEdus = eduLevels.map(lvl => ({ level: lvl }));
                const currentEdu = profile.education || [];
                success = await onSaveStep({ education: [...currentEdu, ...newEdus] });
            } else if (activeStep.id === "payment") {
                if (paymentMethod === 'bank') {
                    if (!accountName.trim() || !accountNumber.trim() || !bankName.trim() || !branchName.trim()) {
                        setStepError("Please fill out all bank details. Or click 'Skip for now'.");
                        setSaving(false);
                        return;
                    }
                    success = await onSaveStep({ paymentDetails: { paymentMethod, accountName, accountNumber, bankName, branchName } });
                } else {
                    if (!cardName.trim() || !cardNumber.trim() || !expiryDate.trim() || !cvv.trim()) {
                        setStepError("Please fill out all card details. Or click 'Skip for now'.");
                        setSaving(false);
                        return;
                    }
                    success = await onSaveStep({ paymentDetails: { paymentMethod, cardName, cardNumber, expiryDate, cvv } });
                }
            } else {
                success = true; // Fallback
            }

            if (success) {
                if (!isLast) {
                    setCurrentStepIndex(currentStepIndex + 1);
                } else {
                    onClose();
                }
            } else {
                setStepError("Failed to save profile details. Please try again.");
            }
        } catch (e) {
            console.error(e);
            setStepError("Could not save the details. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleSkip = () => {
        setStepError("");
        if (!isLast) {
            setCurrentStepIndex(currentStepIndex + 1);
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden w-full max-w-2xl flex flex-col max-h-[90vh]"
            >
                {/* Header Phase */}
                <div className="px-8 pt-8 pb-4 relative flex items-center justify-between z-10 bg-white">
                    <button onClick={onClose} className="absolute right-6 top-6 text-slate-400 hover:bg-slate-100 rounded-full p-2 transition-colors"><X className="w-5 h-5"/></button>
                    <div>
                        <div className="text-[#6b8bff] font-bold text-xs uppercase tracking-widest mb-1">Step {currentStepIndex + 1} of {steps.length}</div>
                        <h2 className="text-2xl font-black text-slate-900 leading-tight">{activeStep.label}</h2>
                        <p className="text-slate-500 font-medium text-sm mt-1">{activeStep.desc}</p>
                    </div>

                    {/* Mini Progress ring in header matching Slate/#6b8bff */}
                    <div className="relative w-14 h-14 hidden sm:flex items-center justify-center mr-8">
                        <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#6b8bff" strokeWidth="3.5" strokeDasharray={`${currentProgress}, 100`} strokeLinecap="round" className="transition-all duration-700 ease-out" />
                        </svg>
                        <span className="absolute text-[10px] font-bold text-slate-700">{currentProgress}%</span>
                    </div>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full h-1 bg-slate-100">
                    <div 
                        className="h-full bg-[#6b8bff] transition-all duration-500 ease-out" 
                        style={{ width: `${((currentStepIndex) / steps.length) * 100}%` }}
                    />
                </div>

                {/* Content Body */}
                <div className="px-8 py-8 overflow-y-auto flex-1 min-h-[45vh] flex flex-col justify-center bg-white">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={activeStep.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeStep.id === "phone" && (
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-slate-700">Phone Number</label>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-0 inset-y-0 flex items-center pl-4 pr-3 text-slate-900 font-bold bg-slate-100 rounded-l-xl border-r border-slate-200 z-10 select-none">
                                            🇱🇰 +94
                                        </div>
                                        <input type="tel" value={phone} onChange={e => { setPhone(e.target.value.replace(/[^\d\s-]/g, '')); setStepError(""); setPhoneError(""); }} placeholder="77 123 4567" className={`w-full bg-slate-50 border ${phoneError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-[#6b8bff] focus:border-[#6b8bff]'} rounded-xl pl-24 pr-5 py-4 outline-none focus:ring-2 font-medium text-slate-900 transition-all text-lg`} autoFocus/>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Your phone number is kept private until you apply.</p>
                                </div>
                            )}

                            {activeStep.id === "about" && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Professional Headline</label>
                                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Reliable Hospitality Worker | Cashier" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-[#6b8bff] focus:border-[#6b8bff] font-medium text-slate-900 transition-all" autoFocus/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Professional Summary</label>
                                        <textarea value={aboutMe} onChange={e => setAboutMe(e.target.value)} placeholder="I am a dedicated professional with experience in..." rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-[#6b8bff] focus:border-[#6b8bff] font-medium text-slate-900 transition-all resize-none"/>
                                        <p className="text-xs text-slate-500 font-medium mt-2">Write a short paragraph highlighting your strengths and what kind of work you&apos;re looking for.</p>
                                    </div>
                                </div>
                            )}

                            {activeStep.id === "skills" && (
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-slate-700">Format: Skill 1, Skill 2, Skill 3</label>
                                    <input type="text" value={skillsText} onChange={e => setSkillsText(e.target.value)} placeholder="e.g. Leadership, Management, Coding" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-[#6b8bff] focus:border-[#6b8bff] font-medium text-slate-900 transition-all text-lg" autoFocus/>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {["Customer Service", "Time Management", "Leadership", "Teamwork"].map(sk => (
                                            <button 
                                                key={sk} 
                                                onClick={() => setSkillsText((prev: string) => prev ? prev + `, ${sk}` : sk)}
                                                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-xs font-bold hover:bg-indigo-100 hover:border-indigo-200 transition-all"
                                            >
                                                + {sk}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeStep.id === "languages" && (
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-slate-700">Format: Language 1, Language 2</label>
                                    <input type="text" value={languagesText} onChange={e => setLanguagesText(e.target.value)} placeholder="e.g. English, Spanish" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-[#6b8bff] focus:border-[#6b8bff] font-medium text-slate-900 transition-all text-lg" autoFocus/>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {["English", "Spanish", "French", "German"].map(lang => (
                                            <button 
                                                key={lang} 
                                                onClick={() => setLanguagesText((prev: string) => prev ? prev + `, ${lang}` : lang)}
                                                className="px-3 py-1.5 bg-[#6b8bff]/10 text-[#6b8bff] border border-[#6b8bff]/20 rounded-lg text-xs font-bold hover:bg-[#6b8bff]/20 hover:border-[#6b8bff]/30 transition-all"
                                            >
                                                + {lang}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeStep.id === "availability" && (() => {
                                const AVAIL_OPTIONS = ["Full Time", "Part Time", "Weekdays", "Weekends", "Mornings", "Afternoons", "Evenings", "Night Shifts"];
                                const currentAvails = availability ? availability.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
                                
                                const toggleAvailability = (opt: string) => {
                                    if (currentAvails.includes(opt)) {
                                        setAvailability(currentAvails.filter((o: string) => o !== opt).join(', '));
                                    } else {
                                        setAvailability([...currentAvails, opt].join(', '));
                                    }
                                };
                                
                                return (
                                    <div className="space-y-4">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">When are you available for work?</label>
                                        <div className="flex flex-wrap gap-2.5">
                                            {AVAIL_OPTIONS.map(opt => {
                                                const isSelected = currentAvails.includes(opt);
                                                return (
                                                    <button
                                                        key={opt}
                                                        onClick={() => toggleAvailability(opt)}
                                                        className={`px-4 py-2 border rounded-xl text-sm font-bold transition-all ${
                                                            isSelected
                                                            ? "bg-[#6b8bff] border-[#6b8bff] text-white shadow-md shadow-[#6b8bff]/20"
                                                            : "bg-white border-slate-200 text-slate-600 hover:border-[#6b8bff] hover:text-[#6b8bff]"
                                                        }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className="mt-6 pt-5 border-t border-slate-100">
                                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Or type custom availability</label>
                                            <input type="text" value={availability} onChange={e => setAvailability(e.target.value)} placeholder="e.g. Tuesday mornings only" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#6b8bff] focus:border-[#6b8bff] font-medium text-slate-900 transition-all text-sm"/>
                                        </div>
                                    </div>
                                );
                            })()}

                            {activeStep.id === "documents" && (
                                <div className="space-y-6">
                                    {!profile.cv && (
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">CV / Resume Document</label>
                                            <label className="flex items-center justify-center w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl px-5 py-6 cursor-pointer hover:bg-[#6b8bff]/5 hover:border-[#6b8bff]/40 transition-all group">
                                                <div className="flex flex-col items-center">
                                                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-[#6b8bff] mb-2 transition-colors" />
                                                    <span className="text-sm font-bold text-slate-600 group-hover:text-[#6b8bff] transition-colors">{cvFile ? cvFile.name : "Select CV File (.pdf, .doc)"}</span>
                                                </div>
                                                <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => { if(e.target.files) setCvFile(e.target.files[0]) }} />
                                            </label>
                                        </div>
                                    )}
                                    
                                    {(!profile.idFront || !profile.idBack) && (
                                        <div className="grid grid-cols-2 gap-4">
                                            {!profile.idFront && (
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 mb-2">ID Front Side</label>
                                                    <label className="flex items-center justify-center w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl px-2 py-6 cursor-pointer hover:bg-[#6b8bff]/5 hover:border-[#6b8bff]/40 transition-all text-center group">
                                                        <span className="text-sm font-bold text-slate-600 truncate px-2 group-hover:text-[#6b8bff]">{idFrontFile ? idFrontFile.name : "+ Upload Front"}</span>
                                                        <input type="file" accept=".pdf,.jpg,.png" className="hidden" onChange={e => { if(e.target.files) setIdFrontFile(e.target.files[0]) }} />
                                                    </label>
                                                </div>
                                            )}
                                            {!profile.idBack && (
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 mb-2">ID Back Side</label>
                                                    <label className="flex items-center justify-center w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl px-2 py-6 cursor-pointer hover:bg-[#6b8bff]/5 hover:border-[#6b8bff]/40 transition-all text-center group">
                                                        <span className="text-sm font-bold text-slate-600 truncate px-2 group-hover:text-[#6b8bff]">{idBackFile ? idBackFile.name : "+ Upload Back"}</span>
                                                        <input type="file" accept=".pdf,.jpg,.png" className="hidden" onChange={e => { if(e.target.files) setIdBackFile(e.target.files[0]) }} />
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeStep.id === "education" && (() => {
                                const EDU_OPTIONS = ["GCE O/L", "GCE A/L", "Undergraduate", "Degree Holder", "Postgraduate", "Other"];
                                
                                return (
                                    <div className="space-y-4">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Education Levels (Select all that apply)</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {EDU_OPTIONS.map(opt => {
                                                const isSelected = eduLevels.includes(opt);
                                                return (
                                                    <button
                                                        key={opt}
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                setEduLevels(eduLevels.filter(lvl => lvl !== opt));
                                                            } else {
                                                                setEduLevels([...eduLevels, opt]);
                                                            }
                                                            setStepError("");
                                                        }}
                                                        className={`px-4 py-3 border rounded-xl text-sm font-bold transition-all ${
                                                            isSelected
                                                            ? "bg-[#6b8bff] border-[#6b8bff] text-white shadow-md shadow-[#6b8bff]/20"
                                                            : "bg-white border-slate-200 text-slate-600 hover:border-[#6b8bff] hover:text-[#6b8bff]"
                                                        }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium pt-2">Providing education details builds trust with employers. Select your highest qualification here.</p>
                                    </div>
                                );
                            })()}

                            {activeStep.id === "payment" && (
                                <div className="space-y-4">
                                    <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-100 text-sm font-medium flex items-center gap-2 shadow-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Secure Payouts enabled by PayHere
                                    </div>

                                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                                        <button type="button" onClick={() => setPaymentMethod('bank')} className={`flex-1 py-2 rounded-md font-bold text-sm transition-all ${paymentMethod === 'bank' ? 'bg-white shadow-sm text-slate-900 border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>Bank Account</button>
                                        <button type="button" onClick={() => setPaymentMethod('card')} className={`flex-1 py-2 rounded-md font-bold text-sm transition-all ${paymentMethod === 'card' ? 'bg-white shadow-sm text-slate-900 border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>Debit/Credit Card</button>
                                    </div>

                                    {paymentMethod === 'bank' ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Account Owner Name</label>
                                                <input type="text" value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="e.g. John Doe" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#6b8bff] font-medium text-slate-900 transition-all text-sm"/>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Account Number</label>
                                                <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="1000 2000 3000" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#6b8bff] font-medium text-slate-900 transition-all text-sm"/>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Bank Name</label>
                                                <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. Commercial Bank" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#6b8bff] font-medium text-slate-900 transition-all text-sm"/>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Branch</label>
                                                <input type="text" value={branchName} onChange={e => setBranchName(e.target.value)} placeholder="e.g. Colombo 03" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#6b8bff] font-medium text-slate-900 transition-all text-sm"/>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Name on Card</label>
                                                <input type="text" value={cardName} onChange={e => setCardName(e.target.value)} placeholder="e.g. John Doe" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#6b8bff] font-medium text-slate-900 transition-all text-sm"/>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Card Number</label>
                                                <input type="text" value={cardNumber} onChange={e => {
                                                    const val = e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
                                                    setCardNumber(val);
                                                }} placeholder="0000 0000 0000 0000" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#6b8bff] font-medium text-slate-900 transition-all text-sm"/>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Expiry Date</label>
                                                <input type="text" value={expiryDate} onChange={e => {
                                                    const val = e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d{1,2})/, '$1/$2').substring(0, 5);
                                                    setExpiryDate(val);
                                                }} placeholder="MM/YY" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#6b8bff] font-medium text-slate-900 transition-all text-sm"/>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">CVV</label>
                                                <input type="text" value={cvv} onChange={e => {
                                                    const val = e.target.value.replace(/\D/g, '').substring(0, 4);
                                                    setCvv(val);
                                                }} placeholder="123" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#6b8bff] font-medium text-slate-900 transition-all text-sm"/>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {stepError && (
                    <div className="px-8 py-3 bg-red-50 border-t border-b border-red-100 flex items-start text-red-600 text-sm font-bold gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <Shield className="w-4 h-4 mt-0.5 shrink-0" /> <span className="flex-1">{stepError}</span>
                    </div>
                )}

                {/* Footer Controls */}
                <div className="px-8 py-6 bg-white border-t border-slate-100 flex items-center justify-between">
                    <button 
                        onClick={handleSkip} 
                        disabled={saving}
                        className="text-slate-500 font-bold hover:text-slate-800 text-sm disabled:opacity-50 transition-colors"
                    >
                        Skip for now
                    </button>
                    
                    <button 
                        onClick={handleNext} 
                        disabled={saving || (activeStep.id === "documents" && (!profile.cv && !cvFile) && (!profile.idFront && !idFrontFile))}
                        className="flex items-center px-8 py-3.5 bg-[#6b8bff] text-white font-bold rounded-xl hover:bg-[#5a7af0] hover:shadow-lg hover:shadow-[#6b8bff]/30 transition-all disabled:opacity-50 shadow-sm"
                    >
                        {saving ? <LoaderCircle className="w-5 h-5 animate-spin"/> : (
                            <>
                                {isLast ? "Complete Profile" : "Save & Continue"}
                                {!isLast && <ChevronRight className="w-4 h-4 ml-1.5" />}
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
