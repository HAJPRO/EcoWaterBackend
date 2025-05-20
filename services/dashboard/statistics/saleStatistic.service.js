const User = require("../../../models/user.model");
const Customer = require("../../../models/Customers/customer.model");
const Order = require("../../../models/Sale/orders/order.model");


class SaleStatisticService {

    async GetAllDayStatistics() {
        try {
            const NewCustomers = await this.GetNewCustomers();
            const MonthlyTotalAmount = await this.GetMonthlyTotalAmount();
            const WaterUsageByDay = await this.GetWaterUsageByDay();
            const MonthlySparklingWaterTotalPriceByMonth = await this.GetMonthlySparklingWaterTotalPriceByMonth();
            const metrics = [await NewCustomers, await MonthlyTotalAmount]
            const charBartOptions = [await MonthlySparklingWaterTotalPriceByMonth]
            return { metrics, charBartOptions };

        } catch (error) {
            return { msg: `Server xatosi: ${error.message} `, customers: [], all_length: {} };
        }
    }
    async GetNewCustomers() {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const Customers = await Customer.find({
                registeredAt: {
                    $gte: thirtyDaysAgo, // 30 kun oldingi sana
                    $lte: new Date()     // hozirgi sana
                }
            }).lean();
            const NewCustomers = {
                title: "Yangi ulanuvchilar soni",
                value: Customers.length ? Customers.length : 0,
                change: 5,
                text: "kechagiga nisbatan",
            }
            return NewCustomers;
        } catch (error) {
            return { msg: `Server xatosi: ${error.message}` };
        }
    }
    async GetMonthlyTotalAmount() {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const result = await Order.aggregate([
                {
                    $match: {
                        driverSentToTime: {
                            $gte: thirtyDaysAgo,
                            $lte: new Date()
                        },
                        status: "Yetkazib berildi"
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$totalAmount" }
                    }
                }
            ]);

            const total = result.length ? result[0].total : 0;

            const MonthlyTotalAmount = {
                title: "Oylik to‘langan hisob-kitoblar",
                value: total,
                change: -7 // bu yerga oylik o‘zgarish foizini hisoblab bersam bo'ladi
            };

            return MonthlyTotalAmount;
        } catch (error) {
            return { msg: `Server xatosi: ${error.message}` };
        }
    }
    async GetWaterUsageByDay() {
        try {
            const WaterUsageByDay =
            {
                title: "Kunlik suv iste’moli (m³)",
                value: 18250,
                change: 12,
                text: "kechagiga nisbatan",

            };

            return WaterUsageByDay;
        } catch (error) {
            return { msg: `Server xatosi: ${error.message}` };
        }
    }

    async GetMonthlySparklingWaterTotalPriceByMonth() {
        try {
            const currentYear = new Date().getFullYear();

            const result = await Order.aggregate([
                {
                    $match: {
                        status: "Yetkazib berildi",
                        createdAt: {
                            $gte: new Date(`${currentYear}-01-01T00:00:00Z`),
                            $lte: new Date(`${currentYear}-12-31T23:59:59Z`)
                        }
                    }
                },
                { $unwind: "$products" },
                {
                    $match: {
                        "products.pro_type": "Gazli"
                    }
                },
                {
                    $group: {
                        _id: { month: { $month: "$createdAt" } },
                        totalSparklingWaterPrice: { $sum: "$products.pro_total_price" }
                    }
                }
            ]);

            const months = [
                "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
                "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
            ];

            // Resultni map qilib olish
            const monthMap = new Map();
            result.forEach(item => {
                monthMap.set(item._id.month, item.totalSparklingWaterPrice);
            });

            const labels = [];
            const data = [];

            for (let i = 1; i <= 12; i++) {
                labels.push(`${months[i - 1]} ${currentYear}`);
                data.push(monthMap.get(i) || 0);
            }

            return {
                name: "Gazli",
                type: "bar",
                labels,
                data
            };

        } catch (error) {
            return { msg: `Server xatosi: ${error.message}` };
        }
    }




}

module.exports = new SaleStatisticService();
