import { Router } from 'express';
import { getCategories } from '../models/category';
import { fetchPostsByCategory } from '../models/post';

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

router.route('/:id')
  .get((req, res, next) => {
    const { id } = req.params;
    fetchPostsByCategory(id, (e, posts) => {
      if (e) {
        console.error(e);
        next(e);
      }
      res.status(200).json(posts);
    });
  });

export default router;
