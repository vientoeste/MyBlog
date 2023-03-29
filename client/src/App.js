import React from 'react';
import Navigation from './Navigation';
import Categories from './Categories';
import Articles from './Articles';

function App() {
  return (
    <div className="App">
      <Navigation />
      <div className="content">
        <div className="categories">
          <Categories />
        </div>
        <div className="articles">
          <Articles />
        </div>
      </div>
    </div>
  );
}

export default App;