# Niramoy Backend — Full Marketplace Testing Flow

This is a **step-by-step manual testing flow** that simulates a realistic marketplace
lifecycle. Follow the steps in order — each step depends on data created in the
previous one.

> **Prerequisites:**
>
> - Server running on `http://localhost:5000`
> - PostgreSQL database connected and migrations applied
> - Admin user seeded (`npm run seed:admin`)

---

## Step 1: Seed Admin & Verify

Run the seed script, then sign in as admin:

```
POST /api/auth/sign-in/email
{
  "email": "nirobmondal202@gmail.com",
  "password": "pass1234"
}
```

Verify admin access:

```
GET /api/admin/dashboard
```

**Expected:** `200` with `totalUsers: 1`, all other counts at 0.

> **Note:** If the admin was seeded before the `ADMIN` role typo fix, update the
> existing admin user's role in the database:
>
> ```sql
> UPDATE "user" SET role = 'ADMIN' WHERE email = 'nirobmondal202@gmail.com';
> ```

---

## Step 2: Register Customer Accounts

Sign up 2 customer accounts.

**Customer A:**

```
POST /api/auth/sign-up/email
{
  "name": "Alice Customer",
  "email": "alice@example.com",
  "password": "pass1234"
}
```

**Customer B:**

```
POST /api/auth/sign-up/email
{
  "name": "Bob Customer",
  "email": "bob@example.com",
  "password": "pass1234"
}
```

Sign in as Alice to continue:

```
POST /api/auth/sign-in/email
{ "email": "alice@example.com", "password": "pass1234" }
```

Update profile:

```
PATCH /api/users/me
{
  "phone": "01700000001",
  "address": "42 Garden Road, Dhaka"
}
```

**Checkpoint:** `GET /api/users/me` should return updated phone and address.

---

## Step 3: Create Categories (Admin)

Sign in as Admin, then create categories:

```
POST /api/categories
{ "name": "Antibiotics", "description": "Fight bacterial infections" }
```

```
POST /api/categories
{ "name": "Pain Relief", "description": "Pain and fever management" }
```

```
POST /api/categories
{ "name": "Vitamins", "description": "Dietary supplements" }
```

**Checkpoint:** `GET /api/categories` returns 3 categories. Save the IDs.

---

## Step 4: Become a Seller

Sign in as Alice (Customer A):

```
POST /api/seller/profile
{
  "storeName": "Alice Pharma",
  "address": "100 Pharmacy Lane, Dhaka",
  "contactNumber": "01800000001",
  "openingTime": "09:00 AM",
  "closingTime": "10:00 PM",
  "offDay": "Friday"
}
```

**Checkpoint:**

- Response `201` with seller profile data.
- `GET /api/users/me` should now show `"role": "SELLER"`.
- Sign out and sign back in to get the updated session cookie with role `SELLER`.

---

## Step 5: Create Manufacturers (Admin)

Sign in as Admin and create manufacturers:

```
POST /api/admin/manufacturers
{ "name": "Square Pharma" }
```

```
POST /api/admin/manufacturers
{ "name": "Beximco" }
```

```
POST /api/admin/manufacturers
{ "name": "ACI" }
```

**Checkpoint:**

- `GET /api/manufacturers` returns all manufacturers sorted by name.
- Save manufacturer IDs for medicine creation.

---

## Step 6: Add Medicines (Seller)

Sign in as Alice (now SELLER). Add medicines to different categories:

**Medicine 1:**

```
POST /api/seller/medicines
{
  "name": "Amoxicillin 500mg",
  "description": "Broad-spectrum antibiotic capsule",
  "price": 120.00,
  "stock": 50,
  "manufacturerId": "<square-manufacturer-id>",
  "dosageForm": "Capsule",
  "strength": "500mg",
  "categoryId": "<antibiotics-category-id>"
}
```

**Medicine 2:**

```
POST /api/seller/medicines
{
  "name": "Paracetamol 500mg",
  "description": "Fever and pain relief tablet",
  "price": 30.00,
  "stock": 200,
  "manufacturerId": "<beximco-manufacturer-id>",
  "dosageForm": "Tablet",
  "strength": "500mg",
  "categoryId": "<pain-relief-category-id>"
}
```

**Medicine 3:**

```
POST /api/seller/medicines
{
  "name": "Vitamin D3 2000 IU",
  "description": "Daily vitamin supplement",
  "price": 250.00,
  "stock": 30,
  "manufacturerId": "<aci-manufacturer-id>",
  "dosageForm": "Softgel",
  "strength": "2000 IU",
  "categoryId": "<vitamins-category-id>"
}
```

**Checkpoint:**

- `GET /api/medicines` returns 3 medicines with pagination.
- `GET /api/medicines?manufacturerId=<square-manufacturer-id>` returns only matching medicines.
- `GET /api/medicines?manufacturerId=<square-manufacturer-id>&categoryId=<antibiotics-category-id>&page=1&limit=10` returns combined filter + pagination result.
- `GET /api/categories/<antibiotics-id>/medicines` returns Amoxicillin.
- `GET /api/medicines/<medicine-id>` returns full details with seller, category, and manufacturer name.

