# Technical Plan: Public Store & Member Identification

## 1. How to Identify if a Buyer is a Gym Member?

We will implement a **Automatic Detection System** using two methods:

### Method A: The "Logged In" Check (Best for App/Website Users)
If the user is already logged into your Member Portal/App when they visit the store:
1.  The system detects their **User ID**.
2.  When they buy, the sale is automatically saved with `memberId: "12345"`.
3.  **Admin Panel Result**: You see their Name, Photo, and "Active Member" badge on the order.

### Method B: The "Phone Number Match" (For Guests/Walk-ins)
If a user is **not** logged in (or just walks into the gym) and buys as a "Guest":
1.  They must enter their **email id ** at checkout.
2.  The backend runs a smart check: `Does this  email id exist in our Members Database?`
3.  **If Match Found**: The system automatically links the sale to that Member, or flags it as **"Registered Member (Guest Checkout)"**.

---

## 2. Revised Workflow

### User Side (Public Store Page)
1.  **Product Catalog**: Anyone can see products (Protein, Gear, etc.).
2.  **Cart & Checkout**:
    *   **If Logged In**: No form to fill. Click "Pay/Order".
    *   **If Guest**: Fill "Name" & "Phone".
3.  **Payment**:
    *   **Pay Now**: GPAY QR code .
    * Cash 
    i want payment module same as gym payment module.

### Admin Side (Tracking)
We will add a **"Store Orders"** page in your Admin Panel.
columns:
*   **Date**
*   **Customer**:
    *   Shows **Member Name & Plan** (if Member).
    *   Shows **Guest Name** (if Outsider).
*   **Items**: e.g., "1kg Whey Protein".
*   **Status**: Paid / Unpaid.
*   **Action**: Mark Paid / View Details.

---

## 3. Database Design Update

We will use this schema to support both types of buyers:

```javascript
const StoreSaleSchema = new mongoose.Schema({
  // If Member
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // If Guest
  guestDetails: {
    name: String,
    phone: String,
    email: String
  },
  // Order Details
  items: [{
    product: { type: ObjectId, ref: 'Product' },
    quantity: Number,
    priceAtSale: Number
  }],
  totalAmount: Number,
  paidAmount: Number,
  paymentStatus: { type: String, enum: ['paid', 'partial', 'unpaid'] }
});
```

---

## 4. Next Steps

Since you want the Admin Panel integration **and** the Public Store Page, I will start by building the **Backend Foundation**.

**Phase 1 Tasks:**
1.  Create `Product` & `Category` Models.
2.  Create `StoreSale` Model (with the Member/Guest logic).
3.  Create Admin APIs (to add products).
4.  Create Public APIs (to fetch products).

Shall I begin with **Phase 1 (Backend Models)** now?
