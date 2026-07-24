// ============================================================
// notifiche.js — Messaggio che compare in cima alla pagina
// Richiamato da Login/scriptLogin.js
// ============================================================

function showNotification(message, type) {
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) existingNotification.remove();

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  if (!document.querySelector("style[data-notification-style]")) {
    document.head.insertAdjacentHTML(
      "beforeend",
      `
      <style data-notification-style>
        .notification {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          padding: 12px 22px;
          border-radius: 999px;
          color: white;
          font-weight: 500;
          z-index: 1000;
          animation: notificationAppear 0.3s, notificationDisappear 0.3s 3s;
        }
        @keyframes notificationAppear {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes notificationDisappear {
          from { opacity: 1; transform: translate(-50%, 0); }
          to { opacity: 0; transform: translate(-50%, -20px); }
        }
        .notification.success { background-color: #0ca678; }
        .notification.error { background-color: #e03131; }
        .notification.warning { background-color: #f2701a; color: #fff; }
        .shake {
          animation: shake 0.5s;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      </style>
    `,
    );
  }

  document.body.appendChild(notification);
  setTimeout(() => {
    if (notification.parentNode) notification.remove();
  }, 3500);
}
