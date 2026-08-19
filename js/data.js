/**
 * Mock data layer — Virtual Smart Hospital
 * In production, all of this is fetched from an authenticated,
 * server-side API over HTTPS. Nothing here is real PHI.
 */

const MOCK_PATIENT = {
  id: "PT-778312",
  nameAr: "شادن عوده العنزي",
  nameEn: "Shaden Awdah Al-Anazi",
  lastVisit: "18/6/2026",
  age: 34,
  bloodType: "O+",
  unreadNotifications: 3,
};

const MOCK_ALERTS = [
  {
    icon: "⏰",
    ar: "موعد جرعة دواء ضغط الدم خلال ساعتين",
    en: "Blood pressure medication due in 2 hours",
    level: "warning",
  },
  {
    icon: "📋",
    ar: "نتيجة تحليل المختبر جاهزة للمراجعة",
    en: "Lab analysis result ready for review",
    level: "info",
  },
];

const MOCK_VITALS = [
  {
    key: "heartRate",
    ar: "معدل ضربات القلب",
    en: "Heart Rate",
    value: 72,
    unit: "bpm",
    color: "#00BCD4",
    icon: "💓",
  },
  {
    key: "bloodPressure",
    ar: "ضغط الدم",
    en: "Blood Pressure",
    value: "120/80",
    unit: "mmHg",
    color: "#0288D1",
    icon: "🩺",
  },
  {
    key: "bloodSugar",
    ar: "سكر الدم",
    en: "Blood Sugar",
    value: 110,
    unit: "mg/dL",
    color: "#4FC3F7",
    icon: "🩸",
  },
];

// Time-series mock data for the health trend chart (last 7 readings)
const MOCK_CHART_LABELS = ["6/13", "6/14", "6/15", "6/16", "6/17", "6/18", "6/19"];
const MOCK_CHART_SERIES = {
  bloodPressure: [122, 125, 119, 121, 118, 120, 120],
  bloodSugar: [115, 118, 112, 110, 108, 111, 110],
  pulse: [75, 78, 74, 73, 71, 70, 72],
};

const MOCK_APPOINTMENTS = [
  {
    doctorAr: "د. لمى الحربي",
    doctorEn: "Dr. Lama Al-Harbi",
    specialtyAr: "طب باطني",
    specialtyEn: "Internal Medicine",
    date: "22/6/2026",
    time: "10:30 ص",
    type: "video",
  },
  {
    doctorAr: "د. فهد القحطاني",
    doctorEn: "Dr. Fahad Al-Qahtani",
    specialtyAr: "طب نفسي",
    specialtyEn: "Psychiatry",
    date: "25/6/2026",
    time: "05:00 م",
    type: "audio",
    anonymous: true,
  },
];

const MOCK_PRESCRIPTIONS = [
  {
    nameAr: "أملوديبين 5mg",
    nameEn: "Amlodipine 5mg",
    statusAr: "قيد التوصيل",
    statusEn: "Out for delivery",
    refillDate: "24/6/2026",
    autoRefill: true,
  },
  {
    nameAr: "ميتفورمين 500mg",
    nameEn: "Metformin 500mg",
    statusAr: "تم التسليم",
    statusEn: "Delivered",
    refillDate: "02/7/2026",
    autoRefill: true,
  },
  {
    nameAr: "أسبرين 81mg",
    nameEn: "Aspirin 81mg",
    statusAr: "بانتظار المراجعة الطبية",
    statusEn: "Awaiting physician review",
    refillDate: "—",
    autoRefill: false,
  },
];

const MOCK_LABS = [
  { nameAr: "صورة دم كاملة (CBC)", nameEn: "Complete Blood Count (CBC)", date: "17/6/2026", statusAr: "طبيعي", statusEn: "Normal" },
  { nameAr: "وظائف الكلى", nameEn: "Renal Function Panel", date: "17/6/2026", statusAr: "طبيعي", statusEn: "Normal" },
  { nameAr: "السكر التراكمي (HbA1c)", nameEn: "HbA1c", date: "10/5/2026", statusAr: "يحتاج متابعة", statusEn: "Needs follow-up" },
];

// Structured biomarker values for the most recent CBC (17/6/2026) — feeds
// the "AI Blood Test Analysis" card in the Labs tab. Real deployment would
// parse these off the uploaded PDF/image instead of hardcoding them.
const MOCK_BLOOD_PANEL = [
  { nameAr: "الهيموغلوبين (Hemoglobin)", nameEn: "Hemoglobin", value: 11.2, unit: "g/dL", range: "12.0–15.5", flag: "low" },
  { nameAr: "الهيماتوكريت (Hematocrit)", nameEn: "Hematocrit", value: 34.5, unit: "%", range: "36–46", flag: "low" },
  { nameAr: "كريات الدم البيضاء (WBC)", nameEn: "White Blood Cells (WBC)", value: 7.8, unit: "×10³/µL", range: "4.5–11.0", flag: "normal" },
  { nameAr: "الصفائح الدموية (Platelets)", nameEn: "Platelets", value: 245, unit: "×10³/µL", range: "150–450", flag: "normal" },
  { nameAr: "كريات الدم الحمراء (RBC)", nameEn: "Red Blood Cells (RBC)", value: 4.1, unit: "×10⁶/µL", range: "4.2–5.4", flag: "low" },
  { nameAr: "السكر التراكمي (HbA1c)", nameEn: "HbA1c", value: 6.1, unit: "%", range: "<5.7", flag: "high" },
  { nameAr: "الكرياتينين (Creatinine)", nameEn: "Creatinine", value: 0.9, unit: "mg/dL", range: "0.6–1.3", flag: "normal" },
];

