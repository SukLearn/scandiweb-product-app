# Scandiweb Product App

React Vite frontend, Node.js Express API, PostgreSQL database, and Docker Compose setup for the Scandiweb product list/add-product task.

## Run with Docker

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend health check: http://localhost:5000/health
- Add product page: http://localhost:5173/add-product

## Required UI hooks

- Product form: `#product_form`
- SKU input: `#sku`
- Name input: `#name`
- Price input: `#price`
- Type switcher: `#productType`
- DVD size input: `#size`
- Book weight input: `#weight`
- Furniture inputs: `#height`, `#width`, `#length`
- Delete checkboxes: `.delete-checkbox`
- Mass delete button: `#delete-product-btn`
