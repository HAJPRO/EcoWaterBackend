const { bot } = require("../../bot");
const { AdminKeyboard, UserKeyboard } = require("../keyboards/keyboard");
const SeamUserModel = require("../../../../models/bots/seam/seam_user.model");
const SeamDepartmentModel = require("../../../../models/bots/seam/seam_department.model");


class SeamService {
    async AdminPanel(data) {
        const chatId = data.msg.from.id;
        const text = data.msg.text
        const id = data.user._id
        if (text === `Foydalanuvchilar`) {

            const users = await SeamUserModel.find();
            let list = ''
            users.forEach((user) => {
                list += `${user.fullname} : ${user._id}\n`
            })
            bot.sendMessage(
                chatId,
                `Foydalanuvchilar ro'yxati:
    ${list}`
            );
        }
        if (text === `Bo'lim qo'shish`) {

            const user = await SeamUserModel.findByIdAndUpdate(id, { action: "request_add_department" }, { new: true });
            bot.sendMessage(
                chatId,
                `Bo'lim nomini kiriting`
            );
        };

    }
    async AddDepartment(data) {
        const chatId = data.msg.from.id;
        const text = data.msg.text
        const id = data.user._id
        const department = await SeamDepartmentModel.create({ name: text });
        bot.sendMessage(
            chatId,
            `Bo'lim nomi qo'shildi`
        );

    }



};
module.exports = new SeamService();