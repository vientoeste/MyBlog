import { Router } from 'express';
import { getCategories } from '../models/category';

const router = Router();

router.route('/')
  .get((req, res, next) => {
    getCategories((e, categories) => {
      if (e) {
        console.error(e);
        next(e);
      }
      res.status(200).json(categories);
    });
  });

export default router;
