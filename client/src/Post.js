import React from 'react';

function Post({ post }) {
    return (
        <div className="post" style={{ marginTop: '2rem' }}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
            <p>{post.categoryId}</p>
        </div>
    );
}

export default Post;