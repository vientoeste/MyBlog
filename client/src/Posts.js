import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Posts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get('/api-proxy/posts')
      .then(response => setPosts(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div className="posts">
      <h2>Recent Articles</h2>
      <ul>
        {posts.map(post => (
          <li key={post.uuid}>
            <a href={`/posts/${post.uuid}`}>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              <p>{post.category_id}</p>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Posts;
