try {
  const dns = require("dns");
  dns.setDefaultResultOrder("ipv4first");
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const crypto = require("crypto");
const admin = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth");
require("dotenv").config();

if (!admin.apps.length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.cert(serviceAccount),
    });
  } else {
    const serviceAccount = require("./serviceAccountKey.json");
    admin.initializeApp({
      credential: admin.cert(serviceAccount),
    });
  }
}
const app = express();

app.use(cors({
  origin: [
    "https://blog-project-191p.vercel.app",
    "https://blog-project-kgv67y3z1-jayakumar-ks-projects.vercel.app",
    "http://localhost:5173",
  ],
  credentials: true,
}));
app.use(express.json());

const CASHFREE_BASE_URL = process.env.CASHFREE_BASE_URL || "https://sandbox.cashfree.com/pg";

function getCashfreeHeaders() {
  return {
    "x-client-id": process.env.CASHFREE_APP_ID,
    "x-client-secret": process.env.CASHFREE_SECRET_KEY,
    "x-api-version": process.env.CASHFREE_API_VERSION || "2025-01-01",
    "Content-Type": "application/json",
  };
}

// Prevent mongoose buffering
mongoose.set("bufferCommands", false);

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
    });

    isConnected = true;
    console.log("MongoDB Atlas Connected Successfully");
  } catch (err) {
    console.error("Connection Error:", err);
    throw err;
  }
}

// Schema
const blogSchema = new mongoose.Schema({
  newTitle: String,
  newContent: String,
  date: String,
  likes: Number,
});

const Blog = mongoose.models.Blog || mongoose.model("Blog", blogSchema);

// Vendor Feature Schema
const vendorFeatureSchema = new mongoose.Schema({
  vendorId: { type: String, required: true, unique: true },
  vendorName: { type: String, required: true },
  vendorEmail: { type: String, required: true },
  upiPayment: { type: Boolean, default: false },
  multiLanguage: { type: Boolean, default: false },
  voiceEnable: { type: Boolean, default: false },
});

const VendorFeature = mongoose.models.VendorFeature || mongoose.model("VendorFeature", vendorFeatureSchema);

const customerSchema = new mongoose.Schema({
  vendorId: { type: String, required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  firebaseUid: { type: String, required: true },
  upiPayment: { type: Boolean, default: false },
  multiLanguage: { type: Boolean, default: false },
  voiceEnable: { type: Boolean, default: false },
});

const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);

// Test Route
app.get("/", async (req, res) => {
  res.json({
    success: true,
    message: "Backend is running",
  });
});

// Get Blogs
app.get("/api/blogs", async (req, res) => {
  try {
    await connectDB();

    const blogs = await Blog.find({});
    res.json(blogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err.message,
    });
  }
});

// Like Blog
app.patch("/api/blogs/like/:id", async (req, res) => {
  try {
    await connectDB();

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        $inc: {
          likes: 1,
        },
      },
      {
        new: true,
      }
    );

    res.json(updatedBlog);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err.message,
    });
  }
});

// Add Blog
app.post("/api/blogs", async (req, res) => {
  try {
    await connectDB();

    const blog = new Blog({
      newTitle: req.body.newTitle,
      newContent: req.body.newContent,
      date: req.body.date,
      likes: req.body.likes,
    });

    const newBlog = await blog.save();

    res.status(201).json(newBlog);
  } catch (err) {
    console.error(err);
    res.status(400).json({
      message: err.message,
    });
  }
});

// Payment Routes

