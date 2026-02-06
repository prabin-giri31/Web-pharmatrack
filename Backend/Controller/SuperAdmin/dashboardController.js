import { Op, fn, col, literal } from "sequelize";
import { User, Item, Invoice, SalesOrder, Supplier, Customer, UserActivity, SystemSettings } from "../../Model/index.js";

// GET /api/super-admin/dashboard
export const getSuperAdminDashboard = async (req, res) => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      pendingUsers,
      activeUsers,
      lockedUsers,
      totalItems,
      totalSales,
      totalCustomers,
      totalSuppliers,
      recentActivities,
      userRegistrations,
      salesByUser
    ] = await Promise.all([
      // Total users count
      User.count(),
      
      // Pending approval users
      User.count({ where: { status: "pending", isApproved: false } }),
      
      // Active users
      User.count({ where: { status: "active" } }),
      
      // Locked users
      User.count({ where: { status: "locked" } }),
      
      // Total items in system
      Item.count(),
      
      // Total sales (all users)
      Invoice.sum("netPayable") || 0,
      
      // Total customers
      Customer.count(),
      
      // Total suppliers
      Supplier.count(),
      
      // Recent activities
      UserActivity.findAll({
        include: [{
          model: User,
          as: "user",
          attributes: ["id", "ownerName", "pharmacyName", "email"]
        }],
        order: [["createdAt", "DESC"]],
        limit: 10
      }),
      
      // User registrations in last 30 days
      User.findAll({
        where: {
          createdAt: { [Op.gte]: thirtyDaysAgo }
        },
        attributes: [
          [fn("DATE", col("createdAt")), "date"],
          [fn("COUNT", col("id")), "count"]
        ],
        group: [fn("DATE", col("createdAt"))],
        order: [[fn("DATE", col("createdAt")), "ASC"]],
        raw: true
      }),
      
      // Top 5 users by sales
      Invoice.findAll({
        attributes: [
          "userId",
          [fn("SUM", col("netPayable")), "totalSales"],
          [fn("COUNT", col("id")), "invoiceCount"]
        ],
        include: [{
          model: User,
          as: "user",
          attributes: ["id", "ownerName", "pharmacyName"]
        }],
        group: ["userId", "user.id"],
        order: [[fn("SUM", col("netPayable")), "DESC"]],
        limit: 5
      })
    ]);

    // Get suspicious activities count
    const suspiciousActivities = await UserActivity.count({
      where: { isSuspicious: true }
    });

    // Get recent logins
    const recentLogins = await User.findAll({
      where: {
        lastLoginAt: { [Op.not]: null }
      },
      attributes: ["id", "ownerName", "pharmacyName", "email", "lastLoginAt", "lastLoginIp"],
      order: [["lastLoginAt", "DESC"]],
      limit: 10
    });

    res.status(200).json({
      stats: {
        totalUsers,
        pendingUsers,
        activeUsers,
        lockedUsers,
        totalItems,
        totalSales: Number(totalSales || 0),
        totalCustomers,
        totalSuppliers,
        suspiciousActivities
      },
      recentActivities: recentActivities.map(a => ({
        id: a.id,
        action: a.action,
        description: a.description,
        user: a.user ? {
          id: a.user.id,
          name: a.user.ownerName,
          pharmacy: a.user.pharmacyName,
          email: a.user.email
        } : null,
        ipAddress: a.ipAddress,
        isSuspicious: a.isSuspicious,
        createdAt: a.createdAt
      })),
      recentLogins: recentLogins.map(u => ({
        id: u.id,
        name: u.ownerName,
        pharmacy: u.pharmacyName,
        email: u.email,
        lastLoginAt: u.lastLoginAt,
        lastLoginIp: u.lastLoginIp
      })),
      userRegistrations,
      topUsersBySales: salesByUser.map(s => ({
        userId: s.userId,
        name: s.user?.ownerName,
        pharmacy: s.user?.pharmacyName,
        totalSales: Number(s.dataValues.totalSales || 0),
        invoiceCount: Number(s.dataValues.invoiceCount || 0)
      }))
    });
  } catch (error) {
    console.error("Super Admin Dashboard Error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};

// GET /api/super-admin/system-overview
export const getSystemOverview = async (req, res) => {
  try {
    const [
      itemsByUser,
      salesByMonth,
      usersByStatus,
      usersByRole
    ] = await Promise.all([
      // Items count by user
      Item.findAll({
        attributes: [
          "userId",
          [fn("COUNT", col("id")), "itemCount"]
        ],
        include: [{
          model: User,
          as: "user",
          attributes: ["id", "pharmacyName"]
        }],
        group: ["userId", "user.id"],
        order: [[fn("COUNT", col("id")), "DESC"]],
        limit: 10
      }),
      
      // Sales by month (last 6 months)
      Invoice.findAll({
        attributes: [
          [fn("DATE_TRUNC", "month", col("invoiceDate")), "month"],
          [fn("SUM", col("netPayable")), "totalSales"],
          [fn("COUNT", col("id")), "invoiceCount"]
        ],
        where: {
          invoiceDate: {
            [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 6))
          }
        },
        group: [fn("DATE_TRUNC", "month", col("invoiceDate"))],
        order: [[fn("DATE_TRUNC", "month", col("invoiceDate")), "ASC"]],
        raw: true
      }),
      
      // Users by status
      User.findAll({
        attributes: [
          "status",
          [fn("COUNT", col("id")), "count"]
        ],
        group: ["status"],
        raw: true
      }),
      
      // Users by role
      User.findAll({
        attributes: [
          "role",
          [fn("COUNT", col("id")), "count"]
        ],
        group: ["role"],
        raw: true
      })
    ]);

    res.status(200).json({
      itemsByUser: itemsByUser.map(i => ({
        userId: i.userId,
        pharmacy: i.user?.pharmacyName,
        itemCount: Number(i.dataValues.itemCount || 0)
      })),
      salesByMonth: salesByMonth.map(s => ({
        month: s.month,
        totalSales: Number(s.totalSales || 0),
        invoiceCount: Number(s.invoiceCount || 0)
      })),
      usersByStatus,
      usersByRole
    });
  } catch (error) {
    console.error("System Overview Error:", error);
    res.status(500).json({ message: "Failed to fetch system overview" });
  }
};
