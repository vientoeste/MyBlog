import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Post from './Post';
import PostList from './PostList';

function Posts() {
  const [posts, setPosts] = useState([]);
  const [cachedPosts, setCachedPosts] = useState([]);

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

  function handleBackClick() {
    setPosts(cachedPosts);
  }

  return (
    <>
      {posts.length === 1 ? <Post post={posts[0]} handleBackClick={handleBackClick} /> : <PostList posts={posts} handlePostClick={handlePostClick} />}
    </>
  );
}

export default Posts;
