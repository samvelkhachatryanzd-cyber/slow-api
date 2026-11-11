import {useEffect, useState, useSyncExternalStore} from 'react';
import ProductRow from './ProductRow.jsx';
import Pagination from './Pagination.jsx';

const REFRESH_MS = 60000;

const listeners = new Set();

function subscribe(listener) {
  listeners.add(listener);
  window.addEventListener('popstate', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('popstate', listener);
  };
}

const getSearch = () => window.location.search;

function parsePage(search) {
  const page = Number(new URLSearchParams(search).get('page'));
  return Number.isSafeInteger(page) && page >= 1 ? page : 1;
}

function writePage(page, method) {
  const url = new URL(window.location.href);
  url.searchParams.set('page', page);
  window.history[method]({}, '', url);
  listeners.forEach((listener) => listener());
}

const navigate = (page) => {
  if (page !== parsePage(getSearch())) writePage(page, 'pushState');
};
const replacePage = (page) => writePage(page, 'replaceState');

export default function App() {
  const search = useSyncExternalStore(subscribe, getSearch);
  const page = parsePage(search);
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [owner, setOwner] = useState({});

  async function fetchOwnerInfo(product) {
    setOwner({});
    setOpenId(openId === product.id ? null : product.id);
    const response = await fetch(`/api/product/${product.ownerId}/owner`);
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
    const data = await response.json();
    setOwner(data);
  }

  useEffect(() => {
    if (new URLSearchParams(search).get('page') !== String(page)) replacePage(page);
  }, [search, page]);

  useEffect(() => {
    let cancelled = false;

    setProducts([]);
    setOpenId(null);
    setError(null);
    setLoading(true);

    async function load() {
      try {
        const response = await fetch(`/api/dashboard?page=${page}`);
        if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
        const data = await response.json();
        if (cancelled) return;

        if (data.products.length === 0 && page > 1 && data.totalPages > 0) {
          replacePage(data.totalPages);
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
  }, [page]);

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
        <Pagination page={page} totalPages={totalPages} onChange={navigate}/>
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
              owner={owner}
              onToggle={() => fetchOwnerInfo(product)}
            />
          ))}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} onChange={navigate}/>
      </div>
    </main>
  );
}
