import React from 'react';

function Post({ post, handleBackClick }) {
    return (
        <div className="post" style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <button type="button" className="btn btn-secondary" onClick={handleBackClick}>
                    Back to Posts
                </button>
            </div>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
            <p>{post.categoryId}</p>
        </div>
    );
}

export default Post;
