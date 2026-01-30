import { Router } from 'express';
import { requireAuth } from './middlewares/auth.middleware';

/* AUTH */
import * as Auth from './modules/auth/auth.controller';


/* HOME (PUBLIC) */
import * as Home from './modules/home/home.controller';

/* CORE CMS */
import * as Users from './modules/users/users.controller';
import * as Categories from './modules/categories/categories.controller';
import * as Articles from './modules/articles/articles.controller';
import * as Videos from './modules/videos/videos.controller';

/* DASHBOARD + ANALYTICS */
import * as Dashboard from './modules/dashboard/dashboard.controller';
import * as Analytics from './modules/analytics/analytics.controller';

/* SETTINGS */
import * as Settings from './modules/settings/settings.controller';

const router = Router();


import * as Comments from "./modules/comments/comments.controller";

router.get("/api/public/comments", Comments.listComments);
router.post("/api/public/comments", Comments.createComment);
router.put("/api/public/comments/:id", Comments.updateComment);
router.delete("/api/public/comments/:id", Comments.deleteComment);
router.post("/api/public/comments/report", Comments.reportComment);
//
// ───────────────────────────────── AUTH ─────────────────────────────────
//
router.post('/api/auth/login', Auth.login);
router.post("/api/auth/google", Auth.googleLogin);
router.get("/api/auth/me", Auth.me);



router.get('/api/home', Home.getHomeData);
//
// ───────────────────────────────── USERS ─────────────────────────────────
//
router.get('/api/users', requireAuth, Users.listUsers);
router.post('/api/users', requireAuth, Users.createUser);
router.put('/api/users/:id', requireAuth, Users.updateUser);
router.patch('/api/users/:id/status', requireAuth, Users.toggleUserStatus);

//
// ───────────────────────────────── CATEGORIES ────────────────────────────
//
router.get('/api/categories', Categories.listCategories); // public


//router.post('/api/categories', requireAuth, Categories.createCategory);
//router.put('/api/categories/:id', requireAuth, Categories.updateCategory);


router.delete('/api/categories/:id', requireAuth, Categories.deleteCategory);
router.get(
  "/api/categories/:slug",
  Categories.getCategoryBySlug
);

import { categoryUpload } from './utils/uploadCategory';

router.post(
  '/api/categories',
  categoryUpload.single('icon'),
  Categories.createCategory
);

router.put(
  '/api/categories/:id',
  categoryUpload.single('icon'),
  Categories.updateCategory
);


//
// ───────────────────────────────── ARTICLES ──────────────────────────────
//
router.get('/api/articles', Articles.listArticles); // public + dashboard filters
//router.get('/api/articles/:id', Articles.getArticleById); // public

import { articleUpload } from "./utils/upload";

router.post(
  "/api/articles",
  (req, _res, next) => {
    console.log("🔥 BEFORE MULTER");
    next();
  },
  articleUpload,
  (req, _res, next) => {
    console.log("🔥 AFTER MULTER BODY:", req.body);
    console.log("🔥 AFTER MULTER FILES:", req.files);
    next();
  },
  Articles.createArticle
);

router.put(
  "/api/articles/:id",
  (req, _res, next) => {
    console.log("🔥 BEFORE MULTER");
    next();
  },
  articleUpload,
  (req, _res, next) => {
    console.log("🔥 AFTER MULTER BODY:", req.body);
    console.log("🔥 AFTER MULTER FILES:", req.files);
    next();
  },
  Articles.updateArticle
);



// router.put('/api/articles/:id',  Articles.updateArticle);
router.delete('/api/articles/:id',  Articles.deleteArticle);
// ARTICLES (PUBLIC)
router.get('/api/articles/id/:id', Articles.getArticleById);
router.get('/api/articles/slug/:slug', Articles.getArticleBySlug);
//
// ───────────────────────────────── VIDEOS ────────────────────────────────
//
router.get('/api/videos', Videos.listVideos); // public
router.get('/api/videos/:id', Videos.getVideoById); // public


// router.post('/api/videos', requireAuth, Videos.createVideo);
// router.put('/api/videos/:id', requireAuth, Videos.updateVideo);
import { videoUpload } from "./utils/upload";

router.post(
  "/api/videos",
  videoUpload.single("video"), // ✅ expects FormData field name "video"
  Videos.createVideo
);

router.put(
  "/api/videos/:id",
  videoUpload.single("video"),
  Videos.updateVideo
);


router.delete('/api/videos/:id', requireAuth, Videos.deleteVideo);

//
// ───────────────────────────── DASHBOARD (HOME) ──────────────────────────
//
router.get('/api/dashboard/overview', requireAuth, Dashboard.overview);
router.get('/api/dashboard/recent', requireAuth, Dashboard.overview);

//
// ───────────────────────────── ANALYTICS (DETAILED) ──────────────────────
//
router.get('/api/analytics/content', requireAuth, Analytics.contentStats);
router.get('/api/analytics/traffic', requireAuth, Analytics.trafficAnalytics);

router.post('/api/analytics/page-view', Analytics.trackPageView); // public (web)
router.post('/api/analytics/article/:id/view', Analytics.trackArticleView);
router.post('/api/analytics/video/:id/view', Analytics.trackVideoView);

//
// ───────────────────────────────── SETTINGS ──────────────────────────────
//
router.get('/api/settings', requireAuth, Settings.getSettings);
router.put('/api/settings', requireAuth, Settings.updateSettings);

/* ASTROLOGY (PUBLIC) */
import * as Astrology from "./modules/astrology/astrology.controller";

//
// ───────────────────────────── ASTROLOGY (PUBLIC) ─────────────────────────
//
//
// ───────────────────────── ASTROLOGY (PUBLIC) ─────────────────────────
//
router.post("/api/astrology/by-dob", Astrology.getHoroscopeByDob);
router.get("/api/astrology/all", Astrology.getAllRashiGeneral);
router.get("/api/astrology/:rashi", Astrology.getByRashi);


export default router;
