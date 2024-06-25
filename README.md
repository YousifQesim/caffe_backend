# Caffe Node.js API

Welcome to the Caffe Node.js API documentation. This API serves as the backend for managing categories, items, orders, and authentication for a cafe application.

## Table of Contents

- [Introduction](#introduction)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Public Endpoints](#public-endpoints)
  - [Admin Endpoints](#admin-endpoints)
- [Error Handling](#error-handling)
- [Setup Instructions](#setup-instructions)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

## Introduction

This document outlines the RESTful API endpoints and functionalities of the Caffe Node.js application. The API provides operations to manage categories, items, orders, and user authentication.

## Base URL

The base URL for all API endpoints is:

* http://localhost:3000


Replace `localhost:3000` with the appropriate URL if deployed elsewhere.

## Authentication

- **JWT Authentication**: JSON Web Tokens (JWT) are used for authentication. A token is issued upon successful login and must be included in the `Authorization` header for protected endpoints.

## Endpoints

### Public Endpoints

- **Welcome Message**
  - **GET** `/`
  - Returns a simple welcome message indicating the server is running.

- **Login**
  - **POST** `/api/login`
  - Endpoint for user login.
  - **Request Body**: `{ "username": "admin", "password": "admin123" }`
  - Upon successful login, returns a JWT token which should be included in subsequent requests.

### Admin Endpoints

**Note:** Authentication using JWT token is required for these endpoints.

- **Manage Items**
  - **POST** `/api/admin/items/:categoryId`
    - Adds a new item to a specific category.
    - **Request Body**: `{ "name": "Item Name", "price": 10 }`
    - **File Upload**: Accepts an image file upload.

  - **DELETE** `/api/items/:itemId`
    - Removes an item by its ID.

  - **PUT** `/api/items/:itemId`
    - Updates details of an existing item, including image upload.

- **Manage Categories**
  - **GET** `/api/categories`
    - Retrieves all categories.

  - **POST** `/api/categories`
    - Adds a new category.
    - **Request Body**: `{ "name": "Category Name" }`

  - **PUT** `/api/categories/:categoryId`
    - Updates details of an existing category.

  - **DELETE** `/api/categories/:categoryId`
    - Removes a category by its ID.

- **Manage Orders**
  - **POST** `/api/orders`
    - Places a new order.
    - **Request Body**: `{ "tableNumber": 1, "items": [{ "id": 1, "quantity": 2 }] }`

  - **GET** `/api/orders`
    - Retrieves all orders, including order items and total price.

  - **PUT** `/api/orders/:orderId`
    - Updates an existing order.
    - **Request Body**: `{ "tableNumber": 2, "items": [{ "id": 1, "quantity": 3 }] }`

  - **PUT** `/api/orders/:orderId/accept`
    - Accepts an order.

  - **DELETE** `/api/orders/:orderId`
    - Removes an order by its ID.

## Error Handling

- Errors are handled globally using middleware.
- All responses include appropriate HTTP status codes and error messages where applicable.

## Setup Instructions

To run this application locally, follow these steps:

1. Clone this repository.
2. Install dependencies using `npm install`.
3. Set up MySQL database and update `db` connection details in `index.js`.
4. Start the server using `npm start`.

## Technologies Used

- Node.js
- Express.js
- MySQL
- JWT (JSON Web Tokens)
- Multer (for file uploads)
- Body-parser
- CORS

## Contributing

Contributions are welcome! Please fork this repository and submit pull requests to contribute to the project.

## License

This project is licensed under the [MIT License](LICENSE).
