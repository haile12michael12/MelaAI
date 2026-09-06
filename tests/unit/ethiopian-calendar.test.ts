import { describe, it, expect } from "vitest";
import {
  toEthiopianDate,
  formatEthiopianDate,
  getEthiopianHolidayForDate,
  getUpcomingEthiopianHolidays,
  ETHIOPIAN_MONTHS,
  ETHIOPIAN_HOLIDAYS,
} from "@/lib/utils/ethiopian-calendar";

describe("Ethiopian Calendar Engine & Holiday Resolver", () => {
  it("has exactly 13 Ethiopian months defined", () => {
    expect(ETHIOPIAN_MONTHS).toHaveLength(13);
    expect(ETHIOPIAN_MONTHS[0].en).toBe("Meskerem");
    expect(ETHIOPIAN_MONTHS[0].am).toBe("መስከረም");
    expect(ETHIOPIAN_MONTHS[12].en).toBe("Pagume");
    expect(ETHIOPIAN_MONTHS[12].am).toBe("ጳጉሜን");
  });

  it("converts Gregorian dates into valid Ethiopian dates", () => {
    const testDate = new Date(2026, 8, 11); // September 11, 2026
    const ethDate = toEthiopianDate(testDate);

    expect(ethDate.month).toBeGreaterThanOrEqual(1);
    expect(ethDate.month).toBeLessThanOrEqual(13);
    expect(ethDate.day).toBeGreaterThanOrEqual(1);
    expect(ethDate.day).toBeLessThanOrEqual(30);
    expect(ethDate.monthNameEn).toBeTruthy();
    expect(ethDate.monthNameAm).toBeTruthy();
  });

  it("formats Ethiopian dates in English and Amharic correctly", () => {
    const testDate = new Date(2026, 8, 11);
    const enFormat = formatEthiopianDate(testDate, "en");
    const amFormat = formatEthiopianDate(testDate, "am");

    expect(typeof enFormat).toBe("string");
    expect(typeof amFormat).toBe("string");
    expect(amFormat).toContain("ዓ.ም");
    expect(amFormat).toContain("ቀን");
  });

  it("identifies major Ethiopian holidays", () => {
    expect(ETHIOPIAN_HOLIDAYS.length).toBeGreaterThanOrEqual(8);
    const enkutatash = ETHIOPIAN_HOLIDAYS.find((h) => h.ethiopianMonth === 1 && h.ethiopianDay === 1);
    expect(enkutatash).toBeDefined();
    expect(enkutatash?.nameEn).toContain("Enkutatash");
    expect(enkutatash?.nameAm).toContain("እንቁጣጣሽ");
    expect(enkutatash?.isNationalHoliday).toBe(true);

    const meskel = ETHIOPIAN_HOLIDAYS.find((h) => h.ethiopianMonth === 1 && h.ethiopianDay === 17);
    expect(meskel).toBeDefined();
    expect(meskel?.nameEn).toContain("Meskel");
  });

  it("resolves upcoming holidays across a projection window", () => {
    const from = new Date(2026, 8, 1); // Sept 1, 2026
    const upcoming = getUpcomingEthiopianHolidays(45, from);

    expect(Array.isArray(upcoming)).toBe(true);
    expect(upcoming.length).toBeGreaterThan(0);
    expect(upcoming[0].holiday).toBeDefined();
    expect(upcoming[0].ethiopianDate).toBeDefined();
  });
});

