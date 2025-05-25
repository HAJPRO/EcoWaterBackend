const User = require("../../../models/user.model");
const Order = require("../../../models/Sale/orders/order.model");

class EmployeeManagmentService {
    async Create(data) {
        try {
            const customerExists = await User.exists({
                $or: [
                    { passportNumber: data.passportNumber },
                    { artikul: data.artikul },
                ],
            });

            if (customerExists) {
                return { msg: "Bunday mijoz bazada mavjud !" };
            } else {
                const customer = new User(data);
                const savedCustomer = await User.save();
                return { status: "200", msg: "Mijoz muvaffaqiyatli qo'shildi!" };
            }
        } catch (error) {
            throw new Error("Error creating customer: " + error.message);
        }
    }

    async getAllLength(data) {
        const all = await User.find().then((data) => {
            if (data) {
                return data.length;
            } else {
                return 0;
            }
        });
        return { all };
    }
    async GetAll(data) {

        try {
            if (data.status === 0) {
                const employees = await User.find().lean()
                return { employees }
            }
            if (data.status === 1) {
                const all_length = await this.getAllLength(data);
                const employees = await this.GetAllEmloyees(data);
                return { employees, all_length };
            }
            if (data.status === 3) {
                const all_length = await this.getAllLength(data);
                const employees = await this.GetAllDrivers(data);
                return { employees, all_length };
            }
            else {
                return { msg: `Server xatosi: ${error.message} `, customers: [] };
            }
        } catch (error) {
            return { msg: `Server xatosi: ${error.message} `, customers: [], all_length: {} };
        }
    }
    // 📌 **Barcha mijozlar olish**
    async GetAllEmloyees(data) {
        const page = Number(data.page);
        const limit = Number(data.limit)
        const skip = (page - 1) * limit;
        try {
            const customers = await User.find().populate("roles", "name permissions")
                .skip(skip)
                .limit(limit)
                .lean();

            return customers.length ? customers : [];
        } catch (error) {
            return { msg: `Server xatosi: ${error.message}` };
        }
    }
    async GetAllDrivers(data) {

        const page = Number(data.page);
        const limit = Number(data.limit)
        const skip = (page - 1) * limit;
        try {
            const drivers = await User.find({ position: "Haydovchi" }).populate("roles", "name permissions")
                .skip(skip)
                .limit(limit)
                .lean();
            console.log(drivers);

            return drivers.length ? drivers : [];
        } catch (error) {
            return { msg: `Server xatosi: ${error.message}` };
        }
    }

    async DeleteById(data) {
        const id = data.id;
        try {
            const customer = await User.findByIdAndDelete(id);
            if (!customer) {
                return { msg: "Bunday mijoz topilmadi!" };
            }
            return { msg: "Mijoz muvaffaqiyatli o'chirildi!" };
        } catch (error) {
            return { msg: `Server xatosi: ${error.message}` };
        }

    }
    async GetById(data) {
        const id = data.id;
        try {
            const user = await User.findById(data.id)
                .populate({
                    path: "roles",
                    select: "name -_id" // faqat name ni oladi, _id ni olmaslik uchun
                });

            const roleNames = user.roles.map(role => role.name); // name larni arrayga olish

            const customer = {
                ...user.toObject(),
                roles: roleNames
            };

            if (!user) {
                return { msg: "Bunday mijoz topilmadi!" };
            } else {

                return { msg: "Mijoz muvaffaqiyatli aniqlandi !", customer };
            }


        } catch (error) {
            return { msg: `Server xatosi: ${error.message}` };
        }

    }

    async GetOrdersByDriverId(data) {
        const id = data.id;
        try {
            const orders = await Order.find({ driverId: id })
                .populate('driverId')    // haydovchi haqida ma'lumotni olish
                .populate('author')     // author (buyurtmani kim yaratgan) haqida ma'lumot
                .populate('customerId')

            return { msg: "ok", status: 200, orders };
        } catch (error) {
            return { msg: `Server xatosi: ${error.message}` };
        }
    }

}

module.exports = new EmployeeManagmentService();
