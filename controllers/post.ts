import { NextFunction, Request, Response, Router } from 'express';
import { v5 } from 'uuid';
import { CreatePostDTO } from '../interfaces/ReqBody';
import { getDateForDb } from '../lib/util';
import { createNewPostTX } from '../models/post';

const router = Router();

router.route('/').post((req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content, categoryId } = req.body as CreatePostDTO;
    const now = getDateForDb();
    const postUuid = v5(title.concat(now), process.env.NAMESPACE_UUID as string);
    const isSucceed = createNewPostTX(postUuid, title, content, categoryId, now);
    if (isSucceed) {
      return res.send({
        uuid: postUuid,
      });
    } else {
      return res.send({
        error: 'query error',
      });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
});

export default router;
