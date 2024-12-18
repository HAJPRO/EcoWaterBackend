const UserModel = require("../../models/user.model");
const bcrypt = require("bcryptjs");

class UserService {
  async CreateUser(data) {
    try {
      const { username, department, password, role } = data;
      const hashPassword = await bcrypt.hash(password, 10);
      let obj = {
        username,
        password: hashPassword,
        department,
        role,
      };
      const isExists = await UserModel.findOne({ username });
      if (isExists) {
        return {
          success: false,
          msg: "Username name already exists",
        };
      } else if (role && role == 1) {
        return { success: false, msg: "You can't ceate Admin !" };
      } else if (role) {
        const data = await UserModel.create(obj);
        return {
          success: true,
          msg: "User created Successfully !",
          data,
        };
      }
    } catch (err) {
      return err;
    }
  }
  async GetUsers(data) {
    try {
      const users = await UserModel.find();
      // .then((items) => {
      // for (let i = 0; i <= items.length; i++) {

      //   const password = bcrypt.verify(`${items[i].password}`, 10)
      //   console.log(password);
      // }

      // })

      return users;
    } catch (error) {
      return error.messages;
    }
  }
}

module.exports = new UserService();
