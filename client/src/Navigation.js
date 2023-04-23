import React from 'react';

function Navigation() {
  return (
    <nav>
      <ul>
        <li><a href="/"><img src="/laptop-code-solid.svg" alt="" />Este the Dev</a></li>
        <li><a href="/#">🌸</a></li>
        <li><a href="/#">🌸</a></li>
        <li><a href="/#">🌸</a></li>
        <li className="search">
          <input type="text" placeholder="내용을 입력하세요" />
          <button>검색</button>
        </li>
        <li><a href="/login">로그인</a></li>
      </ul>
    </nav>
  );
}

export default Navigation;