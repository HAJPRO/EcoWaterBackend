const UserDto = require("../dtos/user.dto");
const userModel = require("../models/user.model");
const PermissionModel = require("../models/Admin/permission.model");
const UserPermissionModel = require("../models/Admin/UserPermission.model");

const bcrypt = require("bcryptjs");
const tokenService = require("../services/token.service");
// const mailService = require('./mail.service')
const BaseError = require("../errors/base.error");

class AuthService {
  async register(data) {
    const { username, password } = data;
    const existUser = await userModel.findOne({ username });
    if (existUser) {
      throw BaseError.BadRequest(
        `User with existing username ${username} already registered`
      );
    }

    const hashPassword = await bcrypt.hash(password, 10);
    data.password = hashPassword;
    data.action = "login_successfully";
    data.chatId = 1;
    // Endi data to‘liq, shu jumladan password ham yangilangan holatda
    const user = await userModel.create(data);
    const userDto = new UserDto(user);

    const tokens = tokenService.generateToken({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { msg: "Muvaffaqiyatli qo'shildi", user: userDto, ...tokens };
  }
  async update(data) {

    const updateUser = await userModel.findByIdAndUpdate(data.id, data.model, { new: true })
    return {
      msg: "Muvaffaqiyatli o'zgartirildi"
    };
  }

async login(username, password) {
    // 1. Userni topish va Role -> Permission zanjirini ochish (Deep Populate)
    const user = await userModel.findOne({ username }).populate({
        path: 'roles',
        model: 'Role',
        populate: {
            path: 'permissions',
            model: 'Permission'
        }
    });

    if (!user) throw BaseError.BadRequest("Username yoki parol xato");

    // 2. Parolni tekshirish
    const isPassword = await bcrypt.compare(password, user.password);
    if (!isPassword) throw BaseError.BadRequest("Username yoki parol xato");

    // 3. UserDto yaratish (ichida roles va permissions'ni formatlaydi)
    const userDto = new UserDto(user);

    // 4. Token generatsiya qilish 
    // MUHIM: Permissions va Roles bu yerda string massivi bo'lishi shart
    const tokens = tokenService.generateToken({
        id: userDto.id,
        username: userDto.username,
        roles: userDto.roles, 
        permissions: userDto.permissions 
    });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { user: userDto, ...tokens };
}

  async logout(refreshToken) {
    return await tokenService.removeToken(refreshToken);
  }
  async activation(userId) {
    const user = await userModel.findById(userId);

    if (!user) {
      throw BaseError.BadRequest("User is not defined");
    }

    user.isActivated = true;
    await user.save();
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw BaseError.UnauthorizedError("Bad authorization");
    }

    const userPayload = tokenService.validateRefreshToken(refreshToken);
    const tokenDb = await tokenService.findToken(refreshToken);
    if (!userPayload || !tokenDb) {
      throw BaseError.UnauthorizedError("Bad authorization");
    }

    const user = await userModel.findById(userPayload.id);
    const userDto = new UserDto(user);

    const tokens = tokenService.generateToken({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { user: userDto, ...tokens };
  }

  async getUsers() {
    return await userModel.find();
  }
}

module.exports = new AuthService();
