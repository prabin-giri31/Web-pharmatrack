import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBell,
  FiAlertCircle,
  FiShoppingCart,
  FiCheckCircle,
  FiClock,
  FiCheck,
  FiLoader,
  FiInbox,
} from "react-icons/fi";
import { API_ENDPOINTS, apiRequest } from "../../config/api";
import { formatDate } from "../../utils/formatters";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const result = await apiRequest(API_ENDPOINTS.notifications);
      if (result.success) {
        setNotifications(result.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      const result = await apiRequest(`${API_ENDPOINTS.notifications}/read-all`, {
        method: "PATCH",
      });
      if (result.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (notification.unread) {
      try {
        await apiRequest(`${API_ENDPOINTS.notifications}/${notification.id}/read`, {
          method: "PATCH",
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, unread: false } : n))
        );
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "low_stock":
        return <FiAlertCircle className="w-5 h-5 text-red-500" />;
      case "sales_order":
        return <FiShoppingCart className="w-5 h-5 text-blue-500" />;
      case "success":
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <FiBell className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatNotificationTime = (time) => {
    if (!time) return "";
    const date = new Date(time);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
    return formatDate(time);
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FiBell className="w-6 h-6" />
              Notifications
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={markingAll}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {markingAll ? (
                <FiLoader className="w-4 h-4 animate-spin" />
              ) : (
                <FiCheck className="w-4 h-4" />
              )}
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6">
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <FiLoader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <FiInbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-500">You're all caught up! Check back later for updates.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {notifications.map((notification, index) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left px-4 sm:px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors ${
                    index !== notifications.length - 1 ? "border-b border-gray-100" : ""
                  } ${notification.unread ? "bg-blue-50/50" : ""}`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm sm:text-base ${
                        notification.unread ? "font-semibold text-gray-900" : "text-gray-700"
                      }`}
                    >
                      {notification.title}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      {formatNotificationTime(notification.time)}
                    </p>
                  </div>
                  {notification.unread && (
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
