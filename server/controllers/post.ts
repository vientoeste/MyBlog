import { NextFunction, Request, Response, Router } from 'express';
import { v5, validate } from 'uuid';
import { CustomError } from '../lib/util';
import { CreatePostDTO, UpdatePostDTO } from '../interfaces/Dto';
import { getDateForDb } from '../lib/util';
import { createNewPostTx, fetchPreviewPosts, fetchSinglePost, updatePostTx } from '../models/post';

const router = Router();

router.route('/')
  .get((req, res, next) => {
    fetchPreviewPosts((e, posts) => {
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
        throw new CustomError('invalid params', 400);
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

router.route('/:post_uuid')
  .get((req, res, next) => {
    try {
      const { post_uuid: postUuid } = req.params;
      if (!postUuid || !validate(postUuid)) {
        throw new CustomError('invalid params', 400);
      }
      fetchSinglePost(postUuid, (e, post) => {
        if (e) {
          next(new CustomError('query error: no contents', 404));
        }
        res.status(200).json(post);
      });
    } catch (e) {
      console.error(e);
      next(e);
    }
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .put(async (req, res, next) => {
    try {
      const { post_uuid: postUuid } = req.params;
      if (!postUuid || !validate(postUuid)) {
        throw new CustomError('invalid params', 400);
      }

      // [TODO] subdivide http stat code - not updated, updated, ...
      await updatePostTx(postUuid, req.body as UpdatePostDTO);

      res.status(201).json({
        message: 'ok',
      });
    } catch (e) {
      next(e);
    }
  });

export default router;
