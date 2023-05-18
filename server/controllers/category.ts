import { Router } from 'express';
import { createNewCategoryTx, updateCategoryTx } from '../models/category';
import { fetchPostsByCategory } from '../models/post';
import { CreateCategoryDTO, UpdateCategoryDTO } from '../interfaces/Dto';
import { CustomError } from '../utils';
import { mainPageCache } from '../app';

const router = Router();

router.route('/')
  .get((req, res) => {
    res.status(200).json(mainPageCache.getCategory());
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .post(async (req, res, next) => {
    try {
      const { name, description } = req.body as CreateCategoryDTO;
      if (!name || !description) {
        throw new CustomError('invalid params', 400);
      }
      await createNewCategoryTx(name, description).then(() => {
        mainPageCache.updateCategoryCache();
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
    try {
      const { id: categoryId } = req.params;
      if (!categoryId || Number.isNaN(parseInt(categoryId))) {
        return res.status(400).json({
          message: 'invalid category id',
        });
      }

      let { count } = req.query as { count: string };
      if (count === undefined) {
        count = '0';
      }
      if (Number.isNaN(parseInt(count, 10))) {
        return res.status(400).json({
          message: 'invalid query string(not a number)',
        });
      }

      const posts = fetchPostsByCategory(parseInt(categoryId), parseInt(count, 10));
      res.status(200).json(posts);
    } catch (e) {
      console.error(e);
      next(e);
    }
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .patch(async (req, res, next) => {
    try {
      const { id: categoryId } = req.params;
      if (!categoryId || Number.isNaN(parseInt(categoryId, 10))
        || mainPageCache.getCategory().filter((e) => e.id === parseInt(categoryId)).length === 0) {
        return res.status(400).json({
          message: 'invalid category id',
        });
      }
      await updateCategoryTx(parseInt(categoryId), req.query as UpdateCategoryDTO);
      res.status(200).send('ok');
    } catch (e) {
      console.error(e);
      next(e);
    }
  });

export default router;