---

## Step 7: Customer Shops (Cart → Checkout)

Sign in as Bob (Customer B):

**Add items to cart:**

```
POST /api/cart/items
{ "medicineId": "<amoxicillin-id>", "quantity": 2 }
```

```
POST /api/cart/items
{ "medicineId": "<paracetamol-id>", "quantity": 5 }
```

**View cart:**

```
GET /api/cart
```

**Expected:** 2 items, total = (120×2) + (30×5) = 390.00

**Update quantity:**

```
PATCH /api/cart/items/<amoxicillin-cart-item-id>
{ "quantity": 3 }
```

**Expected:** New total = (120×3) + (30×5) = 510.00

**Checkout:**

```
POST /api/orders
{
  "shippingAddress": "88 College Road",
  "shippingCity": "Chittagong",
  "phone": "01900000001",
  "notes": "Deliver between 2-5 PM"
}
```

**Checkpoint:**

- Order created with `totalPrice: 510.00`, status `PLACED`.
- `GET /api/cart` should return an empty cart (cleared after checkout).
- `GET /api/medicines/<amoxicillin-id>` — stock reduced from 50 to 47.
- `GET /api/medicines/<paracetamol-id>` — stock reduced from 200 to 195.

---

## Step 8: Seller Processes Order

Sign in as Alice (SELLER):

**View incoming orders:**

```
GET /api/seller/orders
```

**Expected:** 1 seller order with status `PLACED`, subtotal `510.00`.

**View order details:**

```
GET /api/seller/orders/<seller-order-id>
```

**Update status to PROCESSING:**

```
PATCH /api/seller/orders/<seller-order-id>/status
{ "status": "PROCESSING" }
```

**Update status to SHIPPED:**

```
PATCH /api/seller/orders/<seller-order-id>/status
{ "status": "SHIPPED" }
```

**Update status to DELIVERED:**

```
PATCH /api/seller/orders/<seller-order-id>/status
{ "status": "DELIVERED" }
```

**Checkpoint:** `GET /api/seller/dashboard` should show updated metrics.

---

## Step 9: Customer Reviews Medicine

Sign in as Bob:

**Leave a review:**

```
POST /api/medicines/<amoxicillin-id>/reviews
{
  "rating": 5,
  "comment": "Excellent quality, fast delivery!"
}
```

**View reviews:**

```
GET /api/medicines/<amoxicillin-id>/reviews
```

**Expected:** 1 review, averageRating: 5.0.

**Update the review:**

```
PATCH /api/reviews/<review-id>
{
  "rating": 4,
  "comment": "Good but packaging could be better"
}
```

**Checkpoint:** Average rating should update.

---

## Step 10: Order Cancellation (Stock Restoration)

Sign in as Bob. Place a new order:

```
POST /api/cart/items
{ "medicineId": "<vitamin-d3-id>", "quantity": 5 }
```

```
POST /api/orders
{
  "shippingAddress": "88 College Road",
  "shippingCity": "Chittagong",
  "phone": "01900000001"
}
```

**Note the Vitamin D3 stock (should be 30 - 5 = 25).**

**Cancel the order:**

```
PATCH /api/orders/<new-order-id>/cancel
```

**Checkpoint:**

- Order status changes to `CANCELLED`.
- `GET /api/medicines/<vitamin-d3-id>` — stock restored to 30.

**Seller-side cancellation test:**
Sign in as Bob, place another order for Vitamin D3 (qty: 3).
Sign in as Alice (SELLER):

```
PATCH /api/seller/orders/<seller-order-id>/status
{ "status": "CANCELLED" }
```

**Checkpoint:** Vitamin D3 stock restored (27 → 30).

---

## Step 11: Admin Operations

Sign in as Admin:

**View dashboard:**

```
GET /api/admin/dashboard
```

**Expected:** Updated counts for users, orders, medicines, sellers, revenue.

**List users with filters:**

```
GET /api/admin/users?role=CUSTOMER
GET /api/admin/users?search=bob
```

**Ban a user:**

```
PATCH /api/admin/users/<bob-user-id>/ban
{ "isBanned": true }
```

**Verify ban works:**
Sign in as Bob → `GET /api/users/me` should return `403 "Your account has been banned"`.

**Unban the user:**

```
PATCH /api/admin/users/<bob-user-id>/ban
{ "isBanned": false }
```

**View all orders:**

```
GET /api/admin/orders?status=DELIVERED
```

**View all medicines:**

```
GET /api/admin/medicines?search=amox
```

**Delete a review (admin privilege):**

```
DELETE /api/reviews/<review-id>
```

**Checkpoint:** Admin can see all data, ban/unban users, and delete reviews.

---

## Edge Cases to Test

