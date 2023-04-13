import axios from 'axios';
import React, { useEffect, useState } from 'react';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [cachedCategories, setCachedCategories] = useState([]);

  useEffect(() => {
    if (cachedCategories.length > 0) {
      setCachedCategories(cachedCategories);
    } else {
      axios.get('/api-proxy/categories')
        .then(res => {
          setCategories(res.data);
          setCachedCategories(res.data);
        })
        .catch(error => console.error(error));
    }
  }, [cachedCategories]);

  return (
    <div className="categories">
      <h2>카테고리</h2>
      <ul>
        {Array.isArray(categories) && categories.length !== 0 ? categories.map(category => (
          <li key={category.id}>
            <a href={'categories/'.concat(category.id)}><p>{category.name}</p></a>
          </li>
        )) : <p>no categories</p>}
      </ul>
    </div>
  );
}

export default Categories;