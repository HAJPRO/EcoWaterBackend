const User = require("../../../models/user.model");
const Customer = require("../../../models/Customers/customer.model");
const Order = require("../../../models/Sale/orders/order.model");


class SaleStatisticService {

    async GetAllDayStatistics() {
        try {
            const NewCustomers = await this.GetNewCustomers();
            const TodayTotalAmount = await this.GetTodayTotalAmount();
            const WaterUsageByDay = await this.GetWaterUsageByDay();
            ///
            const MonthlySparklingWaterTotalPriceByMonth = await this.GetMonthlySparklingWaterTotalPriceByMonth();
            const MonthlyStillWaterTotalPriceByMonth = await this.GetMonthlyStillWaterTotalPriceByMonth();
            const MonthlyJuiceTotalPriceByMonth = await this.GetMonthlyJuiceTotalPriceByMonth();
            ////
            const MonthlyKolaTotalPriceBy = await this.GetMonthlyKolaTotalPriceBy();
            const MonthlyFantaTotalPriceBy = await this.GetMonthlyFantaTotalPriceBy();
            const MonthlyChortoqTotalPriceBy = await this.GetMonthlyChortoqTotalPriceBy();
            const MonthlyEcoWaterTotalPriceBy = await this.GetMonthlyEcoWaterTotalPriceBy();
            ///
            const TopDriversWithFullInfo = await this.GetTopDriversWithFullInfo(3);

            const metrics = [await NewCustomers, await TodayTotalAmount, await WaterUsageByDay]
            const charBarOptions = [await MonthlySparklingWaterTotalPriceByMonth, await MonthlyStillWaterTotalPriceByMonth, await MonthlyJuiceTotalPriceByMonth]
            const charLineOptions = [await MonthlyKolaTotalPriceBy, MonthlyFantaTotalPriceBy, MonthlyChortoqTotalPriceBy, MonthlyEcoWaterTotalPriceBy]
            ///
            return { metrics, charBarOptions, charLineOptions, TopDriversWithFullInfo };

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
    async GetTodayTotalAmount() {
        try {
            // === Bugungi kun boshlanishi va oxiri ===
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);

            const endOfToday = new Date();
            endOfToday.setHours(23, 59, 59, 999);

            // === Kechagi kun boshlanishi va oxiri ===
            const startOfYesterday = new Date(startOfToday);
            startOfYesterday.setDate(startOfYesterday.getDate() - 1);

            const endOfYesterday = new Date(endOfToday);
            endOfYesterday.setDate(endOfYesterday.getDate() - 1);

            // === Bugungi umumiy summa ===
            const todayResult = await Order.aggregate([
                {
                    $match: {
                        driverSentToTime: {
                            $gte: startOfToday,
                            $lte: endOfToday
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

            const todayTotal = todayResult.length ? todayResult[0].total : 0;

            // === Kechagi umumiy summa ===
            const yesterdayResult = await Order.aggregate([
                {
                    $match: {
                        driverSentToTime: {
                            $gte: startOfYesterday,
                            $lte: endOfYesterday
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

            const yesterdayTotal = yesterdayResult.length ? yesterdayResult[0].total : 0;

            // === Foizli o‘zgarishni hisoblash ===
            let change = 0;
            if (yesterdayTotal > 0) {
                change = ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100;
            } else if (todayTotal > 0) {
                change = 100;
            }

            // === Natijani obyekt ko‘rinishida qaytarish ===
            const TodayTotalAmount = {
                title: "Bugungi to‘langan hisob-kitoblar (so'm)",
                value: todayTotal,
                change: parseFloat(change.toFixed(2)) // % ko‘rinishida
            };

            return TodayTotalAmount;
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
    async GetMonthlyStillWaterTotalPriceByMonth() {
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
                        "products.pro_type": "Gazsiz"
                    }
                },
                {
                    $group: {
                        _id: { month: { $month: "$createdAt" } },
                        totalStillWaterPrice: { $sum: "$products.pro_total_price" }
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
                monthMap.set(item._id.month, item.totalStillWaterPrice);
            });

            const labels = [];
            const data = [];

            for (let i = 1; i <= 12; i++) {
                labels.push(`${months[i - 1]} ${currentYear}`);
                data.push(monthMap.get(i) || 0);
            }

            return {
                name: "Gazsiz",
                type: "bar",
                labels,
                data
            };

        } catch (error) {
            return { msg: `Server xatosi: ${error.message}` };
        }
    }
    async GetMonthlyJuiceTotalPriceByMonth() {
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
                        "products.pro_type": "Sharbatlar"
                    }
                },
                {
                    $group: {
                        _id: { month: { $month: "$createdAt" } },
                        totalJuicePrice: { $sum: "$products.pro_total_price" }
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
                monthMap.set(item._id.month, item.totalJuicePrice);
            });

            const labels = [];
            const data = [];

            for (let i = 1; i <= 12; i++) {
                labels.push(`${months[i - 1]} ${currentYear}`);
                data.push(monthMap.get(i) || 0);
            }

            return {
                name: "Sharbatlar",
                type: "bar",
                labels,
                data
            };

        } catch (error) {
            return { msg: `Server xatosi: ${error.message}` };
        }
    }
    async GetMonthlyKolaTotalPriceBy() {
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
                        "products.pro_name": "Kola"
                    }
                },
                {
                    $group: {
                        _id: { month: { $month: "$createdAt" } },
                        totalKolaPrice: { $sum: "$products.pro_total_price" }
                    }
                }
            ]);

            const months = [
                "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
                "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
            ];

            // Resultni map qilib olish
            const monthMap = new Map();
            result?.forEach(item => {
                monthMap.set(item._id.month, item.totalKolaPrice);
            });

            const labels = [];
            const data = [];

            for (let i = 1; i <= 12; i++) {
                labels.push(`${months[i - 1]} ${currentYear}` || 0);
                data.push(monthMap.get(i) || 0);
            }

            return {
                name: "Kola",
                type: "line",
                labels,
                data
            };

        } catch (error) {
            return { msg: `Server xatosi: ${error.message}` };
        }
    }
    async GetMonthlyFantaTotalPriceBy() {
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
                        "products.pro_name": "Fanta"
                    }
                },
                {
                    $group: {
                        _id: { month: { $month: "$createdAt" } },
                        totalFantaPrice: { $sum: "$products.pro_total_price" }
                    }
                }
            ]);

            const months = [
                "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
                "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
            ];

            // Resultni map qilib olish
            const monthMap = new Map();
            result?.forEach(item => {
                monthMap.set(item._id.month, item.totalFantaPrice);
            });

            const labels = [];
            const data = [];

            for (let i = 1; i <= 12; i++) {
                labels.push(`${months[i - 1]} ${currentYear}` || 0);
                data.push(monthMap.get(i) || 0);
            }

            return {
                name: "Fanta",
                type: "line",
                labels,
                data
            };

        } catch (error) {
            return { msg: `Server xatosi: ${error.message}` };
        }
    }
    async GetMonthlyChortoqTotalPriceBy() {
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
                        "products.pro_name": "Chortoq"
                    }
                },
                {
                    $group: {
                        _id: { month: { $month: "$createdAt" } },
                        totalChortoqPrice: { $sum: "$products.pro_total_price" }
                    }
                }
            ]);

            const months = [
                "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
                "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
            ];

            // Resultni map qilib olish
            const monthMap = new Map();
            result?.forEach(item => {
                monthMap.set(item._id.month, item.totalChortoqPrice);
            });

            const labels = [];
            const data = [];

            for (let i = 1; i <= 12; i++) {
                labels.push(`${months[i - 1]} ${currentYear}` || 0);
                data.push(monthMap.get(i) || 0);
            }

            return {
                name: "Chortoq",
                type: "line",
                labels,
                data
            };

        } catch (error) {
            return { msg: `Server xatosi: ${error.message}` };
        }
    }
    async GetMonthlyEcoWaterTotalPriceBy() {
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
                        "products.pro_name": "Eco Water"
                    }
                },
                {
                    $group: {
                        _id: { month: { $month: "$createdAt" } },
                        totalEcowaterPrice: { $sum: "$products.pro_total_price" }
                    }
                }
            ]);

            const months = [
                "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
                "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
            ];

            // Resultni map qilib olish
            const monthMap = new Map();
            result?.forEach(item => {
                monthMap.set(item._id.month, item.totalEcowaterPrice);
            });

            const labels = [];
            const data = [];

            for (let i = 1; i <= 12; i++) {
                labels.push(`${months[i - 1]} ${currentYear}` || 0);
                data.push(monthMap.get(i) || 0);
            }

            return {
                name: "Eco Water",
                type: "line",
                labels,
                data
            };

        } catch (error) {
            return { msg: `Server xatosi: ${error.message}` };
        }
    }

    async GetTopDriversWithFullInfo(limit) {
        try {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

            const result = await Order.aggregate([
                {
                    $match: {
                        status: "Yetkazib berildi",
                        driverArrivedTime: { $gte: oneMonthAgo }
                    }
                },
                {
                    $group: {
                        _id: "$driverId", // To‘g‘ri maydon
                        totalSales: { $sum: "$totalAmount" }
                    }
                },
                {
                    $lookup: {
                        from: "users", // <-- MongoDB'dagi User collection nomi
                        localField: "_id", // driverId
                        foreignField: "_id",
                        as: "driver"
                    }
                },
                { $unwind: "$driver" },
                {
                    $project: {
                        driver: {
                            $mergeObjects: [
                                "$driver",
                                { totalSales: "$totalSales" }
                            ]
                        }
                    }
                },
                { $sort: { totalSales: -1 } },
                { $limit: limit }
            ]);

            return result;
        } catch (error) {
            return { msg: `Server xatosi: ${error.message}` };
        }
    }






}

module.exports = new SaleStatisticService();
