import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "data-store.json");

app.use(express.json());

// Helper to ensure database file exists with initial data
async function initDatabase() {
  try {
    await fs.access(DB_FILE);
  } catch (err) {
    const initialData = {
      posts: [
        {
          id: "post-1",
          title: "The Ultimate Guide to Indie Beat Production",
          category: "Music Production",
          content: "Creating high-fidelity, commercially competitive instrumental beats from a home setup requires attention to three fundamental areas: gain staging, melodic texturing, and drum carving.\n\nFirst, always make sure to keep your individual element tracks around -12dBFS to maintain peak headroom at the master bus. Second, layers should serve a structural purpose; mixing a pad, an arp, and a lead is fine, but make sure they don't fight for the same 400Hz - 2kHz frequencies.\n\nIn our digital shop, we have released our Vol. 1 Exclusive Beat Pack where we apply these exact formulas. Grab it in the store tab!",
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          comments: [
            {
              id: "comm-1",
              author: "Marcus K.",
              content: "This gain staging advice solved my muddy 808 issues! Thank you!",
              date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        },
        {
          id: "post-2",
          title: "Designing Seamless Creator Toolkits for Quick Workflows",
          category: "Design Tools",
          content: "As digital creators, speed is our currency. When we build overlays, transitions, or preset libraries, we aim for maximum modularity.\n\nApplying clean templates and customizable color filters can reduce video edit turnarounds by up to 40%. In our latest creator toolkit, available in the products gallery, we offer Drag-And-Drop video transitions and alpha channel overlays optimized for modern compilers.",
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          comments: []
        }
      ],
      products: [
        {
          id: "prod-1",
          name: "Exclusive Beat Pack (Vol. 1)",
          description: "Premium Royalty-Free loops and stems. Includes 10 construction kits, BPM & scale key markings, and high-fidelity MIDI files.",
          price: 29.99,
          category: "Music Production",
          image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600&auto=format&fit=crop"
        },
        {
          id: "prod-2",
          name: "Digital Creator Transition Toolkit",
          description: "Unpolished transitions, sound FX, and particle overlays customized for Premiere, DaVinci, and FCPX overlays.",
          price: 14.99,
          category: "Design Tools",
          image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop"
        }
      ],
      categories: ["Music Production", "Design Tools", "Updates", "General"],
      siteTexts: {
        brandName: "Dayal Pal",
        subLabel: "Aesthetics Journal",
        heroPill: "Creative Hub & Journal",
        heroTitle: "Fresh Audio Formulae & Production Aesthetics",
        heroDescription: "Sharing industry insights, creator tutorials, and sound templates. Explore the store to support the channel and speed up your workflow!",
        heroButton: "Browse Production Shop",
        footerCopyrightName: "Dayal Pal"
      },
      paymentSettings: {
        activeMethod: "gpay_qr",
        gpayUpid: "dp4737187@okicici",
        gpayName: "Dayal Pal",
        bankName: "Reserve Credit Bank",
        bankAccount: "98765432101",
        bankIfsc: "RCBK0001234",
        useBackupQr: true
      },
      orders: [
        {
          id: "ORD-9281",
          customerName: "Alice Peterson",
          customerEmail: "alice.p@example.com",
          customerPhone: "+15550192",
          items: [
            {
              productId: "prod-1",
              name: "Exclusive Beat Pack (Vol. 1)",
              price: 29.99,
              quantity: 1
            }
          ],
          total: 29.99,
          paymentMethodUsed: "Google Pay QR Code (Dayal Pal)",
          paymentDetails: {
            transactionId: "TXN5812903829",
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
          },
          status: "Verified",
          emailSent: true,
          emailRecipient: "beatbounce181@gmail.com",
          date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "ORD-3294",
          customerName: "Bob Miller",
          customerEmail: "bob.miller@example.com",
          items: [
            {
              productId: "prod-2",
              name: "Digital Creator Transition Toolkit",
              price: 14.99,
              quantity: 2
            }
          ],
          total: 29.98,
          paymentMethodUsed: "Direct Bank Transfer",
          paymentDetails: {
            transactionId: "TXNBANK27491",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            bankName: "Chase Bank",
            accountLast4: "5521"
          },
          status: "Pending",
          emailSent: true,
          emailRecipient: "beatbounce181@gmail.com",
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
      ],
      emailLogs: [
        {
          id: "elog-1",
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          to: "beatbounce181@gmail.com",
          subject: "Secure Transaction Received: Order ORD-9281 Verified - ₹29.99",
          body: "Secure Order Notification!\n\nOrder ID: ORD-9281\nCustomer: Alice Peterson (alice.p@example.com)\nTotal paid: ₹29.99\nPayment Method: Google Pay QR Code (Dayal Pal)\nVerification: Verified on GPay UPI network.\nTransaction reference: TXN5812903829"
        }
      ]
    };
    await fs.writeFile(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
  }
}

async function readData() {
  await initDatabase();
  const raw = await fs.readFile(DB_FILE, "utf-8");
  const data = JSON.parse(raw);
  let updated = false;
  if (!data.siteTexts) {
    data.siteTexts = {
      brandName: "Dayal Pal",
      subLabel: "Aesthetics Journal",
      heroPill: "Creative Hub & Journal",
      heroTitle: "Fresh Audio Formulae & Production Aesthetics",
      heroDescription: "Sharing industry insights, creator tutorials, and sound templates. Explore the store to support the channel and speed up your workflow!",
      heroButton: "Browse Production Shop",
      footerCopyrightName: "Dayal Pal"
    };
    updated = true;
  }
  if (!data.customInputs) {
    data.customInputs = [
      { id: "field-1", label: "Discord Handle (Optional)", placeholder: "creative#9999", required: false },
      { id: "field-2", label: "Instagram Username (Optional)", placeholder: "@creative_aesthetics", required: false }
    ];
    updated = true;
  }
  if (updated) {
    await writeData(data);
  }
  return data;
}

async function writeData(data: any) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// ----------------------
// API ROUTES
// ----------------------

// Strict owner passcode check middleware to protect writing endpoints
const checkAdminPasscode = (req: any, res: any, next: any) => {
  const passcode = req.headers["x-admin-passcode"];
  if (passcode !== "Dayal@123Avijit@123") {
    return res.status(403).json({ error: "Unauthorized: Only the verified panel owner with the correct passcode is permitted to execute this action." });
  }
  next();
};

// Checkout custom extra inputs configuration endpoints
app.get("/api/custom-inputs", async (req, res) => {
  try {
    const data = await readData();
    res.json(data.customInputs || []);
  } catch (error) {
    res.status(500).json({ error: "Failed to read custom inputs" });
  }
});

app.post("/api/custom-inputs", checkAdminPasscode, async (req, res) => {
  try {
    const data = await readData();
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ error: "Payload must be an array of fields." });
    }
    data.customInputs = req.body;
    await writeData(data);
    res.json(data.customInputs);
  } catch (error) {
    res.status(500).json({ error: "Failed to write custom inputs" });
  }
});

// 1. Posts API
app.get("/api/posts", async (req, res) => {
  try {
    const data = await readData();
    res.json(data.posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to read posts" });
  }
});

app.post("/api/posts", checkAdminPasscode, async (req, res) => {
  try {
    const data = await readData();
    const newPost = {
      id: "post-" + Date.now(),
      title: req.body.title || "Untitled Post",
      category: req.body.category || "General",
      content: req.body.content || "",
      date: new Date().toISOString(),
      comments: [],
      image: req.body.image || ""
    };
    data.posts.unshift(newPost);
    await writeData(data);
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: "Failed to create post" });
  }
});

