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
            const statistics = [await NewCustomers, await MonthlyTotalAmount]
            const chartOptions = [await MonthlySparklingWaterTotalPriceByMonth]
            return { statistics, chartOptions };

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
            const result = await Order.aggregate([
                {
                    $match: {
                        status: "Yetkazib berildi"
                    }
                },
                {
                    $unwind: "$products"
                },
                {
                    $match: {
                        "products.pro_type": "Gazli"
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" }
                        },
                        totalSparklingWaterPrice: { $sum: "$products.pro_total_price" }
                    }
                },
                {
                    $sort: {
                        "_id.year": 1,
                        "_id.month": 1
                    }
                }
            ]);

            const months = [
                "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
                "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
            ];

            // Labels va data massivlarini yaratish
            const labels = [];
            const data = [];

            result.forEach(item => {
                const label = `${months[item._id.month - 1]} ${item._id.year}`;
                labels.push(label);
                data.push(item.totalSparklingWaterPrice);
            });

            return {
                name: "Gazli",
                type: "bar",
                labels, // ["Mart 2025", "Aprel 2025", ...]
                data    // [1234000, 984000, ...]
            };

        } catch (error) {
            return { msg: `Server xatosi: ${error.message}` };
        }
    }



}

module.exports = new SaleStatisticService();
