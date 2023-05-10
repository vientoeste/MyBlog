import React from 'react';

function PostList({ posts, handlePostClick }) {
    return (
        <div className="posts">
            <h2>Recent Articles</h2>
            <ul>
                {Array.isArray(posts) && posts.length !== 0 ? posts.map(post => (
                    <li key={post.uuid} onClick={() => handlePostClick(post.uuid)} className="list-group-item list-group-item-action mb-3" tabIndex="0">
                        <div className="d-flex w-100 justify-content-between">
                            <h3 className="mb-1">{post.title}</h3>
                            <small>{post.categoryId}</small>
                        </div>
                        <p className="mb-1">{post.content}</p>
                        <small>{post.uuid}</small>
                    </li>
                )) : <p>no contents</p>}
            </ul>
        </div>
    );
}

export default PostList;