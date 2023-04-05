import { NextFunction, Request, Response, Router } from 'express';
import { v5 } from 'uuid';
import { CustomError } from '../lib/util';
import { CreatePostDTO } from '../interfaces/Dto';
import { getDateForDb } from '../lib/util';
import { createNewPostTx, getExistingPosts } from '../models/post';

const router = Router();

router.route('/')
  .get((req, res, next) => {
    getExistingPosts((e, posts) => {
      if (e) {
        console.error(e);
        next(e);
      }
      res.status(200).json(posts);
    });
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .post(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, content, categoryId } = req.body as CreatePostDTO;
      if (!title || !content || !categoryId) {
        new CustomError('invalid params', 400);
      }
      const now = getDateForDb();
      const postUuid = v5(title.concat(now), process.env.NAMESPACE_UUID as string);
      await createNewPostTx(postUuid, title, content, categoryId, now).then(() => {
        res.status(201).json({
          message: 'successfully created a post',
          uuid: postUuid,
        });
      });
    } catch (e) {
      console.error(e);
      next(e);
    }
  });

export default router;
