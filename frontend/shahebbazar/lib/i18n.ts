/**
 * Interface copy in English and Bangla.
 *
 * The active locale is supplied by the `lang` query parameter.
 *
 * Known limitation: reading a search parameter excludes the page from
 * static generation. Server-rendered markup remains complete, so indexing
 * is unaffected, but the static cache is not used. Migrating to
 * locale-prefixed routes (`/en`, `/bn`) would restore it and give each
 * language a distinct indexable URL.
 */

export const LOCALES = ["en", "bn"] as const;
export type Locale = (typeof LOCALES)[number];

export function resolveLocale(raw: string | string[] | undefined): Locale {
    const value = Array.isArray(raw) ? raw[0] : raw;
    return value === "bn" ? "bn" : "en";
}

/** Appends the locale parameter to a path, preserving existing query values. */
export function localeHref(path: string, locale: Locale): string {
    if (locale === "en") return path;
    return path.includes("?") ? `${path}&lang=bn` : `${path}?lang=bn`;
}

/**
 * Selects the localised value, falling back to the other language when a
 * translation is absent, so a field is never rendered empty.
 */
export function pick(
    locale: Locale,
    english: string | null | undefined,
    bangla: string | null | undefined
): string {
    if (locale === "bn" && bangla) return bangla;
    return english ?? bangla ?? "";
}