const MOCK_ALLERGIES = [
  { ar: "البنسلين", en: "Penicillin", severityAr: "شديدة", severityEn: "Severe" },
  { ar: "المكسرات", en: "Tree nuts", severityAr: "متوسطة", severityEn: "Moderate" },
];

const MOCK_EDUCATION = [
  {
    titleAr: "التحكم في ضغط الدم غذائيًا",
    titleEn: "Managing Blood Pressure Through Diet",
    typeAr: "مقال",
    typeEn: "Article",
    minutes: 6,
    bodyAr: [
      {
        week: "1. اتباع نظام DASH الغذائي",
        items: [
          "الخضار والفواكه: 4-5 حصص يومياً للحصول على الألياف ومضادات الأكسدة.",
          "الحبوب الكاملة: استبدال الدقيق الأبيض بالشوفان، والقمح الكامل، والأرز البني.",
          "البروتينات الخفيفة: التركيز على الأسماك، والدواجن، والبقوليات وتقليل اللحوم الحمراء.",
        ],
      },
      {
        week: "2. موازنة الصوديوم والبوتاسيوم",
        items: [
          "تقليل الصوديوم (الملح): خفض الاستهلاك لأقل من ملعقة صغيرة يومياً (2000 ملغم)، وتجنب المعلبات والوجبات السريعة.",
          "زيادة البوتاسيوم: لطرد الصوديوم الزائد وإرخاء الشرايين (الموز، البطاطس المشوية، السبانخ، الأفوكادو، والتمر).",
        ],
      },
      {
        week: "3. أطعمة ومكونات داعمة لضغط الدم",
        items: [
          "الأطعمة الغنية بالنترات: لزيادة توسع الأوعية الدموية (الشمندر/البنجر، الورقيات الخضراء).",
          "أوميغا 3 والمغنيسيوم: لتخفيف التهاب الشرايين وتنظيم انقباضها (السلمون، بذور الكتان، المكسرات النيئة، والزبادي قليل الدسم).",
          "الثوم الطازج: يحتوي على الأليسين الذي يساهم في استرخاء الأوعية.",
        ],
      },
      {
        week: "4. عادات يجب تجنبها",
        items: [
          "تقليل الكافيين: الابتعاد عن الإفراط في القهوة ومشروبات الطاقة لمنع الارتفاع المفاجئ.",
          "قطع الدهون المتحولة: تجنب المقالي والزيوت المهدرجة لحماية الشرايين من التصلب.",
          "مراقبة الملصقات الغذائية: قراءة نسبة الصوديوم في أي منتج قبل الشراء.",
        ],
      },
    ],
  },
  {
    titleAr: "تمارين تنفس لتقليل التوتر",
    titleEn: "Breathing Exercises to Reduce Stress",
    typeAr: "فيديو",
    typeEn: "Video",
    minutes: 4,
    video: "assets/breathing-exercises.mp4",
  },
  {
    titleAr: "برنامج صحة الأسرة الشهري",
    titleEn: "Monthly Family Health Program",
    typeAr: "برنامج",
    typeEn: "Program",
    minutes: 20,
    bodyAr: [
      {
        week: "الأسبوع الأول: التغذية والديتوكس",
        items: [
          "تنظيف الثلاجة من الأطعمة المصنعة والزيوت المهدرجة.",
          "اعتماد \"يوم بدون سكر مضاف\" لجميع أفراد العائلة.",
          "تحضير قائمة وجبات مسبقة للأسبوع تركز على الخضروات والألياف.",
        ],
      },
      {
        week: "الأسبوع الثاني: النشاط البدني والحركة",
        items: [
          "تنظيم \"مشي عائلي\" مرتين في الأسبوع (30-45 دقيقة).",
          "تحدي عدد الخطوات اليومي (مثلاً: 8,000 خطوة لكل فرد).",
          "جلسة إطالات وتخفيف إجهاد جماعية نهاية الأسبوع.",
        ],
      },
      {
        week: "الأسبوع الثالث: الصحة النفسية والنوم",
        items: [
          "تحديد \"ساعة بدون شاشات\" قبل النوم لجميع أفراد البيت.",
          "إدخال تمارين التنفس العميق والرخاء قبل النوم.",
          "جلسة حوار عائلي مفتوح لتخفيف ضغوط العمل أو الدراسة.",
        ],
      },
      {
        week: "الأسبوع الرابع: الفحوصات والوقاية",
        items: [
          "مراجعة وحساب كميات شرب الماء اليومية لكل فرد.",
          "فحص صيدلية المنزل والتخلص من الأدوية المنتهية الصلاحية.",
          "جدولة الفحوصات الدورية أو تحاليل الدم النصف سنوية/السنوية.",
        ],
      },
    ],
  },
];

const MOCK_ISOLATION = {
  daysRemaining: 4,
  totalDays: 10,
  startDate: "15/6/2026",
  endDate: "25/6/2026",
};
