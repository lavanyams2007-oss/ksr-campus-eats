
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChefHat,
  Clock3,
  PackageCheck,
} from "lucide-react";
import "./OrderTracking.css";

const STEPS = [
  {
    label: "Order Placed",
    detail: "We received your order.",
    icon: Clock3,
  },
  {
    label: "Order Accepted",
    detail: "The canteen has accepted your order.",
    icon: CheckCircle2,
  },
  {
    label: "Preparing",
    detail: "Your food is being prepared fresh.",
    icon: ChefHat,
  },
  {
    label: "Ready for Pickup",
    detail: "Please collect your order from the assigned counter.",
    icon: PackageCheck,
  },
];

function normalizeStatus(status) {
  const value = String(status || "Pending").trim().toLowerCase();

  const statusMap = {
    pending: "Pending",
    "order placed": "Pending",
    "order accepted": "Order Accepted",
    preparing: "Preparing",
    "preparing food": "Preparing",
    ready: "Ready",
    "ready for pickup": "Ready",
    collected: "Completed",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return statusMap[value] || "Pending";
}

function getStepIndex(status) {
  const normalized = normalizeStatus(status);

  if (normalized === "Order Accepted") return 1;
  if (normalized === "Preparing") return 2;

  if (
    normalized === "Ready" ||
    normalized === "Completed"
  ) {
    return 3;
  }

  return 0;
}

// Premium three-note notification chime.
function playReadyTone() {
  let audioContext;

  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    audioContext = new AudioContextClass();

    const playNote = (frequency, startTime, duration) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(
        frequency,
        startTime
      );

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(
        0.16,
        startTime + 0.04
      );
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        startTime + duration
      );

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    if (audioContext.state !== "running") {
      audioContext.close();
      return;
    }

    const now = audioContext.currentTime;

    playNote(784, now, 0.22);
    playNote(988, now + 0.28, 0.22);
    playNote(1175, now + 0.58, 0.45);

    setTimeout(() => {
      audioContext?.close();
    }, 1500);
  } catch (error) {
    console.error("Ready notification error:", error);
    audioContext?.close();
  }
}

export default function OrderTracking({
  onBack,
  order,
  orderNumber,
  onStatusChange,
}) {
  const resolvedOrderNumber =
    order?.number || orderNumber || "KSR-DEMO";

  const counterNumber = order?.counterNumber || 1;

  const [currentStatus, setCurrentStatus] = useState(
    normalizeStatus(order?.status)
  );

  const [trackingError, setTrackingError] = useState("");

  const previousStatusRef = useRef(
    normalizeStatus(order?.status)
  );

  const currentStep = getStepIndex(currentStatus);

  const isReady = currentStatus === "Ready";
  const isCompleted = currentStatus === "Completed";
  const isCancelled = currentStatus === "Cancelled";

  // Synchronize status when a different order is selected.
  useEffect(() => {
    const initialStatus = normalizeStatus(order?.status);

    previousStatusRef.current = initialStatus;
    setCurrentStatus(initialStatus);
    setTrackingError("");
  }, [order?._id]);

  // Fetch the latest order status from MongoDB.
  useEffect(() => {
    const token = sessionStorage.getItem("ksrStudentToken");

    if (!token || !order?._id) return;

    const apiBase = (
      import.meta.env.VITE_API_URL || "http://localhost:5000"
    ).replace(/\/$/, "");

    let active = true;

    async function fetchLatestStatus() {
      try {
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
          throw new Error(
            data.message || "Unable to refresh order status."
          );
        }

        const latestOrder = (data.orders || []).find(
          (item) =>
            String(item._id) === String(order._id)
        );

        if (!latestOrder || !active) return;

        const latestStatus = normalizeStatus(
          latestOrder.status
        );

        const previousStatus = previousStatusRef.current;

        // Play once when the order changes to Ready.
        if (
          previousStatus !== "Ready" &&
          latestStatus === "Ready"
        ) {
          playReadyTone();
        }

        previousStatusRef.current = latestStatus;

        setCurrentStatus(latestStatus);
        setTrackingError("");

        onStatusChange?.(
          resolvedOrderNumber,
          latestStatus
        );
      } catch (error) {
        if (active) {
          console.error("Tracking refresh error:", error);

          setTrackingError(
            "Unable to refresh your order status. Please try again."
          );
        }
      }
    }

    fetchLatestStatus();

    const timer = window.setInterval(
      fetchLatestStatus,
      5000
    );

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [order?._id, resolvedOrderNumber, onStatusChange]);

  return (
    <div className="tracking-page">
      <div className="tracking-card">
        <button
          className="tracking-back-button"
          type="button"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
          Back to menu
        </button>

        <div className="tracking-header">
          <span className="tracking-kicker">
            KSR CAMPUS EATS
          </span>

          <h1>
            {isCancelled
              ? "Your order was cancelled"
              : isCompleted
              ? "Order completed!"
              : isReady
              ? "Your order is ready!"
              : "Track your order"}
          </h1>

          <p>
            Order <strong>#{resolvedOrderNumber}</strong>
          </p>
        </div>

        {isReady && (
          <section
            className="pickup-notice"
            role="status"
            aria-live="polite"
          >
            <div className="pickup-notice-icon">
              <PackageCheck size={28} />
            </div>

            <div>
              <span className="pickup-eyebrow">
                PLEASE COLLECT YOUR ORDER AT
              </span>

              <h2>COUNTER {counterNumber}</h2>

              <p>
                Show order number{" "}
                <strong>{resolvedOrderNumber}</strong> to the
                canteen staff.
              </p>
            </div>
          </section>
        )}

        <div className="tracking-status-row">
          <div>
            <span className="tracking-muted">
              CURRENT STATUS
            </span>

            <h2>
              {isReady
                ? "Ready for Pickup"
                : currentStatus}
            </h2>
          </div>

          <span
            className={`tracking-status-pill ${
              isReady || isCompleted ? "is-ready" : ""
            }`}
          >
            {isCancelled
              ? "CANCELLED"
              : isCompleted
              ? "COMPLETED"
              : isReady
              ? "READY"
              : "IN PROGRESS"}
          </span>
        </div>

        {trackingError && (
          <p role="alert" className="tracking-demo-note">
            {trackingError}
          </p>
        )}

        {!isCancelled && (
          <div className="tracking-timeline">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const complete = index <= currentStep;

              return (
                <div
                  className={`tracking-step ${
                    complete ? "is-complete" : ""
                  }`}
                  key={step.label}
                >
                  <div className="tracking-step-marker">
                    {index < currentStep ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      <StepIcon size={20} />
                    )}
                  </div>

                  <div className="tracking-step-copy">
                    <strong>{step.label}</strong>

                    <p>
                      {index === 3
                        ? `Collect at Counter ${counterNumber} when ready.`
                        : step.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="tracking-demo-note">
          Order status is refreshed automatically every 5
          seconds using the canteen order database.
        </p>

        <button
          className="tracking-primary-button"
          type="button"
          onClick={onBack}
        >
          {isReady || isCompleted || isCancelled
            ? "Back to Home"
            : "Continue Browsing"}
        </button>
      </div>
    </div>
  );
}
