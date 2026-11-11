import { useEffect, useMemo, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import {

  LayoutDashboard, ClipboardList, UtensilsCrossed, IndianRupee, Clock3,

  CheckCircle2, Search, ArrowLeft, LogOut, RefreshCw, ShoppingBag, Users,

  TrendingUp, ChevronDown, Plus, Pencil, Trash2, X, Image as ImageIcon,

  PackageCheck, PackageX, ChefHat,

} from "lucide-react";

import "./AdminDashboard.css";

const STATUSES = ["Pending", "Preparing", "Ready", "Completed", "Cancelled"];

const FOOD_CATEGORIES = ["Breakfast", "Lunch", "Snacks", "Dinner", "Drinks", "Desserts"];

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const EMPTY_FOOD_FORM = { name: "", category: "Breakfast", price: "", description: "", image: "", isAvailable: true };

export default function AdminDashboard() {

  const [authenticated, setAuthenticated] = useState(false);

  const [orders, setOrders] = useState([]);

  const [orderLoading, setOrderLoading] = useState(false);

  const [orderError, setOrderError] = useState("");

  const [orderMessage, setOrderMessage] = useState("");

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Orders");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [foods, setFoods] = useState([]);

  const [foodSearch, setFoodSearch] = useState("");

  const [foodCategoryFilter, setFoodCategoryFilter] = useState("All");

  const [foodAvailabilityFilter, setFoodAvailabilityFilter] = useState("All");

  const [foodLoading, setFoodLoading] = useState(false);

  const [foodError, setFoodError] = useState("");

  const [foodMessage, setFoodMessage] = useState("");

  const [showFoodForm, setShowFoodForm] = useState(false);

  const [editingFoodId, setEditingFoodId] = useState(null);

  const [foodForm, setFoodForm] = useState(EMPTY_FOOD_FORM);

  const [savingFood, setSavingFood] = useState(false);
  const [kitchenSoundEnabled, setKitchenSoundEnabled] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState("");
  const knownKitchenOrderIdsRef = useRef(null);
  const audioContextRef = useRef(null);

 useEffect(() => {

  const token = sessionStorage.getItem("ksrAdminToken");

  if (!token) {

    navigate("/admin/login", { replace: true });

    return;

  }

  setAuthenticated(true);

  fetchOrders();

}, [navigate]);

  useEffect(() => {

    if (activeTab === "Food Menu") fetchFoods();

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [activeTab]);

  // Refresh kitchen orders while the Kitchen Display tab is open.
  useEffect(() => {
    if (activeTab !== "Kitchen Display" || !authenticated) return;

    fetchOrders();
    const timer = window.setInterval(fetchOrders, 5000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, authenticated, kitchenSoundEnabled]);

  function playKitchenNewOrderSound() {
    if (!kitchenSoundEnabled) return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      const audioContext = audioContextRef.current || new AudioContextClass();
      audioContextRef.current = audioContext;

      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      const notes = [
        { frequency: 880, start: 0, duration: 0.16 },
        { frequency: 1174.66, start: 0.2, duration: 0.18 },
        { frequency: 1396.91, start: 0.43, duration: 0.28 },
      ];

      notes.forEach(({ frequency, start, duration }) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, audioContext.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.16, audioContext.currentTime + start + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + start + duration);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(audioContext.currentTime + start);
        oscillator.stop(audioContext.currentTime + start + duration + 0.02);
      });
    } catch (error) {
      console.warn("Kitchen notification sound could not play:", error);
    }
  }

  async function fetchOrders() {

    const token = sessionStorage.getItem("ksrAdminToken");

    if (!token) {

      navigate("/admin/login", { replace: true });

      return;

    }

    setOrderLoading(true);

    setOrderError("");

    try {

      const response = await fetch(`${API_BASE}/api/admin/orders`, {

        headers: { Authorization: `Bearer ${token}` },

      });

      const data = await response.json();

      if (!response.ok || !data.success) {

        throw new Error(data.message || "Unable to load student orders.");

      }

      const normalizedOrders = (Array.isArray(data.orders) ? data.orders : []).map((order) => ({

        ...order,

        number: order.orderNumber || order.number || String(order._id || "").slice(-8).toUpperCase(),

        name: order.studentName || order.student?.fullName || "Student",

        studentId: order.studentId || order.student?.studentId || "",

        total: Number(order.totalAmount ?? order.total ?? 0),

        items: Array.isArray(order.items) ? order.items : [],

      }));

      const currentOrderIds = new Set(
        normalizedOrders.map((order) => String(order._id || order.number))
      );

      if (knownKitchenOrderIdsRef.current === null) {
        // First fetch establishes a baseline; old orders should not trigger alerts.
        knownKitchenOrderIdsRef.current = currentOrderIds;
      } else {
        const newlyArrivedOrders = normalizedOrders.filter((order) => {
          const orderId = String(order._id || order.number);
          return !knownKitchenOrderIdsRef.current.has(orderId) &&
            (order.status || "Pending") === "Pending";
        });

        if (newlyArrivedOrders.length > 0) {
          const newestOrder = newlyArrivedOrders[0];
          setNewOrderAlert(`${newlyArrivedOrders.length} new order${newlyArrivedOrders.length > 1 ? "s" : ""} received. Latest: #${newestOrder.number}.`);
          playKitchenNewOrderSound();
        }

        knownKitchenOrderIdsRef.current = currentOrderIds;
      }

      setOrders(normalizedOrders);

    } catch (error) {

      setOrderError(`${error.message} Check that the backend is running at ${API_BASE}.`);

    } finally {

      setOrderLoading(false);

    }

  }

  async function updateOrderStatus(order, status) {

    const token = sessionStorage.getItem("ksrAdminToken");

    if (!token) {

      navigate("/admin/login", { replace: true });

      return;

    }

    setOrderError("");

    setOrderMessage("");

    try {

      const response = await fetch(`${API_BASE}/api/admin/orders/${order._id}/status`, {

        method: "PATCH",

        headers: {

          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,

        },

        body: JSON.stringify({ status }),

      });

      const data = await response.json();

      if (!response.ok || !data.success) {

        throw new Error(data.message || "Unable to update order status.");

      }

      setOrders((current) => current.map((item) =>

        item._id === order._id ? { ...item, status: data.order?.status || status } : item

      ));

      setOrderMessage(`Order #${order.number} updated to ${status}.`);

    } catch (error) {

      setOrderError(error.message);

      fetchOrders();

    }

  }

  async function fetchFoods() {

    setFoodLoading(true);

    setFoodError("");

    try {

      const response = await fetch(`${API_BASE}/api/foods`);

      const data = await response.json();

      if (!response.ok || !data.success) throw new Error(data.message || "Unable to load food items.");

      setFoods(Array.isArray(data.foods) ? data.foods : []);

    } catch (error) {

      setFoodError(`${error.message} Check that the backend is running at ${API_BASE}.`);

    } finally {

      setFoodLoading(false);

    }

  }

  const stats = useMemo(() => {

    const validOrders = orders.filter((order) => order.status !== "Cancelled");

    return {

      total: orders.length,

      pending: orders.filter((order) => ["Pending", "Preparing"].includes(order.status)).length,

      ready: orders.filter((order) => order.status === "Ready").length,

      sales: validOrders.filter((order) => order.status === "Completed").reduce((sum, order) => sum + Number(order.totalAmount ?? order.total ?? 0), 0),

    };

  }, [orders]);

  const filteredOrders = useMemo(() => {

    const term = search.toLowerCase().trim();

    return orders.filter((order) => {

      const matchesSearch = !term || String(order.number || "").toLowerCase().includes(term) ||

        String(order.name || "").toLowerCase().includes(term) || String(order.studentId || "").toLowerCase().includes(term);

      return matchesSearch && (statusFilter === "All" || order.status === statusFilter);

    });

  }, [orders, search, statusFilter]);

  const filteredFoods = useMemo(() => {

    const term = foodSearch.toLowerCase().trim();

    return foods.filter((food) => {

      const matchesSearch = !term || String(food.name || "").toLowerCase().includes(term) ||

        String(food.description || "").toLowerCase().includes(term);

      const matchesCategory = foodCategoryFilter === "All" || food.category === foodCategoryFilter;

      const matchesAvailability = foodAvailabilityFilter === "All" ||

        (foodAvailabilityFilter === "Available" && food.isAvailable) ||

        (foodAvailabilityFilter === "Out of Stock" && !food.isAvailable);

      return matchesSearch && matchesCategory && matchesAvailability;

    });

  }, [foods, foodSearch, foodCategoryFilter, foodAvailabilityFilter]);

  function logout() {

    sessionStorage.removeItem("ksrAdminToken");

    sessionStorage.removeItem("ksrAdmin");

    sessionStorage.removeItem("ksrAdminDemoSession");

    navigate("/admin/login", { replace: true });

  }

  function formatDate(date) {

    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

  }

  function openAddFoodForm() {

    setEditingFoodId(null);

    setFoodForm(EMPTY_FOOD_FORM);

    setFoodMessage("");

    setFoodError("");

    setShowFoodForm(true);

  }

  function openEditFoodForm(food) {

    setEditingFoodId(food._id);

    setFoodForm({

      name: food.name || "", category: food.category || "Breakfast",

      price: String(food.price ?? ""), description: food.description || "",

      image: food.image || "", isAvailable: Boolean(food.isAvailable),

    });

    setFoodMessage("");

    setFoodError("");

    setShowFoodForm(true);

  }

  function closeFoodForm() {

    if (savingFood) return;

    setShowFoodForm(false);

    setEditingFoodId(null);

    setFoodForm(EMPTY_FOOD_FORM);

  }

  function updateFoodField(event) {

    const { name, value, type, checked } = event.target;

    setFoodForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));

  }

  async function saveFood(event) {

    event.preventDefault();

    setFoodError("");

    setFoodMessage("");

    const price = Number(foodForm.price);

    if (!foodForm.name.trim()) return setFoodError("Please enter the food name.");

    if (!Number.isFinite(price) || price < 0 || foodForm.price === "") return setFoodError("Please enter a valid price.");

    const payload = { ...foodForm, name: foodForm.name.trim(), price, description: foodForm.description.trim(), image: foodForm.image.trim() };

    setSavingFood(true);

    try {

      const isEditing = Boolean(editingFoodId);

      const response = await fetch(isEditing ? `${API_BASE}/api/foods/${editingFoodId}` : `${API_BASE}/api/foods`, {

        method: isEditing ? "PUT" : "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify(payload),

      });

      const data = await response.json();

      if (!response.ok || !data.success) {

  throw new Error(data.error || data.message || "Unable to save food.");

}

      setFoodMessage(isEditing ? "Food updated successfully." : "Food added successfully.");

      setShowFoodForm(false);

      setEditingFoodId(null);

      setFoodForm(EMPTY_FOOD_FORM);

      await fetchFoods();

    } catch (error) {

      setFoodError(error.message);

    } finally {

      setSavingFood(false);

    }

  }

  async function deleteFood(food) {

    if (!window.confirm(`Delete "${food.name}" from the food menu? This cannot be undone.`)) return;

    setFoodError("");

    setFoodMessage("");

    try {

      const response = await fetch(`${API_BASE}/api/foods/${food._id}`, { method: "DELETE" });

      const data = await response.json();

      if (!response.ok || !data.success) throw new Error(data.message || "Unable to delete food.");

      setFoodMessage(`${food.name} deleted successfully.`);

      setFoods((current) => current.filter((item) => item._id !== food._id));

    } catch (error) {

      setFoodError(error.message);

    }

  }

  async function toggleFoodAvailability(food) {

    setFoodError("");

    setFoodMessage("");

    try {

      const response = await fetch(`${API_BASE}/api/foods/${food._id}`, {

        method: "PUT", headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ isAvailable: !food.isAvailable }),

      });

      const data = await response.json();

      if (!response.ok || !data.success) throw new Error(data.message || "Unable to update availability.");

      setFoods((current) => current.map((item) => item._id === food._id ? data.food : item));

      setFoodMessage(`${food.name} marked ${!food.isAvailable ? "Available" : "Out of Stock"}.`);

    } catch (error) {

      setFoodError(error.message);

    }

  }

  const kitchenNewOrders = orders.filter((order) => (order.status || "Pending") === "Pending");
  const kitchenPreparingOrders = orders.filter((order) => order.status === "Preparing");
  const kitchenReadyOrders = orders.filter((order) => order.status === "Ready");

  const isFoodTab = activeTab === "Food Menu";

  if (!authenticated) {

    return <p>Checking admin access...</p>;

  }

  return (

    <main className="ksr-admin">

      <aside className="ksr-admin-sidebar">

        <div className="ksr-admin-brand">

          <div className="ksr-admin-brand-icon"><UtensilsCrossed size={23} /></div>

          <div><strong>KSR Campus Eats</strong><span>ADMIN CONSOLE</span></div>

        </div>

        <p className="ksr-admin-nav-label">WORKSPACE</p>

        <button className={`ksr-admin-nav-item ${activeTab === "Overview" ? "active" : ""}`} onClick={() => setActiveTab("Overview")}><LayoutDashboard size={19} />Overview</button>

        <button className={`ksr-admin-nav-item ${activeTab === "Orders" ? "active" : ""}`} onClick={() => setActiveTab("Orders")}><ClipboardList size={19} />Orders<span className="ksr-admin-nav-count">{stats.pending}</span></button>

        <button className={`ksr-admin-nav-item ${isFoodTab ? "active" : ""}`} onClick={() => setActiveTab("Food Menu")}><UtensilsCrossed size={19} />Food Menu<span className="ksr-admin-nav-count">{foods.length}</span></button>
        <button className={`ksr-admin-nav-item ${activeTab === "Kitchen Display" ? "active" : ""}`} onClick={() => setActiveTab("Kitchen Display")}><ChefHat size={19} />Kitchen Display<span className="ksr-admin-nav-count">{kitchenNewOrders.length}</span></button>

        <div className="ksr-admin-sidebar-bottom">

          <div className="ksr-admin-user"><div className="ksr-admin-avatar">A</div><div><strong>Canteen Admin</strong><span>Administrator</span></div></div>

          <button className="ksr-admin-nav-item" onClick={logout}><LogOut size={19} />Sign out</button>

          <button className="ksr-admin-nav-item" onClick={() => navigate("/")}><ArrowLeft size={19} />Student Website</button>

        </div>

      </aside>

      <section className="ksr-admin-main">

        <header className="ksr-admin-topbar">

          <div><p className="ksr-admin-breadcrumb">KSR / Administration</p><h1>{isFoodTab ? "Food Menu Management" : activeTab === "Kitchen Display" ? "Kitchen Display" : activeTab === "Orders" ? "Order Management" : "Overview"}</h1></div>

          <div className="ksr-admin-topbar-right"><span className="ksr-admin-live-dot" />Admin dashboard<div className="ksr-admin-topbar-avatar">A</div></div>

        </header>

        <div className="ksr-admin-content">

          {isFoodTab ? (

            <section className="ksr-admin-food-page">

              <div className="ksr-admin-food-intro">

                <div><p className="ksr-admin-welcome-label">MENU CONTROL CENTER</p><h2>Manage your canteen menu</h2><p>Add food items, update prices and control what students can order.</p></div>

                <div className="ksr-admin-food-intro-icon"><UtensilsCrossed size={32} /></div>

              </div>

              <div className="ksr-admin-food-summary">

                <article><span>Total food items</span><strong>{foods.length}</strong></article>

                <article><span>Available</span><strong>{foods.filter((food) => food.isAvailable).length}</strong></article>

                <article><span>Out of stock</span><strong>{foods.filter((food) => !food.isAvailable).length}</strong></article>

              </div>

              <section className="ksr-admin-orders-panel">

                <div className="ksr-admin-orders-heading ksr-admin-food-heading">

                  <div><h3>Food items</h3><p>Manage the items stored in your food database.</p></div>

                  <div className="ksr-admin-food-heading-actions">

                    <button className="ksr-admin-refresh" onClick={fetchFoods} disabled={foodLoading}><RefreshCw size={15} />Refresh</button>

                    <button className="ksr-admin-food-add" onClick={openAddFoodForm}><Plus size={16} />Add Food</button>

                  </div>

                </div>

                {foodError && <div className="ksr-admin-food-alert error" role="alert">{foodError}</div>}

                {foodMessage && <div className="ksr-admin-food-alert success" role="status">{foodMessage}</div>}

                <div className="ksr-admin-filters ksr-admin-food-filters">

                  <div className="ksr-admin-search"><Search size={18} /><input value={foodSearch} onChange={(event) => setFoodSearch(event.target.value)} placeholder="Search food name or description..." /></div>

                  <div className="ksr-admin-status-filter"><select value={foodCategoryFilter} onChange={(event) => setFoodCategoryFilter(event.target.value)} aria-label="Filter food by category"><option value="All">All categories</option>{FOOD_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}</select><ChevronDown size={15} /></div>

                  <div className="ksr-admin-status-filter"><select value={foodAvailabilityFilter} onChange={(event) => setFoodAvailabilityFilter(event.target.value)} aria-label="Filter food by availability"><option value="All">All availability</option><option value="Available">Available</option><option value="Out of Stock">Out of Stock</option></select><ChevronDown size={15} /></div>

                </div>

                {foodLoading ? (

                  <div className="ksr-admin-empty"><div><RefreshCw size={27} /></div><h4>Loading food menu...</h4><p>Fetching food items from your database.</p></div>

                ) : filteredFoods.length === 0 ? (

                  <div className="ksr-admin-empty">

                    <div><UtensilsCrossed size={30} /></div>

                    <h4>{foods.length === 0 ? "Your menu is empty" : "No food items found"}</h4>

                    <p>{foods.length === 0 ? "Add your first food item. It will be saved in MongoDB." : "Try changing your search or filters."}</p>

                    {foods.length === 0 && <button onClick={openAddFoodForm}><Plus size={16} />Add your first food</button>}

                  </div>

                ) : (

                  <div className="ksr-admin-table-wrap">

                    <table className="ksr-admin-table ksr-admin-food-table">

                      <thead><tr><th>FOOD ITEM</th><th>CATEGORY</th><th>PRICE</th><th>AVAILABILITY</th><th>ACTIONS</th></tr></thead>

                      <tbody>

                        {filteredFoods.map((food) => (

                          <tr key={food._id}>

                            <td><div className="ksr-admin-food-name-cell">

                              {food.image ? <img src={food.image} alt={food.name} className="ksr-admin-food-thumb" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <span className="ksr-admin-food-thumb-placeholder"><ImageIcon size={18} /></span>}

                              <span><strong>{food.name}</strong><span className="ksr-admin-date">{food.description || "No description"}</span></span>

                            </div></td>

                            <td>{food.category}</td>

                            <td><strong>₹{Number(food.price || 0).toFixed(2)}</strong></td>

                            <td><button className={`ksr-admin-food-availability ${food.isAvailable ? "available" : "unavailable"}`} onClick={() => toggleFoodAvailability(food)} title="Click to change availability">

                              {food.isAvailable ? <><PackageCheck size={14} />Available</> : <><PackageX size={14} />Out of Stock</>}

                            </button></td>

                            <td><div className="ksr-admin-food-actions">

                              <button className="ksr-admin-food-icon-btn edit" onClick={() => openEditFoodForm(food)} aria-label={`Edit ${food.name}`} title="Edit food"><Pencil size={15} /></button>

                              <button className="ksr-admin-food-icon-btn delete" onClick={() => deleteFood(food)} aria-label={`Delete ${food.name}`} title="Delete food"><Trash2 size={15} /></button>

                            </div></td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                )}

                <div className="ksr-admin-panel-footer">Showing {filteredFoods.length} of {foods.length} food item(s)</div>

              </section>

              <p className="ksr-admin-disclaimer">Food items are saved through the Food API. Image field currently accepts an image URL; direct image-file upload is not configured.</p>

            </section>

           ) : activeTab === "Kitchen Display" ? (
            <section className="ksr-kitchen-page">
              <div className="ksr-kitchen-heading">
                <div>
                  <p className="ksr-admin-welcome-label">KITCHEN WORKSPACE</p>
                  <h2>Incoming food orders</h2>
                  <p>Orders refresh automatically every 5 seconds.</p>
                </div>
                <div className="ksr-kitchen-heading-actions">
                  <button
                    type="button"
                    className={`ksr-kitchen-sound-toggle ${kitchenSoundEnabled ? "enabled" : ""}`}
                    onClick={() => {
                      const nextEnabled = !kitchenSoundEnabled;
                      setKitchenSoundEnabled(nextEnabled);
                      if (nextEnabled) {
                        // This click unlocks browser audio and plays a short test chime.
                        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                        if (AudioContextClass) {
                          const audioContext = audioContextRef.current || new AudioContextClass();
                          audioContextRef.current = audioContext;
                          if (audioContext.state === "suspended") audioContext.resume();
                          const oscillator = audioContext.createOscillator();
                          const gain = audioContext.createGain();
                          oscillator.type = "sine";
                          oscillator.frequency.value = 880;
                          gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
                          gain.gain.exponentialRampToValueAtTime(0.12, audioContext.currentTime + 0.025);
                          gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.2);
                          oscillator.connect(gain);
                          gain.connect(audioContext.destination);
                          oscillator.start();
                          oscillator.stop(audioContext.currentTime + 0.22);
                        }
                      }
                    }}
                    aria-pressed={kitchenSoundEnabled}
                  >
                    {kitchenSoundEnabled ? "🔔 Sound On" : "🔕 Sound Off"}
                  </button>
                  <button className="ksr-admin-refresh" onClick={fetchOrders} disabled={orderLoading}>
                    <RefreshCw size={15} /> {orderLoading ? "Refreshing..." : "Refresh"}
                  </button>
                </div>
              </div>

              {newOrderAlert && (
                <div className="ksr-kitchen-new-order-alert" role="status">
                  <strong>New order alert</strong>
                  <span>{newOrderAlert}</span>
                  <button type="button" onClick={() => setNewOrderAlert("")} aria-label="Dismiss new order alert">×</button>
                </div>
              )}

              {orderError && <div className="ksr-admin-food-alert error" role="alert">{orderError}</div>}
              {orderMessage && <div className="ksr-admin-food-alert success" role="status">{orderMessage}</div>}

              {orderLoading && orders.length === 0 ? (
                <div className="ksr-admin-empty"><div><RefreshCw size={27} /></div><h4>Loading kitchen orders...</h4><p>Fetching orders from MongoDB.</p></div>
              ) : (
                <div className="ksr-kitchen-columns">
                  {[
                    { title: "New Orders", status: "Pending", list: kitchenNewOrders, color: "new" },
                    { title: "Preparing", status: "Preparing", list: kitchenPreparingOrders, color: "preparing" },
                    { title: "Ready for Pickup", status: "Ready", list: kitchenReadyOrders, color: "ready" },
                  ].map((column) => (
                    <section className={`ksr-kitchen-column ${column.color}`} key={column.status}>
                      <div className="ksr-kitchen-column-title">
                        <h3>{column.title}</h3>
                        <span>{column.list.length}</span>
                      </div>

                      {column.list.length === 0 ? (
                        <div className="ksr-kitchen-empty">No {column.title.toLowerCase()}</div>
                      ) : column.list.map((order) => (
                        <article className="ksr-kitchen-order" key={order._id || order.number}>
                          <div className="ksr-kitchen-order-top">
                            <strong>#{order.number}</strong>
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                          <p className="ksr-kitchen-student">{order.name || "Student"}{order.studentId ? ` · ${order.studentId}` : ""}</p>
                          <div className="ksr-kitchen-items">
                            {(order.items || []).map((item, index) => (
                              <div key={item._id || item.foodId || index}>
                                <span>{item.name || item.title || "Food item"}</span>
                                <strong>× {item.quantity || 1}</strong>
                              </div>
                            ))}
                          </div>
                          <div className="ksr-kitchen-order-footer">
                            <strong>₹{Number(order.totalAmount ?? order.total ?? 0).toFixed(2)}</strong>
                            {column.status === "Pending" && (
                              <button type="button" onClick={() => updateOrderStatus(order, "Preparing")}>Start Preparing</button>
                            )}
                            {column.status === "Preparing" && (
                              <button type="button" onClick={() => updateOrderStatus(order, "Ready")}>Mark as Ready</button>
                            )}
                            {column.status === "Ready" && (
                              <span className="ksr-kitchen-ready-label"><PackageCheck size={15} /> Ready</span>
                            )}
                          </div>
                        </article>
                      ))}
                    </section>
                  ))}
                </div>
              )}
              <p className="ksr-admin-disclaimer">Kitchen actions update the same MongoDB order status used by the student tracking page.</p>
            </section>
          ) : (
            <>
              <div className="ksr-admin-welcome"><div><p className="ksr-admin-welcome-label">CANTEEN CONTROL CENTER</p><h2>Good day, Admin 👋</h2><p>Here's what's happening with your canteen orders.</p></div><div className="ksr-admin-welcome-icon"><TrendingUp size={34} /></div></div>

              <div className="ksr-admin-stat-grid">

                <article className="ksr-admin-stat-card"><div className="ksr-admin-stat-top"><span>Total Orders</span><div className="ksr-admin-stat-icon purple"><ShoppingBag size={20} /></div></div><strong>{stats.total}</strong><p>All recorded orders</p></article>

                <article className="ksr-admin-stat-card"><div className="ksr-admin-stat-top"><span>In Progress</span><div className="ksr-admin-stat-icon orange"><Clock3 size={20} /></div></div><strong>{stats.pending}</strong><p>Orders needing attention</p></article>

                <article className="ksr-admin-stat-card"><div className="ksr-admin-stat-top"><span>Ready for Pickup</span><div className="ksr-admin-stat-icon blue"><CheckCircle2 size={20} /></div></div><strong>{stats.ready}</strong><p>Waiting for students</p></article>

                <article className="ksr-admin-stat-card"><div className="ksr-admin-stat-top"><span>Completed Sales</span><div className="ksr-admin-stat-icon green"><IndianRupee size={20} /></div></div><strong>₹{stats.sales.toFixed(2)}</strong><p>From completed orders</p></article>

              </div>

              <section className="ksr-admin-orders-panel">

                <div className="ksr-admin-orders-heading"><div><h3>{activeTab === "Orders" ? "Recent Orders" : "Order Overview"}</h3><p>Review orders and update their status.</p></div><button className="ksr-admin-refresh" onClick={() => { setSearch(""); setStatusFilter("All"); fetchOrders(); }}><RefreshCw size={15} />Reset filters</button></div>

                <div className="ksr-admin-filters">

                  <div className="ksr-admin-search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order, student name or ID..." /></div>

                  <div className="ksr-admin-status-filter"><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter orders by status"><option value="All">All statuses</option>{STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select><ChevronDown size={15} /></div>

                </div>

                {orderError && <div className="ksr-admin-food-alert error" role="alert">{orderError}</div>}

                {orderMessage && <div className="ksr-admin-food-alert success" role="status">{orderMessage}</div>}

                {orderLoading ? (

                  <div className="ksr-admin-empty"><div><RefreshCw size={27} /></div><h4>Loading orders...</h4><p>Fetching student orders from MongoDB.</p></div>

                ) : filteredOrders.length === 0 ? (

                  <div className="ksr-admin-empty"><div><ClipboardList size={30} /></div><h4>No orders found</h4><p>{orders.length === 0 ? "Student orders will appear here after someone places an order." : "Try changing your search or status filter."}</p>{orders.length === 0 && <button onClick={() => navigate("/")}><Users size={16} />Open student website</button>}</div>

                ) : (

                  <div className="ksr-admin-table-wrap"><table className="ksr-admin-table">

                    <thead><tr><th>ORDER</th><th>STUDENT</th><th>ITEMS</th><th>TOTAL</th><th>STATUS</th><th>UPDATE STATUS</th></tr></thead>

                    <tbody>{filteredOrders.map((order) => (

                      <tr key={order._id || order.number}>

                        <td><strong className="ksr-admin-order-number">#{order.number}</strong><span className="ksr-admin-date">{formatDate(order.createdAt)}</span></td>

                        <td><strong>{order.name || "Student"}</strong><span className="ksr-admin-date">{order.studentId || "Student ID not provided"}</span></td>

                        <td><span className="ksr-admin-item-count">{(order.items || []).reduce((sum, item) => sum + Number(item.quantity || 1), 0)} item(s)</span><span className="ksr-admin-date">{(order.items || []).map((item) => `${item.name || "Food"} × ${item.quantity || 1}`).join(", ")}</span></td>

                        <td><strong>₹{Number(order.totalAmount ?? order.total ?? 0).toFixed(2)}</strong><span className="ksr-admin-date">{order.paymentMethod || "Payment not specified"}</span></td>

                        <td><span className={`ksr-admin-status status-${String(order.status || "Pending").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "")}`}>{order.status || "Pending"}</span></td>

                        <td><select className="ksr-admin-update-select" value={order.status || "Pending"} onChange={(event) => updateOrderStatus(order, event.target.value)} aria-label={`Update status for order ${order.number}`}>{STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select></td>

                      </tr>

                    ))}</tbody>

                  </table></div>

                )}

                <div className="ksr-admin-panel-footer">Showing {filteredOrders.length} of {orders.length} order(s)</div>

              </section>

              <p className="ksr-admin-disclaimer">Orders are loaded from your MongoDB database. Status changes are saved through the admin API.</p>

            </>

          )}

        </div>

      </section>

      {showFoodForm && (

        <div className="ksr-admin-modal-backdrop" onMouseDown={closeFoodForm}>

          <section className="ksr-admin-food-modal" role="dialog" aria-modal="true" aria-labelledby="ksr-food-form-title" onMouseDown={(event) => event.stopPropagation()}>

            <div className="ksr-admin-food-modal-heading">

              <div><span>MENU ITEM</span><h2 id="ksr-food-form-title">{editingFoodId ? "Edit food item" : "Add new food"}</h2></div>

              <button className="ksr-admin-food-close" onClick={closeFoodForm} aria-label="Close form"><X size={19} /></button>

            </div>

            <form onSubmit={saveFood} className="ksr-admin-food-form">

              <label>Food name \\*<input name="name" value={foodForm.name} onChange={updateFoodField} placeholder="e.g. Masala Dosa" required /></label>

              <div className="ksr-admin-food-form-row">

                <label>Category \\*<select name="category" value={foodForm.category} onChange={updateFoodField} required>{FOOD_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>

                <label>Price (₹) \\*<input name="price" type="number" min="0" step="0.01" value={foodForm.price} onChange={updateFoodField} placeholder="e.g. 50" required /></label>

              </div>

              <label>Description<textarea name="description" value={foodForm.description} onChange={updateFoodField} placeholder="Short description of the food item" rows="3" /></label>

              <label>Image URL<input name="image" type="url" value={foodForm.image} onChange={updateFoodField} placeholder="https\\://example.com/food-image.jpg" /></label>

              {foodForm.image && <div className="ksr-admin-food-image-preview"><img src={foodForm.image} alt="Food preview" onError={(event) => { event.currentTarget.style.display = "none"; }} /></div>}

              <label className="ksr-admin-food-checkbox"><input type="checkbox" name="isAvailable" checked={foodForm.isAvailable} onChange={updateFoodField} />Available for students to order</label>

              {foodError && <div className="ksr-admin-food-alert error" role="alert">{foodError}</div>}

              <div className="ksr-admin-food-form-actions">

                <button type="button" className="ksr-admin-food-cancel" onClick={closeFoodForm} disabled={savingFood}>Cancel</button>

                <button type="submit" className="ksr-admin-food-add" disabled={savingFood}>{savingFood ? "Saving..." : editingFoodId ? "Save Changes" : "Add Food"}</button>

              </div>

            </form>

          </section>

        </div>

      )}

    </main>

  );

}
