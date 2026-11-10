import {useCallback, useEffect, useState} from 'react';
import ProductRow from './ProductRow.jsx';
import Pagination from './Pagination.jsx';

const REFRESH_MS = 30000;

export default function App() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  const changePage = useCallback((next) => {
    setPage(next);
    setProducts([]);
    setOpenId(null);
    setError(null);
    setLoading(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(`/api/dashboard?page=${page}`);
        if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
        const data = await response.json();
        if (cancelled) return;

        if (data.products.length === 0 && page > 1 && data.totalPages > 0) {
          changePage(data.totalPages);
          return;
        }

        setProducts(data.products);
        setTotalPages(data.totalPages);
        setUpdatedAt(data.updatedAt);
        setError(null);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      }
    }

    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [page, changePage]);

  let status = 'Loading...';
  if (error) status = `Error: ${error}`;
  else if (!loading && updatedAt) {
    status = `${products.length} products, page ${page} of ${totalPages}, updated ${new Date(updatedAt).toLocaleTimeString()}`;
  }

  return (
    <main>
      <header>
        <h1>Product dashboard</h1>
        <span className="status">{status}</span>
      </header>
      <div className="container">
        <Pagination page={page} totalPages={totalPages} onChange={changePage}/>
        <table>
          <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th className="num">Price</th>
            <th className="num">Stock</th>
            <th className="num">Units sold</th>
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
        <Pagination page={page} totalPages={totalPages} onChange={changePage}/>
      </div>
    </main>
  );
}
