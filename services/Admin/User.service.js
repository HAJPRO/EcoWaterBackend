const UserModel = require("../../models/user.model");
const RoleModel = require("../../models/Admin/role.model");
const PermissionModel = require("../../models/Admin/permission.model");

const bcrypt = require("bcryptjs");

class UserService {
  async CreateUser(data) {
    try {
      const { username, department, password, role, permissions, actions } =
        data;
      const hashPassword = await bcrypt.hash(password, 10);
      let obj = {
        username,
        password: hashPassword,
        department,
        role,
        permissions,
        actions,
      };
      const isExists = await UserModel.findOne({ username });
      if (isExists) {
        return {
          success: false,
          msg: "Username name already exists",
        };
      } else if (role && role == 1000) {
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
  async UpdateUser(data) {
    try {
      const { _id, username, department, role, permissions, actions } = data;

      let obj = {
        _id,
        username,
        department,
        role,
        permissions,
        actions,
      };
      if (role && role == 1000) {
        return { success: false, msg: "You can't ceate Admin !" };
      } else if (role) {
        const data = await UserModel.findByIdAndUpdate(_id, obj, { new: true });
        return {
          success: true,
          msg: "User Update Successfully !",
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
  async GetOneUser(data) {
    try {
      const user = await UserModel.findOne({ _id: data.id });
      return user;
    } catch (error) {
      return error.messages;
    }
  }
  async GetRoles() {
    try {
      const roles = await RoleModel.find();

      return roles;
    } catch (error) {
      return error.messages;
    }
  }
  async GetPermissions() {
    try {
      const permissions = await PermissionModel.find();
      return permissions;
    } catch (error) {
      return error.messages;
    }
  }
}

module.exports = new UserService();
