module.exports = class UserDto {
  username;
  department;
  id;
  isActivated;
  role;

  constructor(model) {
    this.username = model.username;
    this.department = model.department;
    this.id = model._id;
    this.isActivated = model.isActivated;
    this.role = model.role;
  }
};
