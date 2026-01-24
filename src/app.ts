
// import express from 'express';
// import cors from 'cors';
// import morgan from 'morgan';

// import authRoutes from './modules/auth/auth.routes.js';
// import articleRoutes from './modules/articles/article.routes.js';
// import videoRoutes from './modules/videos/video.routes.js';
// import categoryRoutes from './modules/categories/category.routes.js';
// import analyticsRoutes from './modules/analytics/analytics.routes.js';
// import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
// import featureRoutes from './modules/features/feature.routes.js';
// import { authMiddleware } from './middlewares/auth.middleware.js';

// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use(morgan('dev'));

// app.get('/health', (_,res)=>res.send('CMS_OK'));

// app.use('/api/auth', authRoutes);
// app.use('/api/articles', articleRoutes);
// app.use('/api/categories', categoryRoutes);
// app.use('/api/videos', videoRoutes);
// // app.use('/api/articles', authMiddleware, articleRoutes);
// // app.use('/api/videos', authMiddleware, videoRoutes);
// // app.use('/api/categories', authMiddleware, categoryRoutes);
// app.use('/api/analytics', authMiddleware, analyticsRoutes);
// app.use('/api/dashboard', authMiddleware, dashboardRoutes);
// app.use('/api/features', authMiddleware, featureRoutes);

// export default app;
import express from 'express';
import cors from 'cors';
import routes from './routes'; 
import path from 'path';

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  '/uploads',
  express.static(path.join(process.cwd(), 'uploads'))
);
app.use(routes);


app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});


export default app;
