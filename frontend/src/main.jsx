import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createProduct, deleteProducts, getProducts } from './api';
import './styles.css';

function formatNumber(value) {
  return Number(value).toString();
}

function getAttribute(product) {
  if (product.type === 'DVD') {
    return `Size: ${formatNumber(product.size)} MB`;
  }

  if (product.type === 'Book') {
    return `Weight: ${formatNumber(product.weight)}KG`;
  }

  return `Dimension: ${formatNumber(product.height)}x${formatNumber(product.width)}x${formatNumber(product.length)}`;
}

function ProductList({ goToAdd }) {
  const [products, setProducts] = useState([]);
  const [selectedSkus, setSelectedSkus] = useState([]);

  async function loadProducts() {
    const data = await getProducts();
    setProducts(data);
  }

  useEffect(() => {
    loadProducts().catch(console.error);
  }, []);

  function toggleSku(sku) {
    setSelectedSkus((current) =>
      current.includes(sku) ? current.filter((item) => item !== sku) : [...current, sku]
    );
  }

  async function handleMassDelete() {
    await deleteProducts(selectedSkus);
    setSelectedSkus([]);
    await loadProducts();
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1>Product List</h1>
        <div className="actions">
          <button type="button" onClick={goToAdd}>
            ADD
          </button>
          <button id="delete-product-btn" type="button" onClick={handleMassDelete}>
            MASS DELETE
          </button>
        </div>
      </header>

      <section className="product-grid" aria-label="Products">
        {products.map((product) => (
          <article className="product-card" key={product.sku}>
            <input
              className="delete-checkbox"
              type="checkbox"
              checked={selectedSkus.includes(product.sku)}
              onChange={() => toggleSku(product.sku)}
              aria-label={`Delete ${product.sku}`}
            />
            <div className="product-info">
              <p>{product.sku}</p>
              <p>{product.name}</p>
              <p>{Number(product.price).toFixed(2)} $</p>
              <p>{getAttribute(product)}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

const emptyForm = {
  sku: '',
  name: '',
  price: '',
  type: '',
  size: '',
  weight: '',
  height: '',
  width: '',
  length: '',
};

const descriptions = {
  DVD: 'Please, provide size',
  Book: 'Please, provide weight',
  Furniture: 'Please, provide dimensions',
};

function ProductAdd({ goToList }) {
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');

  const payload = useMemo(() => {
    const base = {
      sku: form.sku,
      name: form.name,
      price: form.price,
      type: form.type,
    };

    if (form.type === 'DVD') return { ...base, size: form.size };
    if (form.type === 'Book') return { ...base, weight: form.weight };
    if (form.type === 'Furniture') {
      return {
        ...base,
        height: form.height,
        width: form.width,
        length: form.length,
      };
    }

    return base;
  }, [form]);

  function updateField(event) {
    const { name, value } = event.target;
    setMessage('');
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      await createProduct(payload);
      goToList();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1>Product Add</h1>
        <div className="actions">
          <button type="submit" form="product_form">
            Save
          </button>
          <button type="button" onClick={goToList}>
            Cancel
          </button>
        </div>
      </header>

      <form id="product_form" className="product-form" onSubmit={handleSubmit} noValidate>
        {message && <p className="form-message">{message}</p>}

        <label>
          <span>SKU</span>
          <input id="sku" name="sku" value={form.sku} onChange={updateField} />
        </label>

        <label>
          <span>Name</span>
          <input id="name" name="name" value={form.name} onChange={updateField} />
        </label>

        <label>
          <span>Price ($)</span>
          <input id="price" name="price" value={form.price} onChange={updateField} />
        </label>

        <label className="type-row">
          <span>Type Switcher</span>
          <select id="productType" name="type" value={form.type} onChange={updateField}>
            <option value="">Type Switcher</option>
            <option value="DVD">DVD</option>
            <option value="Furniture">Furniture</option>
            <option value="Book">Book</option>
          </select>
        </label>

        <section className="attribute-panel">
          {form.type === 'DVD' && (
            <>
              <label>
                <span>Size (MB)</span>
                <input id="size" name="size" value={form.size} onChange={updateField} />
              </label>
              <p>{descriptions.DVD}</p>
            </>
          )}

          {form.type === 'Furniture' && (
            <>
              <label>
                <span>Height (CM)</span>
                <input id="height" name="height" value={form.height} onChange={updateField} />
              </label>
              <label>
                <span>Width (CM)</span>
                <input id="width" name="width" value={form.width} onChange={updateField} />
              </label>
              <label>
                <span>Length (CM)</span>
                <input id="length" name="length" value={form.length} onChange={updateField} />
              </label>
              <p>{descriptions.Furniture}</p>
            </>
          )}

          {form.type === 'Book' && (
            <>
              <label>
                <span>Weight (KG)</span>
                <input id="weight" name="weight" value={form.weight} onChange={updateField} />
              </label>
              <p>{descriptions.Book}</p>
            </>
          )}
        </section>
      </form>
    </main>
  );
}

function App() {
  const [path, setPath] = useState(window.location.pathname);

  function navigate(nextPath) {
    window.history.pushState({}, '', nextPath);
    setPath(nextPath);
  }

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (path === '/add-product') {
    return <ProductAdd goToList={() => navigate('/')} />;
  }

  return <ProductList goToAdd={() => navigate('/add-product')} />;
}

createRoot(document.getElementById('root')).render(<App />);
