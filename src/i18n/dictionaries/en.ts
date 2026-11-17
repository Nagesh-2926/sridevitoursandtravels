import type { ServiceId } from "@/config/services";

type ServiceCopy = { title: string; summary: string };

export const en = {
  meta: {
    title: "Sridevi Tours & Travels — Chagallu",
    description:
      "Flight, train, bus and temple darshanam ticket assistance, plus passport, PAN and online application services in Chagallu.",
  },
  a11y: {
    skipToContent: "Skip to main content",
    opensInNewTab: "(opens in a new tab)",
  },
  nav: {
    primaryLabel: "Primary",
    home: "Home",
    services: "Services",
    about: "About",
    location: "Location",
    contact: "Contact",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    languageLabel: "Language",
    enquire: "Enquire",
    callUs: "Call us",
    theme: { toLight: "Switch to light theme", toDark: "Switch to dark theme" },
  },
  intro: {
    regionLabel: "Welcome to Sridevi Tours & Travels",
    skip: "Skip intro",
  },
  hero: {
    eyebrow: "Chagallu · Travel & digital services",
    slides: [
      {
        kicker: "Worldwide flights",
        title: "Journeys planned with quiet care.",
        body: "Tell us where you want to go. We check routes and fares, then call you back with options.",
      },
      {
        kicker: "Across India by rail and road",
        title: "Every station, every highway.",
        body: "Train and bus tickets across India, arranged by people you can visit on Main Road.",
      },
      {
        kicker: "Temple darshanam",
        title: "Darshan, arranged with devotion.",
        body: "We help you apply for darshanam tickets and plan the journey around them.",
      },
    ],
    enquire: "Start an enquiry",
    exploreServices: "Explore services",
    slideStatus: "Slide {current} of {total}",
    goToSlide: "Show slide {n}",
    pause: "Pause slideshow",
    play: "Play slideshow",
    carouselLabel: "Featured services",
    shortcutsLabel: "Travel services",
  },
  home: {
    showcaseEyebrow: "Our services",
    showcaseTitle: "Travel & Digital Services",
    journeysEyebrow: "Travel & services",
    journeysTitle: "Where are you going — and what can we help you finish?",
    journeysBody:
      "Choose a service to start an enquiry. We reply with options and a quotation; nothing is booked until you approve it.",
    viewAll: "View all services",
    processEyebrow: "How enquiries work",
    processTitle: "Simple, personal, and never assumed.",
    steps: [
      {
        title: "Share your requirement",
        body: "Call, WhatsApp, or send the enquiry form with your dates and details.",
      },
      {
        title: "We check and quote",
        body: "The proprietor checks real availability and contacts you with a quotation.",
      },
      {
        title: "You decide",
        body: "Nothing is booked until you approve the quotation and payment is verified.",
      },
    ],
    contactEyebrow: "Visit or call",
    contactTitle: "Main Road, near the Bus Stand, Chagallu.",
    contactBody: "Open every day from 9:00 AM to 9:00 PM.",
  },
  services: {
    eyebrow: "Services",
    title: "Everything we can help you with.",
    intro:
      "Prices and availability change every day, so we never publish fixed rates. Send an enquiry and we will reply with a quotation.",
    travelTitle: "Travel & ticketing",
    digitalTitle: "Digital & government services",
    assistanceNote:
      "Application assistance only. We are not a government office; approvals and timelines are decided by the issuing authority.",
    assistanceBadge: "Assistance",
    jumpLabel: "Jump to",
    digitalCategory: {
      title: "Digital & government services",
      summary:
        "Passport, PAN, GCC medical / PCC, EAMCET, counselling, bill payments, resumes and more — application assistance at our office.",
      cta: "See all 10 services",
      shortTitle: "Digital Services",
      shortSummary:
        "Passport, PAN, GCC, bill payments, jobs, resumes, EAMCET, counselling and more.",
    },
    enquire: "Enquire",
    enquireOnWhatsApp: "Enquire on WhatsApp",
    detailsLabel: "View service details",
    documentsLabel: "Required Documents",
    preparationLabel: "What to prepare",
    items: {
      flights: {
        title: "Flight tickets",
        summary: "Domestic and international flight booking assistance, worldwide.",
      },
      trains: {
        title: "Train tickets",
        summary: "Reservations on routes across India, including Tatkal requests.",
      },
      buses: {
        title: "Bus tickets",
        summary: "Private and state-run bus tickets across India.",
      },
      darshanam: {
        title: "Darshanam tickets",
        summary: "Help applying for temple darshanam tickets and planning the visit.",
      },
      passport: {
        title: "Passport applications",
        summary: "Form filling, appointment booking and document checklist support.",
      },
      pan: {
        title: "PAN card applications",
        summary: "New PAN, corrections and reprint application support.",
      },
      gccMedicalPcc: {
        title: "GCC medical / PCC",
        summary:
          "Appointment and application help for GCC medicals and police clearance.",
      },
      xeroxPrinting: {
        title: "Xerox & printing",
        summary: "Photocopies, printouts and document scanning at the office.",
      },
      billPayments: {
        title: "Current bill payments",
        summary: "Electricity bill payment help at the counter.",
      },
      jobApplications: {
        title: "Job applications",
        summary: "Online job application filling and upload support.",
      },
      resume: {
        title: "Resume creation",
        summary: "Clean, printable resumes prepared with you.",
      },
      eamcet: {
        title: "EAMCET applications",
        summary: "Application filling and document upload help for EAMCET.",
      },
      counselling: {
        title: "College counselling",
        summary: "Help with counselling registration and web options.",
      },
      onlineServices: {
        title: "All online services",
        summary: "Any other online form or service — ask us and we will guide you.",
      },
    } satisfies Record<ServiceId, ServiceCopy>,
  },
  about: {
    eyebrow: "About",
    title: "A local office you can walk into.",
    body: [
      "Sridevi Tours & Travels is run by V. Srinivasarao from Main Road, near the Bus Stand in Chagallu.",
      "We help families, students and workers with travel tickets and the online applications that everyday life now needs — explained clearly, in Telugu or English.",
    ],
    proprietorLabel: "Proprietor",
  },
  location: {
    eyebrow: "Location",
    title: "Find the office.",
    addressLabel: "Address",
    hoursLabel: "Office hours",
    hoursValue: "Every day, 9:00 AM – 9:00 PM",
    openInMaps: "Open in Google Maps",
    showMap: "Show map",
    mapConsent: "Loading the map connects to Google.",
    mapTitle: "Map showing Sridevi Tours & Travels, Chagallu",
  },
  contact: {
    eyebrow: "Contact",
    title: "Tell us what you need.",
    intro:
      "Choose WhatsApp or email to send your enquiry to the proprietor. Nothing is sent until you complete the hand-off in that app; an enquiry is not a booking.",
    callLabel: "Primary Call",
    whatsapp: "WhatsApp us",
    whatsappLabel: "WhatsApp Enquiries",
    whatsappNote: "The quickest way to send an enquiry.",
    emailLabel: "Official email",
    emailNote: "For written business enquiries.",
    gmailCompose: "Open Gmail compose",
    emailFallback: "Use your email app",
    visitLabel: "Visit the office",
    addressLabel: "Business Address",
    hoursLabel: "Office hours",
    form: {
      title: "Enquiry form",
      name: "Your name",
      email: "Email address (optional)",
      phone: "Mobile number",
      phoneHint: "10-digit Indian mobile number",
      service: "Service",
      servicePlaceholder: "Choose a service",
      message: "Your requirement",
      messageHint:
        "Dates, places, number of travellers, or the application you need help with.",
      submit: "Send on WhatsApp",
      note: "Your draft stays in this browser for 24 hours after your last edit. WhatsApp opens with your details ready; nothing is sent until you complete the hand-off.",
      errors: {
        name: "Please enter your name.",
        email: "Enter a valid email address.",
        phone: "Enter a valid 10-digit mobile number.",
        service: "Please choose a service.",
        message: "Please describe your requirement.",
      },
      summary: "Please fix the highlighted fields.",
      ready: {
        title: "Your enquiry is ready to send.",
        body: "Choose WhatsApp or an email option below. Nothing has been sent yet; this is an enquiry, not a booking.",
        fallback: "WhatsApp did not open? Open it here",
        emailFallback: "Use your email app",
        gmailCompose: "Open Gmail compose",
      },
    },
  },
  enquiry: {
    modalTitle: "{service} enquiry",
    modalIntro:
      "Share your details. We check real availability and reply on WhatsApp with a quotation.",
    close: "Close",
    optional: "optional",
    fields: {
      name: "Your name",
      email: "Email address",
      phone: "Mobile number",
      from: "Departure city",
      to: "Destination city",
      departDate: "Travel date",
      tripType: "Trip type",
      oneWay: "One way",
      roundTrip: "Round trip",
      returnDate: "Return date",
      passengers: "Passengers",
      fromStation: "From station",
      toStation: "To station",
      journeyDate: "Journey date",
      travelClass: "Class preference",
      busCategory: "Bus category",
      boarding: "Boarding point",
      destination: "Destination",
      temple: "Temple or destination",
      assistance: "Assistance needed",
      preferredDate: "Preferred date",
      devotees: "Number of devotees",
      digitalService: "Service needed",
      requirement: "Your requirement",
      notes: "Notes",
    },
    classes: {
      any: "Any / not sure",
      sleeper: "Sleeper (SL)",
      ac3: "AC 3 tier (3A)",
      ac2: "AC 2 tier (2A)",
      ac1: "AC first class (1A)",
      chairCar: "AC chair car (CC)",
      secondSitting: "Second sitting (2S)",
    },
    busCategories: {
      any: "Any / not sure",
      acSleeper: "AC sleeper",
      nonAcSleeper: "Non-AC sleeper",
      acSeater: "AC seater",
      nonAcSeater: "Non-AC seater",
    },
    temples: {
      tirumala: "Sri Venkateswara Swamy Temple — Tirumala, Tirupati",
      sabarimala: "Sabarimala Ayyappa Temple — Pathanamthitta, Kerala",
      vadapalli: "Sri Venkateswara Swamy Temple — Vadapalli, Konaseema",
      kashi: "Kashi Vishwanath Temple — Varanasi, Uttar Pradesh",
      simhachalam: "Sri Varaha Lakshmi Narasimha Swamy Temple — Visakhapatnam",
      vijayawada: "Sri Durga Malleswara Swamy Temple — Vijayawada",
      srisailam: "Sri Bhramaramba Mallikarjuna Swamy Temple — Srisailam",
      annavaram: "Sri Veera Venkata Satyanarayana Swamy Temple — Annavaram",
      dwarakaTirumala: "Sri Venkateswara Swamy Temple — Dwaraka Tirumala",
      puri: "Sri Jagannath Temple — Puri, Odisha",
    },
    errors: {
      required: "This field is required.",
      email: "Enter a valid email address.",
      phone: "Enter a valid 10-digit mobile number.",
      date: "Choose today or a later date.",
      returnDate: "Return date must be on or after the travel date.",
      count: "Enter a number from 1 to 20.",
      text: "Please enter valid information.",
    },
    summary: "Please fix the highlighted fields.",
    submit: "Send enquiry on WhatsApp",
    note: "Drafts stay in this browser for 24 hours after your last edit. WhatsApp opens with your details ready; nothing is sent until you complete the hand-off. An enquiry is not a booking.",
    draft: {
      loading: "Restoring your draft…",
      empty: "Drafts are saved on this device for 24 hours after your last edit.",
      saving: "Saving draft…",
      saved: "Draft saved",
      lastSaved: "Last saved {time}",
      storageError:
        "This browser could not save your draft. Your entries remain available in this tab.",
      clearForm: "Clear Form",
      clearTitle: "Clear this form?",
      clearBody:
        "This deletes only the saved information for this form from this browser. Other service drafts will remain unchanged.",
      cancelClear: "Keep draft",
      confirmClear: "Clear this form",
      cleared: "Form cleared successfully.",
      submissionCleared:
        "Draft cleared after WhatsApp opened. Complete sending in WhatsApp; the enquiry has not been sent by this website.",
    },
    message: {
      heading: "New enquiry: {service}",
      disclaimer:
        "Enquiry only - not a booking. Please reply with availability and a quotation.",
    },
  },
  footer: {
    tagline: "Travel · Ticketing · Digital Services",
    disclaimer:
      "We provide booking and application assistance. Ticket availability, prices and government approvals are confirmed only by the respective providers and authorities.",
    rights: "All rights reserved.",
    explore: "Explore",
    reach: "Reach us",
  },
  status: {
    loading: "Loading",
  },
};

export type Dictionary = typeof en;
