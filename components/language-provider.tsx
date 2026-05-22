"use client";

import * as React from "react";

export type Language = "en" | "bn";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const textNodeOriginals = new WeakMap<Text, string>();

const attributeOriginals = new WeakMap<Element, Record<string, string>>();

const domTranslations: Record<string, string> = {
  "Toggle theme": "থিম পরিবর্তন করুন",
  Close: "বন্ধ করুন",
  "Open menu": "মেনু খুলুন",
  Track: "ট্র্যাক",
  "Government Complaint Portal": "সরকারি অভিযোগ পোর্টাল",
  "Your voice matters. We listen.": "আপনার কথা গুরুত্বপূর্ণ। আমরা শুনি।",
  "Report civic issues, track their progress in real time, and hold your government accountable - all in one transparent platform.":
    "নাগরিক সমস্যা জানান, অগ্রগতি সরাসরি দেখুন, এবং স্বচ্ছভাবে সেবার জবাবদিহি নিশ্চিত করুন।",
  "Already submitted? Enter your ticket ID to check status instantly.":
    "আগে অভিযোগ করেছেন? অবস্থা দেখতে টিকিট আইডি লিখুন।",
  "Simple Process": "সহজ প্রক্রিয়া",
  "How it works": "যেভাবে কাজ করে",
  "From submission to resolution - a transparent process you can trust.":
    "জমা থেকে সমাধান পর্যন্ত স্বচ্ছ প্রক্রিয়া।",
  "Submit Your Complaint": "অভিযোগ জমা দিন",
  "Fill out a simple form describing your civic issue. Attach photos, select a category, and provide the location.":
    "সমস্যার বিবরণ দিন, ছবি বা প্রমাণ যুক্ত করুন, বিভাগ ও লোকেশন নির্বাচন করুন।",
  "Receive a Ticket ID": "টিকিট আইডি নিন",
  "Get an instant": "সঙ্গে সঙ্গে পান",
  "Quick Links": "দ্রুত লিংক",
  "Submit a Complaint": "অভিযোগ জমা দিন",
  "Track Your Complaint": "অভিযোগ ট্র্যাক করুন",
  "Citizen Dashboard": "নাগরিক ড্যাশবোর্ড",
  Resources: "রিসোর্স",
  "Help Center": "সহায়তা কেন্দ্র",
  "Privacy Policy": "গোপনীয়তা নীতি",
  "Terms of Service": "সেবার শর্তাবলি",
  Contact: "যোগাযোগ",
  "Civic Service Center": "নাগরিক সেবা কেন্দ্র",
  "Government complaint management portal. Submit, track, and resolve civic issues transparently.":
    "সরকারি অভিযোগ ব্যবস্থাপনা পোর্টাল। স্বচ্ছভাবে অভিযোগ জমা, ট্র্যাক ও সমাধান করুন।",
  "Government of the People. All rights reserved.": "জনগণের সরকার। সর্বস্বত্ব সংরক্ষিত।",
  "© 2026 CivicDesk. Government of the People. All rights reserved.":
    "© ২০২৬ CivicDesk. জনগণের সরকার। সর্বস্বত্ব সংরক্ষিত।",
  "Welcome back,": "আবার স্বাগতম,",
  "New Complaint": "নতুন অভিযোগ",
  "Total Complaints": "মোট অভিযোগ",
  "In Progress": "চলমান",
  Resolved: "সমাধান হয়েছে",
  Overdue: "সময় পেরিয়েছে",
  "My Complaints": "আমার অভিযোগ",
  "No complaints found matching your search.": "আপনার অনুসন্ধানের সাথে কোনো অভিযোগ পাওয়া যায়নি।",
  "Search complaints...": "অভিযোগ খুঁজুন...",
  "Ticket Not Found": "টিকিট পাওয়া যায়নি",
  "Status Progress": "অবস্থার অগ্রগতি",
  "Activity Timeline": "কার্যক্রমের টাইমলাইন",
  "No timeline activity found.": "কোনো টাইমলাইন কার্যক্রম পাওয়া যায়নি।",
  "Public Messages": "পাবলিক বার্তা",
  "No public messages yet.": "এখনো কোনো পাবলিক বার্তা নেই।",
  Attachments: "সংযুক্তি",
  "Complaint Not Found": "অভিযোগ পাওয়া যায়নি",
  Messages: "বার্তা",
  Timeline: "টাইমলাইন",
  Details: "বিস্তারিত",
  Category: "বিভাগ",
  Location: "লোকেশন",
  Submitted: "জমা হয়েছে",
  "Due Date": "শেষ সময়",
  "Last Updated": "সর্বশেষ আপডেট",
  "Not specified": "উল্লেখ করা হয়নি",
  "Not set": "সেট করা হয়নি",
  "Open map": "ম্যাপ খুলুন",
  "No attachments submitted.": "কোনো সংযুক্তি জমা দেওয়া হয়নি।",
  Dashboard: "ড্যাশবোর্ড",
  "Overview of all civic complaints and system performance.":
    "সব নাগরিক অভিযোগ ও সিস্টেম পারফরম্যান্সের সারসংক্ষেপ।",
  "Total Tickets": "মোট টিকিট",
  "Open Tickets": "খোলা টিকিট",
  "Recent Tickets": "সাম্প্রতিক টিকিট",
  "View All": "সব দেখুন",
  "Status Breakdown": "অবস্থার বিভাজন",
  "No ticket data yet.": "এখনো কোনো টিকিট ডেটা নেই।",
  "Agent Load": "এজেন্টের কাজের চাপ",
  "No agents or supervisors have been added yet.": "এখনো কোনো এজেন্ট বা সুপারভাইজার যোগ করা হয়নি।",
  Performance: "পারফরম্যান্স",
  "Avg. Resolution": "গড় সমাধান",
  "SLA Compliance": "SLA অনুসরণ",
  Tickets: "টিকিট",
  "Manage all citizen complaints and service requests.": "সব নাগরিক অভিযোগ ও সেবা অনুরোধ পরিচালনা করুন।",
  "All Statuses": "সব অবস্থা",
  "All Priorities": "সব অগ্রাধিকার",
  Ticket: "টিকিট",
  Citizen: "নাগরিক",
  Status: "অবস্থা",
  Priority: "অগ্রাধিকার",
  Agent: "এজেন্ট",
  Updated: "আপডেট হয়েছে",
  Unassigned: "অ্যাসাইন করা হয়নি",
  "Under Review": "পর্যালোচনায়",
  "Pending Citizen": "নাগরিকের অপেক্ষায়",
  Closed: "বন্ধ",
  Critical: "জরুরি",
  High: "উচ্চ",
  Medium: "মাঝারি",
  Low: "নিম্ন",
  "Users & Staff": "ব্যবহারকারী ও স্টাফ",
  "Super admins can promote users, assign staff roles, and monitor workload.":
    "সুপার অ্যাডমিন ব্যবহারকারীকে উন্নীত করতে, স্টাফ ভূমিকা দিতে এবং কাজের চাপ দেখতে পারেন।",
  "Super Admin Access": "সুপার অ্যাডমিন অ্যাক্সেস",
  "Active Staff": "সক্রিয় স্টাফ",
  "Total Resolved": "মোট সমাধান",
  "Search users...": "ব্যবহারকারী খুঁজুন...",
  Open: "খোলা",
  Active: "সক্রিয়",
  Workload: "কাজের চাপ",
  "All Users": "সব ব্যবহারকারী",
  "Change a citizen into an agent, supervisor, or admin.": "নাগরিককে এজেন্ট, সুপারভাইজার বা অ্যাডমিন বানান।",
  "Super Admin": "সুপার অ্যাডমিন",
  Saving: "সেভ হচ্ছে",
  "Saving...": "সেভ হচ্ছে...",
  Inactive: "নিষ্ক্রিয়",
  Analytics: "অ্যানালিটিক্স",
  "Last year": "গত বছর",
  "Tickets by Category": "বিভাগ অনুযায়ী টিকিট",
  "Resolution Time": "সমাধানের সময়",
  "Monthly Ticket Volume": "মাসিক টিকিট সংখ্যা",
  "SLA Compliance Trend": "SLA অনুসরণের প্রবণতা",
  "Met SLA": "SLA পূরণ",
  Breached: "লঙ্ঘিত",
  "Department Performance": "বিভাগের পারফরম্যান্স",
  Department: "বিভাগ",
  "Avg. Hours": "গড় ঘণ্টা",
  "SLA %": "SLA %",
  "Audit Log": "অডিট লগ",
  "All Actions": "সব কার্যক্রম",
  "Ticket Created": "টিকিট তৈরি",
  "Status Changed": "অবস্থা পরিবর্তন",
  "Assigned Agent": "এজেন্ট অ্যাসাইন",
  "Priority Changed": "অগ্রাধিকার পরিবর্তন",
  Settings: "সেটিংস",
  "Department Categories": "বিভাগীয় ক্যাটাগরি",
  "Default Priority": "ডিফল্ট অগ্রাধিকার",
  "SLA Hours": "SLA ঘণ্টা",
  "SLA Configuration": "SLA কনফিগারেশন",
  "Default SLA Timers": "ডিফল্ট SLA সময়",
  "Critical Priority (hours)": "জরুরি অগ্রাধিকার (ঘণ্টা)",
  "High Priority (hours)": "উচ্চ অগ্রাধিকার (ঘণ্টা)",
  "Medium Priority (hours)": "মাঝারি অগ্রাধিকার (ঘণ্টা)",
  "Low Priority (hours)": "নিম্ন অগ্রাধিকার (ঘণ্টা)",
  "Escalation Rules": "এস্কেলেশন নিয়ম",
  "Auto-escalate after breach (minutes)": "লঙ্ঘনের পর অটো-এস্কেলেট (মিনিট)",
  "Send warning before breach (minutes)": "লঙ্ঘনের আগে সতর্কতা পাঠান (মিনিট)",
  "Escalation target": "এস্কেলেশন লক্ষ্য",
  Supervisor: "সুপারভাইজার",
  Admin: "অ্যাডমিন",
  "Email Templates": "ইমেইল টেমপ্লেট",
  "Organization Info": "প্রতিষ্ঠানের তথ্য",
  "Organization Name": "প্রতিষ্ঠানের নাম",
  "Support Email": "সহায়তা ইমেইল",
  "Phone Number": "ফোন নম্বর",
  Appearance: "চেহারা",
  "Accent Color": "অ্যাকসেন্ট রং",
  Logo: "লোগো",
  "Account Created!": "অ্যাকাউন্ট তৈরি হয়েছে!",
  "Please check your email to verify your account, then you can log in and start submitting complaints.":
    "আপনার অ্যাকাউন্ট প্রস্তুত। এখন লগইন করে অভিযোগ জমা দিতে পারবেন।",
  "Go to Login": "লগইনে যান",
  "Join CivicDesk": "CivicDesk-এ যোগ দিন",
  "Create an account to submit and track your civic complaints":
    "আপনার নাগরিক অভিযোগ জমা ও ট্র্যাক করতে অ্যাকাউন্ট তৈরি করুন",
  "Full Name": "পূর্ণ নাম",
  "Email Address": "ইমেইল ঠিকানা",
  "Password": "পাসওয়ার্ড",
  "Must be at least 8 characters with 1 uppercase letter and 1 number.":
    "কমপক্ষে ৮ অক্ষর, ১টি বড় হাতের অক্ষর ও ১টি সংখ্যা থাকতে হবে।",
  "Create Account": "অ্যাকাউন্ট তৈরি করুন",
  "Creating account...": "অ্যাকাউন্ট তৈরি হচ্ছে...",
  "Already have an account?": "ইতিমধ্যে অ্যাকাউন্ট আছে?",
  "Sign in": "সাইন ইন",
  "Back to homepage": "হোমপেজে ফিরে যান",
  "Your full name": "আপনার পূর্ণ নাম",
  "Min 8 chars, 1 uppercase, 1 number": "কমপক্ষে ৮ অক্ষর, ১টি বড় হাতের অক্ষর, ১টি সংখ্যা",
  "Welcome back to CivicDesk": "CivicDesk-এ আবার স্বাগতম",
  "Welcome back to": "আবার স্বাগতম",
  "Sign in to manage your complaints": "আপনার অভিযোগ পরিচালনা করতে সাইন ইন করুন",
  "Forgot password?": "পাসওয়ার্ড ভুলে গেছেন?",
  "Sign In": "সাইন ইন",
  "Don't have an account? Create one": "অ্যাকাউন্ট নেই? অ্যাকাউন্ট তৈরি করুন",
  "Don't have an account?": "অ্যাকাউন্ট নেই?",
  "Create one": "অ্যাকাউন্ট তৈরি করুন",
  "Enter your password": "আপনার পাসওয়ার্ড লিখুন",
  "Enter your ticket ID to check live status, messages, timeline, and files.":
    "লাইভ অবস্থা, বার্তা, টাইমলাইন ও ফাইল দেখতে আপনার টিকিট আইডি লিখুন।",
  "Enter your ticket ID": "আপনার টিকিট আইডি লিখুন",
  "No complaint found with ticket ID": "এই টিকিট আইডি দিয়ে কোনো অভিযোগ পাওয়া যায়নি",
  "Please check the ID and try again.": "আইডিটি যাচাই করে আবার চেষ্টা করুন।",
  Assigned: "অ্যাসাইন করা হয়েছে",
  "Pending assignment": "অ্যাসাইনমেন্ট অপেক্ষায়",
  "View Map": "ম্যাপ দেখুন",
};

