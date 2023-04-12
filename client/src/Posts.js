import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Posts() {
  const [posts, setPosts] = useState([]);
  const [cachedPosts, setCachedPosts] = useState([]);

  // [TODO] 전체 포스트 조회 시와 단일 포스트 조회 시 같은 타입으로 전송하기 때문에 통일된 캐싱 사용
  // 포스트 미리보기 기능 추가 혹은 실제 포스트 작성 시작 시 캐시를 나눠야 함
  useEffect(() => {
    if (cachedPosts.length > 0) {
      setPosts(cachedPosts);
    } else {
      axios.get('/api-proxy/posts')
        .then(response => {
          setPosts(response.data);
          setCachedPosts(response.data);
        })
        .catch(error => console.error(error));
    }
  }, [cachedPosts]);

  function handlePostClick(postUuid) {
    const cachedPost = cachedPosts.find(post => post.uuid === postUuid);

    if (cachedPost) {
      setPosts([cachedPost]);
    } else {
      axios.get(`/api-proxy/posts/${postUuid}`)
        .then(response => {
          setPosts([response.data]);
          setCachedPosts([...cachedPosts, response.data]);
        })
        .catch(error => console.error(error));
    }
  }

  if (posts.length === 1) {
    const currentPost = posts[0];

    return (
      <div className="post">
        <h2>{currentPost.title}</h2>
        <p>{currentPost.content}</p>
        <p>{currentPost.categoryId}</p>
      </div>
    );
  }

  return (
    <div className="posts">
      <h2>Recent Articles</h2>
      <ul>
        {Array.isArray(posts) && posts.length !== 0 ? posts.map(post => (
          <li key={post.uuid}>
            <button onClick={() => handlePostClick(post.uuid)}>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              <p>{post.categoryId}</p>
            </button>
          </li>
        )) : <p>no contents</p>}
      </ul>
    </div>
  );
}

export default Posts;
