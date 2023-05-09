import { NextFunction, Request, Response, Router } from 'express';
import { v5, validate } from 'uuid';
import { CustomError } from '../utils';
import { CreateCommentDTO, CreatePostDTO, UpdatePostDTO } from '../interfaces/Dto';
import { getDateForDb } from '../utils';
import { createNewPostTx, deletePostTx, fetchSinglePost, updatePostTx } from '../models/post';
import { mainPageCache } from '../app';
import { createNewCommentTx, deleteComment, fetchComments, updateComment } from '../models/comment';
import { CommentEntity } from '../interfaces/Entity';

const router = Router();

router.route('/')
  .get((req, res) => {
    res.status(200).json(mainPageCache.getPostPreview());
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
        mainPageCache.updatePostPreviewCache();
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
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .get(async (req, res, next) => {
    try {
      const { post_uuid: postUuid } = req.params;
      if (!postUuid || !validate(postUuid)) {
        throw new CustomError('invalid params', 400);
      }
      const post = await fetchSinglePost(postUuid);
      res.status(200).json(post);
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
      await updatePostTx(postUuid, req.body as UpdatePostDTO).then(() => {
        mainPageCache.updatePostPreviewCache();
      });

      res.status(201).json({
        message: 'ok',
      });
    } catch (e) {
      next(e);
    }
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .delete(async (req, res, next) => {
    const { post_uuid: postUuid } = req.params;
    if (!postUuid || !validate(postUuid)) {
      next(new CustomError('invalid params', 400));
    }

    await deletePostTx(postUuid);
    res.status(204).send();
  });

router.route('/:post_uuid/comments')
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .get(async (req, res, next) => {
    try {
      const { post_uuid: postUuid } = req.params;
      if (!postUuid || !validate(postUuid)) {
        next(new CustomError('invalid params', 400));
      }
      const comments = await fetchComments(postUuid);
      res.status(200).json(comments);
    } catch (e) {
      console.error(e);
      next(e);
    }
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .post(async (req, res, next) => {
    try {
      const { userId, content } = req.body as CreateCommentDTO;
      const { post_uuid: postUuid } = req.params;
      if (!userId || !content || !postUuid || !validate(postUuid)) {
        throw new CustomError('invalid params', 400);
      }
      const now = getDateForDb();
      const commentUuid = v5(content.concat(now), process.env.NAMESPACE_UUID as string);
      await createNewCommentTx(commentUuid, postUuid, userId, content, now).then(() => {
        res.status(201).json({
          message: 'successfully created a comment',
          uuid: commentUuid,
        });
      });
    } catch (e) {
      console.error(e);
      next(e);
    }
  });

// [TODO] cli-side에서, 응답한 이전의 res body를 바탕으로 commentUuid에 대한 유효성(is_deleted==0?) 검증 필요
router.route('/:post_uuid/comments/:comment_uuid')
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .patch(async (req, res, next) => {
    try {
      const { post_uuid: postUuid, comment_uuid: commentUuid } = req.params;
      if (!validate(commentUuid) || !validate(postUuid)) {
        next(new CustomError('invalid params', 400));
      }
      const paramsToUpdate = req.query as Partial<CommentEntity>;
      await updateComment(paramsToUpdate, commentUuid);
      res.status(200).send('ok');
    } catch (err) {
      console.error(err);
      next(err);
    }
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .delete(async (req, res, next) => {
    const { comment_uuid: commentUuid } = req.params;
    if (!validate(commentUuid)) {
      next(new CustomError('invalid params', 400));
    }
    await deleteComment(commentUuid);
    res.status(204).send();
  });

export default router;
