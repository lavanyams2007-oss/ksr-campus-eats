import AdminDashboard from "./pages/AdminDashboard";

import AdminLogin from "./pages/AdminLogin";

import {

  BrowserRouter,

  Routes,

  Route,

  useLocation,

  useNavigate,

} from "react-router-dom";

import StudentAuth from "./pages/StudentAuth";

import MyOrders from "./pages/MyOrders";

import { useEffect, useMemo, useRef, useState } from "react";

import OrderTracking from "./pages/OrderTracking";

import {

  ArrowRight,

  Check,

  ChefHat,

  Clock3,

  Heart,

  Leaf,

  Minus,

  Plus,

  Search,

  ShoppingBag,

  ShoppingCart,

  Sparkles,

  Star,

  UtensilsCrossed,

  Wallet,

  RefreshCw,

  X,

} from "lucide-react";

import "./App.css";

const foodMenu = [

  {

    id: 1,

    name: "Masala Dosa",

    category: "Breakfast",

    price: 55,

    rating: 4.8,

    time: "12 min",

    veg: true,

    badge: "Bestseller",

    description: "Golden crispy dosa served with coconut chutney and sambar.",

    image:

      "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=85",

  },

  {

    id: 3,

    name: "Veg Fried Rice",

    category: "Lunch",

    price: 80,

    rating: 4.6,

    time: "10 min",

    veg: true,

    badge: "",

    description: "Wok-tossed rice with fresh vegetables and mild seasoning.",

    image:

      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=85",

  },

  {

    id: 4,

    name: "Paneer Burger",

    category: "Snacks",

    price: 75,

    rating: 4.7,

    time: "10 min",

    veg: true,

    badge: "Student favourite",

    description: "Crispy paneer patty, fresh lettuce and creamy sauce.",

    image:

      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85",

  },

  {

    id: 5,

    name: "Classic Sandwich",

    category: "Snacks",

    price: 50,

    rating: 4.5,

    time: "8 min",

    veg: true,

    badge: "",

    description: "Toasted bread layered with vegetables and cheese.",

    image:

      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=85",

  },

  {

    id: 6,

    name: "Cold Coffee",

    category: "Drinks",

    price: 45,

    rating: 4.7,

    time: "5 min",

    veg: true,

    badge: "Refreshing",

    description: "Chilled creamy coffee for your campus break.",

    image:

      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=85",

  },

  {

    id: 7,

    name: "Fresh Lime Juice",

    category: "Drinks",

    price: 30,

    rating: 4.4,

    time: "4 min",

    veg: true,

    badge: "",

    description: "A refreshing lime drink served chilled.",

    image:

      "https://img.magnific.com/free-photo/lemonade-glass-with-lemons-herbs-side-view-white-plaster_176474-7389.jpg?semt=ais_hybrid&w=740&q=80",

  },

  {

    id: 8,

    name: "Chocolate Brownie",

    category: "Desserts",

    price: 60,

    rating: 4.8,

    time: "6 min",

    veg: true,

    badge: "Sweet pick",

    description: "Rich chocolate brownie for a little campus treat.",

    image:

      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=85",

  },

];

const categories = [

  "All",

  "Breakfast",

  "Lunch",

  "Snacks",

  "Dinner",

  "Drinks",

  "Desserts",

];

