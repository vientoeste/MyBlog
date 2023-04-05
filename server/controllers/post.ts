import { NextFunction, Request, Response, Router } from 'express';
import { v5 } from 'uuid';
import { CustomError } from '../lib/util';
import { CreatePostDTO } from '../interfaces/ReqBody';
import { getDateForDb } from '../lib/util';
import { createNewPostTx } from '../models/post';

const router = Router();

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.route('/').post(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content, categoryId } = req.body as CreatePostDTO;
    if (!title || !content || !categoryId) {
      res.status(400).json({
        error: 'invalid params',
      });
      next(new CustomError('invalid param', 400));
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
