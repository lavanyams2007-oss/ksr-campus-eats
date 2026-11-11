
import React from "react";
import { ArrowLeft, Package, ReceiptText } from "lucide-react";
import "./MyOrders.css";

function MyOrders({ orders = [], onBack }) {
  const getOrderNumber = (order) =>
    order.number ||
    (order._id ? `KSR${order._id.slice(-6).toUpperCase()}` : "KSR");

  const getStatus = (status) => {
    const statuses = {
      Pending: "Order Placed",
      Preparing: "Preparing",
      Ready: "Ready for Pickup",
      Completed: "Completed",
      Cancelled: "Cancelled",
    };

    return statuses[status] || status || "Order Placed";
  };

  return (
    <div className="my-orders-page">
      <div className="my-orders-container">
        <button className="my-orders-back" onClick={onBack}>
          <ArrowLeft size={18} />
          Back to menu
        </button>

        <div className="my-orders-heading">
          <div className="my-orders-icon">
            <ReceiptText size={28} />
          </div>
          <p className="my-orders-eyebrow">KSR CAMPUS EATS</p>
          <h1>My Orders</h1>
          <p>View your canteen orders in one place.</p>
        </div>

        {orders.length === 0 ? (
          <div className="my-orders-empty">
            <Package size={42} />
            <h2>No orders yet</h2>
            <p>Your placed orders will appear here.</p>
            <button onClick={onBack}>Explore Menu</button>
          </div>
        ) : (
          <div className="my-orders-list">
            {orders.map((order) => {
              const orderNumber = getOrderNumber(order);
              const total = order.totalAmount ?? order.total ?? 0;

              return (
                <article className="my-order-card" key={order._id || order.number}>
                  <div className="my-order-top">
                    <div>
                      <span className="my-order-label">ORDER ID</span>
                      <h2>#{orderNumber}</h2>
                    </div>

                    <span className="my-order-status">
                      {getStatus(order.status)}
                    </span>
                  </div>

                  <div className="my-order-items">
                    {(order.items || []).map((item, index) => (
                      <div
                        className="my-order-item"
                        key={`${orderNumber}-${index}`}
                      >
                        <span>
                          {item.name || "Food item"} × {item.quantity || 1}
                        </span>
                        <span>
                          ₹
                          {(
                            Number(item.price || 0) *
                            Number(item.quantity || 1)
                          ).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="my-order-bottom">
                    <div>
                      <span className="my-order-label">PAYMENT</span>
                      <p>
                        {order.paymentMethod === "Counter"
                          ? "Pay at counter"
                          : order.paymentMethod === "Online"
                          ? "Online payment"
                          : order.paymentMethod || "Not specified"}
                      </p>
                    </div>

                    <div className="my-order-total">
                      <span className="my-order-label">TOTAL</span>
                      <strong>₹{Number(total).toFixed(2)}</strong>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;