function translateExactText(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return value;

  const translated = domTranslations[trimmed];
  if (!translated) return value;

  return value.replace(trimmed, translated);
}

function translateDom(language: Language) {
  if (typeof document === "undefined") return;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE", "TEXTAREA"].includes(parent.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const textNodes: Text[] = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text);
  }

  textNodes.forEach((node) => {
    if (!textNodeOriginals.has(node)) {
      textNodeOriginals.set(node, node.nodeValue || "");
    }

    const original = textNodeOriginals.get(node) || "";
    const translated = translateExactText(original);
    const nextValue =
      language === "bn"
        ? translated !== original
          ? translated
          : node.nodeValue || ""
        : original;
    if (node.nodeValue !== nextValue) {
      node.nodeValue = nextValue;
    }
  });

  document.querySelectorAll("[placeholder], [aria-label], [title]").forEach((element) => {
    const originals = attributeOriginals.get(element) || {};

    ["placeholder", "aria-label", "title"].forEach((attribute) => {
      const current = element.getAttribute(attribute);
      if (current == null) return;

      if (!originals[attribute]) {
        originals[attribute] = current;
      }

      const translated = translateExactText(originals[attribute]);
      const nextValue =
        language === "bn"
          ? translated !== originals[attribute]
            ? translated
            : current
          : originals[attribute];
      if (element.getAttribute(attribute) !== nextValue) {
        element.setAttribute(attribute, nextValue);
      }
    });

    attributeOriginals.set(element, originals);
  });
}

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

  React.useEffect(() => {
    translateDom(language);
    let scheduled = false;

    const observer = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      window.setTimeout(() => {
        scheduled = false;
        translateDom(language);
      }, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "aria-label", "title"],
    });

    return () => observer.disconnect();
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
