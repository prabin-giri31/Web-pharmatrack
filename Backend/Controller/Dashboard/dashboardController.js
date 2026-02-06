import { Op, fn, col } from "sequelize";
import { Item, SalesOrder, Supplier, Invoice, PurchaseReceive, Notification } from "../../Model/index.js";

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    
    // Calculate date ranges
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get all items first to calculate low stock properly
    const allItems = await Item.findAll({
      where: { userId, status: "active" },
      attributes: ["id", "name", "sku", "stockOnHand", "reorderLevel", "unit", "expiryDate"],
    });

    // Calculate low stock items (stock <= reorderLevel or stock <= 10)
    const lowStockList = allItems.filter(item => 
      item.stockOnHand <= (item.reorderLevel || 10)
    ).sort((a, b) => a.stockOnHand - b.stockOnHand).slice(0, 10);

    // Calculate expiring items
    const expiringItems = allItems.filter(item => {
      if (!item.expiryDate) return false;
      const expiry = new Date(item.expiryDate);
      return expiry >= today && expiry <= thirtyDaysFromNow;
    }).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)).slice(0, 10);

    const [
      todaysSales,
      totalVendors,
      pendingOrders,
      recentOrders,
      recentPurchases,
      recentInvoices,
      notifications,
      salesByDay
    ] = await Promise.all([
      // Today's sales total
      Invoice.sum("netPayable", {
        where: {
          userId,
          invoiceDate: todayStr,
        },
      }),
      
      // Total vendors count
      Supplier.count({ where: { userId } }),
      
      // Pending orders count
      SalesOrder.count({
        where: {
          userId,
          status: { [Op.in]: ["pending", "draft"] },
        },
      }),
      
      // Recent sales orders
      SalesOrder.findAll({
        where: { userId },
        order: [["createdAt", "DESC"]],
        limit: 5,
        attributes: ["id", "orderNumber", "status", "grandTotal", "orderDate", "createdAt"],
      }),
      
      // Recent purchases
      PurchaseReceive.findAll({
        where: { userId },
        order: [["createdAt", "DESC"]],
        limit: 5,
        attributes: ["id", "receiveNumber", "status", "grandTotal", "receiveDate", "createdAt"],
        include: [{
          model: Supplier,
          as: "supplier",
          attributes: ["name", "displayName"]
        }]
      }),
      
      // Recent invoices
      Invoice.findAll({
        where: { userId },
        order: [["createdAt", "DESC"]],
        limit: 5,
        attributes: ["id", "invoiceNumber", "paymentStatus", "netPayable", "invoiceDate", "createdAt"],
      }),
      
      // Unread notifications
      Notification.findAll({
        where: { 
          userId,
          unread: true
        },
        order: [["createdAt", "DESC"]],
        limit: 5,
      }),
      
      // Sales data for chart (last 7 days)
      Invoice.findAll({
        where: {
          userId,
          invoiceDate: {
            [Op.gte]: sevenDaysAgo.toISOString().slice(0, 10)
          }
        },
        attributes: [
          "invoiceDate",
          [fn("SUM", col("netPayable")), "totalSales"],
          [fn("COUNT", col("id")), "orderCount"]
        ],
        group: ["invoiceDate"],
        order: [["invoiceDate", "ASC"]],
        raw: true
      })
    ]);

    // Process sales data for chart - fill in missing days
    const salesChartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      const dayData = salesByDay.find(d => d.invoiceDate === dateStr);
      
      salesChartData.push({
        date: dateStr,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        totalSales: Number(dayData?.totalSales || 0),
        orderCount: Number(dayData?.orderCount || 0)
      });
    }

    res.status(200).json({
      // Summary cards
      totalItems: allItems.length,
      lowStockItems: lowStockList.length,
      todaysSales: Number(todaysSales || 0),
      totalVendors,
      pendingOrders,
      
      // Lists
      recentOrders,
      lowStockList,
      expiringItems,
      recentPurchases,
      recentInvoices,
      notifications,
      
      // Chart data
      salesChartData
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};

// Mark notification as read
export const markNotificationRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    
    await Notification.update(
      { unread: false },
      { where: { id, userId } }
    );
    
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark notification error:", error);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
};

// Mark all notifications as read
export const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    await Notification.update(
      { unread: false },
      { where: { userId, unread: true } }
    );
    
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all notifications error:", error);
    res.status(500).json({ message: "Failed to mark notifications as read" });
  }
};
