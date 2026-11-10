const money = (cents) => (cents / 100).toFixed(2);

export default function ProductRow({ product, open, onToggle }) {
  const { owner } = product;

  return (
    <>
      <tr className={open ? 'product open' : 'product'} onClick={onToggle}>
        <td>{product.name}</td>
        <td>{product.category}</td>
        <td className="num">{money(product.priceCents)}</td>
        <td className="num">{product.stock}</td>
        <td className="num">{product.totalSold}</td>
      </tr>
      {open && (
        <tr className="owner">
          <td colSpan={6}>
            <dl>
              <dt>Owner</dt>
              <dd>{owner.name}</dd>
              <dt>Company</dt>
              <dd>{owner.company}</dd>
              <dt>Email</dt>
              <dd>{owner.email}</dd>
              <dt>Phone</dt>
              <dd>{owner.phone}</dd>
              <dt>City</dt>
              <dd>{owner.city}</dd>
              <dt>Owner since</dt>
              <dd>{new Date(owner.createdAt).toLocaleDateString()}</dd>
              <dt>Products</dt>
              <dd>{owner.productCount}</dd>
            </dl>
          </td>
        </tr>
      )}
    </>
  );
}
