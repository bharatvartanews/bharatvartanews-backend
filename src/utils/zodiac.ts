// utils/zodiac.util.ts
export function getRashi(day: number, month: number) {
  const signs = [
    { name: "Capricorn", end: 19 },
    { name: "Aquarius", end: 18 },
    { name: "Pisces", end: 20 },
    { name: "Aries", end: 19 },
    { name: "Taurus", end: 20 },
    { name: "Gemini", end: 20 },
    { name: "Cancer", end: 22 },
    { name: "Leo", end: 22 },
    { name: "Virgo", end: 22 },
    { name: "Libra", end: 22 },
    { name: "Scorpio", end: 21 },
    { name: "Sagittarius", end: 21 },
  ];

  return day <= signs[month - 1].end
    ? signs[month - 1].name
    : signs[month % 12].name;
}
