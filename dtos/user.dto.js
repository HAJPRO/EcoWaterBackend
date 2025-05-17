module.exports = class UserDto {
  username;
  department;
  id;
  isActivated;
  roles;
  actions;

  // Qo‘shimcha maydonlar
  chatId;
  action;
  fullname;
  gender;
  age;
  phoneNumber;
  passportNumber;
  address;
  position;
  status;
  isActive;
  registeredAt;
  driverLicenseNumber;
  driverLicenseDate;
  carNumber;
  carType;
  carColor;
  profileImage;
  vehicleCapacity;
  lastLocation;
  workingHours;
  ratings;
  totalOrders;
  completedOrders;
  blockedUntil;
  notes;

  constructor(model) {
    this.username = model.username;
    this.department = model.department;
    this.id = model._id;
    this.isActivated = model.isActivated;
    this.roles = model.roles;
    this.actions = model.actions;
    this.permissions = model.permissions || [];

    this.chatId = model.chatId;
    this.action = model.action;
    this.fullname = model.fullname;
    this.gender = model.gender;
    this.age = model.age;
    this.phoneNumber = model.phoneNumber;
    this.passportNumber = model.passportNumber;
    this.address = model.address;
    this.position = model.position;
    this.status = model.status;
    this.isActive = model.isActive;
    this.registeredAt = model.registeredAt;

    this.driverLicenseNumber = model.driverLicenseNumber;
    this.driverLicenseDate = model.driverLicenseDate;
    this.carNumber = model.carNumber;
    this.carType = model.carType;
    this.carColor = model.carColor;
    this.profileImage = model.profileImage;
    this.vehicleCapacity = model.vehicleCapacity;
    this.lastLocation = model.lastLocation;
    this.workingHours = model.workingHours;
    this.ratings = model.ratings;
    this.totalOrders = model.totalOrders;
    this.completedOrders = model.completedOrders;
    this.blockedUntil = model.blockedUntil;
    this.notes = model.notes;
  }
};
