import { Router } from 'express';
import { createNewCategoryTx, fetchCategories } from '../models/category';
import { fetchPostsByCategory } from '../models/post';
import { CreateCategoryDTO } from '../interfaces/Dto';
import { CustomError } from '../lib/util';

const router = Router();

router.route('/')
  .get((req, res, next) => {
    fetchCategories((e, categories) => {
      if (e) {
        console.error(e);
        next(e);
      }
      res.status(200).json(categories);
    });
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .post(async (req, res, next) => {
    try {
      const { name, description } = req.body as CreateCategoryDTO;
      if (!name || !description) {
        throw new CustomError('invalid params', 400);
      }
      await createNewCategoryTx(name, description).then(() => {
        res.status(201).json({
          message: 'successfully created a category',
        });
      });
    } catch (e) {
      console.error(e);
      next(e);
    }
  });

router.route('/:id')
  .get((req, res, next) => {
    const { id } = req.params;
    let { count } = req.query as { count: string };
    if (count === undefined) {
      count = '0';
    }
    if (Number.isNaN(parseInt(count, 10))) {
      res.status(400).json({
        message: 'invalid query string(not a number)',
      });
    }
    fetchPostsByCategory(id, parseInt(count, 10), (e, posts) => {
      if (e) {
        console.error(e);
        next(e);
      }
      res.status(200).json(posts);
    });
  });

export default router;
