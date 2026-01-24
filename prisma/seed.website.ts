// prisma/seed.website.ts
import {
  PrismaClient,
  ArticleStatus,
  VideoStatus
} from '@prisma/client';
import slugify from 'slugify';

export default async function seedWebsite(prisma: PrismaClient) {
  const admin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' }
  });

  if (!admin) {
    throw new Error('❌ Super admin missing. Run seedCore first.');
  }

  // ─────────────────────────────
  // 1️⃣ CATEGORIES
  // ─────────────────────────────
  const categoriesData = [
    { name: 'Top News', icon: '🔥' },
    { name: 'National', icon: '🇮🇳' },
    { name: 'State', icon: '📍' },
    { name: 'Politics', icon: '🏛️' },
    { name: 'Business', icon: '💼' },
    { name: 'Sports', icon: '🏏' },
    { name: 'Videos', icon: '🎥' }
  ];

  const categories = [];

  for (const c of categoriesData) {
    const slug = slugify(c.name, { lower: true });
    const category = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: {
        name: c.name,
        slug
      }
    });
    categories.push(category);
  }

  console.log('✅ Categories seeded (with icons mapping)');

  // ─────────────────────────────
  // 2️⃣ ARTICLES
  // ─────────────────────────────
  const articleTemplates = [
    'देश में बड़ा राजनीतिक घटनाक्रम',
    'भारत ने सीरीज में शानदार जीत दर्ज की',
    'शेयर बाजार में आज जबरदस्त उछाल',
    'राज्य में मौसम को लेकर अलर्ट जारी',
    'राष्ट्रीय स्तर पर नई योजना लागू',
    'महंगाई पर सरकार का बड़ा फैसला',
    'खेल जगत से बड़ी खबर सामने आई',
    'व्यापार जगत में निवेश बढ़ा',
    'चुनाव से पहले सियासी हलचल तेज',
    'स्टार्टअप सेक्टर में नई उम्मीद'
  ];

  let articleCount = 0;

  for (const category of categories) {
    for (let i = 0; i < 3; i++) {
      // const title =
      //   articleTemplates[(articleCount + i) % articleTemplates.length] +
      //   ` (${category.name})`;

      const title =
  articleTemplates[(articleCount + i) % articleTemplates.length];


      const slug = slugify(`${title}-${i}`, { lower: true });

      await prisma.article.upsert({
        where: { slug },
        update: {},
        create: {
          title,
          slug,
          body:
            `यह ${category.name} श्रेणी की समाचार है। ` +
            `इस खबर में विस्तार से जानकारी दी गई है ताकि उपयोगकर्ताओं को सही और ताज़ा अपडेट मिल सके।`,
          status: ArticleStatus.PUBLISHED,
          categoryId: category.id,
          authorId: admin.id,
          image: '/news.jpg'
        }
      });

      articleCount++;
    }
  }

  console.log(`✅ ${articleCount} articles seeded`);

  // ─────────────────────────────
  // 3️⃣ VIDEOS
  // ─────────────────────────────
  const videoUrls = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://www.youtube.com/watch?v=9bZkp7q19f0',
    'https://www.youtube.com/watch?v=3tmd-ClpJxA',
    'https://www.youtube.com/watch?v=l482T0yNkeo',
    'https://www.youtube.com/watch?v=RgKAFK5djSk'
  ];

  let videoCount = 0;

  for (let i = 0; i < 10; i++) {
    const url = videoUrls[i % videoUrls.length];
    const exists = await prisma.video.findFirst({ where: { url } });

    if (!exists) {
      await prisma.video.create({
        data: {
          title: `वीडियो खबर ${i + 1}`,
          url,
          status: VideoStatus.PUBLISHED
        }
      });
      videoCount++;
    }
  }

  console.log(`✅ ${videoCount} videos seeded`);

  // ─────────────────────────────
  // 4️⃣ SETTINGS
  // ─────────────────────────────
  await prisma.setting.upsert({
    where: { id: 1 },
    update: {
      data: {
        siteName: 'भारत वार्ता',
        language: 'hi',
        categoryIcons: categoriesData,
        imagePlaceholder: '/news.jpg'
      }
    },
    create: {
      id: 1,
      data: {
        siteName: 'भारत वार्ता',
        language: 'hi',
        categoryIcons: categoriesData,
        imagePlaceholder: '/news.jpg'
      }
    }
  });

  console.log('✅ Settings updated');
}
