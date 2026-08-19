/**
 * Bilingual dictionary (Arabic primary / RTL, English secondary / LTR).
 * Elements tagged data-i18n="key" get their textContent swapped by app.js.
 * Elements tagged data-i18n-ph="key" get their placeholder swapped.
 */

const I18N = {
  verse: {
    ar: "﴿ وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ ﴾",
    en: "“And when I am ill, it is He who cures me.”",
  },
  appName: { ar: "المستشفى الذكي الافتراضي", en: "Virtual Smart Hospital" },

  // Nav
  nav_home: { ar: "الرئيسية", en: "Home" },
  nav_consultations: { ar: "الاستشارات الطبية", en: "Consultations" },
  nav_ehr: { ar: "ملفي الطبي", en: "My Medical Record" },
  nav_labs: { ar: "التحاليل والفحوصات", en: "Labs & Diagnostics" },
  nav_pharmacy: { ar: "الصيدلية", en: "E-Pharmacy" },
  nav_isolation: { ar: "الأمراض المعدية", en: "Infectious Diseases" },
  nav_education: { ar: "التثقيف الصحي", en: "Health Education" },
  nav_emergency: { ar: "الطوارئ", en: "Emergency" },

  // Header
  greeting: { ar: "مرحباً", en: "Welcome" },
  langToggle: { ar: "English", en: "العربية" },
  lastVisitLabel: { ar: "آخر زيارة", en: "Last visit" },

  // Home — alerts
  urgentAlertsTitle: { ar: "تنبيهات عاجلة", en: "Urgent Alerts" },

  // Home — vitals
  vitalsTitle: { ar: "المؤشرات الحيوية", en: "Vital Signs" },

  // Home — chart
  chartTitle: { ar: "المخطط الصحي التفاعلي", en: "Interactive Health Trends" },
  chartSubtitle: { ar: "آخر 7 قراءات", en: "Last 7 readings" },

  // Home — quick actions
  quickActionsTitle: { ar: "إجراءات سريعة", en: "Quick Actions" },
  bookAppointment: { ar: "حجز موعد", en: "Book Appointment" },
  instantConsult: { ar: "استشارة فورية", en: "Instant Consultation" },
  orderMedicine: { ar: "طلب دواء", en: "Order Medicine" },
  uploadLab: { ar: "رفع تحليل", en: "Upload Lab Result" },
  sosCall: { ar: "اتصال طوارئ", en: "Emergency SOS" },

  // Home — recommendations
  recommendationsTitle: { ar: "توصيات مخصصة لك", en: "Personalized Recommendations" },
  exerciseTitle: { ar: "برنامج التمارين", en: "Exercise Plan" },
  exerciseBody: { ar: "المشي 30 دقيقة يوميًا، 5 أيام أسبوعيًا، لتحسين ضغط الدم.", en: "Walk 30 minutes daily, 5 days a week, to help manage blood pressure." },
  dietTitle: { ar: "النظام الغذائي المقترح", en: "Suggested Diet Plan" },
  dietBody: { ar: "تقليل الصوديوم والسكريات المضافة، وزيادة الألياف والخضروات الورقية.", en: "Reduce sodium and added sugar; increase fiber and leafy greens." },

  // Consultations
  consultTitle: { ar: "الاستشارات الطبية", en: "Medical Consultations" },
  consultSubtitle: { ar: "احجز موعدًا أو ابدأ استشارة فورية على مدار الساعة", en: "Book an appointment or start an instant consultation, 24/7" },
  bookNewAppointment: { ar: "حجز موعد جديد", en: "Book New Appointment" },
  upcomingAppointments: { ar: "المواعيد القادمة", en: "Upcoming Appointments" },
  videoCall: { ar: "مكالمة فيديو", en: "Video Call" },
  audioCall: { ar: "مكالمة صوتية", en: "Audio Call" },
  join: { ar: "انضمام", en: "Join" },
  instantConsultTitle: { ar: "استشارة فورية على مدار الساعة", en: "24/7 Instant Consultation" },
  instantConsultBody: { ar: "تواصل مع طبيب مناوب خلال دقائق عبر الفيديو أو الصوت.", en: "Connect with an on-call physician within minutes via video or audio." },
  startVideo: { ar: "بدء فيديو", en: "Start Video" },
  startAudio: { ar: "بدء صوت", en: "Start Audio" },
  telepsychTitle: { ar: "الطب النفسي عن بُعد", en: "Tele-Psychiatry" },
  telepsychBody: { ar: "جلسات خاصة ومشفرة بالكامل، مع خيار الهوية المجهولة.", en: "Fully encrypted, private sessions with an anonymous identity option." },
  anonymousMode: { ar: "وضع الهوية المجهولة مفعّل", en: "Anonymous mode enabled" },
  aiMentalHealthTitle: { ar: "مساعد الصحة النفسية الذكي", en: "AI Mental Health Support" },
  aiChatPlaceholder: { ar: "اكتب ما تشعر به الآن...", en: "Type how you're feeling right now..." },
  send: { ar: "إرسال", en: "Send" },
  aiWelcomeMsg: { ar: "مرحبًا، أنا هنا للاستماع إليك. هذه المحادثة خاصة ومجهولة تمامًا.", en: "Hello, I'm here to listen. This conversation is private and fully anonymous." },
  form_specialty: { ar: "التخصص", en: "Specialty" },
  form_date: { ar: "التاريخ", en: "Date" },
  form_time: { ar: "الوقت", en: "Time" },
  form_notes: { ar: "ملاحظات (اختياري)", en: "Notes (optional)" },
  form_submit: { ar: "تأكيد الحجز", en: "Confirm Booking" },

  // EHR
  ehrTitle: { ar: "ملفي الطبي الموحد", en: "Unified Electronic Health Record" },
  ehrSubtitle: { ar: "سجلك الصحي الكامل في مكان واحد وآمن", en: "Your complete health record, unified and secure" },
  personalInfo: { ar: "المعلومات الشخصية", en: "Personal Information" },
  medicalHistory: { ar: "التاريخ المرضي", en: "Medical History" },
  allergies: { ar: "الحساسية", en: "Allergies" },
  activePrescriptions: { ar: "الوصفات الفعّالة", en: "Active Prescriptions" },
  labHistory: { ar: "سجل التحاليل", en: "Lab History" },
  radiologyReports: { ar: "تقارير الأشعة", en: "Radiology Reports" },
  fullName: { ar: "الاسم الكامل", en: "Full Name" },
  patientId: { ar: "رقم الملف", en: "Patient ID" },
  age: { ar: "العمر", en: "Age" },
  bloodType: { ar: "فصيلة الدم", en: "Blood Type" },
  medicalHistoryBody: { ar: "ارتفاع ضغط الدم (منذ 2021)، سكري النوع الثاني (منذ 2023). لا توجد عمليات جراحية سابقة.", en: "Hypertension (since 2021), Type 2 Diabetes (since 2023). No prior surgeries." },
  noRadiology: { ar: "لا توجد تقارير أشعة حديثة", en: "No recent radiology reports" },
  severity: { ar: "الشدة", en: "Severity" },
  viewReport: { ar: "عرض التقرير", en: "View Report" },

  // Labs
  labsTitle: { ar: "التحاليل والفحوصات", en: "Labs & Diagnostics" },
  labsSubtitle: { ar: "ارفع نتائجك وتابع مؤشراتك عبر الزمن", en: "Upload your results and track your indicators over time" },
  uploadTitle: { ar: "رفع نتيجة تحليل", en: "Upload Lab Result" },
  uploadDrag: { ar: "اسحب الملف هنا أو اضغط للاختيار", en: "Drag a file here or click to browse" },
  uploadFormats: { ar: "PDF, JPG, PNG — حتى 10 ميجابايت", en: "PDF, JPG, PNG — up to 10MB" },
  uploadBtn: { ar: "رفع", en: "Upload" },
  comparisonTitle: { ar: "مقارنة تاريخية", en: "Historical Comparison" },
  trendTitle: { ar: "تتبع المؤشرات عبر الزمن", en: "Time-Series Vital Tracking" },
  labName: { ar: "التحليل", en: "Test" },
  labDate: { ar: "التاريخ", en: "Date" },
  labStatus: { ar: "الحالة", en: "Status" },

  // AI Blood Test Analysis
  bloodPanelTitle: { ar: "تحليل فحص الدم بالذكاء الاصطناعي", en: "AI Blood Test Analysis" },
  bloodPanelSubtitle: { ar: "صورة الدم الكاملة (CBC) — 17/6/2026", en: "Complete Blood Count (CBC) — 6/17/2026" },
  bpMarker: { ar: "المؤشر", en: "Marker" },
  bpValue: { ar: "القيمة", en: "Value" },
  bpRange: { ar: "المعدل الطبيعي", en: "Reference Range" },
  bpFlagNormal: { ar: "طبيعي", en: "Normal" },
  bpFlagHigh: { ar: "مرتفع", en: "High" },
  bpFlagLow: { ar: "منخفض", en: "Low" },
  analyzeWithAI: { ar: "تحليل النتائج بالذكاء الاصطناعي", en: "Analyze with AI" },
  analyzing: { ar: "جارٍ التحليل...", en: "Analyzing..." },
  aiAnalysisTitle: { ar: "التحليل", en: "Analysis" },
  aiRecommendationsTitle: { ar: "التوصيات", en: "Recommendations" },
  aiAnalysisDisclaimer: {
    ar: "هذا التحليل مساعد إعلامي وليس تشخيصًا طبيًا. راجع طبيبك دائمًا لتفسير نتائج فحوصاتك واتخاذ القرار العلاجي.",
    en: "This analysis is informational only and not a medical diagnosis. Always consult your physician to interpret your results and decide on treatment.",
  },
  aiAnalysisError: {
    ar: "تعذر الحصول على التحليل حاليًا. تأكد من تشغيل الخادم الخلفي (راجع server/README.md) وحاول مرة أخرى.",
    en: "Couldn't get an analysis right now. Make sure the backend server is running (see server/README.md) and try again.",
  },
  aiAnalysisRateLimited: { ar: "الرجاء الانتظار قليلًا قبل طلب تحليل آخر.", en: "Please wait a moment before requesting another analysis." },
  bloodPanelSubtitleUploaded: { ar: "مستخرج من الملف المرفوع", en: "Extracted from your uploaded file" },
  uploadAnalyzing: { ar: "جارٍ قراءة الملف وتحليله بالذكاء الاصطناعي...", en: "Reading and analyzing the file with AI..." },
  uploadAnalyzed: { ar: "تم التحليل ✓", en: "Analyzed ✓" },
  uploadInvalidType: { ar: "نوع الملف غير مدعوم (PDF, JPG, PNG فقط)", en: "Unsupported file type (PDF, JPG, PNG only)" },
  uploadTooLarge: { ar: "حجم الملف أكبر من 10 ميجابايت", en: "File is larger than 10MB" },
  uploadNoPanelFound: {
    ar: "ما قدرنا نلقى نتائج تحاليل واضحة بهذا الملف. جربي صورة أوضح أو تأكدي إنه تقرير مختبر.",
    en: "We couldn't find clear lab results in this file. Try a clearer photo, or make sure it's a lab report.",
  },
  aiProviderRateLimited: {
    ar: "خدمة الذكاء الاصطناعي وصلت للحد الأقصى من الاستخدام المسموح مؤقتًا. جربي بعد شوي.",
    en: "The AI service has temporarily hit its usage limit. Please try again in a little while.",
  },

  // Pharmacy
  pharmacyTitle: { ar: "الصيدلية الإلكترونية", en: "E-Pharmacy" },
  pharmacySubtitle: { ar: "تتبع وصفاتك وطلباتك وإعادة التعبئة الذكية", en: "Track prescriptions, deliveries, and smart refills" },
  deliveryTracking: { ar: "تتبع التوصيل", en: "Delivery Tracking" },
  autoRefill: { ar: "إعادة تعبئة تلقائية", en: "Auto-refill" },
  refillDate: { ar: "موعد إعادة التعبئة القادم", en: "Next refill date" },
  requestRefill: { ar: "طلب إعادة تعبئة", en: "Request Refill" },
  track: { ar: "تتبع الطلب", en: "Track Order" },

  // Isolation
  isolationTitle: { ar: "غرفة العزل الافتراضية", en: "Virtual Isolation Room" },
  isolationSubtitle: { ar: "متابعة يومية وتواصل مباشر مع الفريق الطبي", en: "Daily monitoring and direct contact with your care team" },
  dailyCheckin: { ar: "تسجيل الأعراض اليومي", en: "Daily Symptom Check-in" },
  symptomFever: { ar: "حمى", en: "Fever" },
  symptomCough: { ar: "سعال", en: "Cough" },
  symptomFatigue: { ar: "إرهاق", en: "Fatigue" },
  symptomBreath: { ar: "ضيق تنفس", en: "Shortness of breath" },
  submitCheckin: { ar: "إرسال التقرير اليومي", en: "Submit Daily Report" },
  isolationChatTitle: { ar: "الدردشة مع فريق العزل الطبي", en: "Isolation Care Team Chat" },
  isolationChatPlaceholder: { ar: "اكتب رسالتك للفريق الطبي...", en: "Message your care team..." },
  quarantineCounter: { ar: "عداد إتمام الحجر الصحي", en: "Quarantine Completion Counter" },
  daysRemaining: { ar: "أيام متبقية", en: "days remaining" },
  isolationStart: { ar: "بداية العزل", en: "Isolation start" },
  isolationEnd: { ar: "نهاية العزل المتوقعة", en: "Expected end" },

  // Education
  educationTitle: { ar: "التثقيف الصحي", en: "Health Education" },
  educationSubtitle: { ar: "محتوى تفاعلي وتوصيات مخصصة بالذكاء الاصطناعي", en: "Interactive content and AI-personalized tips" },
  aiTipTitle: { ar: "نصيحة اليوم من الذكاء الاصطناعي", en: "Today's AI Tip" },
  aiTipBody: { ar: "بناءً على قراءاتك الأخيرة، يُنصح بتقليل الملح وزيادة شرب الماء اليوم.", en: "Based on your recent readings, consider reducing salt intake and drinking more water today." },
  familyProgramsTitle: { ar: "برامج صحة الأسرة", en: "Family Health Programs" },
  readMore: { ar: "قراءة المزيد", en: "Read More" },
  watchNow: { ar: "مشاهدة الآن", en: "Watch Now" },
  minutesRead: { ar: "دقائق", en: "min" },
  articleArabicOnly: { ar: "", en: "This article's full content is currently available in Arabic only." },

  // Emergency
  emergencyTitle: { ar: "الطوارئ الذكية", en: "Smart Emergency" },
  emergencySubtitle: { ar: "استجابة فورية عند الحاجة", en: "Immediate response when it matters" },
  sosButton: { ar: "زر الطوارئ SOS", en: "SOS Panic Button" },
  sosConfirm: { ar: "اضغط مطولًا لتأكيد الإرسال", en: "Press and hold to confirm dispatch" },
  sosSent: { ar: "تم إرسال نداء الطوارئ! جارِ تحديد موقعك وأقرب مستشفى...", en: "Emergency alert sent! Locating you and the nearest hospital..." },
  nearestHospital: { ar: "أقرب مستشفى متاح", en: "Nearest Available Hospital" },
  ambulanceStatus: { ar: "حالة سيارة الإسعاف", en: "Ambulance Status" },
  ambulanceDispatched: { ar: "تم إرسال الإسعاف — الوصول المتوقع", en: "Ambulance dispatched — ETA" },
  shareLocation: { ar: "مشاركة الموقع", en: "Share Location" },
  emergencyContacts: { ar: "جهات اتصال الطوارئ", en: "Emergency Contacts" },

  // Footer
  footerCompliance: { ar: "متوافق مع معايير الخصوصية HIPAA و NDMO/PDPL", en: "Compliant with HIPAA and Saudi NDMO/PDPL privacy standards" },
  footerRights: { ar: "جميع الحقوق محفوظة", en: "All rights reserved" },
  footerSecurity: { ar: "الأمان والخصوصية", en: "Security & Privacy" },
  footerContact: { ar: "تواصل معنا", en: "Contact Us" },
  footerAbout: { ar: "عن المستشفى", en: "About" },

  // Common
  notifications: { ar: "الإشعارات", en: "Notifications" },
  close: { ar: "إغلاق", en: "Close" },
  status_normal: { ar: "طبيعي", en: "Normal" },
};
