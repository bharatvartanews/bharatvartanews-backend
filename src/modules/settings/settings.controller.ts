import { Request, Response } from 'express';
import prisma from '../../database/prisma';

/**
 * DEFAULT SETTINGS
 * Used only when DB is empty
 */
const DEFAULT_SETTINGS = {
  site: {
    name: 'Bharat Varta',
    language: 'en',
  },
  features: {
    comments: false,
    ads: false,
  },
  seo: {
    metaTitle: '',
    metaDescription: '',
  },
  ads: {
    adsense: {
      enabled: false,
      publisherId: '',
      slotId: '',
    },
    adManager: {
      enabled: false,
      networkCode: '',
    },
  },
};

export async function getSettings(_: Request, res: Response) {
  const setting = await prisma.setting.findUnique({
    where: { id: 1 },
  });

  res.json(setting?.data ?? DEFAULT_SETTINGS);
}

export async function updateSettings(req: Request, res: Response) {
  const updated = await prisma.setting.upsert({
    where: { id: 1 },
    update: {
      data: req.body, // full JSON overwrite (intended)
    },
    create: {
      id: 1,
      data: req.body,
    },
  });

  res.json(updated.data);
}
