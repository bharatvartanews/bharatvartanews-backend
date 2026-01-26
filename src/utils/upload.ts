import multer from 'multer';
import { Request } from 'express';
import path from 'path';

export const imageUpload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/images',
    filename: (_req: Request, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  })
});

export const videoUpload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/videos',
    filename: (_req: Request, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  })
});


export const articleUpload = multer({
  storage: multer.memoryStorage(),
}).fields([
  { name: "image", maxCount: 10 },
  { name: "video", maxCount: 5 },
  { name: "audio", maxCount: 3 },
]);

// export const categoryIconUpload = multer({
//   storage: multer.diskStorage({
//     destination: (_req, _file, cb) => {
//       cb(null, 'uploads/categories');
//     },
//     filename: (_req, file, cb) => {
//       const ext = path.extname(file.originalname);
//       const name = path.basename(file.originalname, ext);
//       cb(null, `${Date.now()}-${name}${ext}`);
//     },
//   }),
// });

// export const categoryIconUpload = multer({
//   storage: multer.diskStorage({
//     destination: 'uploads/categories',
//     filename: (_req, file, cb) => {
//       const ext = path.extname(file.originalname);
//       cb(null, `${Date.now()}${ext}`);
//     },
//   }),
// });


export const categoryUpload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/categories',
    filename: (_req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
});


// For FormData without files (title, content, action, imageUrl, etc.)
export const formDataOnly = multer().none();