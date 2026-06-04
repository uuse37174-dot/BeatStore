import React, { useState, useEffect } from "react";
import { BookOpen, ShoppingBag, ShieldAlert, ShoppingCart, LogOut, Lock, KeyRound, AlertCircle, Info, ChevronRight, Search } from "lucide-react";
import { Post, Product, Order, PaymentSettings, SalesStats, SiteTexts } from "./types";
import BlogView from "./components/BlogView";
import ShopView, { CartItem } from "./components/ShopView";
import AdminPanel from "./components/AdminPanel";
import CheckoutModal from "./components/CheckoutModal";
import TrackingView from "./components/TrackingView";
import AuthScreen from "./components/AuthScreen";

// Firebase Integration imports
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from "firebase/auth";
import { db, auth, googleProvider, handleFirestoreError, OperationType } from "./firebase";

export default function App() {
  const [activeView, setActiveView] = useState<'journal' | 'store' | 'admin' | 'track'>('journal');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [siteTexts, setSiteTexts] = useState<SiteTexts>({
    brandName: "Dayal Pal",
    subLabel: "Aesthetics journal",
    heroPill: "Creative Hub & Journal",
    heroTitle: "Fresh Audio Formulae & Production Aesthetics",
    heroDescription: "Sharing industry insights, creator tutorials, and sound templates. Explore the store to support the channel and speed up your workflow!",
    heroButton: "Browse Production Shop",
    footerCopyrightName: "Dayal Pal"
  });

  // Storage states
  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    activeMethod: 'gpay_qr',
    gpayUpid: 'dp4737187@okicici',
    gpayName: 'Dayal Pal',
    bankName: 'Reserve Credit Bank',
    bankAccount: '98765432101',
    bankIfsc: 'RCBK0001234',
    useBackupQr: true,
    instagramLink: "https://instagram.com/dayal_pal",
    messengerLink: "https://m.me/dayal_pal",
    whatsAppLink: "https://wa.me/911234567890",
    enableWhatsApp: true
  });
  
  // Admin stats, orders & logs
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<SalesStats>({
    totalSales: 0,
    totalOrders: 0,
    verifiedOrders: 0,
    pendingOrders: 0,
    categorySales: [],
    dailyRevenue: []
  });
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [customInputs, setCustomInputs] = useState<any[]>([]);

  // Cart configuration state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Global loading states
  const [appLoading, setAppLoading] = useState(true);

  // Subscribe to Firebase Authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && user.email === "uuse37174@gmail.com") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Automatic seeding routine to guarantee database presence on first launch
  const seedAllCollectionsIfEmpty = async () => {
    if (!isAdmin) return;
    try {
      const postsSnapshot = await getDocs(collection(db, "posts"));
      if (postsSnapshot.empty) {
        const initialPosts = [
          {
            id: "post-1",
            title: "The Ultimate Guide to Indie Beat Production",
            category: "Music Production",
            content: "Creating high-fidelity, commercially competitive instrumental beats from a home setup requires attention to three fundamental areas: gain staging, melodic texturing, and drum carving.\n\nFirst, always make sure to keep your individual element tracks around -12dBFS to maintain peak headroom at the master bus. Second, layers should serve a structural purpose; mixing a pad, an arp, and a lead is fine, but make sure they don't fight for the same 400Hz - 2kHz frequencies.\n\nIn our digital shop, we have released our Vol. 1 Exclusive Beat Pack where we apply these exact formulas. Grab it in the store tab!",
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            image: "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?q=80&w=600&auto=format&fit=crop",
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
            image: "https://images.unsplash.com/photo-1525362081669-2b476bb628c3?q=80&w=600&auto=format&fit=crop",
            comments: []
          }
        ];
        for (const pst of initialPosts) {
          await setDoc(doc(db, "posts", pst.id), pst);
        }
      }

      const productsSnapshot = await getDocs(collection(db, "products"));
      if (productsSnapshot.empty) {
        const initialProducts = [
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
        ];
        for (const prd of initialProducts) {
          await setDoc(doc(db, "products", prd.id), prd);
        }
      }

      const payRef = doc(db, "paymentSettings", "config");
      const paySnap = await getDoc(payRef);
      if (!paySnap.exists()) {
        await setDoc(payRef, {
          activeMethod: "gpay_qr",
          gpayUpid: "dp4737187@okicici",
          gpayName: "Dayal Pal",
          bankName: "Reserve Credit Bank",
          bankAccount: "98765432101",
          bankIfsc: "RCBK0001234",
          useBackupQr: true,
          instagramLink: "https://instagram.com/dayal_pal",
          messengerLink: "https://m.me/dayal_pal",
          whatsAppLink: "https://wa.me/911234567890",
          enableWhatsApp: true
        });
      }

      const siteTextsRef = doc(db, "siteTexts", "config");
      const siteTextsSnap = await getDoc(siteTextsRef);
      if (!siteTextsSnap.exists()) {
        await setDoc(siteTextsRef, {
          brandName: "Dayal Pal",
          subLabel: "Aesthetics Journal",
          heroPill: "Creative Hub & Journal",
          heroTitle: "Fresh Audio Formulae & Production Aesthetics",
          heroDescription: "Sharing industry insights, creator tutorials, and sound templates. Explore the store to support the channel and speed up your workflow!",
          heroButton: "Browse Production Shop",
          footerCopyrightName: "Dayal Pal"
        });
      }

      const customInputsRef = doc(db, "customInputs", "config");
      const customInputsSnap = await getDoc(customInputsRef);
      if (!customInputsSnap.exists()) {
        await setDoc(customInputsRef, {
          fields: [
            { id: "field-1", label: "Discord Handle (Optional)", placeholder: "creative#9999", required: false },
            { id: "field-2", label: "Instagram Username (Optional)", placeholder: "@creative_aesthetics", required: false }
          ]
        });
      }

      const catRef = doc(db, "categories", "config");
      const catSnap = await getDoc(catRef);
      if (!catSnap.exists()) {
        await setDoc(catRef, {
          list: ["Music Production", "Design Tools", "Updates", "General"]
        });
      }

      const ordersSnapshot = await getDocs(collection(db, "orders"));
      if (ordersSnapshot.empty) {
        const initialOrders = [
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
        ];
        for (const ord of initialOrders) {
          await setDoc(doc(db, "orders", ord.id), ord);
        }
      }
    } catch (e) {
      console.error("Initialization seeding error:", e);
    }
  };

  // Fetch Firestore Datasets
  const fetchAllData = async () => {
    try {
      await seedAllCollectionsIfEmpty();

      let postsList: Post[] = [];
      try {
        const postsSnap = await getDocs(collection(db, "posts"));
        postsSnap.forEach(doc => {
          postsList.push(doc.data() as Post);
        });
        postsList.sort((a, b) => b.date.localeCompare(a.date));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "posts");
      }

      let productsList: Product[] = [];
      try {
        const productsSnap = await getDocs(collection(db, "products"));
        productsSnap.forEach(doc => {
          productsList.push(doc.data() as Product);
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "products");
      }

      let categoriesList: string[] = [];
      try {
        const catSnap = await getDoc(doc(db, "categories", "config"));
        if (catSnap.exists()) {
          categoriesList = catSnap.data().list || [];
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, "categories/config");
      }

      let paymentSettingsData = paymentSettings;
      try {
        const paySnap = await getDoc(doc(db, "paymentSettings", "config"));
        if (paySnap.exists()) {
          paymentSettingsData = paySnap.data() as PaymentSettings;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, "paymentSettings/config");
      }

      let siteTextsData = siteTexts;
      try {
        const siteTextsSnap = await getDoc(doc(db, "siteTexts", "config"));
        if (siteTextsSnap.exists()) {
          siteTextsData = siteTextsSnap.data() as SiteTexts;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, "siteTexts/config");
      }

      let customInputsData: any[] = [];
      try {
        const customInputsSnap = await getDoc(doc(db, "customInputs", "config"));
        if (customInputsSnap.exists()) {
          customInputsData = customInputsSnap.data().fields || [];
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, "customInputs/config");
      }

      setPosts(postsList);
      setProducts(productsList);
      setCategories(categoriesList);
      setPaymentSettings(paymentSettingsData);
      setCustomInputs(customInputsData);
      setSiteTexts(siteTextsData);

      if (isAdmin) {
        await fetchAdminDetails();
      }
    } catch (err) {
      console.error("Failed to boot core data stores:", err);
    } finally {
      setAppLoading(false);
    }
  };

  const fetchAdminDetails = async () => {
    try {
      let ordersList: Order[] = [];
      try {
        const ordersSnap = await getDocs(collection(db, "orders"));
        ordersSnap.forEach(doc => {
          ordersList.push(doc.data() as Order);
        });
        ordersList.sort((a, b) => b.date.localeCompare(a.date));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "orders");
      }

      let emailLogsList: any[] = [];
      try {
        const emailLogsSnap = await getDocs(collection(db, "emailLogs"));
        emailLogsSnap.forEach(doc => {
          emailLogsList.push(doc.data());
        });
        emailLogsList.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "emailLogs");
      }

      setOrders(ordersList);
      setEmailLogs(emailLogsList);

      // Recalculate sales figures client-side for live analytics
      let totalSales = 0;
      let verifiedCount = 0;
      let pendingCount = 0;
      const categorySalesMap: { [cat: string]: number } = {};
      const revenueByDateMap: { [date: string]: number } = {};

      ordersList.forEach((ord: any) => {
        if (ord.status === "Verified" || ord.status === "Completed") {
          totalSales += ord.total;
          verifiedCount++;
          
          if (ord.items && Array.isArray(ord.items)) {
            ord.items.forEach((item: any) => {
              const matchedProd = products.find(p => p.id === item.productId || p.name === item.name);
              const cat = matchedProd?.category || "Other";
              categorySalesMap[cat] = (categorySalesMap[cat] || 0) + (item.price * item.quantity);
            });
          }

          const rawDate = ord.date || new Date().toISOString();
          const dateStr = rawDate.split("T")[0];
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

      setStats({
        totalSales: Math.round(totalSales * 100) / 100,
        totalOrders: ordersList.length,
        verifiedOrders: verifiedCount,
        pendingOrders: pendingCount,
        categorySales,
        dailyRevenue
      });
    } catch (err) {
      console.error("Failed to load secure admin datasets:", err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [isAdmin]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "true" || window.location.hash === "#admin") {
      setShowLoginModal(true);
    }
  }, []);



  const handleAdminLogout = async () => {
    try {
      localStorage.removeItem("custom_auth_user");
      setCurrentUser(null);
      await signOut(auth);
    } catch (err) {
      console.error("Failed signing out from firebase auth:", err);
    }
    setIsAdmin(false);
    setActiveView('journal');
  };

  // 2. Client Shopping Cart Methods
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // 3. Readers Interactions: add comment to backend posts
  const handleAddComment = async (postId: string, author: string, content: string) => {
    try {
      const postRef = doc(db, "posts", postId);
      const postSnap = await getDoc(postRef);
      if (!postSnap.exists()) {
        throw new Error("Post not found");
      }
      const postData = postSnap.data() as Post;
      const newComment = {
        id: "comm-" + Date.now(),
        author: author || "Anonymous Reader",
        content: content || "",
        date: new Date().toISOString()
      };
      const updatedComments = [...(postData.comments || []), newComment];
      
      await updateDoc(postRef, { comments: updatedComments });
      await fetchAllData();
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.UPDATE, `posts/${postId}`);
    }
  };

  // 4. Secure checkout submission
  const handleSubmitOrder = async (orderData: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    paymentMethodUsed: string;
    transactionId: string;
    bankName?: string;
  }) => {
    try {
      const itemsPayload = cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      }));

      const total = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

      // Verify transaction reference uniqueness
      const ordersSnapshot = await getDocs(collection(db, "orders"));
      let isDuplicate = false;
      ordersSnapshot.forEach((doc) => {
        const ord = doc.data();
        if (ord.paymentDetails?.transactionId === orderData.transactionId) {
          isDuplicate = true;
        }
      });
      if (isDuplicate) {
        throw new Error("This transaction reference has already been submitted for evaluation.");
      }

      const orderId = "ORD-" + Math.floor(1000 + Math.random() * 9000);
      const destinationEmail = "beatbounce181@gmail.com";

      const newOrder = {
        id: orderId,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone || "",
        items: itemsPayload,
        total,
        paymentMethodUsed: orderData.paymentMethodUsed,
        paymentDetails: {
          transactionId: orderData.transactionId,
          timestamp: new Date().toISOString(),
          bankName: orderData.bankName || ""
        },
        status: "Pending",
        emailSent: true,
        emailRecipient: destinationEmail,
        date: new Date().toISOString(),
        customFields: {}
      };

      await setDoc(doc(db, "orders", orderId), newOrder);

      // Log action receipt
      const emailSubject = `Secure Transaction Received: Order ${orderId} (${orderData.customerName}) - ₹${total.toFixed(2)}`;
      const emailBody = `
SECURE TRANSACTION LOG FOR ADMIN (FIRESTORE)
========================================
Order Reference: ${orderId}
Submitted At: ${new Date().toLocaleString()}
Customer Details:
  - Name: ${orderData.customerName}
  - Email: ${orderData.customerEmail}
  - Phone: ${orderData.customerPhone || "N/A"}

Purchase Specifications:
${itemsPayload.map((it: any) => `  * ${it.name} [x${it.quantity}] - ₹${(it.price * it.quantity).toFixed(2)}`).join("\n")}

Payment Declaration:
  - Method Selected: ${orderData.paymentMethodUsed}
  - Reported Transaction ID: ${orderData.transactionId}
  - Bank Name / Notes: ${orderData.bankName || "None Provided"}
  - Timestamp of Action: ${new Date().toISOString()}

SYSTEM STATUS: 
  - Status is set to "PENDING AUTO-LEDGER"
========================================
[END REPORT]
      `;

      const logId = "elog-" + Date.now();
      await setDoc(doc(db, "emailLogs", logId), {
        id: logId,
        timestamp: new Date().toISOString(),
        to: destinationEmail,
        subject: emailSubject,
        body: emailBody
      });

      setCart([]);
      await fetchAllData();
      return newOrder;
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.CREATE, "orders");
    }
  };

  // 5. Admin Hub Actions
  const handleUpdateCustomInputs = async (inputs: any[]) => {
    try {
      await setDoc(doc(db, "customInputs", "config"), { fields: inputs });
      await fetchAllData();
    } catch (err) {
      console.error("Failed updating custom inputs:", err);
      handleFirestoreError(err, OperationType.UPDATE, "customInputs/config");
    }
  };

  const handleAddPost = async (post: { title: string; category: string; content: string; image?: string }) => {
    try {
      const id = "post-" + Date.now();
      const newPost = {
        id,
        title: post.title || "Untitled Post",
        category: post.category || "General",
        content: post.content || "",
        date: new Date().toISOString(),
        comments: [],
        image: post.image || ""
      };
      await setDoc(doc(db, "posts", id), newPost);
      await fetchAllData();
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.CREATE, "posts");
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      await deleteDoc(doc(db, "posts", id));
      await fetchAllData();
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.DELETE, `posts/${id}`);
    }
  };

  const handleAddProduct = async (prod: { 
    name: string; 
    description: string; 
    price: number; 
    category: string; 
    image: string; 
    allowedCheckoutMode?: 'both' | 'direct_only' | 'chat_only';
    instagramLink?: string;
    messengerLink?: string;
    whatsAppLink?: string;
  }) => {
    try {
      const id = "prod-" + Date.now();
      const newProduct = {
        id,
        name: prod.name || "Unnamed Product",
        description: prod.description || "",
        price: Number(prod.price) || 0,
        category: prod.category || "General",
        image: prod.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop",
        allowedCheckoutMode: prod.allowedCheckoutMode || 'both',
        instagramLink: prod.instagramLink || "",
        messengerLink: prod.messengerLink || "",
        whatsAppLink: prod.whatsAppLink || ""
      };
      await setDoc(doc(db, "products", id), newProduct);
      await fetchAllData();
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.CREATE, "products");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, "products", id));
      await fetchAllData();
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    }
  };

  const handleAddCategory = async (category: string) => {
    try {
      if (category && !categories.includes(category)) {
        const nextList = [...categories, category];
        await setDoc(doc(db, "categories", "config"), { list: nextList });
        await fetchAllData();
      }
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.UPDATE, "categories/config");
    }
  };

  const handleUpdatePaymentSettings = async (settings: Partial<PaymentSettings>) => {
    try {
      const updated = { ...paymentSettings, ...settings };
      await setDoc(doc(db, "paymentSettings", "config"), updated);
      await fetchAllData();
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.UPDATE, "paymentSettings/config");
    }
  };

  const handleUpdateSiteTexts = async (texts: Partial<SiteTexts>) => {
    try {
      const updated = { ...siteTexts, ...texts };
      await setDoc(doc(db, "siteTexts", "config"), updated);
      await fetchAllData();
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.UPDATE, "siteTexts/config");
    }
  };

  const handleVerifyOrder = async (id: string, status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' | 'Verified') => {
    try {
      const orderRef = doc(db, "orders", id);
      await updateDoc(orderRef, { status });
      await fetchAllData();
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.UPDATE, `orders/${id}`);
    }
  };

  const handleTrackQuery = async (queryStr: string) => {
    try {
      const ordersSnapshot = await getDocs(collection(db, "orders"));
      const matched: any[] = [];
      const q = queryStr.toLowerCase().trim();
      ordersSnapshot.forEach((doc) => {
        const ord = doc.data();
        if (
          ord.id?.toLowerCase() === q ||
          ord.customerEmail?.toLowerCase() === q
        ) {
          matched.push(ord);
        }
      });
      return matched;
    } catch (err) {
      console.error("Firestore tracking query failed:", err);
      handleFirestoreError(err, OperationType.LIST, "orders");
      return [];
    }
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  if (appLoading || authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center font-sans space-y-4">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-mono">Securing environment & loading databases...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-150 flex flex-col justify-between font-sans selection:bg-indigo-600/10 selection:text-indigo-500">
      
      {/* Top Navigation Frame */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-850/65 py-4 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo brand */}
          <div 
            onClick={() => setActiveView('journal')}
            onDoubleClick={() => {
              setShowLoginModal(true);
            }}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 select-none"
            title="Double-click to sign in"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-600/15">
              {siteTexts.brandName ? siteTexts.brandName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "DP"}
            </div>
            <div>
              <span className="text-sm font-black text-slate-900 dark:text-white leading-none block tracking-wide font-sans">{siteTexts.brandName}</span>
              <span className="text-[10px] text-indigo-600 font-mono font-medium block mt-0.5 uppercase tracking-widest">{siteTexts.subLabel}</span>
            </div>
          </div>

          {/* Navigation selectors and Tabs */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setActiveView('journal');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition ${
                activeView === 'journal'
                  ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Journal
            </button>

            <button
              onClick={() => {
                setActiveView('store');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition ${
                activeView === 'store'
                  ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Store
            </button>

            <button
              onClick={() => {
                setActiveView('track');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition ${
                activeView === 'track'
                  ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
              }`}
            >
              <Search className="w-4 h-4" />
              Track Order
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  setActiveView('admin');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition ${
                  activeView === 'admin'
                    ? "bg-slate-100 dark:bg-slate-800 text-orange-600 dark:text-orange-400"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                Console
              </button>
            )}
          </div>

          {/* Right utility buttons: login/logout/shopping-cart */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt={currentUser.displayName || "User"} 
                      className="w-5 h-5 rounded-full object-cover shrink-0" 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-[10px] uppercase">
                      {currentUser.email?.slice(0, 2)}
                    </div>
                  )}
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 max-w-[100px] truncate sm:max-w-none">
                    {currentUser.displayName || currentUser.email}
                  </span>
                  {isAdmin && (
                    <span className="bg-orange-500/10 text-orange-500 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md border border-orange-500/25">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={handleAdminLogout}
                  title="Sign Out"
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-650 dark:hover:bg-red-950/30 text-slate-500 cursor-pointer flex items-center justify-center transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                title="Sign In / Register Account"
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 cursor-pointer flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition"
              >
                <Lock className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Body container */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
        {activeView === 'journal' && (
          <BlogView
            posts={posts}
            categories={categories}
            isAdmin={isAdmin}
            onAddComment={handleAddComment}
            onNavigateToShop={() => setActiveView('store')}
            siteTexts={siteTexts}
          />
        )}

        {activeView === 'store' && (
          <ShopView
            products={products}
            cart={cart}
            paymentSettings={paymentSettings}
            onAddToCart={handleAddToCart}
            onUpdateCartQuantity={handleUpdateCartQuantity}
            onRemoveFromCart={handleRemoveFromCart}
            onOpenCheckout={() => {
              setIsCheckoutOpen(true);
            }}
          />
        )}

        {activeView === 'track' && (
          <TrackingView
            onNavigateToShop={() => setActiveView('store')}
            onTrackQuery={handleTrackQuery}
          />
        )}

        {activeView === 'admin' && isAdmin && (
          <AdminPanel
            posts={posts}
            products={products}
            categories={categories}
            orders={orders}
            paymentSettings={paymentSettings}
            stats={stats}
            emailLogs={emailLogs}
            siteTexts={siteTexts}
            customInputs={customInputs}
            onUpdateCustomInputs={handleUpdateCustomInputs}
            onAddPost={handleAddPost}
            onDeletePost={handleDeletePost}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            onAddCategory={handleAddCategory}
            onUpdatePaymentSettings={handleUpdatePaymentSettings}
            onUpdateSiteTexts={handleUpdateSiteTexts}
            onVerifyOrder={handleVerifyOrder}
          />
        )}

        {activeView === 'admin' && !isAdmin && (
          <div className="max-w-md mx-auto my-12 animate-fade-in text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-150 dark:border-slate-850 shadow-xl space-y-6">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
                Access Restricted
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                The Author Console is reserved solely for verified administrator credentials. Private data streams and content controls are protected by email check.
              </p>
            </div>
            <button
              onClick={() => setShowLoginModal(true)}
              className="w-full py-3 px-5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-850 dark:hover:bg-slate-50 text-xs font-bold uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
            >
              Sign In as Admin
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      {/* Footer frame */}
      <footer className="bg-slate-100/60 dark:bg-slate-900 border-t border-slate-200/50 dark:border-slate-800/60 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-1.5 font-sans">
            <span className="font-bold text-slate-700 dark:text-slate-300 font-sans">{siteTexts.footerCopyrightName}</span>
            <span>&copy; {new Date().getFullYear()}. All Rights Reserved.</span>
          </div>

          <div className="flex gap-4 font-bold uppercase tracking-wider text-[10px]">
            <button onClick={() => setActiveView('journal')} className="hover:text-slate-800 dark:hover:text-slate-300">Journal Publication</button>
            <button onClick={() => setActiveView('store')} className="hover:text-slate-800 dark:hover:text-slate-300">Creator Shop</button>
            {isAdmin ? (
              <button onClick={() => setActiveView('admin')} className="hover:text-orange-600 dark:hover:text-orange-400 text-indigo-650">Author Console</button>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="hover:text-slate-850 dark:hover:text-slate-200">Sign In</button>
            )}
          </div>
        </div>
      </footer>

      {/* CORE MODALS */}

      {/* 1. Secure Authentication modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <AuthScreen
            siteTexts={siteTexts}
            isModal={true}
            onClose={() => setShowLoginModal(false)}
            onAuthSuccess={(user) => {
              setCurrentUser(user);
              if (user && user.email === "uuse37174@gmail.com") {
                setIsAdmin(true);
              } else {
                setIsAdmin(false);
              }
              setShowLoginModal(false);
            }}
            customPrompt={cart.length > 0 ? "Login or register to complete your order" : undefined}
          />
        </div>
      )}

      {/* 2. Secure Checkout modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        paymentSettings={paymentSettings}
        onSubmitOrder={handleSubmitOrder}
        customInputs={customInputs}
        currentUser={currentUser}
        onTrackOrder={(orderId) => {
          setActiveView('track');
          setIsCheckoutOpen(false);
        }}
      />
    </div>
  );
}
