import { Op } from "sequelize";
import { Item, Notification, SalesOrder } from "../../Model/index.js";

const seedNotifications = async (userId) => {
  const notifications = [];

  const lowStockItems = await Item.findAll({
    where: {
      userId,
      stockOnHand: { [Op.lte]: 10 },
    },
    attributes: ["id", "name", "stockOnHand"],
    limit: 5,
  });

  lowStockItems.forEach((item) => {
    notifications.push({
      userId,
      type: "low_stock",
      title: `Low stock: ${item.name} (${item.stockOnHand})`,
      link: "/items",
      isRead: false,
    });
  });

  const recentOrders = await SalesOrder.findAll({
    where: {
      userId,
      status: "confirmed",
    },
    attributes: ["id", "orderNumber"],
    order: [["createdAt", "DESC"]],
    limit: 5,
  });

  recentOrders.forEach((order) => {
    notifications.push({
      userId,
      type: "sales_order",
      title: `Sales order confirmed: ${order.orderNumber}`,
      link: "/sales/orders",
      isRead: false,
    });
  });

  if (!notifications.length) {
    return;
  }

  await Notification.bulkCreate(notifications);
};

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;

    let notifications = await Notification.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    if (!notifications.length) {
      await seedNotifications(userId);
      notifications = await Notification.findAll({
        where: { userId },
        order: [["createdAt", "DESC"]],
      });
    }

    return res.status(200).json(
      notifications.map((n) => ({
        id: n.id,
        title: n.title,
        time: n.createdAt,
        unread: !n.isRead,
        type: n.type,
        link: n.link,
      }))
    );
  } catch (error) {
    console.error("Notification Error:", error);
    return res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

export const markAllRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    await Notification.update({ isRead: true }, { where: { userId } });
    return res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark All Read Error:", error);
    return res.status(500).json({ message: "Failed to update notifications" });
  }
};

export const markOneRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    await Notification.update({ isRead: true }, { where: { id, userId } });
    return res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark One Read Error:", error);
    return res.status(500).json({ message: "Failed to update notification" });
  }
};