function StudentApp() {

  const navigate = useNavigate();

  const location = useLocation();

  const isStudentLoggedIn = () =>

    Boolean(sessionStorage.getItem("ksrStudentToken"));

  const [cart, setCart] = useState([]);

  const [databaseFoods, setDatabaseFoods] = useState([]);

const [foodLoading, setFoodLoading] = useState(true);

const [foodError, setFoodError] = useState("");

  const [activeCategory, setActiveCategory] = useState("All");

  const [search, setSearch] = useState("");

  const [sortBy, setSortBy] = useState("recommended");

  const [vegOnly, setVegOnly] = useState(false);

  const [favourites, setFavourites] = useState([]);

  const [cartOpen, setCartOpen] = useState(false);

  const [selectedFood, setSelectedFood] = useState(null);

  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [orderConfirmation, setOrderConfirmation] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("counter");

  const [customerName, setCustomerName] = useState("");

  const [studentId, setStudentId] = useState("");

  const [notes, setNotes] = useState("");

  const [flyItem, setFlyItem] = useState(null);

  const [cartBump, setCartBump] = useState(false);

  const [showTracking, setShowTracking] = useState(false);

  const [activeTrackingOrder, setActiveTrackingOrder] = useState(null);

  const [showMyOrders, setShowMyOrders] = useState(false);

const [myOrders, setMyOrders] = useState([]);

const [orderLoading, setOrderLoading] = useState(false);

const [orderError, setOrderError] = useState("");

const [isRefreshing, setIsRefreshing] = useState(false);

async function refreshMyOrders() {

  const token = sessionStorage.getItem("ksrStudentToken");

  if (!token) {

    setOrderError("Please login again.");

    return;

  }

  const apiBase = (

    import.meta.env.VITE_API_URL || "http://localhost:5000"

  ).replace(/\/$/, "");

  try {

    setIsRefreshing(true);

    setOrderError("");

    const response = await fetch(

      `${apiBase}/api/orders/my-orders`,

      {

        headers: {

          Authorization: `Bearer ${token}`,

        },

      }

    );

    const data = await response.json();

    if (!response.ok || !data.success) {

      throw new Error(data.message || "Unable to refresh orders.");

    }

    const orders = Array.isArray(data.orders) ? data.orders : [];

    setMyOrders(

      orders.map((savedOrder) => ({

        ...savedOrder,

        number:

          savedOrder.number ||

          (savedOrder._id

            ? `KSR${savedOrder._id.slice(-6).toUpperCase()}`

            : "KSR"),

        total: Number(savedOrder.totalAmount ?? savedOrder.total ?? 0),

        name: savedOrder.studentName || "",

        items: (savedOrder.items || []).map((item) => ({

          ...item,

          id: item.foodId || item.id,

          name: item.name || item.title || "Food item",

          price: Number(item.price || 0),

          quantity: Number(item.quantity || 1),

        })),

      }))

    );

  } catch (error) {

    console.error("Refresh orders error:", error);

    setOrderError(error.message || "Unable to refresh orders.");

  } finally {

    setIsRefreshing(false);

  }

}

  // Load the logged-in student's orders from MongoDB.

  useEffect(() => {

    const token = sessionStorage.getItem("ksrStudentToken");

    if (!token) {

      setMyOrders([]);

      return;

    }

    const apiBase = (

      import.meta.env.VITE_API_URL || "http://localhost:5000"

    ).replace(/\/$/, "");

    async function fetchMyOrders() {

      try {

        setOrderLoading(true);

        setOrderError("");

        const response = await fetch(`${apiBase}/api/orders/my-orders`, {

          headers: {

            Authorization: `Bearer ${token}`,

          },

        });

        const data = await response.json();

        if (!response.ok || !data.success) {

          throw new Error(data.message || "Unable to load orders.");

        }

        const orders = Array.isArray(data.orders) ? data.orders : [];

        setMyOrders(

          orders.map((savedOrder) => ({

            ...savedOrder,

            number: savedOrder.number || (

              savedOrder._id

                ? `KSR${savedOrder._id.slice(-6).toUpperCase()}`

                : "KSR"

            ),

            total: Number(savedOrder.totalAmount ?? savedOrder.total ?? 0),

            name: savedOrder.studentName || "",

            items: (savedOrder.items || []).map((item) => ({

              ...item,

              id: item.foodId || item.id,

              name: item.name || item.title || "Food item",

              price: Number(item.price || 0),

              quantity: Number(item.quantity || 1),

            })),

          }))

        );

      } catch (error) {

        console.error("My orders error:", error);

        setOrderError(error.message || "Unable to load orders.");

      } finally {

        setOrderLoading(false);

      }

    }

    fetchMyOrders();

  }, []);

  // Load admin-managed food items from MongoDB through the backend API.

  useEffect(() => {

    const controller = new AbortController();

    async function fetchFoods() {

      try {

        setFoodLoading(true);

        setFoodError("");

        const apiBase = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

        const response = await fetch(`${apiBase}/api/foods`, {

          signal: controller.signal,

        });

        const data = await response.json();

        if (!response.ok || !data.success) {

          throw new Error(data.message || "Unable to load food menu.");

        }

        setDatabaseFoods(Array.isArray(data.foods) ? data.foods : []);

      } catch (error) {

        if (error.name !== "AbortError") {

          console.error("Student food menu fetch failed:", error);

          setFoodError("Could not load the latest menu. Please refresh the page.");

        }

      } finally {

        if (!controller.signal.aborted) setFoodLoading(false);

      }

    }

    fetchFoods();

    return () => controller.abort();

  }, []);

  const cartButtonRef = useRef(null);

  const bumpTimerRef = useRef(null);

  const cartCount = cart.reduce(

    (sum, item) => sum + item.quantity,

    0

  );

  const subtotal = cart.reduce(

    (sum, item) => sum + item.price * item.quantity,

    0

  );

  const activeOrder = myOrders.length > 0 ? myOrders[0] : null;

  // Admin-managed records override the old sample items with the same name.

  const allFoods = useMemo(() => {

    const managedFoods = databaseFoods

      .filter((food) => food.isAvailable !== false)

      .map((food) => ({

      id: food._id,

      name: food.name,

      category: food.category,

      price: Number(food.price),

      rating: 4.8,

      time: "15 min",

      // Food model currently has no veg/non-veg field.

      veg: true,

      badge: "Fresh",

      description: food.description || "Freshly prepared for your campus break.",

      image: food.image || "https://placehold.co/600x400?text=Food",

      isDatabaseFood: true,

    }));

    const managedNames = new Set(

      managedFoods.map((food) => food.name.trim().toLowerCase())

    );

    const legacyFoods = foodMenu.filter(

      (food) => !managedNames.has(food.name.trim().toLowerCase())

    );

    return [...managedFoods, ...legacyFoods];

  }, [databaseFoods]);

  const visibleFoods = useMemo(() => {

    let items = allFoods.filter((food) => {

      const matchesCategory =

        activeCategory === "All" ||

        food.category === activeCategory;

      const matchesSearch =

        food.name.toLowerCase().includes(search.toLowerCase()) ||

        food.category.toLowerCase().includes(search.toLowerCase());

      const matchesVeg = !vegOnly || food.veg;

      return matchesCategory && matchesSearch && matchesVeg;

    });

    if (sortBy === "price-low") {

      items = [...items].sort((a, b) => a.price - b.price);

    } else if (sortBy === "price-high") {

      items = [...items].sort((a, b) => b.price - a.price);

    } else if (sortBy === "rating") {

      items = [...items].sort((a, b) => b.rating - a.rating);

    }

    return items;

  }, [activeCategory, search, sortBy, vegOnly, allFoods]);

  useEffect(() => {

    if (!flyItem) return undefined;

    const frame = window.requestAnimationFrame(() => {

      setFlyItem((current) =>

        current ? { ...current, active: true } : null

      );

    });

    const timer = window.setTimeout(

      () => setFlyItem(null),

      1450

    );

    return () => {

      window.cancelAnimationFrame(frame);

      window.clearTimeout(timer);

    };

  }, [flyItem?.id]);

  useEffect(() => {

    return () => window.clearTimeout(bumpTimerRef.current);

  }, []);

  function addToCart(food, event) {

    if (!isStudentLoggedIn()) {

      navigate("/login");

      return;

    }

    const button = event?.currentTarget;

    const cartButton = cartButtonRef.current;

    if (button && cartButton) {

      const start = button.getBoundingClientRect();

      const end = cartButton.getBoundingClientRect();

      setFlyItem({

        id: `${food.id}-${Date.now()}`,

        image: food.image,

        startX: start.left + start.width / 2 - 27,

        startY: start.top + start.height / 2 - 27,

        endX: end.left + end.width / 2 - 27,

        endY: end.top + end.height / 2 - 27,

        active: false,

      });

    }

    setCart((current) => {

      const existing = current.find(

        (item) => item.id === food.id

      );

      if (existing) {

        return current.map((item) =>

          item.id === food.id

            ? { ...item, quantity: item.quantity + 1 }

            : item

        );

      }

      return [...current, { ...food, quantity: 1 }];

    });

    setOrderConfirmation(null);

    setCartBump(true);

    window.clearTimeout(bumpTimerRef.current);

    bumpTimerRef.current = window.setTimeout(

      () => setCartBump(false),

      650

    );

  }

  function changeQuantity(foodId, amount) {

    setCart((current) =>

      current

        .map((item) =>

          item.id === foodId

            ? { ...item, quantity: item.quantity + amount }

            : item

        )

        .filter((item) => item.quantity > 0)

    );

    setOrderConfirmation(null);

  }

  function toggleFavourite(foodId) {

    setFavourites((current) =>

      current.includes(foodId)

        ? current.filter((id) => id !== foodId)

        : [...current, foodId]

    );

  }

  async function placeOrder(event) {

    event.preventDefault();

    const token = sessionStorage.getItem("ksrStudentToken");

    if (!token) {

      navigate("/login");

      return;

    }

    if (!cart.length) return;

    // Only food records created in MongoDB can be ordered.

    const invalidFood = cart.find((item) => !item.isDatabaseFood);

    if (invalidFood) {

      alert(

        `${invalidFood.name} is a sample menu item. Please select a food item added through the admin dashboard.`

      );

      return;

    }

    try {

      const apiBase = (

        import.meta.env.VITE_API_URL || "http://localhost:5000"

      ).replace(/\/$/, "");

      const response = await fetch(`${apiBase}/api/orders`, {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,

        },

        body: JSON.stringify({

          paymentMethod: paymentMethod === "counter" ? "Counter" : "Online",

          items: cart.map((item) => ({

            foodId: item.id,

            quantity: item.quantity,

          })),

        }),

      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.order) {

        throw new Error(data.message || "Unable to place order.");

      }

      const savedOrder = data.order;

      const order = {

        ...savedOrder,

        number: `KSR${savedOrder._id.slice(-6).toUpperCase()}`,

        total: Number(savedOrder.totalAmount || 0),

        status: savedOrder.status || "Pending",

        name: customerName.trim(),

        studentId: studentId.trim(),

        paymentMethod: savedOrder.paymentMethod || (

          paymentMethod === "counter" ? "Counter" : "Online"

        ),

        items: (savedOrder.items || []).map((item) => ({

          ...item,

          id: item.foodId,

          name: item.name,

          price: Number(item.price || 0),

          quantity: Number(item.quantity || 1),

        })),

      };

      setMyOrders((previousOrders) => [order, ...previousOrders]);

      setOrderConfirmation(order);

      setActiveTrackingOrder(order);

      setCart([]);

      setCheckoutOpen(false);

      setCartOpen(false);

      setSelectedFood(null);

    } catch (error) {

      console.error("Place order error:", error);

      alert(error.message || "Could not place your order.");

    }

  }

  function handleOrderStatusChange(orderNumber, status) {

    setMyOrders((previousOrders) =>

      previousOrders.map((order) =>

        order.number === orderNumber

          ? { ...order, status }

          : order

      )

    );

    setActiveTrackingOrder((previousOrder) =>

      previousOrder?.number === orderNumber

        ? { ...previousOrder, status }

        : previousOrder

    );

    setOrderConfirmation((previousOrder) =>

      previousOrder?.number === orderNumber

        ? { ...previousOrder, status }

        : previousOrder

    );

  }

  function startCheckout() {

    if (!isStudentLoggedIn()) {

      navigate("/login");

      return;

    }

    if (!cart.length) return;

    setCartOpen(false);

    setCheckoutOpen(true);

  }

  // Admin screens use the same order state as the student website.

  if (location.pathname === "/admin/login") {

    return <AdminLogin />;

  }

  if (location.pathname === "/admin/dashboard") {

    return (

      <AdminDashboard

        orders={myOrders}

        onStatusChange={handleOrderStatusChange}

      />

    );

  }

  return (

    <div className="app-shell">

      {flyItem && (

        <img

          key={flyItem.id}

          className={`flying-food ${

            flyItem.active ? "fly-active" : ""

          }`}

          src={flyItem.image}

          alt=""

          aria-hidden="true"

          style={{

            left: flyItem.startX,

            top: flyItem.startY,

            "--fly-x": `${flyItem.endX - flyItem.startX}px`,

            "--fly-y": `${flyItem.endY - flyItem.startY}px`,

          }}

        />

      )}

      <div className="announcement">

        <Sparkles size={14} />

        <span>Your campus cravings, just a few clicks away.</span>

      </div>

      <header className="site-header">

        <a

          className="brand"

          href="#home"

          aria-label="KSR Campus Eats home"

        >

          <span className="brand-mark">

            <UtensilsCrossed size={23} />

          </span>

          <span className="brand-copy">

            <strong>KSR Campus Eats</strong>

            <small>GOOD FOOD. GREAT CAMPUS.</small>

          </span>

        </a>

        <nav className="desktop-nav" aria-label="Main navigation">

          <a className="nav-active" href="#home">Home</a>

          <a href="#menu">Explore Menu</a>

          <a href="#how-it-works">How it works</a>

        </nav>

        <div className="header-actions">

          <button

  type="button"

  onClick={() => {

    window.location.href = "/admin/login";

  }}

  style={{

    padding: "10px 14px",

    borderRadius: "10px",

    border: "1px solid #d7e2d8",

    background: "#ffffff",

    color: "#1d5136",

    fontWeight: 700,

    cursor: "pointer",

  }}

>

  Admin Login

</button>

          <button

            ref={cartButtonRef}

            className={`header-cart ${

              cartBump ? "cart-bumping" : ""

            }`}

            onClick={() => setCartOpen(true)}

            aria-label={`Open cart, ${cartCount} items`}

          >

            <ShoppingBag size={19} />

            <span className="cart-label">My Cart</span>

            <span

              className={`cart-count ${

                cartBump ? "cart-count-pop" : ""

              }`}

            >

              {cartCount}

            </span>

          </button>

        </div>

      </header>

      {activeOrder && (

        <section

          aria-label="Your latest order"

          style={{

            maxWidth: "1180px",

            margin: "18px auto 0",

            padding: "18px 22px",

            width: "calc(100% - 40px)",

            boxSizing: "border-box",

            display: "flex",

            alignItems: "center",

            justifyContent: "space-between",

            gap: "18px",

            flexWrap: "wrap",

            background: "#edf5ed",

            border: "1px solid #cfe2cf",

            borderRadius: "18px",

            color: "#183d2b",

          }}

        >

          <div

            style={{

              display: "flex",

              alignItems: "center",

              gap: "14px",

            }}

          >

            <div

              style={{

                width: "44px",

                height: "44px",

                borderRadius: "14px",

                background: "#d8ead8",

                display: "grid",

                placeItems: "center",

                fontSize: "22px",

                flexShrink: 0,

              }}

            >

              🍱

            </div>

            <div>

              <div

                style={{

                  fontSize: "11px",

                  fontWeight: 800,

                  letterSpacing: "1.3px",

                  textTransform: "uppercase",

                  color: "#52745a",

                }}

              >

                YOUR LATEST ORDER · {activeOrder.number}

              </div>

              <div

                style={{

                  fontSize: "17px",

                  fontWeight: 750,

                  marginTop: "4px",

                }}

              >

{activeOrder.status === "Ready"

  ? "Ready for Pickup"

  : activeOrder.status || "Order Placed"}

              </div>

              <div

                style={{

                  fontSize: "13px",

                  marginTop: "3px",

                  color: "#54705d",

                }}

              >

                {activeOrder.items

                  ?.map(

                    (item) => `${item.name} × ${item.quantity}`

                  )

                  .join(", ")}{" "}

                · ₹{activeOrder.total}

              </div>

              {["Ready", "Ready for Pickup"].includes(activeOrder.status) && (

                <div

                  role="status"

                  aria-live="polite"

                  style={{

                    marginTop: "10px",

                    padding: "10px 12px",

                    background: "#fff8e8",

                    border: "1px solid #f0d69b",

                    borderRadius: "10px",

                    color: "#704b08",

                  }}

                >

                  <strong>🔔 Your order is ready!</strong>

                  <div>

                    Please collect your order at Counter{" "}

                    {activeOrder.counterNumber || 1}.

                  </div>

                  <small>

                    Show order number {activeOrder.number} to the

                    canteen staff.

                  </small>

                </div>

              )}

            </div>

          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setActiveTrackingOrder(activeOrder);
                setShowTracking(true);
              }}
              style={{
                border: "none",
                borderRadius: "13px",
                padding: "0 18px",
                height: "52px",
                background: "#1d5136",
                color: "#fff",
                fontWeight: 700,
                fontSize: "15px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Track My Order →
            </button>

            <button
              type="button"
              onClick={() => setShowMyOrders(true)}
              style={{
                border: "1px solid #c4d7c4",
                borderRadius: "13px",
                padding: "0 18px",
                height: "52px",
                background: "#fff",
                color: "#1d5136",
                fontWeight: 700,
                fontSize: "15px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              My Orders
            </button>

            <button
              type="button"
              onClick={refreshMyOrders}
              disabled={isRefreshing}
              style={{
                border: "1px solid #c4d7c4",
                borderRadius: "13px",
                padding: "0 18px",
                height: "52px",
                background: "#fff",
                color: "#1d5136",
                fontWeight: 700,
                fontSize: "15px",
                cursor: isRefreshing ? "not-allowed" : "pointer",
                opacity: isRefreshing ? 0.6 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                whiteSpace: "nowrap",
              }}
            >
              <RefreshCw size={17} className={isRefreshing ? "spin" : ""} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

        </section>

      )}

      <main>

        <section className="hero-section" id="home">

          <div className="hero-copy">

            <div className="eyebrow">

              <span className="eyebrow-dot" />

              YOUR CAMPUS FOOD DESTINATION

            </div>

            <h1>

              Good food.

              <br />

              <span>Great minds.</span>

              <br />

              Zero waiting.

            </h1>

            <p>

              Skip the queue and get back to what matters. Your favourite

              campus meals are just a few clicks away.

            </p>

            <div className="hero-actions">

              <a className="primary-button" href="#menu">

                Explore the menu <ArrowRight size={18} />

              </a>

              <div className="hero-rating">

                <span className="rating-stars">

                  <Star size={15} fill="currentColor" />

                  <Star size={15} fill="currentColor" />

                  <Star size={15} fill="currentColor" />

                  <Star size={15} fill="currentColor" />

                  <Star size={15} fill="currentColor" />

                </span>

                <span>

                  <strong>4.8/5</strong> student favourites

                </span>

              </div>

            </div>

            <div className="hero-trust">

              <div className="trust-icon">

                <Clock3 size={17} />

              </div>

              <span>

                <strong>Quick ordering</strong>

                <small>Less queue, more you.</small>

              </span>

              <div className="trust-divider" />

              <div className="trust-icon">

                <Leaf size={17} />

              </div>

              <span>

                <strong>Fresh choices</strong>

                <small>Made for campus life.</small>

              </span>

            </div>

          </div>

          <div className="hero-visual">

            <div className="hero-image-wrap">

<img

  src="/logo.png%20(2).png"

  alt="KSR Campus Eats"

  className="hero-image"

/>

              <div className="image-overlay" />

              <div className="hero-image-caption">

                <span className="caption-icon">

                  <ChefHat size={20} />

                </span>

                <span>

                  <strong>Freshly prepared</strong>

                  <small>Your break, made better.</small>

                </span>

              </div>

            </div>

            <div className="floating-note floating-top">

              <span className="floating-note-icon">

                <Clock3 size={17} />

              </span>

              <span>

                <strong>Quick & easy</strong>

                <small>Order in seconds</small>

              </span>

            </div>

            <div className="floating-note floating-bottom">

              <span className="floating-note-icon orange">

                <Heart size={17} fill="currentColor" />

              </span>

              <span>

                <strong>Made for you</strong>

                <small>Student favourites</small>

              </span>

            </div>

            <span className="hero-decoration decoration-one" />

            <span className="hero-decoration decoration-two" />

          </div>

        </section>

        <section className="benefit-strip" id="how-it-works">

          <div className="benefit-item">

            <span className="benefit-icon">

              <ShoppingCart size={20} />

            </span>

            <div>

              <strong>1. Pick your food</strong>

              <p>Explore your favourites.</p>

            </div>

          </div>

          <div className="benefit-arrow">

            <ArrowRight size={19} />

          </div>

          <div className="benefit-item">

            <span className="benefit-icon">

              <Wallet size={20} />

            </span>

            <div>

              <strong>2. Place your order</strong>

              <p>Checkout in a few clicks.</p>

            </div>

          </div>

          <div className="benefit-arrow">

            <ArrowRight size={19} />

          </div>

          <div className="benefit-item">

            <span className="benefit-icon">

              <ChefHat size={20} />

            </span>

            <div>

              <strong>3. Collect & enjoy</strong>

              <p>Skip the long queue.</p>

            </div>

          </div>

        </section>

        <section className="menu-section" id="menu">

          <div className="section-heading">

            <div>

              <div className="eyebrow">

                <span className="eyebrow-dot" />

                MADE FOR YOUR BREAK

              </div>

              <h2>

                What are you <span>craving?</span>

              </h2>

              <p>

                Good things are on the menu. Find your next favourite.

              </p>

            </div>

            <div className="menu-heading-badge">

              <Leaf size={17} />

              <span>Fresh choices, happy breaks</span>

            </div>

          </div>

          <div className="menu-toolbar">

            <div className="category-list">

              {categories.map((category) => (

                <button

                  key={category}

                  className={`category-chip ${

                    activeCategory === category ? "selected" : ""

                  }`}

                  onClick={() => setActiveCategory(category)}

                >

                  {category}

                </button>

              ))}

            </div>

            <div className="menu-controls">

              <label className="search-box">

                <Search size={18} />

                <input

                  type="search"

                  value={search}

                  onChange={(event) => setSearch(event.target.value)}

                  placeholder="Search dishes..."

                  aria-label="Search dishes"

                />

                {search && (

                  <button

                    type="button"

                    className="clear-search"

                    onClick={() => setSearch("")}

                    aria-label="Clear search"

                  >

                    <X size={15} />

                  </button>

                )}

              </label>

              <label className="sort-select">

                <span className="sr-only">Sort food</span>

                <select

                  value={sortBy}

                  onChange={(event) => setSortBy(event.target.value)}

                >

                  <option value="recommended">Recommended</option>

                  <option value="rating">Top rated</option>

                  <option value="price-low">Price: low to high</option>

                  <option value="price-high">Price: high to low</option>

                </select>

              </label>

              <button

                className={`veg-toggle ${

                  vegOnly ? "veg-selected" : ""

                }`}

                onClick={() => setVegOnly((value) => !value)}

                aria-pressed={vegOnly}

              >

                <Leaf size={16} /> Veg

              </button>

            </div>

          </div>

          <div className="menu-result-line">

            <span>

              <strong>{visibleFoods.length}</strong> delicious options

            </span>

            <span className="fresh-note">

              <span /> Updated for your campus break

            </span>

          </div>

          {foodLoading && (

            <p role="status" style={{ margin: "12px 0", color: "#52745a" }}>

              Loading the latest canteen menu...

            </p>

          )}

          {foodError && (

            <p role="alert" style={{ margin: "12px 0", color: "#b42318" }}>

              {foodError}

            </p>

          )}

          <div className="food-grid">

            {visibleFoods.map((item) => (

              <article className="food-card" key={item.id}>

                <button

                  className="food-image-button"

                  onClick={() => setSelectedFood(item)}

                  aria-label={`View ${item.name} details`}

                >

                  <img

                    className="food-image"

                    src={item.image}

                    alt={item.name}

                    loading="lazy"

                  />

                  {item.badge && (

                    <span className="food-badge">{item.badge}</span>

                  )}

                </button>

                <button

                  className={`favourite-button ${

                    favourites.includes(item.id)

                      ? "favourite-active"

                      : ""

                  }`}

                  onClick={() => toggleFavourite(item.id)}

                  aria-label={

                    favourites.includes(item.id)

                      ? "Remove from favourites"

                      : "Add to favourites"

                  }

                  aria-pressed={favourites.includes(item.id)}

                >

                  <Heart

                    size={17}

                    fill={

                      favourites.includes(item.id)

                        ? "currentColor"

                        : "none"

                    }

                  />

                </button>

                <div className="food-card-body">

                  <div className="food-meta">

                    <span className="food-category">

                      {item.category}

                    </span>

                    <span className="food-rating">

                      <Star size={13} fill="currentColor" /> {item.rating}

                    </span>

                  </div>

                  <button

                    className="food-title-button"

                    onClick={() => setSelectedFood(item)}

                  >

                    <h3>{item.name}</h3>

                  </button>

                  <p className="food-description">

                    {item.description}

                  </p>

                  <div className="food-card-bottom">

                    <div className="food-price">

                      <strong>₹{item.price}</strong>

                      <span>

                        <Clock3 size={12} /> {item.time}

                      </span>

                    </div>

                    <button

                      className="add-button"

                      onClick={(event) => addToCart(item, event)}

                      aria-label={`Add ${item.name} to cart`}

                    >

                      <Plus size={18} strokeWidth={2.5} />

                      <span>Add</span>

                    </button>

                  </div>

                </div>

              </article>

            ))}

          </div>

          {visibleFoods.length === 0 && (

            <div className="empty-menu">

              <span className="empty-menu-icon">

                <Search size={28} />

              </span>

              <h3>No dishes found</h3>

              <p>

                Try a different search or choose another category.

              </p>

              <button

                className="primary-button"

                onClick={() => {

                  setSearch("");

                  setActiveCategory("All");

                  setVegOnly(false);

                }}

              >

                Show all dishes <ArrowRight size={17} />

              </button>

            </div>

          )}

        </section>

        <section className="bottom-cta">

          <div className="cta-icon">

            <UtensilsCrossed size={26} />

          </div>

          <div>

            <h2>Your next campus break starts here.</h2>

            <p>

              Find something tasty, add it to your cart, and enjoy your break.

            </p>

          </div>

          <a className="cta-button" href="#menu">

            Find your meal <ArrowRight size={17} />

          </a>

        </section>

      </main>

      <footer className="site-footer">

        <a className="brand footer-brand" href="#home">

          <span className="brand-mark">

            <UtensilsCrossed size={21} />

          </span>

          <span className="brand-copy">

            <strong>KSR Campus Eats</strong>

            <small>GOOD FOOD. GREAT CAMPUS.</small>

          </span>

        </a>

        <p>Made for campus life, one delicious break at a time.</p>

        <span className="footer-copyright">

          © {new Date().getFullYear()} KSR Campus Eats · Student project

        </span>

      </footer>

      {cartOpen && (

        <div

          className="modal-backdrop"

          onMouseDown={(event) => {

            if (event.target === event.currentTarget) {

              setCartOpen(false);

            }

          }}

        >

          <aside className="cart-drawer" aria-label="Shopping cart">

            <div className="drawer-header">

              <div>

                <span className="drawer-kicker">YOUR SELECTION</span>

                <h2>

                  Your cart <span>({cartCount})</span>

                </h2>

              </div>

              <button

                className="icon-button"

                onClick={() => setCartOpen(false)}

                aria-label="Close cart"

              >

                <X size={21} />

              </button>

            </div>

            {cart.length === 0 ? (

              <div className="empty-cart">

                <span className="empty-cart-icon">

                  <ShoppingBag size={30} />

                </span>

                <h3>Your cart is taking a break.</h3>

                <p>

                  Add something delicious from the menu to get started.

                </p>

                <button

                  className="primary-button"

                  onClick={() => setCartOpen(false)}

                >

                  Explore menu <ArrowRight size={17} />

                </button>

              </div>

            ) : (

              <>

                <div className="cart-items">

                  {cart.map((item) => (

                    <div className="cart-item" key={item.id}>

                      <img src={item.image} alt={item.name} />

                      <div className="cart-item-info">

                        <h3>{item.name}</h3>

                        <span>₹{item.price} each</span>

                        <strong>

                          ₹{item.price * item.quantity}

                        </strong>

                      </div>

                      <div className="quantity-control">

                        <button

                          onClick={() => changeQuantity(item.id, -1)}

                          aria-label={`Decrease ${item.name} quantity`}

                        >

                          <Minus size={14} />

                        </button>

                        <span>{item.quantity}</span>

                        <button

                          onClick={() => changeQuantity(item.id, 1)}

                          aria-label={`Increase ${item.name} quantity`}

                        >

                          <Plus size={14} />

                        </button>

                      </div>

                    </div>

                  ))}

                </div>

                <div className="cart-summary">

                  <div className="summary-row">

                    <span>Subtotal</span>

                    <strong>₹{subtotal}</strong>

                  </div>

                  <div className="summary-row">

                    <span>Ordering fee</span>

                    <strong>₹0</strong>

                  </div>

                  <div className="summary-total">

                    <span>Total</span>

                    <strong>₹{subtotal}</strong>

                  </div>

                  <p className="demo-notice">

                    Demo checkout — no real payment will be collected.

                  </p>

                  <button

                    className="checkout-button"

                    onClick={startCheckout}

                  >

                    Continue to checkout <ArrowRight size={18} />

                  </button>

                  <button

                    className="continue-shopping"

                    onClick={() => setCartOpen(false)}

                  >

                    Continue exploring

                  </button>

                </div>

              </>

            )}

          </aside>

        </div>

      )}

      {selectedFood && (

        <div

          className="modal-backdrop"

          onMouseDown={(event) => {

            if (event.target === event.currentTarget) {

              setSelectedFood(null);

            }

          }}

        >

          <section

            className="food-modal"

            aria-label={`${selectedFood.name} details`}

          >

            <button

              className="modal-close"

              onClick={() => setSelectedFood(null)}

              aria-label="Close details"

            >

              <X size={21} />

            </button>

            <img

              src={selectedFood.image}

              alt={selectedFood.name}

              className="food-modal-image"

            />

            <div className="food-modal-content">

              <span className="food-category">

                {selectedFood.category}

              </span>

              <h2>{selectedFood.name}</h2>

              <div className="modal-food-meta">

                <span>

                  <Star size={15} fill="currentColor" />{" "}

                  {selectedFood.rating}

                </span>

                <span>

                  <Clock3 size={15} /> {selectedFood.time}

                </span>

                <span>

                  <Leaf size={15} /> Vegetarian

                </span>

              </div>

              <p>{selectedFood.description}</p>

              <div className="modal-food-bottom">

                <strong>₹{selectedFood.price}</strong>

                <button

                  className="primary-button"

                  onClick={(event) => {

                    addToCart(selectedFood, event);

                    setSelectedFood(null);

                  }}

                >

                  <Plus size={18} /> Add to cart

                </button>

              </div>

            </div>

          </section>

        </div>

      )}

      {checkoutOpen && (

        <div

          className="modal-backdrop"

          onMouseDown={(event) => {

            if (event.target === event.currentTarget) {

              setCheckoutOpen(false);

            }

          }}

        >

          <section className="checkout-modal">

            <div className="checkout-header">

              <div>

                <span className="drawer-kicker">ALMOST THERE</span>

                <h2>Complete your order</h2>

                <p>

                  Just a few details before your campus feast.

                </p>

              </div>

              <button

                className="icon-button"

                onClick={() => setCheckoutOpen(false)}

                aria-label="Close checkout"

              >

                <X size={21} />

              </button>

            </div>

            <form onSubmit={placeOrder} className="checkout-form">

              <label className="form-field">

                <span>Your name *</span>

                <input

                  required

                  value={customerName}

                  onChange={(event) =>

                    setCustomerName(event.target.value)

                  }

                  placeholder="Enter your full name"

                />

              </label>

              <label className="form-field">

                <span>Student ID *</span>

                <input

                  required

                  value={studentId}

                  onChange={(event) =>

                    setStudentId(event.target.value)

                  }

                  placeholder="Enter your student ID"

                />

              </label>

              <label className="form-field">

                <span>Order notes (optional)</span>

                <textarea

                  value={notes}

                  onChange={(event) => setNotes(event.target.value)}

                  placeholder="Any special instructions?"

                  rows={3}

                />

              </label>

              <div className="payment-options">

                <span className="payment-heading">

                  Payment preference

                </span>

                <label

                  className={`payment-option ${

                    paymentMethod === "counter"

                      ? "payment-selected"

                      : ""

                  }`}

                >

                  <input

                    type="radio"

                    name="payment"

                    value="counter"

                    checked={paymentMethod === "counter"}

                    onChange={(event) =>

                      setPaymentMethod(event.target.value)

                    }

                  />

                  <span className="payment-icon">

                    <Wallet size={19} />

                  </span>

                  <span>

                    <strong>Pay at counter</strong>

                    <small>Pay when collecting your order</small>

                  </span>

                  {paymentMethod === "counter" && (

                    <Check className="payment-check" size={19} />

                  )}

                </label>

                <label

                  className={`payment-option ${

                    paymentMethod === "online-demo"

                      ? "payment-selected"

                      : ""

                  }`}

                >

                  <input

                    type="radio"

                    name="payment"

                    value="online-demo"

                    checked={paymentMethod === "online-demo"}

                    onChange={(event) =>

                      setPaymentMethod(event.target.value)

                    }

                  />

                  <span className="payment-icon">

                    <ShoppingBag size={19} />

                  </span>

                  <span>

                    <strong>Online payment (demo)</strong>

                    <small>No actual payment is processed</small>

                  </span>

                  {paymentMethod === "online-demo" && (

                    <Check className="payment-check" size={19} />

                  )}

                </label>

              </div>

              <div className="checkout-total">

                <span>Total to pay</span>

                <strong>₹{subtotal}</strong>

              </div>

              <button className="checkout-button" type="submit">

                Place order <ArrowRight size={18} />

              </button>

              <p className="secure-note">

                <Check size={14} /> This is a student project demo. No

                payment details are collected.

              </p>

            </form>

          </section>

        </div>

      )}

      {orderConfirmation && (

        <div className="modal-backdrop confirmation-backdrop">

          <section className="confirmation-modal">

            <div className="success-icon">

              <Check size={34} />

            </div>

            <span className="drawer-kicker">

              ORDER CONFIRMED

            </span>

            <h2>

              You're all set, {orderConfirmation.name}!

            </h2>

            <p>

              Your order has been saved successfully.

            </p>

            <div className="order-number-box">

              <span>ORDER NUMBER</span>

              <strong>{orderConfirmation.number}</strong>

            </div>

            <div className="confirmation-items">

              {orderConfirmation.items.map((item) => (

                <div key={item.id}>

                  <span>

                    {item.name} × {item.quantity}

                  </span>

                  <strong>

                    ₹{item.price * item.quantity}

                  </strong>

                </div>

              ))}

            </div>

            <div className="checkout-total">

              <span>Total</span>

              <strong>₹{orderConfirmation.total}</strong>

            </div>

            <p className="demo-notice">

              {orderConfirmation.paymentMethod === "counter"

                ? "Payment preference: pay at counter."

                : "Online payment was selected, but no payment was processed."}{" "}

              Your order has been saved in the canteen system.

            </p>

            <button

              className="checkout-button"

              onClick={() => {

                setOrderConfirmation(null);

                setShowMyOrders(true);

              }}

            >

              View My Orders <ArrowRight size={18} />

            </button>

            <button

              className="checkout-button"

              onClick={() => {

                setActiveTrackingOrder(orderConfirmation);

                setOrderConfirmation(null);

                setShowTracking(true);

              }}

            >

              Track My Order <ArrowRight size={18} />

            </button>

            <button

              className="checkout-button"

              onClick={() => {

                setOrderConfirmation(null);

                setCustomerName("");

                setStudentId("");

                setNotes("");

                setPaymentMethod("counter");

              }}

            >

              Back to menu <ArrowRight size={18} />

            </button>

          </section>

        </div>

      )}

      {showTracking && (

        <OrderTracking

          onBack={() => setShowTracking(false)}

          order={activeTrackingOrder || activeOrder}

          orderNumber={(activeTrackingOrder || activeOrder)?.number}

          onStatusChange={handleOrderStatusChange}

        />

      )}

      {showMyOrders && (

        <MyOrders

          orders={myOrders}

          onBack={() => setShowMyOrders(false)}

        />

      )}

    </div>

  );

}

export default function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/login" element={<StudentAuth />} />

        <Route path="/admin/login" element={<StudentApp />} />

        <Route path="/admin/dashboard" element={<StudentApp />} />

        <Route path="/*" element={<StudentApp />} />

      </Routes>

    </BrowserRouter>

  );

}