| Test                                           | Expected Result               |
| ---------------------------------------------- | ----------------------------- |
| Sign up with existing email                    | 400/409 error                 |
| Access admin route as CUSTOMER                 | 403 Forbidden                 |
| Add to cart with invalid medicineId            | 404 Medicine not found        |
| Add to cart with quantity = 0                  | 400 Validation error          |
| Checkout with empty cart                       | 400 Cart is empty             |
| Cancel already-delivered order                 | 400 Cannot cancel             |
| Review a medicine twice (same user)            | 409 Duplicate review          |
| Review with rating = 0 or 6                    | 400 Rating must be 1-5        |
| Delete someone else's review as CUSTOMER       | 403 Forbidden                 |
| Create seller profile when already a SELLER    | 400 Already a seller          |
| Edit medicine owned by another seller          | 404 Not found                 |
| Checkout with stock exceeding quantity         | 400 Insufficient stock        |
| Access any route while banned                  | 403 Account banned            |
| Ban yourself (admin bans self)                 | 400 Cannot ban yourself       |
| Ban another admin                              | 403 Cannot ban admin          |
| Update order status backwards (SHIPPED→PLACED) | 400 Invalid status transition |
| Request non-existent route                     | 404 Not found                 |

---

## Summary of All Endpoints

| #   | Method | Path                              | Auth       | Module     |
| --- | ------ | --------------------------------- | ---------- | ---------- |
| 1   | POST   | `/api/auth/sign-up/email`         | Public     | Auth       |
| 2   | POST   | `/api/auth/sign-in/email`         | Public     | Auth       |
| 3   | GET    | `/api/auth/get-session`           | Public     | Auth       |
| 4   | POST   | `/api/auth/sign-out`              | Any        | Auth       |
| 5   | GET    | `/api/users/me`                   | Any        | Users      |
| 6   | PATCH  | `/api/users/me`                   | Any        | Users      |
| 7   | GET    | `/api/categories`                 | Public     | Categories |
| 8   | GET    | `/api/categories/:id/medicines`   | Public     | Categories |
| 9   | POST   | `/api/categories`                 | Admin      | Categories |
| 10  | PATCH  | `/api/categories/:id`             | Admin      | Categories |
| 11  | DELETE | `/api/categories/:id`             | Admin      | Categories |
| 12  | GET    | `/api/medicines`                  | Public     | Medicines  |
| 13  | GET    | `/api/medicines/:id`              | Public     | Medicines  |
| 14  | GET    | `/api/medicines/:id/reviews`      | Public     | Reviews    |
| 15  | POST   | `/api/medicines/:id/reviews`      | Customer   | Reviews    |
| 16  | PATCH  | `/api/reviews/:id`                | Customer   | Reviews    |
| 17  | DELETE | `/api/reviews/:id`                | Cust/Admin | Reviews    |
| 18  | GET    | `/api/cart`                       | Customer   | Cart       |
| 19  | POST   | `/api/cart/items`                 | Customer   | Cart       |
| 20  | PATCH  | `/api/cart/items/:id`             | Customer   | Cart       |
| 21  | DELETE | `/api/cart/items/:id`             | Customer   | Cart       |
| 22  | DELETE | `/api/cart`                       | Customer   | Cart       |
| 23  | POST   | `/api/orders`                     | Customer   | Orders     |
| 24  | GET    | `/api/orders`                     | Customer   | Orders     |
| 25  | GET    | `/api/orders/:id`                 | Customer   | Orders     |
| 26  | PATCH  | `/api/orders/:id/cancel`          | Customer   | Orders     |
| 27  | POST   | `/api/seller/profile`             | Customer   | Sellers    |
| 28  | GET    | `/api/seller/profile`             | Seller     | Sellers    |
| 29  | PATCH  | `/api/seller/profile`             | Seller     | Sellers    |
| 30  | GET    | `/api/seller/medicines`           | Seller     | Sellers    |
| 31  | POST   | `/api/seller/medicines`           | Seller     | Sellers    |
| 32  | PATCH  | `/api/seller/medicines/:id`       | Seller     | Sellers    |
| 33  | DELETE | `/api/seller/medicines/:id`       | Seller     | Sellers    |
| 34  | PATCH  | `/api/seller/medicines/:id/stock` | Seller     | Sellers    |
| 35  | GET    | `/api/seller/orders`              | Seller     | Sellers    |
| 36  | GET    | `/api/seller/orders/:id`          | Seller     | Sellers    |
| 37  | PATCH  | `/api/seller/orders/:id/status`   | Seller     | Sellers    |
| 38  | GET    | `/api/seller/dashboard`           | Seller     | Sellers    |
| 39  | GET    | `/api/admin/dashboard`            | Admin      | Admin      |
| 40  | GET    | `/api/admin/users`                | Admin      | Admin      |
| 41  | PATCH  | `/api/admin/users/:id/ban`        | Admin      | Admin      |
| 42  | GET    | `/api/admin/orders`               | Admin      | Admin      |
| 43  | GET    | `/api/admin/medicines`            | Admin      | Admin      |