const VENDORS = [
  { vendorId: "g3f9iK5j8IOS1neN7McsWnFFX7n2", vendorName: "Vendor 01", vendorEmail: "vendor01@ambisoftware.com" },
  { vendorId: "fTbYHgIKRlTStnXpaxEDZPVXxI92", vendorName: "Vendor 02", vendorEmail: "vendor2@ambisoftware.com" },
];

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
const FIREBASE_SIGNUP_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`;

// Vendor Management Routes
app.post("/api/vendors", async (req, res) => {
  try {
    const { email, password, vendorName } = req.body;

    if (!email || !password || !vendorName) {
      return res.status(400).json({ message: "Email, password, and vendor name are required" });
    }

    const firebaseRes = await fetch(FIREBASE_SIGNUP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    });

    const firebaseData = await firebaseRes.json();

    if (!firebaseRes.ok) {
      const msg = firebaseData.error?.message || "Failed to create vendor in Firebase";
      return res.status(400).json({ message: msg });
    }

    await connectDB();
    const feature = new VendorFeature({
      vendorId: firebaseData.localId,
      vendorName,
      vendorEmail: email,
      upiPayment: false,
      multiLanguage: false,
      voiceEnable: false,
    });
    await feature.save();

    res.status(201).json({ vendorId: firebaseData.localId, vendorName, vendorEmail: email });
  } catch (err) {
    console.error("Create Vendor Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/api/vendors", async (req, res) => {
  try {
    await connectDB();
    const vendors = await VendorFeature.find({}, "vendorId vendorName vendorEmail");
    res.json(vendors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

app.delete("/api/vendors/:vendorId", async (req, res) => {
  try {
    await connectDB();
    await VendorFeature.deleteOne({ vendorId: req.params.vendorId });
    try {
      await getAuth().deleteUser(req.params.vendorId);
    } catch (fbErr) {
      console.log("Firebase delete skipped:", fbErr.message);
    }
    res.json({ message: "Vendor deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/vendors/:vendorId/password", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    await getAuth().updateUser(req.params.vendorId, { password });
    res.json({ message: "Password updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Customer Routes
app.get("/api/customer-by-uid/:uid", async (req, res) => {
  try {
    await connectDB();
    const customer = await Customer.findOne({ firebaseUid: req.params.uid });
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json({ customerName: customer.customerName, customerEmail: customer.customerEmail, upiPayment: customer.upiPayment, multiLanguage: customer.multiLanguage, voiceEnable: customer.voiceEnable });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});
app.get("/api/customers/:vendorId", async (req, res) => {
  try {
    await connectDB();
    const customers = await Customer.find({ vendorId: req.params.vendorId });
    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/customers", async (req, res) => {
  try {
    const { vendorId, email, password, customerName } = req.body;
    if (!vendorId || !email || !password || !customerName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const firebaseRes = await fetch(FIREBASE_SIGNUP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    });

    const firebaseData = await firebaseRes.json();
    if (!firebaseRes.ok) {
      const msg = firebaseData.error?.message || "Failed to create customer in Firebase";
      return res.status(400).json({ message: msg });
    }

    await connectDB();
    const vendorFeature = await VendorFeature.findOne({ vendorId });
    const customer = new Customer({
      vendorId,
      customerName,
      customerEmail: email,
      firebaseUid: firebaseData.localId,
      upiPayment: vendorFeature ? vendorFeature.upiPayment : false,
      multiLanguage: vendorFeature ? vendorFeature.multiLanguage : false,
      voiceEnable: vendorFeature ? vendorFeature.voiceEnable : false,
    });
    await customer.save();

    res.status(201).json({ firebaseUid: firebaseData.localId, customerName, customerEmail: email });
  } catch (err) {
    console.error("Create Customer Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.delete("/api/customers/:customerId", async (req, res) => {
  try {
    await connectDB();
    const customer = await Customer.findById(req.params.customerId);
    if (customer) {
      try {
        await getAuth().deleteUser(customer.firebaseUid);
      } catch (fbErr) {
        console.log("Firebase delete skipped:", fbErr.message);
      }
      await Customer.deleteOne({ _id: req.params.customerId });
    }
    res.json({ message: "Customer deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/customers/:customerId/password", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    const customer = await Customer.findById(req.params.customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    await getAuth().updateUser(customer.firebaseUid, { password });
    res.json({ message: "Password updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/check-user", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ exists: false });
    await getAuth().getUserByEmail(email);
    res.json({ exists: true });
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      res.json({ exists: false });
    } else {
      res.status(500).json({ exists: false, message: err.message });
    }
  }
});

// Vendor Features Routes
app.get("/api/vendor-features", async (req, res) => {
  try {
    await connectDB();
    const features = await VendorFeature.find({});
    res.json(features);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/vendor-features/:vendorId", async (req, res) => {
  try {
    await connectDB();
    const feature = await VendorFeature.findOne({ vendorId: req.params.vendorId });
    if (!feature) {
      return res.status(404).json({ message: "Vendor features not found" });
    }
    res.json(feature);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/vendor-features", async (req, res) => {
  try {
    await connectDB();
    const { vendorId, vendorName, vendorEmail, upiPayment, multiLanguage, voiceEnable } = req.body;

    let feature = await VendorFeature.findOne({ vendorId });
    if (feature) {
      feature.upiPayment = upiPayment;
      feature.multiLanguage = multiLanguage;
      feature.voiceEnable = voiceEnable;
      if (vendorName) feature.vendorName = vendorName;
      if (vendorEmail) feature.vendorEmail = vendorEmail;
      await feature.save();
    } else {
      feature = new VendorFeature({ vendorId, vendorName, vendorEmail, upiPayment, multiLanguage, voiceEnable });
      await feature.save();
    }

    await Customer.updateMany(
      { vendorId },
      { upiPayment, multiLanguage, voiceEnable }
    );

    res.status(200).json(feature);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/vendor-features/:vendorId", async (req, res) => {
  try {
    await connectDB();
    const { upiPayment, multiLanguage, voiceEnable } = req.body;

    const feature = await VendorFeature.findOneAndUpdate(
      { vendorId: req.params.vendorId },
      { upiPayment, multiLanguage, voiceEnable },
      { new: true }
    );

    if (!feature) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    await Customer.updateMany(
      { vendorId: req.params.vendorId },
      { upiPayment, multiLanguage, voiceEnable }
    );

    res.json(feature);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Payment Routes
app.post("/api/payment/orders", async (req, res) => {
  try {
    const { amount } = req.body;
    const orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

    const response = await fetch(`${CASHFREE_BASE_URL}/orders`, {
      method: "POST",
      headers: getCashfreeHeaders(),
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: "guest_user",
          customer_phone: "9999999999",
        },
        order_meta: {
          payment_methods: "upi",
        },
        order_note: "Water delivery order",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Cashfree Create Order Error:", data);
      return res.status(response.status).json({ message: "Order creation failed", error: data });
    }

    return res.status(200).json({ data });
  } catch (error) {
    console.error("Orders Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/api/payment/verify", async (req, res) => {
  try {
    const { order_id } = req.body;

    const response = await fetch(`${CASHFREE_BASE_URL}/orders/${order_id}`, {
      method: "GET",
      headers: getCashfreeHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Cashfree Verify Error:", data);
      return res.status(response.status).json({ message: "Verification failed", error: data });
    }

    if (data.order_status === "PAID") {
      return res.status(200).json({ message: "Payment verified successfully", order_status: data.order_status });
    } else {
      return res.status(200).json({ message: "Payment pending", order_status: data.order_status });
    }
  } catch (error) {
    console.error("Verify Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/api/payment/webhook", (req, res) => {
  try {
    const event = req.body;
    const eventType = event.type;
    const orderId = event.data?.order?.order_id;
    const paymentStatus = event.data?.payment?.payment_status;

    console.log(`Webhook received: ${eventType} | Order: ${orderId} | Status: ${paymentStatus}`);

    return res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

async function seedVendors() {
  try {
    await connectDB();
    for (const v of VENDORS) {
      const exists = await VendorFeature.findOne({ vendorId: v.vendorId });
      if (!exists) {
        await VendorFeature.create({
          vendorId: v.vendorId,
          vendorName: v.vendorName,
          vendorEmail: v.vendorEmail,
          upiPayment: false,
          multiLanguage: false,
          voiceEnable: false,
        });
        console.log(`Seeded vendor: ${v.vendorName}`);
      }
    }

    const allFeatures = await VendorFeature.find({});
    for (const vf of allFeatures) {
      await Customer.updateMany(
        { vendorId: vf.vendorId },
        { upiPayment: vf.upiPayment, multiLanguage: vf.multiLanguage, voiceEnable: vf.voiceEnable }
      );
    }
  } catch (err) {
    console.error("Seed error:", err.message);
  }
}

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    await seedVendors();
  });
}

module.exports = app;