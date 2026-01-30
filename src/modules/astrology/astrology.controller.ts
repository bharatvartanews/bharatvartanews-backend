import { Request, Response } from "express";

/* ───────── Zodiac Logic ───────── */
function getRashi(day: number, month: number): string {
  const rashis = [
    { name: "capricorn", end: 19 },
    { name: "aquarius", end: 18 },
    { name: "pisces", end: 20 },
    { name: "aries", end: 19 },
    { name: "taurus", end: 20 },
    { name: "gemini", end: 20 },
    { name: "cancer", end: 22 },
    { name: "leo", end: 22 },
    { name: "virgo", end: 22 },
    { name: "libra", end: 22 },
    { name: "scorpio", end: 21 },
    { name: "sagittarius", end: 21 },
  ];

  return day <= rashis[month - 1].end
    ? rashis[month - 1].name
    : rashis[month % 12].name;
}

/* ───────── Free API ───────── */
async function fetchHoroscope(sign: string) {
  const res = await fetch(
    `https://ohmanda.com/api/horoscope/${sign}`
  );

  if (!res.ok) {
    throw new Error("Ohmanda API failed");
  }

  const data = await res.json();

  return {
    general: data.horoscope,
    date: data.date,
  };
}


/* ───────── POST /api/astrology/by-dob ───────── */
export const getHoroscopeByDob = async (req: Request, res: Response) => {
  try {
    const { dob } = req.body;
    if (!dob) {
      return res.status(400).json({ message: "DOB required" });
    }

    const date = new Date(dob);
    const rashi = getRashi(date.getDate(), date.getMonth() + 1);

    const h = await fetchHoroscope(rashi);

    res.json({
      rashi,
      general: h.general,
      career: h.general,   // TEMP reuse
      finance: h.general,  // TEMP reuse
      romance: h.general,  // TEMP reuse
      source: "ohmanda",
      date: h.date
    });
  } catch (err) {
    console.error("DOB horoscope error", err);
    res.status(500).json({ message: "Horoscope fetch failed" });
  }
};


/* ───────── GET /api/astrology/all ───────── */
export const getAllRashiGeneral = async (_: Request, res: Response) => {
  try {
    const rashis = [
      "aries","taurus","gemini","cancer","leo","virgo",
      "libra","scorpio","sagittarius","capricorn","aquarius","pisces"
    ];

    const result = [];

    for (const r of rashis) {
      const h = await fetchHoroscope(r);
      result.push({
        rashi: r,
        general: h.general,
        date: h.date,
        source: "ohmanda"
      });
    }

    res.json(result);
  } catch (err) {
    console.error("All rashi error", err);
    res.status(500).json({ message: "Horoscope fetch failed" });
  }
};



/* ───────── GET /api/astrology/:rashi ───────── */
export const getByRashi = async (req: Request, res: Response) => {
  try {
    const h = await fetchHoroscope(req.params.rashi);

    res.json({
      rashi: req.params.rashi,
      general: h.general,
      career: h.general,
      finance: h.general,
      romance: h.general,
      date: h.date,
      source: "ohmanda"
    });
  } catch {
    res.status(500).json({ message: "Horoscope fetch failed" });
  }
};

