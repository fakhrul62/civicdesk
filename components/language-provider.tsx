"use client";

import * as React from "react";

export type Language = "en" | "bn";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const translations: Record<Language, Record<string, string>> = {
  en: {
    "language.current": "English",
    "language.switchTo": "বাংলা",
    "loader.title": "Loading page...",
    "loader.body": "CivicDesk is opening the next screen.",

    "nav.home": "Home",
    "nav.submit": "Submit Complaint",
    "nav.track": "Track Status",
    "nav.dashboard": "Dashboard",
    "nav.login": "Login",
    "nav.staffPortal": "Staff Portal",
    "nav.signOut": "Sign Out",
    "nav.signingOut": "Signing out...",
    "nav.openMenu": "Open menu",
    "nav.menu": "Navigation Menu",

    "admin.badge": "Admin",
    "admin.dashboard": "Dashboard",
    "admin.tickets": "Tickets",
    "admin.agents": "Agents",
    "admin.analytics": "Analytics",
    "admin.auditLog": "Audit Log",
    "admin.settings": "Settings",
    "admin.fallbackName": "Administrator",
    "admin.signOut": "Sign out",
    "admin.signingOut": "Signing out",

    "home.badge": "Government Complaint Portal",
    "home.headingPrefix": "Your voice matters.",
    "home.headingAccent": "We listen.",
    "home.description":
      "Report civic issues, track their progress in real time, and hold your government accountable - all in one transparent platform.",
    "home.submitCta": "Submit a Complaint",
    "home.citizenDashboard": "Citizen Dashboard",
    "home.ticketPlaceholder": "Enter your ticket ID",
    "home.track": "Track",
    "home.trackHelp": "Already submitted? Enter your ticket ID to check status instantly.",
    "home.statsSubmitted": "Complaints Submitted",
    "home.statsResolved": "Complaints Resolved",
    "home.statsCitizens": "Active Citizens",
    "home.statsAvg": "Avg. Resolution Time",
    "home.simpleProcess": "Simple Process",
    "home.howItWorks": "How it works",
    "home.howItWorksBody": "From submission to resolution - a transparent process you can trust.",
    "home.step1Title": "Submit Your Complaint",
    "home.step1Body":
      "Fill out a simple form describing your civic issue. Attach photos, select a category, and provide the location.",
    "home.step2Title": "Receive a Ticket ID",
    "home.step2Body":
      "Get an instant unique ticket number to track your complaint status at any time without needing to log in.",
    "home.step3Title": "We Investigate & Act",
    "home.step3Body":
      "Your complaint is routed to the right department. Agents review, prioritize, and work to resolve the issue.",
    "home.step4Title": "Stay Updated",
    "home.step4Body":
      "Receive status updates via email and track progress through our portal until your issue is fully resolved.",
    "home.departments": "Departments",
    "home.reportTitle": "What you can report",
    "home.reportBody": "We handle complaints across all major civic service categories.",
    "home.complaints": "complaints",
    "home.ready": "Ready to make a difference?",
    "home.readyBody":
      "Your complaint helps improve civic services for everyone. Start by submitting your issue - we'll take it from there.",
    "home.trackExisting": "Track Existing Complaint",

    "submit.stepCategory": "Category",
    "submit.stepDetails": "Details",
    "submit.stepLocation": "Location",
    "submit.stepContact": "Contact",
    "submit.title": "Submit a Complaint",
    "submit.subtitle": "Describe the civic issue and attach evidence so the right team can act.",
    "submit.selectCategory": "Select Category",
    "submit.chooseCategory": "Choose a category",
    "submit.routedTo": "Routed to",
    "submit.targetResponse": "target response",
    "submit.hours": "hours",
    "submit.titleLabel": "Title",
    "submit.titlePlaceholder": "Brief summary of your complaint",
    "submit.descriptionLabel": "Description",
    "submit.descriptionPlaceholder": "Include what happened, when it started, how it affects people, and any safety risk.",
    "submit.attachments": "Attachments",
    "submit.uploadHelp": "Upload photos or PDFs that show the issue",
    "submit.chooseFiles": "Choose Files",
    "submit.streetAddress": "Street Address",
    "submit.addressPlaceholder": "House/building, road, landmark",
    "submit.area": "Area / Neighborhood",
    "submit.areaPlaceholder": "Dhanmondi, Mirpur, Uttara Sector 7",
    "submit.city": "City",
    "submit.latitude": "Latitude",
    "submit.longitude": "Longitude",
    "submit.readingLocation": "Reading location...",
    "submit.useCurrentLocation": "Use Current Location",
    "submit.openMap": "Open Map",
    "submit.mapTitle": "Selected complaint location",
    "submit.locationPreview": "Location preview",
    "submit.locationFallback": "House 12, Road 7, Uttara Sector 7, Dhaka",
    "submit.locationHelp": "The department will use this address and coordinates for field routing.",
    "submit.fullName": "Full Name",
    "submit.email": "Email Address",
    "submit.phone": "Phone Number",
    "submit.review": "Review Your Complaint",
    "submit.files": "files",
    "submit.cancel": "Cancel",
    "submit.back": "Back",
    "submit.next": "Next",
    "submit.submitting": "Submitting...",
    "submit.submitted": "Complaint Submitted",
    "submit.submittedBody": "Your complaint has been registered. Use this ticket ID to track its progress.",
    "submit.ticketId": "Ticket ID",
    "submit.openingTracking": "Opening tracking...",
    "submit.trackComplaint": "Track Complaint",
    "submit.openingDashboard": "Opening dashboard...",
    "submit.dashboard": "Dashboard",
    "submit.errorCategory": "Please select a complaint category.",
    "submit.errorDetails": "Add a title of at least 10 characters and a description of at least 20 characters.",
    "submit.errorLocation": "Please provide a usable address or area.",
    "submit.errorValidCategory": "Please select a valid category.",
    "submit.errorNoGeo": "Your browser does not support location detection.",
    "submit.errorGeo": "Could not read your current location. You can enter the address manually.",

    "login.checking": "Checking your account...",
    "login.opening": "Opening your dashboard...",
    "login.unexpected": "An unexpected error occurred",
    "login.loading": "Loading...",
    "login.keepOpen": "Keep this page open while CivicDesk loads the next screen.",
    "login.welcome": "Welcome back to",
    "login.subtitle": "Sign in to manage your complaints",
    "login.email": "Email Address",
    "login.password": "Password",
    "login.forgot": "Forgot password?",
    "login.passwordPlaceholder": "Enter your password",
    "login.signingIn": "Signing in...",
    "login.signIn": "Sign In",
    "login.noAccount": "Don't have an account?",
    "login.createOne": "Create one",
    "login.backHome": "Back to homepage",
  },
  bn: {
    "language.current": "বাংলা",
    "language.switchTo": "English",
    "loader.title": "পৃষ্ঠা লোড হচ্ছে...",
    "loader.body": "CivicDesk পরের স্ক্রিন খুলছে।",

    "nav.home": "হোম",
    "nav.submit": "অভিযোগ দিন",
    "nav.track": "অবস্থা দেখুন",
    "nav.dashboard": "ড্যাশবোর্ড",
    "nav.login": "লগইন",
    "nav.staffPortal": "স্টাফ পোর্টাল",
    "nav.signOut": "সাইন আউট",
    "nav.signingOut": "সাইন আউট হচ্ছে...",
    "nav.openMenu": "মেনু খুলুন",
    "nav.menu": "নেভিগেশন মেনু",

    "admin.badge": "অ্যাডমিন",
    "admin.dashboard": "ড্যাশবোর্ড",
    "admin.tickets": "টিকিট",
    "admin.agents": "কর্মী",
    "admin.analytics": "অ্যানালিটিক্স",
    "admin.auditLog": "অডিট লগ",
    "admin.settings": "সেটিংস",
    "admin.fallbackName": "অ্যাডমিনিস্ট্রেটর",
    "admin.signOut": "সাইন আউট",
    "admin.signingOut": "সাইন আউট হচ্ছে",

    "home.badge": "সরকারি অভিযোগ পোর্টাল",
    "home.headingPrefix": "আপনার কথা গুরুত্বপূর্ণ।",
    "home.headingAccent": "আমরা শুনি।",
    "home.description":
      "নাগরিক সমস্যা জানান, অগ্রগতি সরাসরি দেখুন, এবং স্বচ্ছভাবে সেবার জবাবদিহি নিশ্চিত করুন।",
    "home.submitCta": "অভিযোগ জমা দিন",
    "home.citizenDashboard": "নাগরিক ড্যাশবোর্ড",
    "home.ticketPlaceholder": "আপনার টিকিট আইডি লিখুন",
    "home.track": "ট্র্যাক",
    "home.trackHelp": "আগে অভিযোগ করেছেন? অবস্থা দেখতে টিকিট আইডি লিখুন।",
    "home.statsSubmitted": "জমা হওয়া অভিযোগ",
    "home.statsResolved": "সমাধান হওয়া অভিযোগ",
    "home.statsCitizens": "সক্রিয় নাগরিক",
    "home.statsAvg": "গড় সমাধান সময়",
    "home.simpleProcess": "সহজ প্রক্রিয়া",
    "home.howItWorks": "যেভাবে কাজ করে",
    "home.howItWorksBody": "জমা থেকে সমাধান পর্যন্ত স্বচ্ছ প্রক্রিয়া।",
    "home.step1Title": "অভিযোগ জমা দিন",
    "home.step1Body":
      "সমস্যার বিবরণ দিন, ছবি বা প্রমাণ যুক্ত করুন, বিভাগ ও লোকেশন নির্বাচন করুন।",
    "home.step2Title": "টিকিট আইডি নিন",
    "home.step2Body":
      "অভিযোগের অবস্থা দেখার জন্য সঙ্গে সঙ্গে একটি ইউনিক টিকিট নম্বর পাবেন।",
    "home.step3Title": "আমরা যাচাই ও ব্যবস্থা নিই",
    "home.step3Body":
      "অভিযোগ সঠিক বিভাগে যায়। দায়িত্বপ্রাপ্ত কর্মীরা যাচাই, অগ্রাধিকার ও সমাধানের কাজ করেন।",
    "home.step4Title": "আপডেট পান",
    "home.step4Body":
      "ইমেইল ও পোর্টালের মাধ্যমে অভিযোগের অগ্রগতি দেখতে পারবেন।",
    "home.departments": "বিভাগসমূহ",
    "home.reportTitle": "যে বিষয়ে অভিযোগ করতে পারবেন",
    "home.reportBody": "প্রধান নাগরিক সেবা-সংক্রান্ত অভিযোগ এখানে জমা দেওয়া যায়।",
    "home.complaints": "অভিযোগ",
    "home.ready": "পরিবর্তন আনতে প্রস্তুত?",
    "home.readyBody":
      "আপনার অভিযোগ সবার জন্য নাগরিক সেবা উন্নত করতে সাহায্য করে।",
    "home.trackExisting": "পুরনো অভিযোগ ট্র্যাক করুন",

    "submit.stepCategory": "বিভাগ",
    "submit.stepDetails": "বিস্তারিত",
    "submit.stepLocation": "লোকেশন",
    "submit.stepContact": "যোগাযোগ",
    "submit.title": "অভিযোগ জমা দিন",
    "submit.subtitle": "সমস্যার বিস্তারিত লিখুন এবং প্রমাণ যুক্ত করুন, যাতে সঠিক দল ব্যবস্থা নিতে পারে।",
    "submit.selectCategory": "বিভাগ নির্বাচন করুন",
    "submit.chooseCategory": "একটি বিভাগ বেছে নিন",
    "submit.routedTo": "রুট করা হবে",
    "submit.targetResponse": "লক্ষ্য প্রতিক্রিয়া",
    "submit.hours": "ঘণ্টা",
    "submit.titleLabel": "শিরোনাম",
    "submit.titlePlaceholder": "অভিযোগের সংক্ষিপ্ত সারাংশ",
    "submit.descriptionLabel": "বিবরণ",
    "submit.descriptionPlaceholder": "কী হয়েছে, কখন শুরু হয়েছে, মানুষ কীভাবে ক্ষতিগ্রস্ত হচ্ছে এবং নিরাপত্তা ঝুঁকি থাকলে লিখুন।",
    "submit.attachments": "সংযুক্তি",
    "submit.uploadHelp": "সমস্যা বোঝায় এমন ছবি বা PDF আপলোড করুন",
    "submit.chooseFiles": "ফাইল বাছুন",
    "submit.streetAddress": "রাস্তার ঠিকানা",
    "submit.addressPlaceholder": "বাসা/ভবন, রাস্তা, ল্যান্ডমার্ক",
    "submit.area": "এলাকা / মহল্লা",
    "submit.areaPlaceholder": "ধানমন্ডি, মিরপুর, উত্তরা সেক্টর ৭",
    "submit.city": "শহর",
    "submit.latitude": "অক্ষাংশ",
    "submit.longitude": "দ্রাঘিমাংশ",
    "submit.readingLocation": "লোকেশন পড়া হচ্ছে...",
    "submit.useCurrentLocation": "বর্তমান লোকেশন ব্যবহার করুন",
    "submit.openMap": "ম্যাপ খুলুন",
    "submit.mapTitle": "নির্বাচিত অভিযোগের লোকেশন",
    "submit.locationPreview": "লোকেশন প্রিভিউ",
    "submit.locationFallback": "বাসা ১২, রোড ৭, উত্তরা সেক্টর ৭, ঢাকা",
    "submit.locationHelp": "মাঠ পর্যায়ের কাজের জন্য বিভাগ এই ঠিকানা ও কোঅর্ডিনেট ব্যবহার করবে।",
    "submit.fullName": "পূর্ণ নাম",
    "submit.email": "ইমেইল ঠিকানা",
    "submit.phone": "ফোন নম্বর",
    "submit.review": "অভিযোগ যাচাই করুন",
    "submit.files": "টি ফাইল",
    "submit.cancel": "বাতিল",
    "submit.back": "পেছনে",
    "submit.next": "পরবর্তী",
    "submit.submitting": "জমা হচ্ছে...",
    "submit.submitted": "অভিযোগ জমা হয়েছে",
    "submit.submittedBody": "আপনার অভিযোগ নিবন্ধিত হয়েছে। অগ্রগতি দেখতে এই টিকিট আইডি ব্যবহার করুন।",
    "submit.ticketId": "টিকিট আইডি",
    "submit.openingTracking": "ট্র্যাকিং খোলা হচ্ছে...",
    "submit.trackComplaint": "অভিযোগ ট্র্যাক করুন",
    "submit.openingDashboard": "ড্যাশবোর্ড খোলা হচ্ছে...",
    "submit.dashboard": "ড্যাশবোর্ড",
    "submit.errorCategory": "অনুগ্রহ করে অভিযোগের বিভাগ নির্বাচন করুন।",
    "submit.errorDetails": "কমপক্ষে ১০ অক্ষরের শিরোনাম এবং ২০ অক্ষরের বিবরণ লিখুন।",
    "submit.errorLocation": "ব্যবহারযোগ্য ঠিকানা বা এলাকা দিন।",
    "submit.errorValidCategory": "অনুগ্রহ করে সঠিক বিভাগ নির্বাচন করুন।",
    "submit.errorNoGeo": "আপনার ব্রাউজার লোকেশন শনাক্তকরণ সমর্থন করে না।",
    "submit.errorGeo": "বর্তমান লোকেশন পড়া যায়নি। আপনি হাতে ঠিকানা লিখতে পারেন।",

    "login.checking": "আপনার অ্যাকাউন্ট যাচাই হচ্ছে...",
    "login.opening": "আপনার ড্যাশবোর্ড খোলা হচ্ছে...",
    "login.unexpected": "অপ্রত্যাশিত সমস্যা হয়েছে",
    "login.loading": "লোড হচ্ছে...",
    "login.keepOpen": "পরের স্ক্রিন লোড হওয়া পর্যন্ত এই পেজ খোলা রাখুন।",
    "login.welcome": "আবার স্বাগতম",
    "login.subtitle": "আপনার অভিযোগ পরিচালনা করতে সাইন ইন করুন",
    "login.email": "ইমেইল ঠিকানা",
    "login.password": "পাসওয়ার্ড",
    "login.forgot": "পাসওয়ার্ড ভুলে গেছেন?",
    "login.passwordPlaceholder": "আপনার পাসওয়ার্ড লিখুন",
    "login.signingIn": "সাইন ইন হচ্ছে...",
    "login.signIn": "সাইন ইন",
    "login.noAccount": "অ্যাকাউন্ট নেই?",
    "login.createOne": "অ্যাকাউন্ট তৈরি করুন",
    "login.backHome": "হোমপেজে ফিরে যান",
  },
};

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<Language>("en");

  React.useEffect(() => {
    const stored = window.localStorage.getItem("civicdesk-language");
    if (stored === "bn") {
      setLanguageState("bn");
    }
  }, []);

  React.useEffect(() => {
    window.localStorage.setItem("civicdesk-language", language);
    document.documentElement.lang = language;
    document.documentElement.dir = "ltr";
  }, [language]);

  const value = React.useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage: setLanguageState,
      t: (key: string) => translations[language][key] ?? translations.en[key] ?? key,
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = React.useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
