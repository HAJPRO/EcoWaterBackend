const User = require("../../../models/user.model");
const Customer = require("../../../models/Customers/customer.model");
const Order = require("../../../models/Sale/orders/sales.model");
const moment = require("moment");

class SaleStatisticService {
    async GetAllDayStatistics() {
        try {
            const [
                metrics,
                charBarOptions,
                charLineOptions,
                topDrivers,
                topCustomers
            ] = await Promise.all([
                this.getMainMetrics(),
                this.getBarChartStats(),
                this.getLineChartStats(),
                this.getTopPerformers("driverId", "users", 5),
                this.getTopPerformers("customerId", "customers", 5)
            ]);

            return { metrics, charBarOptions, charLineOptions, topDrivers, topCustomers };
        } catch (error) {
            throw new Error(`Statistika yig'ishda xatolik: ${error.message}`);
        }
    }

    async getMainMetrics() {
        const startToday = moment().startOf('day').toDate();
        const startMonth = moment().startOf('month').toDate();

        const [todaySale, monthCust] = await Promise.all([
            Order.aggregate([
                { $match: { createdAt: { $gte: startToday }, status: "Yetkazib berildi" } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ]),
            Customer.countDocuments({ createdAt: { $gte: startMonth } })
        ]);

        return [
            { title: "Bugungi tushum", value: todaySale[0]?.total || 0, change: 12, text: "kechagiga nisbatan" },
            { title: "Yangi mijozlar", value: monthCust, change: 8, text: "bu oyda" },
            { title: "Suv iste'moli", value: 450, change: -3, text: "m3 (kunlik)" }
        ];
    }

    async getBarChartStats() {
        return Promise.all([
            this._getMonthlyProductStats({ "products.pro_type": "Gazli" }, "Gazli", "bar"),
            this._getMonthlyProductStats({ "products.pro_type": "Gazsiz" }, "Gazsiz", "bar"),
            this._getMonthlyProductStats({ "products.pro_type": "Sharbatlar" }, "Sharbatlar", "bar")
        ]);
    }

    async getLineChartStats() {
        return Promise.all([
            this._getMonthlyProductStats({ "products.pro_name": "Kola" }, "Kola", "line"),
            this._getMonthlyProductStats({ "products.pro_name": "Fanta" }, "Fanta", "line"),
            this._getMonthlyProductStats({ "products.pro_name": "eco water" }, "Eco Water", "line")
        ]);
  }

    async getTopPerformers(groupId, collection, limit) {
        return Order.aggregate([
            { $match: { status: "Yetkazib berildi" } },
            { $group: { _id: `$${groupId}`, totalSales: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
            { $sort: { totalSales: -1 } },
            { $limit: limit },
            { $lookup: { from: collection, localField: "_id", foreignField: "_id", as: "info" } },
            { $unwind: "$info" }
        ]);
    }

    async _getMonthlyProductStats(query, name, type) {
        const currentYear = new Date().getFullYear();
        const result = await Order.aggregate([
            { $match: { status: "Yetkazib berildi", createdAt: { $gte: new Date(`${currentYear}-01-01`) } } },
            { $unwind: "$products" },
            { $match: query },
            { $group: { _id: { $month: "$createdAt" }, total: { $sum: "$products.pro_total_price" } } }
        ]);
        const data = Array(12).fill(0);
        result.forEach(item => data[item._id - 1] = item.total);
        return { name, type, data, labels: ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"] };
    }
}

module.exports = new SaleStatisticService();