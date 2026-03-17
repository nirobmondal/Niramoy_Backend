# Niramoy Backend — Postman Testing Guide

> **Base URL:** `http://localhost:5000`
> **API Prefix:** `/api`

---

## Table of Contents

1. [Environment Setup](#1-environment-setup)
2. [Authentication (Better-Auth)](#2-authentication-better-auth)
3. [User Profile](#3-user-profile)
4. [Categories (Public + Admin)](#4-categories)
5. [Manufacturers](#5-manufacturers)
6. [Medicines (Public)](#6-medicines)
7. [Cart (Customer)](#7-cart)
8. [Orders (Customer)](#8-orders)
9. [Seller](#9-seller)
10. [Reviews](#10-reviews)
11. [Admin](#11-admin)
12. [Error Responses](#12-error-responses)

---

## 1. Environment Setup

### Postman Variables

| Variable  | Value                      |
| --------- | -------------------------- |
| `baseUrl` | `http://localhost:5000`    |
| `cookie`  | _(auto-set after sign-in)_ |

### Cookie-Based Auth

Better-Auth uses **cookies** (not Bearer tokens). After signing in, Postman will
receive `Set-Cookie` headers. Store the cookie and include it on every
subsequent request.

**Steps:**

1. In Postman Settings → **Automatically follow redirects**: ON
2. After sign-in, go to the **Cookies** tab in Postman and verify cookies are stored for `localhost`.
3. All authenticated requests will automatically include the cookie.

> **Tip:** Create separate Postman environments for **Customer**, **Seller**, and **Admin** to test role-based access.

---

## 2. Authentication (Better-Auth)

Better-Auth exposes endpoints under `/api/auth/*`. These are handled by Better-Auth directly.

### 2.1 Sign Up (Email/Password)

```
POST {{baseUrl}}/api/auth/sign-up/email
Content-Type: application/json
```

**Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePass123"
}
```

**Response (200):**

```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CUSTOMER",
    "isBanned": false
  }
}
```

### 2.2 Sign In (Email/Password)

```
POST {{baseUrl}}/api/auth/sign-in/email
Content-Type: application/json
```

**Body:**

```json
{
  "email": "john@example.com",
  "password": "securePass123"
}
```

**Response (200):** Returns user data + sets session cookie.

### 2.3 Get Session

```
GET {{baseUrl}}/api/auth/get-session
```

**Response (200):** Returns current session + user object.

### 2.4 Sign Out

```
POST {{baseUrl}}/api/auth/sign-out
```

---

## 3. User Profile

> **Auth:** Any authenticated user

### 3.1 Get My Profile

```
GET {{baseUrl}}/api/users/me
```

**Response (200):**

```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CUSTOMER",
    "phone": null,
    "address": null,
    "image": null,
    "isBanned": false,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### 3.2 Update My Profile

```
PATCH {{baseUrl}}/api/users/me
Content-Type: application/json
```

**Body (all fields optional):**

```json
{
  "name": "John Updated",
  "phone": "01700000000",
  "address": "123 Medicine St, Dhaka"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ... }
}
```

---

## 4. Categories

### 4.1 Get All Categories (Public)

```
GET {{baseUrl}}/api/categories
```

**Response (200):**

```json
{
  "success": true,
  "message": "Categories fetched successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Antibiotics",
      "description": "..."
    }
  ]
}
```

### 4.2 Get Category with Medicines (Public)

```
GET {{baseUrl}}/api/categories/:id/medicines
```

**Response (200):**

```json
{
  "success": true,
  "message": "Category medicines fetched successfully",
  "data": {
    "id": "uuid",
    "name": "Antibiotics",
    "medicines": [
      {
        "id": "uuid",
        "name": "Amoxicillin 500mg",
        "price": "120.00",
        "stock": 50,
        "isAvailable": true,
        "seller": { "id": "...", "storeName": "..." }
      }
    ]
  }
}
```

### 4.3 Create Category (Admin)

```
POST {{baseUrl}}/api/categories
Content-Type: application/json
```

**Body:**

```json
{
  "name": "Antibiotics",
  "description": "Medicines that fight bacterial infections"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Category created successfully",
  "data": { "id": "uuid", "name": "Antibiotics", "description": "..." }
}
```

### 4.4 Update Category (Admin)

```
PATCH {{baseUrl}}/api/categories/:id
Content-Type: application/json
```

**Body:**

```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

### 4.5 Delete Category (Admin)

```
DELETE {{baseUrl}}/api/categories/:id
```

---

## 5. Manufacturers

### 5.1 Get All Manufacturers (Public)

```
GET {{baseUrl}}/api/manufacturers
```

**Expected:** Returns all manufacturers sorted by name in ascending order.

### 5.2 Create Manufacturer (Admin)

> **Auth:** ADMIN role

```
POST {{baseUrl}}/api/admin/manufacturers
Content-Type: application/json
```

**Body:**

```json
{
  "name": "Square Pharma"
}
```

**Test cases:**

- Success create
- Duplicate manufacturer name blocked
- Unauthorized user blocked

---

## 6. Medicines

### 6.1 Get All Medicines (Public)

```
GET {{baseUrl}}/api/medicines?page=1&limit=10&search=amox&categoryId=uuid&manufacturerId=uuid&sortBy=price&sortOrder=asc&minPrice=10&maxPrice=500
```

**Query Parameters (all optional):**

| Param            | Type   | Description                        |
| ---------------- | ------ | ---------------------------------- |
| `page`           | number | Page number (default: 1)           |
| `limit`          | number | Items per page (default: 10)       |
| `search`         | string | Search by medicine name            |
| `categoryId`     | string | Filter by category ID              |
| `manufacturerId` | string | Filter by manufacturer ID          |
| `sortBy`         | string | Sort field (e.g., `price`, `name`) |
| `sortOrder`      | string | `asc` or `desc`                    |
| `minPrice`       | number | Minimum price filter               |
| `maxPrice`       | number | Maximum price filter               |

**Response (200):**

```json
{
  "success": true,
  "message": "Medicines fetched successfully",
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

### 6.2 Get Medicine by ID (Public)

```
GET {{baseUrl}}/api/medicines/:id
```

**Response (200):**

```json
{
  "success": true,
  "message": "Medicine fetched successfully",
  "data": {
    "id": "uuid",
    "name": "Amoxicillin 500mg",
    "description": "...",
    "price": "120.00",
    "stock": 50,
    "manufacturer": { "id": "...", "name": "Square Pharma" },
    "imageUrl": "...",
    "dosageForm": "Tablet",
    "strength": "500mg",
    "isAvailable": true,
    "category": { "id": "...", "name": "Antibiotics" },
    "seller": { "id": "...", "storeName": "MediShop" },
    "reviews": [ ... ],
    "averageRating": 4.2
  }
}
```

---

## 7. Cart

> **Auth:** CUSTOMER role

### 6.1 Get Cart

```
GET {{baseUrl}}/api/cart
```

**Response (200):**

```json
{
  "success": true,
  "message": "Cart fetched successfully",
  "data": {
    "id": "uuid",
    "items": [
      {
        "id": "cart-item-uuid",
        "medicine": { "id": "...", "name": "...", "price": "120.00" },
        "quantity": 2
      }
    ],
    "total": 240.0
  }
}
```

### 6.2 Add Item to Cart

```
POST {{baseUrl}}/api/cart/items
Content-Type: application/json
```

**Body:**

```json
{
  "medicineId": "medicine-uuid",
  "quantity": 2
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Item added to cart successfully",
  "data": { ... }
}
```

### 6.3 Update Cart Item Quantity

```
PATCH {{baseUrl}}/api/cart/items/:cartItemId
Content-Type: application/json
```

**Body:**

```json
{
  "quantity": 3
}
```

### 6.4 Remove Cart Item

```
DELETE {{baseUrl}}/api/cart/items/:cartItemId
```

### 6.5 Clear Entire Cart

```
DELETE {{baseUrl}}/api/cart
```

---

## 8. Orders

> **Auth:** CUSTOMER role

### 7.1 Checkout (Place Order)

```
POST {{baseUrl}}/api/orders
Content-Type: application/json
```

**Body:**

```json
{
  "shippingAddress": "123 Medicine St",
  "shippingCity": "Dhaka",
  "phone": "01700000000",
  "notes": "Please deliver before 5 PM"
}
```

> Cart must have items. Stock is decremented and cart is cleared on checkout.

**Response (201):**

```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "id": "order-uuid",
    "totalPrice": "480.00",
    "shippingAddress": "...",
    "sellerOrders": [
      {
        "id": "seller-order-uuid",
        "seller": { "storeName": "MediShop" },
        "status": "PLACED",
        "subtotal": "480.00",
        "items": [ ... ]
      }
    ]
  }
}
```

### 7.2 Get My Orders

```
GET {{baseUrl}}/api/orders?page=1&limit=10&status=PLACED
```

**Query Parameters (all optional):**

| Param    | Type   | Values                                                      |
| -------- | ------ | ----------------------------------------------------------- |
| `page`   | number | Page number                                                 |
| `limit`  | number | Items per page                                              |
| `status` | string | `PLACED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED` |

### 7.3 Get Order by ID

```
GET {{baseUrl}}/api/orders/:id
```

### 7.4 Cancel Order

```
PATCH {{baseUrl}}/api/orders/:id/cancel
```

> Can only cancel orders where **all** seller orders have status `PLACED`. Stock is restored on cancellation.

---

## 9. Seller

### 8.1 Create Seller Profile (Customer → Seller)

> **Auth:** CUSTOMER role (user becomes SELLER after this)

```
POST {{baseUrl}}/api/seller/profile
Content-Type: application/json
```

**Body:**

```json
{
  "storeName": "MediShop BD",
  "address": "45 Pharmacy Lane, Dhaka",
  "contactNumber": "01800000000",
  "openingTime": "09:00 AM",
  "closingTime": "10:00 PM",
  "offDay": "Friday"
}
```

### 8.2 Get Seller Profile

> **Auth:** SELLER role

```
GET {{baseUrl}}/api/seller/profile
```

**Response (200):**

```json
{
  "success": true,
  "message": "Seller profile fetched successfully",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "storeName": "MediShop BD",
    "storeLogo": null,
    "address": "45 Pharmacy Lane, Dhaka",
    "contactNumber": "01800000000",
    "openingTime": "09:00 AM",
    "closingTime": "10:00 PM",
    "offDay": "Friday",
    "_count": { "medicines": 5, "sellerOrders": 3 }
  }
}
```

### 8.3 Update Seller Profile

> **Auth:** SELLER role

```
PATCH {{baseUrl}}/api/seller/profile
Content-Type: application/json
```

**Body (all fields optional):**

```json
{
  "storeName": "Updated Store Name",
  "address": "New Address, Dhaka",
  "contactNumber": "01800000002",
  "openingTime": "10:00 AM",
  "closingTime": "09:00 PM",
  "offDay": "Saturday"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Seller profile updated successfully",
  "data": { ... }
}
```

### 8.4 Add Medicine (Seller)

> **Auth:** SELLER role

```
POST {{baseUrl}}/api/seller/medicines
Content-Type: application/json
```

**Body:**

```json
{
  "name": "Amoxicillin 500mg",
  "description": "Broad-spectrum antibiotic",
  "price": 120.0,
  "stock": 100,
  "manufacturerId": "manufacturer-uuid",
  "imageUrl": "https://example.com/image.jpg",
  "dosageForm": "Tablet",
  "strength": "500mg",
  "categoryId": "category-uuid"
}
```

### 8.5 Edit Medicine (Seller)

```
PATCH {{baseUrl}}/api/seller/medicines/:id
Content-Type: application/json
```

**Body (all fields optional):**

```json
{
  "name": "Updated Name",
  "price": 150.0,
  "stock": 200,
  "isAvailable": true
}
```

### 8.6 Remove Medicine (Seller)

```
DELETE {{baseUrl}}/api/seller/medicines/:id
```

### 8.7 Update Stock (Seller)

```
PATCH {{baseUrl}}/api/seller/medicines/:id/stock
Content-Type: application/json
```

**Body:**

```json
{
  "stock": 75
}
```

### 8.8 Get Seller's Own Medicines

> **Auth:** SELLER role

```
GET {{baseUrl}}/api/seller/medicines?page=1&limit=10&search=amox
```

**Query Parameters (all optional):**

| Param    | Type   | Description             |
| -------- | ------ | ----------------------- |
| `page`   | number | Page number             |
| `limit`  | number | Items per page          |
| `search` | string | Search by medicine name |

**Response (200):**

```json
{
  "success": true,
  "message": "Medicines fetched successfully",
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

### 8.9 Get Seller Orders

```
GET {{baseUrl}}/api/seller/orders?page=1&limit=10&status=PLACED
```

**Query Parameters (all optional):**

| Param    | Type   | Values                                                      |
| -------- | ------ | ----------------------------------------------------------- |
| `page`   | number | Page number                                                 |
| `limit`  | number | Items per page                                              |
| `status` | string | `PLACED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED` |

### 8.10 Get Seller Order by ID

```
GET {{baseUrl}}/api/seller/orders/:id
```

### 8.11 Update Order Status (Seller)

```
PATCH {{baseUrl}}/api/seller/orders/:id/status
Content-Type: application/json
```

**Body:**

```json
{
  "status": "PROCESSING"
}
```

**Valid status transitions:** `PLACED` → `PROCESSING` → `SHIPPED` → `DELIVERED`
Setting `CANCELLED` restores stock (only from `PLACED` or `PROCESSING`).

### 8.12 Get Seller Dashboard

```
GET {{baseUrl}}/api/seller/dashboard
```

**Response (200):**

```json
{
  "success": true,
  "message": "Dashboard data fetched successfully",
  "data": {
    "totalMedicines": 15,
    "totalSales": 42,
    "totalRevenue": 12500.0,
    "pendingOrders": 3
  }
}
```

> `totalRevenue` and `totalSales` only count items from **DELIVERED** seller orders.

---

## 10. Reviews

### 9.1 Get Medicine Reviews (Public)

```
GET {{baseUrl}}/api/medicines/:medicineId/reviews
```

**Response (200):**

```json
{
  "success": true,
  "message": "Reviews fetched successfully",
  "data": {
    "reviews": [ ... ],
    "averageRating": 4.2,
    "count": 12
  }
}
```

### 9.2 Create Review (Customer)

> **Auth:** CUSTOMER role

```
POST {{baseUrl}}/api/medicines/:medicineId/reviews
Content-Type: application/json
```

**Body:**

```json
{
  "rating": 5,
  "comment": "Great medicine, fast delivery!"
}
```

> `rating` must be 1–5. One review per user per medicine.

### 9.3 Update Review (Customer)

```
PATCH {{baseUrl}}/api/reviews/:reviewId
Content-Type: application/json
```

**Body:**

```json
{
  "rating": 4,
  "comment": "Updated my review"
}
```

### 9.4 Delete Review (Customer or Admin)

```
DELETE {{baseUrl}}/api/reviews/:reviewId
```

> Customers can only delete their own review. Admins can delete any review.

---

## 11. Admin

> **Auth:** ADMIN role (all endpoints)

### 10.1 Get Admin Dashboard

```
GET {{baseUrl}}/api/admin/dashboard
```

**Response (200):**

```json
{
  "success": true,
  "message": "Dashboard data fetched successfully",
  "data": {
    "totalUsers": 150,
    "totalOrders": 320,
    "totalRevenue": 85000.0,
    "totalMedicines": 200,
    "totalSellers": 12
  }
}
```

> `totalOrders` excludes fully-cancelled orders. `totalRevenue` only includes orders with `paymentStatus: PAID` (i.e., all seller orders delivered).

### 10.2 Get Users

```
GET {{baseUrl}}/api/admin/users?page=1&limit=10&role=CUSTOMER&search=john
```

**Query Parameters (all optional):**

| Param    | Type   | Values                        |
| -------- | ------ | ----------------------------- |
| `page`   | number | Page number                   |
| `limit`  | number | Items per page                |
| `role`   | string | `CUSTOMER`, `SELLER`, `ADMIN` |
| `search` | string | Search by name or email       |

### 10.3 Ban / Unban User

```
PATCH {{baseUrl}}/api/admin/users/:userId/ban
Content-Type: application/json
```

**Body:**

```json
{
  "isBanned": true
}
```

> Cannot ban yourself or another admin.

### 10.4 Get All Orders

```
GET {{baseUrl}}/api/admin/orders?page=1&limit=10&status=PLACED&date=2025-03-10&seller=sellerId
```

**Query Parameters (all optional):**

| Param    | Type   | Values                                                      |
| -------- | ------ | ----------------------------------------------------------- |
| `page`   | number | Page number                                                 |
| `limit`  | number | Items per page                                              |
| `status` | string | `PLACED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED` |
| `date`   | string | Filter by date (YYYY-MM-DD)                                 |
| `seller` | string | Filter by seller profile ID                                 |

### 10.5 Get All Medicines

```
GET {{baseUrl}}/api/admin/medicines?page=1&limit=10&search=amox&seller=sellerId&category=categoryId
```

**Query Parameters (all optional):**

| Param      | Type   | Description             |
| ---------- | ------ | ----------------------- |
| `page`     | number | Page number             |
| `limit`    | number | Items per page          |
| `search`   | string | Search by medicine name |
| `seller`   | string | Filter by seller ID     |
| `category` | string | Filter by category ID   |

---

## 12. Error Responses

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

### Common HTTP Status Codes

| Code | Meaning                                           |
| ---- | ------------------------------------------------- |
| 400  | Bad request / validation error                    |
| 401  | Not authenticated (no session cookie)             |
| 403  | Forbidden (wrong role or banned)                  |
| 404  | Resource not found                                |
| 409  | Conflict (duplicate entry, e.g. duplicate review) |
| 500  | Internal server error                             |

### Prisma-Specific Errors

| Scenario               | Status | Message Example                             |
| ---------------------- | ------ | ------------------------------------------- |
| Unique constraint fail | 409    | `"A record with this value already exists"` |
| Record not found       | 404    | `"Record not found"`                        |
| Foreign key failure    | 400    | `"Related record not found"`                |
| Validation error       | 400    | `"Invalid data provided"`                   |
