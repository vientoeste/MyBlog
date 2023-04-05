import React from 'react';
import Navigation from './Navigation';
import Categories from './Categories';
import Posts from './Posts';

function App() {
  return (
    <div className="App">
      <Navigation />
      <div className="content">
        <div className="categories">
          <Categories />
        </div>
        <div className="posts">
          <Posts />
        </div>
      </div>
    </div>
  );
}

export default App;