app.delete("/api/posts/:id", checkAdminPasscode, async (req, res) => {
  try {
    const data = await readData();
    const beforeLength = data.posts.length;
    data.posts = data.posts.filter((p: any) => p.id !== req.params.id);
    if (beforeLength === data.posts.length) {
      return res.status(404).json({ error: "Post not found" });
    }
    await writeData(data);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete post" });
  }
});

// 2. Comments API
app.post("/api/posts/:id/comments", async (req, res) => {
  try {
    const data = await readData();
    const post = data.posts.find((p: any) => p.id === req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const newComment = {
      id: "comm-" + Date.now(),
      author: req.body.author || "Anonymous Reader",
      content: req.body.content || "",
      date: new Date().toISOString()
    };
    post.comments.push(newComment);
    await writeData(data);
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// 3. Products API
app.get("/api/products", async (req, res) => {
  try {
    const data = await readData();
    res.json(data.products);
  } catch (error) {
    res.status(500).json({ error: "Failed to read products" });
  }
});

app.post("/api/products", checkAdminPasscode, async (req, res) => {
  try {
    const data = await readData();
    const newProduct = {
      id: "prod-" + Date.now(),
      name: req.body.name || "Unnamed Product",
      description: req.body.description || "",
      price: Number(req.body.price) || 0,
      category: req.body.category || "General",
      image: req.body.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop"
    };
    data.products.push(newProduct);
    await writeData(data);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

app.delete("/api/products/:id", checkAdminPasscode, async (req, res) => {
  try {
    const data = await readData();
    data.products = data.products.filter((p: any) => p.id !== req.params.id);
    await writeData(data);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// 4. Categories API
app.get("/api/categories", async (req, res) => {
  try {
    const data = await readData();
    res.json(data.categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve categories" });
  }
});

app.post("/api/categories", checkAdminPasscode, async (req, res) => {
  try {
    const data = await readData();
    const category = req.body.category;
    if (category && !data.categories.includes(category)) {
      data.categories.push(category);
      await writeData(data);
    }
    res.json(data.categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to save category" });
  }
});

// 5. Payment Settings API
app.get("/api/payment-settings", async (req, res) => {
  try {
    const data = await readData();
    res.json(data.paymentSettings);
  } catch (error) {
    res.status(500).json({ error: "Failed to load payment settings" });
  }
});

app.post("/api/payment-settings", checkAdminPasscode, async (req, res) => {
  try {
    const data = await readData();
    data.paymentSettings = {
      ...data.paymentSettings,
      ...req.body
    };
    await writeData(data);
    res.json(data.paymentSettings);
  } catch (error) {
    res.status(500).json({ error: "Failed to update payment settings" });
  }
});

// 5b. Site Custom Texts API
app.get("/api/site-texts", async (req, res) => {
  try {
    const data = await readData();
    res.json(data.siteTexts || {});
  } catch (error) {
    res.status(500).json({ error: "Failed to load site custom texts" });
  }
});

app.post("/api/site-texts", checkAdminPasscode, async (req, res) => {
  try {
    const data = await readData();
    data.siteTexts = {
      ...(data.siteTexts || {}),
      ...req.body
    };
    await writeData(data);
    res.json(data.siteTexts);
  } catch (error) {
    res.status(500).json({ error: "Failed to update site custom texts" });
  }
});

// 6. Orders & Checkout API
app.get("/api/orders/track", async (req, res) => {
  try {
    const data = await readData();
    const query = (req.query.query as string || "").trim().toLowerCase();
    if (!query) {
      return res.status(250).json([]);
    }
    const results = (data.orders || []).filter((o: any) => 
      o.id.toLowerCase() === query || 
      o.customerEmail.toLowerCase() === query
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Failed to track order details" });
  }
});

app.get("/api/orders", checkAdminPasscode, async (req, res) => {
  try {
    const data = await readData();
    res.json(data.orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to read orders" });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const data = await readData();
    const { customerName, customerEmail, customerPhone, items, total, paymentMethodUsed, paymentDetails, customFields } = req.body;

    // Server-side Checkout transaction verification
    if (!customerName || !customerEmail || !items || items.length === 0 || !total) {
      return res.status(400).json({ error: "Missing required order parameters." });
    }

    if (!paymentDetails || !paymentDetails.transactionId || paymentDetails.transactionId.trim().length === 0) {
      return res.status(400).json({ error: "Transaction ID is required to process and verify secure payments." });
    }

    // Check for duplicate transaction ID to prevent payload replay/fraud
    const duplicate = data.orders.find(
      (o: any) => o.paymentDetails?.transactionId === paymentDetails.transactionId
    );
    if (duplicate) {
      return res.status(400).json({ error: "This transaction reference has already been submitted for evaluation." });
    }

    const orderId = "ORD-" + Math.floor(1000 + Math.random() * 9000);
    const destinationEmail = "beatbounce181@gmail.com"; 

    // Render any dynamic extra checkout inputs filled by the customer
    const parsedFields = customFields || {};
    let customInputsEmailBlock = "";
    if (Object.keys(parsedFields).length > 0) {
      customInputsEmailBlock = "\nCUSTOM EXTRA INFORMATION REQUESTED BY ADMIN:\n" + 
        Object.entries(parsedFields).map(([label, val]) => `  - ${label}: ${val}`).join("\n") + "\n";
    }

    // Create secure Email Log
    const emailSubject = `Secure Transaction Received: Order ${orderId} (${customerName}) - ₹${total.toFixed(2)}`;
    const emailBody = `
SECURE TRANSACTION LOG FOR ADMIN
========================================
Order Reference: ${orderId}
Submitted At: ${new Date().toLocaleString()}
Customer Details:
  - Name: ${customerName}
  - Email: ${customerEmail}
  - Phone: ${customerPhone || "N/A"}
${customInputsEmailBlock}
Purchase Specifications:
${items.map((it: any) => `  * ${it.name} [x${it.quantity}] - ₹${(it.price * it.quantity).toFixed(2)}`).join("\n")}

Payment Declaration:
  - Method Selected: ${paymentMethodUsed}
  - Reported Transaction ID: ${paymentDetails.transactionId}
  - Bank Name / Notes: ${paymentDetails.bankName || "None Provided"}
  - Timestamp of Action: ${paymentDetails.timestamp}

SYSTEM STATUS: 
  - Status is set to "INSTANT VERIFIED"
  - Automatically dispatched files to client inbox: ${customerEmail}
========================================
[END REPORT]
    `;

    const newEmailLog = {
      id: "elog-" + Date.now(),
      timestamp: new Date().toISOString(),
      to: destinationEmail,
      subject: emailSubject,
      body: emailBody
    };

    if (!data.emailLogs) {
      data.emailLogs = [];
    }
    data.emailLogs.unshift(newEmailLog);

    // All orders start at Pending for manual administration as requested
    const finalStatus = "Pending";

    const newOrder = {
      id: orderId,
      customerName,
      customerEmail,
      customerPhone,
      items,
      total,
      paymentMethodUsed,
      paymentDetails,
      status: finalStatus,
      emailSent: true,
      emailRecipient: destinationEmail,
      date: new Date().toISOString(),
      customFields: parsedFields // Dynamic checkout user text inputs
    };

    data.orders.unshift(newOrder);
    await writeData(data);
    res.status(201).json({ success: true, order: newOrder });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit order transaction" });
  }
});

// Update Order Status (Verification)
app.post("/api/orders/:id/verify", checkAdminPasscode, async (req, res) => {
  try {
    const data = await readData();
    const order = data.orders.find((o: any) => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    order.status = req.body.status || "Verified";
    await writeData(data);
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: "Failed to verify transaction status" });
  }
});

// 7. Get Email Logs (For Admin view, highlighting secure offline transmissions)
app.get("/api/email-logs", checkAdminPasscode, async (req, res) => {
  try {
    const data = await readData();
    res.json(data.emailLogs || []);
  } catch (error) {
    res.status(500).json({ error: "Failed to load outbound logs" });
  }
});

// 8. Sales dashboard stats endpoint
app.get("/api/stats", checkAdminPasscode, async (req, res) => {
  try {
    const data = await readData();
    const orders = data.orders || [];
    
    let totalSales = 0;
    let verifiedCount = 0;
    let pendingCount = 0;
    const categorySalesMap: { [cat: string]: number } = {};
    const revenueByDateMap: { [date: string]: number } = {};

    orders.forEach((ord: any) => {
      // Calculate sales for completed/verified orders, and check pending states
      if (ord.status === "Verified" || ord.status === "Completed") {
        totalSales += ord.total;
        verifiedCount++;
        
        // Item categories
        ord.items.forEach((item: any) => {
          const prod = data.products.find((p: any) => p.id === item.productId || p.name === item.name);
          const cat = prod?.category || "Other";
          categorySalesMap[cat] = (categorySalesMap[cat] || 0) + (item.price * item.quantity);
        });

        // Revenue over days
        const rawDate = ord.date || new Date().toISOString();
        const dateStr = rawDate.split("T")[0]; // YYYY-MM-DD
        revenueByDateMap[dateStr] = (revenueByDateMap[dateStr] || 0) + ord.total;
      } else if (ord.status === "Pending" || ord.status === "In Progress") {
        pendingCount++;
      }
    });

    const dailyRevenue = Object.entries(revenueByDateMap).map(([date, amount]) => ({
      date,
      amount: Math.round(amount * 100) / 100
    })).sort((a, b) => a.date.localeCompare(b.date));

    const categorySales = Object.entries(categorySalesMap).map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100
    }));

    res.json({
      totalSales: Math.round(totalSales * 100) / 100,
      totalOrders: orders.length,
      verifiedOrders: verifiedCount,
      pendingOrders: pendingCount,
      categorySales,
      dailyRevenue
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate analytics dashboard stats" });
  }
});

// Vite Middleware & production static router
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server launched successfully on Port ${PORT}`);
  });
}

startServer();
