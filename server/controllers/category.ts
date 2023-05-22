import { Router } from 'express';
import { createNewCategoryTx, deleteCategoryTx, updateCategoryTx } from '../models/category';
import { fetchPostsByCategory } from '../models/post';
import { CategoryDTO, CreateCategoryDTO, UpdateCategoryDTO } from '../interfaces/Dto';
import { CustomError, Nullable, validateDtoForPatchReq } from '../utils';
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

      fetchPostsByCategory(parseInt(categoryId), parseInt(count, 10))
        .then((posts) => {
          res.status(200).json(posts);
        })
        .catch(() => {
          res.status(500).json({
            message: 'internal error',
          });
        });
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
      const categoryDTO = {
        name: (req.query as UpdateCategoryDTO).name ?? null,
        description: (req.query as UpdateCategoryDTO).description ?? null,
      } as Nullable<CategoryDTO>;
      if (!validateDtoForPatchReq<CategoryDTO>(categoryDTO)) {
        return res.status(400).json({
          message: 'invalid req body',
        });
      }
      await updateCategoryTx(parseInt(categoryId), categoryDTO);
      res.status(200).send('ok');
    } catch (e) {
      console.error(e);
      next(e);
    }
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .delete(async (req, res, next) => {
    try {
      const { id: categoryId } = req.params;
      if (!categoryId || Number.isNaN(categoryId)
        || mainPageCache.getCategory().filter((e) => e.id === parseInt(categoryId)).length === 0) {
        return res.status(400).json({
          message: 'invalid category id',
        });
      }
      await deleteCategoryTx(parseInt(categoryId)).then(() => {
        mainPageCache.updateCategoryCache();
        res.status(204).send();
      });
    } catch (e) {
      console.error(e);
      next(e);
    }
  });

export default router;
