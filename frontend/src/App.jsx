import { useEffect, useState } from 'react';
import ProductRow from './ProductRow.jsx';

const REFRESH_MS = 15000;

export default function App() {
  const [products, setProducts] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
        const data = await response.json();
        setProducts(data.products);
        setUpdatedAt(data.updatedAt);
        setError(null);
      } catch (err) {
        setError(err.message);
      }
    }

    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, []);

  let status = 'Loading...';
  if (error) status = `Error: ${error}`;
  else if (updatedAt) status = `${products.length} products, updated ${new Date(updatedAt).toLocaleTimeString()}`;

  return (
    <main>
      <header>
        <h1>Product dashboard</h1>
        <span className="status">{status}</span>
      </header>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th className="num">Price</th>
            <th className="num">Stock</th>
            <th className="num">Units sold</th>
            <th className="num">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              open={openId === product.id}
              onToggle={() => setOpenId(openId === product.id ? null : product.id)}
            />
          ))}
        </tbody>
      </table>
    </main>
  );
}
