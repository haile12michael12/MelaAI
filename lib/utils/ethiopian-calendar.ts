/**
 * Ethiopian Ge'ez Calendar Engine & Holiday Resolver
 *
 * The Ethiopian calendar has 12 months of 30 days each, plus a 13th month
 * (Pagumē / ጳጉሜን) with 5 days (6 days in a leap year).
 * The year is 7 or 8 years behind the Gregorian calendar.
 * The Ethiopian New Year (Enkutatash) begins on September 11 (Sept 12 in Gregorian leap years).
 */

export interface EthiopianDate {
  year: number;
  month: number; // 1 to 13
  day: number;
  monthNameEn: string;
  monthNameAm: string;
  formattedEn: string;
  formattedAm: string;
}

export interface EthiopianHoliday {
  nameEn: string;
  nameAm: string;
  descriptionEn: string;
  descriptionAm: string;
  ethiopianMonth: number;
  ethiopianDay: number;
  approximateGregorian: string; // MM-DD
  isNationalHoliday: boolean;
}

export const ETHIOPIAN_MONTHS = [
  { id: 1, en: "Meskerem", am: "መስከረም" },
  { id: 2, en: "Tikimt", am: "ጥቅምት" },
  { id: 3, en: "Hidar", am: "ኅዳር" },
  { id: 4, en: "Tahsas", am: "ታኅሣሥ" },
  { id: 5, en: "Tir", am: "ጥር" },
  { id: 6, en: "Yakatit", am: "የካቲት" },
  { id: 7, en: "Magabit", am: "መጋቢት" },
  { id: 8, en: "Miyazya", am: "ሚያዝያ" },
  { id: 9, en: "Ginbot", am: "ግንቦት" },
  { id: 10, en: "Sene", am: "ሰኔ" },
  { id: 11, en: "Hamle", am: "ሐምሌ" },
  { id: 12, en: "Nehase", am: "ነሐሴ" },
  { id: 13, en: "Pagume", am: "ጳጉሜን" },
] as const;

export const ETHIOPIAN_HOLIDAYS: EthiopianHoliday[] = [
  {
    nameEn: "Enkutatash (Ethiopian New Year)",
    nameAm: "እንቁጣጣሽ (የኢትዮጵያ አዲስ ዓመት)",
    descriptionEn: "First day of the Ethiopian calendar year, celebrating renewal and spring.",
    descriptionAm: "የአዲሱ ዓመት የመጀመሪያ ቀን፤ የፀደይ እና የአዲስ ተስፋ በዓል።",
    ethiopianMonth: 1,
    ethiopianDay: 1,
    approximateGregorian: "09-11",
    isNationalHoliday: true,
  },
  {
    nameEn: "Meskel (Finding of the True Cross)",
    nameAm: "መስቀል (ደመራ)",
    descriptionEn: "Centuries-old festival commemorating the discovery of the True Cross with Demera bonfires.",
    descriptionAm: "የደመራ ማብራትና የቅዱስ መስቀል መገኘት በዓል (የዩኔስኮ ቅርስ)።",
    ethiopianMonth: 1,
    ethiopianDay: 17,
    approximateGregorian: "09-27",
    isNationalHoliday: true,
  },
  {
    nameEn: "Genna (Ethiopian Christmas)",
    nameAm: "ገና (የገና በዓል)",
    descriptionEn: "Celebration of the nativity of Jesus Christ according to the Eastern calendar.",
    descriptionAm: "የጌታችን የመድኃኒታችን የኢየሱስ ክርስቶስ ልደት በዓል።",
    ethiopianMonth: 4,
    ethiopianDay: 29,
    approximateGregorian: "01-07",
    isNationalHoliday: true,
  },
  {
    nameEn: "Timkat (Ethiopian Epiphany)",
    nameAm: "ጥምቀት",
    descriptionEn: "Spectacular festival commemorating the baptism of Jesus in the Jordan River.",
    descriptionAm: "የታቦታት ጉዞና የጥምቀት ማክበር በዓል (የዩኔስኮ የማይዳሰስ ቅርስ)።",
    ethiopianMonth: 5,
    ethiopianDay: 11,
    approximateGregorian: "01-19",
    isNationalHoliday: true,
  },
  {
    nameEn: "Victory of Adwa",
    nameAm: "የዓድዋ ድል በዓል",
    descriptionEn: "National holiday celebrating the historic victory of Ethiopia over colonial forces in 1896.",
    descriptionAm: "በ1888 ዓ.ም ኢትዮጵያውያን ቅኝ ገዢዎችን ድል ያደረጉበት ታላቅ የድል ቀን።",
    ethiopianMonth: 6,
    ethiopianDay: 23,
    approximateGregorian: "03-02",
    isNationalHoliday: true,
  },
  {
    nameEn: "Ethiopian Good Friday (Siklet)",
    nameAm: "ስቅለት",
    descriptionEn: "Solemn Christian holiday observing the crucifixion of Jesus.",
    descriptionAm: "የስቅለት ዓርብ መታሰቢያ።",
    ethiopianMonth: 8,
    ethiopianDay: 22,
    approximateGregorian: "04-30",
    isNationalHoliday: true,
  },
  {
    nameEn: "Fasika (Ethiopian Easter)",
    nameAm: "ትንሣኤ (ፋሲካ)",
    descriptionEn: "Celebration of the resurrection of Jesus Christ following the 55-day Great Lent.",
    descriptionAm: "የትንሣኤ በዓል፤ ከታላቁ የዐቢይ ጾም በኋላ የሚከበር ደማቅ በዓል።",
    ethiopianMonth: 8,
    ethiopianDay: 24,
    approximateGregorian: "05-02",
    isNationalHoliday: true,
  },
  {
    nameEn: "Patriots' Victory Day",
    nameAm: "የአርበኞች ቀን",
    descriptionEn: "Honors the Ethiopian patriots who resisted foreign occupation.",
    descriptionAm: "ለሀገር ነፃነት የተዋደቁ ጀግኖች አርበኞች መታሰቢያ ቀን።",
    ethiopianMonth: 8,
    ethiopianDay: 27,
    approximateGregorian: "05-05",
    isNationalHoliday: true,
  },
  {
    nameEn: "Eid al-Fitr",
    nameAm: "ዒድ አል-ፊጥር",
    descriptionEn: "Islamic celebration marking the end of the holy month of Ramadan.",
    descriptionAm: "የረመዳን ጾም መጠናቀቂያ በዓል።",
    ethiopianMonth: 7,
    ethiopianDay: 1,
    approximateGregorian: "04-10",
    isNationalHoliday: true,
  },
  {
    nameEn: "Eid al-Adha (Arafa)",
    nameAm: "ዒድ አል-አድሃ (ዐረፋ)",
    descriptionEn: "Feast of the Sacrifice celebrated by Ethiopian Muslims nationwide.",
    descriptionAm: "የመስዋዕት በዓል፤ በአገር አቀፍ ደረጃ በድምቀት የሚከበር።",
    ethiopianMonth: 10,
    ethiopianDay: 10,
    approximateGregorian: "06-16",
    isNationalHoliday: true,
  },
];

