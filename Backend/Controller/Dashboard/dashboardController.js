import { Op } from "sequelize";
import { Item, SalesOrder } from "../../Model/index.js";

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date().toISOString().slice(0, 10);

    const [totalItems, lowStockItems, todaysSales, recentOrders] = await Promise.all([
      Item.count({ where: { userId } }),
      Item.count({
        where: {
          userId,
          stockOnHand: { [Op.lte]: 10 },
        },
      }),
      SalesOrder.sum("grandTotal", {
        where: {
          userId,
          orderDate: today,
          status: { [Op.in]: ["confirmed", "delivered", "invoiced"] },
        },
      }),
      SalesOrder.findAll({
        where: { userId },
        order: [["createdAt", "DESC"]],
        limit: 5,
        attributes: ["id", "orderNumber", "status", "grandTotal", "createdAt"],
      }),
    ]);

    res.status(200).json({
      totalItems,
      lowStockItems,
      todaysSales: Number(todaysSales || 0),
      recentOrders,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};
