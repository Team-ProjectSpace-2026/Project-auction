import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";

const TurnstileWidget = forwardRef(({ onVerify, onExpire, siteKey }, ref) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState(null);

  useImperativeHandle(ref, () => ({
    resetWidget: () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current);
          setStatus("ready");
          setErrorMessage(null);
        } catch (e) {
          console.error("[Turnstile] Reset error:", e);
        }
      }
    },
  }));

  useEffect(() => {
    if (!siteKey) {
      setStatus("error");
      setErrorMessage("No site key configured");
      return;
    }

    let mounted = true;
    let checkInterval;
    let timeoutId;

    const renderWidget = () => {
      if (!mounted || !window.turnstile || !containerRef.current || widgetIdRef.current) {
        return;
      }

      try {
        console.log("[Turnstile] Rendering widget with siteKey:", siteKey);
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => {
            console.log("[Turnstile] Token received");
            if (mounted) setStatus("verified");
            onVerify?.(token);
          },
          "expired-callback": () => {
            console.log("[Turnstile] Token expired");
            if (mounted) setStatus("ready");
            onExpire?.();
          },
          "error-callback": (err) => {
            console.error("[Turnstile] Widget error:", err);
            if (mounted) {
              setStatus("error");
              setErrorMessage("Security verification failed. Please try again.");
            }
            onExpire?.();
          },
          theme: "light",
          appearance: "always",
          "refresh-timeout": "auto",
        });

        widgetIdRef.current = id;
        if (mounted) setStatus("ready");
        console.log("[Turnstile] Widget rendered with ID:", id);
      } catch (error) {
        console.error("[Turnstile] Render error:", error);
        if (mounted) {
          setStatus("error");
          setErrorMessage("Failed to initialize security verification.");
        }
      }
    };

    const checkAndRender = () => {
      if (window.__turnstileLoadError) {
        if (mounted) {
          setStatus("error");
          setErrorMessage("Failed to load Cloudflare security. Check your network connection.");
        }
        return;
      }

      if (window.turnstile && containerRef.current) {
        clearInterval(checkInterval);
        renderWidget();
      }
    };

    checkInterval = setInterval(checkAndRender, 100);

    timeoutId = setTimeout(() => {
      if (mounted && !widgetIdRef.current) {
        clearInterval(checkInterval);
        setStatus("error");
        setErrorMessage("Security verification timed out. Please refresh the page.");
      }
    }, 15000);

    return () => {
      mounted = false;
      clearInterval(checkInterval);
      clearTimeout(timeoutId);
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {}
      }
    };
  }, [siteKey, onVerify, onExpire]);

  if (!siteKey) {
    return null;
  }

  // Big verified checkmark
  if (status === "verified") {
    return (
      <div
        style={{
          marginBottom: "16px",
          marginTop: "8px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "#dcfce7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "8px",
            animation: "scaleIn 0.3s ease-out",
          }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16a34a"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <span
          style={{
            color: "#16a34a",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          Verified
        </span>
        <style>{`
          @keyframes scaleIn {
            from { transform: scale(0.5); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        marginBottom: "16px",
        marginTop: "8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {errorMessage && (
        <div
          style={{
            padding: "8px 12px",
            marginBottom: "8px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "6px",
            color: "#dc2626",
            fontSize: "12px",
            textAlign: "center",
            width: "100%",
          }}
        >
          {errorMessage}
        </div>
      )}
      <div
        ref={containerRef}
        style={{
          minHeight: "65px",
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      />
      {status === "loading" && !errorMessage && (
        <div
          style={{
            color: "#6b7280",
            fontSize: "12px",
            marginTop: "8px",
          }}
        >
          Loading security verification...
        </div>
      )}
    </div>
  );
});

TurnstileWidget.displayName = "TurnstileWidget";

export default TurnstileWidget;
