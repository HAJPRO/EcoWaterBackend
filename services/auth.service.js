const UserDto = require("../dtos/user.dto");
const userModel = require("../models/user.model");
const PermissionModel = require("../models/permission.model");
const UserPermissonModel = require("../models/UserPermission.model");

const bcrypt = require("bcryptjs");
const tokenService = require("../services/token.service");
// const mailService = require('./mail.service')
const BaseError = require("../errors/base.error");
const UserPermissionModel = require("../models/UserPermission.model");

class AuthService {
  async register(username, password, department) {
    const existUser = await userModel.findOne({ username });
    if (existUser) {
      throw BaseError.BadRequest(
        `User with existing username ${username} already registered`
      );
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      username,
      password: hashPassword,
      department,
    });
    const userDto = new UserDto(user);

    // await mailService.sendMail(username, `${process.env.API_URL}/api/auth/activation/${userDto.id}`)

    // ASSIGN DEFAULT PERMISSIONS
    const defaultPermissions = await PermissionModel.find({ is_default: 1 });
    if (defaultPermissions.length > 0) {
      const permissionArray = [];
      defaultPermissions.forEach((permission) => {
        permissionArray.push({
          permission_name: permission.permission_name,
          permission_value: [0, 1, 2, 3],
        });
      });
      // const userPermission = new userPermission({
      //   user_is: userDto.id,
      //   permissions: permissionArray,
      // });
      await UserPermissionModel.create({
        user_id: userDto.id,
        permissions: permissionArray,
      });
    }
    //

    const tokens = tokenService.generateToken({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { user: userDto, ...tokens };
  }

  async login(username, password) {
    const user = await userModel.findOne({ username });
    if (!user) {
      throw BaseError.BadRequest("User is not defined");
    }

    const isPassword = await bcrypt.compare(password, user.password);
    if (!isPassword) {
      throw BaseError.BadRequest("Password is incorrect");
    }

    const userDto = new UserDto(user);

    const tokens = tokenService.generateToken({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    // GET USER DATA WITH ALL PERMISSIONS
    const result = await userModel.aggregate([
      { $match: { username: userDto.username } },
      {
        $lookup: {
          from: "userpermissions",
          localField: "_id",
          foreignField: "user_id",
          as: "permissions",
        },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          permissions: {
            $cond: {
              if: { $isArray: "$permissions" },
              then: { $arrayElemAt: ["$permissions", 0] },
              else: null,
            },
          },
        },
      },
      // {
      //   $addFields: {
      //     permissions: {
      //       permissions: "$permissions.permissions",
      //     },
      //   },
      // },
    ]);

    //
    return { user: userDto, ...tokens, result };
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
