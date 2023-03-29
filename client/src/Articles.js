import React from 'react';

function Articles() {
  return (
    <div className="articles">
      <h2>Recent Articles</h2>
      <ul>
        <li>
          <a href="/article-1">
            <h3>게시물 1</h3>
            <p>미리보기</p>
          </a>
        </li>
        <li>
          <a href="/article-2">
            <h3>게시물 2</h3>
            <p>미리보기</p>
          </a>
        </li>
        <li>
          <a href="/article-3">
            <h3>게시물 3</h3>
            <p>미리보기</p>
          </a>
        </li>
      </ul>
    </div>
  );
}

export default Articles;