const strings = {
    en: {
        brand: "Shahebbazar",
        searchPlaceholder: "Search for businesses, services or categories in Rajshahi",
        logIn: "Log in",
        register: "Register",

        navHome: "Home",
        navBusinesses: "Businesses",
        navCategories: "Categories",
        navDeals: "Deals & Offers",
        navEvents: "Events",
        navBlog: "Blog",
        navAddBusiness: "Add Business",

        exploreTitle: "Explore Rajshahi",
        exploreBody: "Discover trusted local businesses and services around you.",
        learnMore: "Learn More",

        heroTitleA: "Find businesses and services in",
        heroTitleB: "Rajshahi",
        heroSubtitle:
            "Your local directory to discover, connect and support businesses in your community.",
        heroWhat: "What are you looking for?",
        heroWhere: "Rajshahi",
        search: "Search",

        browseCategories: "Browse Categories",
        viewAllCategories: "View all categories",
        featuredBusinesses: "Featured Businesses",
        viewAllBusinesses: "View all businesses",
        sponsored: "Sponsored",
        noBusinesses: "No businesses to show yet.",
        businessesCount: "businesses",

        whyTitle: "Why Shahebbazar?",
        whyDiscoverTitle: "Discover local",
        whyDiscoverBody: "Find trusted businesses near you.",
        whyReviewsTitle: "Trusted reviews",
        whyReviewsBody: "Real reviews from real people.",
        whySupportTitle: "Support local",
        whySupportBody: "Help grow Rajshahi's local economy.",

        popularSearches: "Popular Searches",
        upcomingEvents: "Upcoming Events",
        viewAll: "View all",
        viewAllEvents: "View All Events",
        noEvents: "No events scheduled.",

        open: "Open",
        closed: "Closed",
        closesAt: "Closes at",
        verified: "Verified",
        reviews: "reviews",
        save: "Save",

        footerAbout: "About",
        footerAboutUs: "About Us",
        footerHowItWorks: "How It Works",
        footerContact: "Contact Us",
        footerForBusinesses: "For Businesses",
        footerAddBusiness: "Add Business",
        footerDashboard: "Business Dashboard",
        footerPlans: "Plans & Pricing",
        footerSupport: "Support",
        footerHelp: "Help & Legal",
        footerTerms: "Terms of Use",
        footerPrivacy: "Privacy Policy",
        footerRefunds: "Refund Policy",
        footerCookies: "Cookie Policy",
        footerFaq: "FAQ",
        footerStayConnected: "Stay Connected",
        footerNewsletter:
            "Subscribe to get updates on new businesses, offers and local events.",
        footerEmailPlaceholder: "Your email address",
        subscribe: "Subscribe",
        footerTagline:
            "Shahebbazar is Rajshahi's local business directory helping you discover trusted businesses and services.",
        footerRights: "All rights reserved.",
        madeWith: "Made with",
        forRajshahi: "for Rajshahi",

        // --- search results ---
        searchResultsFor: "Search results for",
        inLocation: "in",
        allBusinesses: "All businesses in",
        showing: "Showing",
        of: "of",
        results: "results",
        noResults: "No businesses matched that search.",
        noResultsHint: "Try a different word, or clear the filters.",
        category: "Category",
        area: "Area",
        sortBy: "Sort by",
        sortRelevance: "Most Relevant",
        sortRating: "Highest Rated",
        sortReviews: "Most Reviewed",
        sortName: "Name (A–Z)",
        clearAll: "Clear all",
        viewBusiness: "View Business",
        searchAreaIn: "Search Area in",
        popularAreas: "Popular Areas",
        viewAllAreas: "View all areas",
        refineSearch: "Refine Your Search",
        popularCategories: "Popular Categories",
        cantFind: "Can't find what you're looking for?",
        cantFindBody: "Add your business to Shahebbazar and get discovered by more customers.",
        addYourBusiness: "Add Your Business",
        home: "Home",
        searchResults: "Search Results",
        previous: "Previous",
        next: "Next",

        // --- business profile ---
        backToResults: "Back to search results",
        seeAllPhotos: "See all photos",
        call: "Call",
        message: "Message",
        getDirections: "Get Directions",
        share: "Share",
        overview: "Overview",
        tabReviews: "Reviews",
        services: "Services",
        photos: "Photos",
        about: "About",
        aboutHeading: "About",
        servicesHeading: "Services & Departments",
        noServices: "No services listed yet.",
        ratingsReviews: "Ratings & Reviews",
        totalReviews: "total reviews",
        writeReview: "Write a Review",
        whatPeopleSay: "What people are saying",
        noReviews: "No written reviews yet.",
        openingHours: "Opening Hours",
        today: "Today",
        hours24: "24 Hours",
        hoursNotSet: "Hours not set",
        location: "Location",
        quickFacts: "Quick Facts",
        similarBusinesses: "Similar Businesses",
        website: "Website",
        from: "From",
        priceOnRequest: "Price on request",
        minOrder: "Min order",
        businessCountOne: "business",
        allCategories: "All Categories",
        allCategoriesBody: "Browse every business and service category in Rajshahi.",
        subcategories: "Subcategories",
        noBusinessesInCategory: "No businesses in this category yet.",
        requestQuote: "Request a Quote",
    },

    bn: {
        brand: "সাহেববাজার",
        searchPlaceholder: "রাজশাহীর ব্যবসা, সেবা বা বিভাগ খুঁজুন",
        logIn: "লগ ইন",
        register: "নিবন্ধন",

        navHome: "হোম",
        navBusinesses: "ব্যবসা",
        navCategories: "বিভাগ",
        navDeals: "অফার ও ছাড়",
        navEvents: "ইভেন্ট",
        navBlog: "ব্লগ",
        navAddBusiness: "ব্যবসা যোগ করুন",

        exploreTitle: "রাজশাহী ঘুরে দেখুন",
        exploreBody: "আপনার আশেপাশের নির্ভরযোগ্য ব্যবসা ও সেবা খুঁজে নিন।",
        learnMore: "আরও জানুন",

        heroTitleA: "খুঁজে নিন ব্যবসা ও সেবা",
        heroTitleB: "রাজশাহীতে",
        heroSubtitle:
            "আপনার এলাকার ব্যবসা খুঁজতে, যোগাযোগ করতে ও পাশে দাঁড়াতে স্থানীয় ডিরেক্টরি।",
        heroWhat: "আপনি কী খুঁজছেন?",
        heroWhere: "রাজশাহী",
        search: "খুঁজুন",

        browseCategories: "বিভাগ দেখুন",
        viewAllCategories: "সব বিভাগ দেখুন",
        featuredBusinesses: "নির্বাচিত ব্যবসা",
        viewAllBusinesses: "সব ব্যবসা দেখুন",
        sponsored: "প্রচারিত",
        noBusinesses: "এখনও কোনো ব্যবসা নেই।",
        businessesCount: "টি ব্যবসা",

        whyTitle: "কেন সাহেববাজার?",
        whyDiscoverTitle: "স্থানীয় খুঁজুন",
        whyDiscoverBody: "আপনার কাছের নির্ভরযোগ্য ব্যবসা খুঁজুন।",
        whyReviewsTitle: "বিশ্বস্ত রিভিউ",
        whyReviewsBody: "প্রকৃত গ্রাহকের প্রকৃত মতামত।",
        whySupportTitle: "স্থানীয়দের পাশে",
        whySupportBody: "রাজশাহীর অর্থনীতি বাড়াতে সাহায্য করুন।",

        popularSearches: "জনপ্রিয় অনুসন্ধান",
        upcomingEvents: "আসন্ন ইভেন্ট",
        viewAll: "সব দেখুন",
        viewAllEvents: "সব ইভেন্ট দেখুন",
        noEvents: "কোনো ইভেন্ট নেই।",

        open: "খোলা",
        closed: "বন্ধ",
        closesAt: "বন্ধ হবে",
        verified: "যাচাইকৃত",
        reviews: "রিভিউ",
        save: "সংরক্ষণ",

        footerAbout: "সম্পর্কে",
        footerAboutUs: "আমাদের সম্পর্কে",
        footerHowItWorks: "যেভাবে কাজ করে",
        footerContact: "যোগাযোগ",
        footerForBusinesses: "ব্যবসার জন্য",
        footerAddBusiness: "ব্যবসা যোগ করুন",
        footerDashboard: "ব্যবসা ড্যাশবোর্ড",
        footerPlans: "প্ল্যান ও মূল্য",
        footerSupport: "সহায়তা",
        footerHelp: "সহায়তা ও আইনি",
        footerTerms: "ব্যবহারের শর্ত",
        footerPrivacy: "গোপনীয়তা নীতি",
        footerRefunds: "ফেরত নীতি",
        footerCookies: "কুকি নীতি",
        footerFaq: "সাধারণ প্রশ্ন",
        footerStayConnected: "যুক্ত থাকুন",
        footerNewsletter: "নতুন ব্যবসা, অফার ও ইভেন্টের খবর পেতে সাবস্ক্রাইব করুন।",
        footerEmailPlaceholder: "আপনার ইমেইল",
        subscribe: "সাবস্ক্রাইব",
        footerTagline:
            "সাহেববাজার রাজশাহীর স্থানীয় ব্যবসা ডিরেক্টরি — নির্ভরযোগ্য ব্যবসা ও সেবা খুঁজে পেতে সাহায্য করে।",
        footerRights: "সর্বস্বত্ব সংরক্ষিত।",
        madeWith: "ভালোবাসা দিয়ে তৈরি",
        forRajshahi: "রাজশাহীর জন্য",

        // --- search results ---
        searchResultsFor: "অনুসন্ধানের ফলাফল",
        inLocation: "—",
        allBusinesses: "সব ব্যবসা",
        showing: "দেখানো হচ্ছে",
        of: "এর মধ্যে",
        results: "টি ফলাফল",
        noResults: "এই অনুসন্ধানে কোনো ব্যবসা পাওয়া যায়নি।",
        noResultsHint: "অন্য শব্দ দিয়ে চেষ্টা করুন, বা ফিল্টার মুছে দিন।",
        category: "বিভাগ",
        area: "এলাকা",
        sortBy: "সাজান",
        sortRelevance: "সবচেয়ে প্রাসঙ্গিক",
        sortRating: "সর্বোচ্চ রেটিং",
        sortReviews: "সর্বাধিক রিভিউ",
        sortName: "নাম (ক–হ)",
        clearAll: "সব মুছুন",
        viewBusiness: "ব্যবসা দেখুন",
        searchAreaIn: "অনুসন্ধান এলাকা",
        popularAreas: "জনপ্রিয় এলাকা",
        viewAllAreas: "সব এলাকা দেখুন",
        refineSearch: "অনুসন্ধান পরিমার্জন",
        popularCategories: "জনপ্রিয় বিভাগ",
        cantFind: "যা খুঁজছেন পাচ্ছেন না?",
        cantFindBody: "আপনার ব্যবসা সাহেববাজারে যোগ করুন এবং আরও গ্রাহকের কাছে পৌঁছান।",
        addYourBusiness: "আপনার ব্যবসা যোগ করুন",
        home: "হোম",
        searchResults: "অনুসন্ধানের ফলাফল",
        previous: "পূর্ববর্তী",
        next: "পরবর্তী",

        // --- business profile ---
        backToResults: "ফলাফলে ফিরে যান",
        seeAllPhotos: "সব ছবি দেখুন",
        call: "কল করুন",
        message: "বার্তা",
        getDirections: "দিকনির্দেশ",
        share: "শেয়ার",
        overview: "সংক্ষিপ্ত",
        tabReviews: "রিভিউ",
        services: "সেবাসমূহ",
        photos: "ছবি",
        about: "পরিচিতি",
        aboutHeading: "পরিচিতি",
        servicesHeading: "সেবা ও বিভাগ",
        noServices: "এখনও কোনো সেবা যোগ করা হয়নি।",
        ratingsReviews: "রেটিং ও রিভিউ",
        totalReviews: "টি রিভিউ",
        writeReview: "রিভিউ লিখুন",
        whatPeopleSay: "গ্রাহকরা যা বলছেন",
        noReviews: "এখনও কোনো লিখিত রিভিউ নেই।",
        openingHours: "খোলার সময়",
        today: "আজ",
        hours24: "২৪ ঘণ্টা",
        hoursNotSet: "সময় নির্ধারিত নেই",
        location: "অবস্থান",
        quickFacts: "সংক্ষিপ্ত তথ্য",
        similarBusinesses: "অনুরূপ ব্যবসা",
        website: "ওয়েবসাইট",
        from: "শুরু",
        priceOnRequest: "মূল্য জানতে যোগাযোগ করুন",
        minOrder: "সর্বনিম্ন অর্ডার",
        businessCountOne: "টি ব্যাবসা",
        allCategories: "সকল বিভাগ",
        allCategoriesBody: "রাজশাহীর সব ব্যবসা ও সেবার বিভাগ দেখুন।",
        subcategories: "উপবিভাগ",
        noBusinessesInCategory: "এই বিভাগে এখনও কোনো ব্যবসা নেই।",
        requestQuote: "কোটেশন চান",
    },
} as const;

export type Dictionary = (typeof strings)["en"];

export function t(locale: Locale): Dictionary {
    return strings[locale] as Dictionary;
}