/**
 * Converts a Gregorian Date to an Ethiopian Date.
 * Accurate algorithm handling leap year alignment.
 */
export function toEthiopianDate(dateInput: Date | string = new Date()): EthiopianDate {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const gYear = d.getFullYear();
  const gMonth = d.getMonth() + 1; // 1-12
  const gDay = d.getDate();

  // Julian day number calculation
  const a = Math.floor((14 - gMonth) / 12);
  const y = gYear + 4800 - a;
  const m = gMonth + 12 * a - 3;
  const jdn =
    gDay +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  // Conversion to Ethiopian calendar
  const r = (jdn - 1723856) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const ethYear =
    4 * Math.floor((jdn - 1723856) / 1461) +
    Math.floor(r / 365) -
    Math.floor(r / 1460);
  const ethMonth = Math.floor(n / 30) + 1;
  const ethDay = (n % 30) + 1;

  const monthMeta = ETHIOPIAN_MONTHS[Math.min(12, Math.max(0, ethMonth - 1))];

  return {
    year: ethYear,
    month: ethMonth,
    day: ethDay,
    monthNameEn: monthMeta.en,
    monthNameAm: monthMeta.am,
    formattedEn: `${monthMeta.en} ${ethDay}, ${ethYear}`,
    formattedAm: `${monthMeta.am} ${ethDay} ቀን ${ethYear} ዓ.ም`,
  };
}

/**
 * Formats an Ethiopian Date string.
 */
export function formatEthiopianDate(
  dateInput: Date | string | EthiopianDate = new Date(),
  locale: "en" | "am" = "en"
): string {
  const eth =
    typeof dateInput === "object" && dateInput !== null && "formattedAm" in dateInput
      ? (dateInput as EthiopianDate)
      : toEthiopianDate(dateInput as Date | string);
  return locale === "am" ? eth.formattedAm : eth.formattedEn;
}

/**
 * Finds if a given date matches an Ethiopian Holiday.
 */
export function getEthiopianHolidayForDate(dateInput: Date | string = new Date()): EthiopianHoliday | null {
  const eth = toEthiopianDate(dateInput);
  return (
    ETHIOPIAN_HOLIDAYS.find(
      (h) => h.ethiopianMonth === eth.month && h.ethiopianDay === eth.day
    ) || null
  );
}

/**
 * Returns upcoming Ethiopian holidays within the next specified number of days.
 */
export function getUpcomingEthiopianHolidays(daysAhead: number = 60, fromDate: Date = new Date()): { date: Date; holiday: EthiopianHoliday; ethiopianDate: EthiopianDate }[] {
  const results: { date: Date; holiday: EthiopianHoliday; ethiopianDate: EthiopianDate }[] = [];
  const current = new Date(fromDate);

  for (let i = 0; i <= daysAhead; i++) {
    const testDate = new Date(current);
    testDate.setDate(current.getDate() + i);
    const hol = getEthiopianHolidayForDate(testDate);
    if (hol) {
      results.push({
        date: testDate,
        holiday: hol,
        ethiopianDate: toEthiopianDate(testDate),
      });
    }
  }

  return results;
}
