// const Address = require("../models/user.model");
class AddressService {
  async Regions(data) {
    const regions = [
        { id: 1, name: "Andijon viloyati", capital: "Andijon" },
        { id: 2, name: "Buxoro viloyati", capital: "Buxoro" },
        { id: 3, name: "Farg'ona viloyati", capital: "Farg'ona" },
        { id: 4, name: "Jizzax viloyati", capital: "Jizzax" },
        { id: 5, name: "Namangan viloyati", capital: "Namangan" },
        { id: 6, name: "Navoiy viloyati", capital: "Navoiy" },
        { id: 7, name: "Qashqadaryo viloyati", capital: "Qarshi" },
        { id: 8, name: "Samarqand viloyati", capital: "Samarqand" },
        { id: 9, name: "Sirdaryo viloyati", capital: "Guliston" },
        { id: 10, name: "Surxondaryo viloyati", capital: "Termiz" },
        { id: 11, name: "Toshkent viloyati", capital: "Nurafshon" },
        { id: 12, name: "Xorazm viloyati", capital: "Urganch" },
        { id: 13, name: "Qoraqalpog'iston Respublikasi", capital: "Nukus" },
        { id: 14, name: "Toshkent shahri", capital: "Toshkent" }
      ];
      return regions
  }
  async Districts(data) {
    
    const districts = [
      // Andijon viloyati
      { id: 1, regionId: 1, name: "Andijon tumani" },
      { id: 2, regionId: 1, name: "Asaka tumani" },
      { id: 3, regionId: 1, name: "Baliqchi tumani" },
      { id: 4, regionId: 1, name: "Bo'z tumani" },
      { id: 5, regionId: 1, name: "Jalaquduq tumani" },
      { id: 6, regionId: 1, name: "Kuyganyor tumani" },
      { id: 7, regionId: 1, name: "Kurgantepa tumani" },
      { id: 8, regionId: 1, name: "Shahrihon tumani" },
      { id: 9, regionId: 1, name: "Xonobod tumani" },
    
      // Buxoro viloyati
      { id: 10, regionId: 2, name: "Buxoro tumani" },
      { id: 11, regionId: 2, name: "G'ijduvon tumani" },
      { id: 12, regionId: 2, name: "Kogon tumani" },
      { id: 13, regionId: 2, name: "Jondor tumani" },
      { id: 14, regionId: 2, name: "Qorako'l tumani" },
      { id: 15, regionId: 2, name: "Vobkent tumani" },
      { id: 16, regionId: 2, name: "Peshku tumani" },
      { id: 17, regionId: 2, name: "Romitan tumani" },
      { id: 18, regionId: 2, name: "Qorovulbozor tumani" },
      { id: 19, regionId: 2, name: "Shofirkon tumani" },
      { id: 20, regionId: 2, name: "Kogon shahar" },
      { id: 21, regionId: 2, name: "Buxoro shahar" },
    
      // Farg'ona viloyati
      { id: 22, regionId: 3, name: "Farg'ona tumani" },
      { id: 23, regionId: 3, name: "Buvayda tumani" },
      { id: 24, regionId: 3, name: "Quva tumani" },
      { id: 25, regionId: 3, name: "Rishton tumani" },
      { id: 26, regionId: 3, name: "O‘zbekiston tumani" },
      { id: 27, regionId: 3, name: "Farg'ona shahar" },
    
      // Jizzax viloyati
      { id: 28, regionId: 4, name: "Jizzax tumani" },
      { id: 29, regionId: 4, name: "Zafarobod tumani" },
      { id: 30, regionId: 4, name: "Paxtakor tumani" },
      { id: 31, regionId: 4, name: "Arnasoy tumani" },
      { id: 32, regionId: 4, name: "Bakhmal tumani" },
      { id: 33, regionId: 4, name: "Jizzax shahar" },
    
      // Namangan viloyati
      { id: 34, regionId: 5, name: "Namangan tumani" },
      { id: 35, regionId: 5, name: "Chortoq tumani" },
      { id: 36, regionId: 5, name: "Kosonsoy tumani" },
      { id: 37, regionId: 5, name: "Namangan shahar" },
    
      // Navoiy viloyati
      { id: 38, regionId: 6, name: "Navoiy tumani" },
      { id: 39, regionId: 6, name: "Zafar tumani" },
      { id: 40, regionId: 6, name: "Uchkiz tumani" },
      { id: 41, regionId: 6, name: "Karmana tumani" },
      { id: 42, regionId: 6, name: "Konimex tumani" },
      { id: 43, regionId: 6, name: "Navoiy shahar" },
    
      // Qashqadaryo viloyati
      { id: 44, regionId: 7, name: "Qarshi tumani" },
      { id: 45, regionId: 7, name: "Yakkabog' tumani" },
      { id: 46, regionId: 7, name: "Shahrisabz tumani" },
      { id: 47, regionId: 7, name: "Muborak tumani" },
      { id: 48, regionId: 7, name: "Qamashi tumani" },
      { id: 49, regionId: 7, name: "Kitob tumani" },
    
      // Samarqand viloyati
      { id: 50, regionId: 8, name: "Samarqand tumani" },
      { id: 51, regionId: 8, name: "Paxtachi tumani" },
      { id: 52, regionId: 8, name: "Kattakurgan tumani" },
      { id: 53, regionId: 8, name: "Samarkand shahar" },
    
      // Sirdaryo viloyati
      { id: 54, regionId: 9, name: "Guliston tumani" },
      { id: 55, regionId: 9, name: "Sardoba tumani" },
      { id: 56, regionId: 9, name: "Jomboy tumani" },
      { id: 57, regionId: 9, name: "Mirzaabad tumani" },
      { id: 58, regionId: 9, name: "Shirin tumani" },
      { id: 59, regionId: 9, name: "Sirdaryo shahar" },
    
      // Surxondaryo viloyati
      { id: 60, regionId: 10, name: "Termiz tumani" },
      { id: 61, regionId: 10, name: "Boysun tumani" },
      { id: 62, regionId: 10, name: "Uzun tumani" },
      { id: 63, regionId: 10, name: "Denov tumani" },
      { id: 64, regionId: 10, name: "Sherobod tumani" },
      { id: 65, regionId: 10, name: "Surxondaryo shahar" },
    
      // Toshkent viloyati
      { id: 66, regionId: 11, name: "Nurafshon tumani" },
      { id: 67, regionId: 11, name: "Bekabad tumani" },
      { id: 68, regionId: 11, name: "Chinoz tumani" },
      { id: 69, regionId: 11, name: "Toshkent shahar" },
    
      // Xorazm viloyati
      { id: 70, regionId: 12, name: "Urganch tumani" },
      { id: 71, regionId: 12, name: "Xiva tumani" },
      { id: 72, regionId: 12, name: "Shavat tumani" },
      { id: 73, regionId: 12, name: "Urganch shahar" },
    
      // Qoraqalpog'iston Respublikasi
      { id: 74, regionId: 13, name: "Nukus tumani" },
      { id: 75, regionId: 13, name: "Beruniy tumani" },
      { id: 76, regionId: 13, name: "Muynak tumani" },
      { id: 77, regionId: 13, name: "Karakalpak tumani" },
    
      // Toshkent shahri
      { id: 78, regionId: 14, name: "Toshkent tumani" },
      { id: 79, regionId: 14, name: "Chilonzor tumani" },
      { id: 80, regionId: 14, name: "Mirzo Ulug'bek tumani" },
      { id: 81, regionId: 14, name: "Yakkasaroy tumani" },
      { id: 82, regionId: 14, name: "Bektemir tumani" },
      { id: 83, regionId: 14, name: "Sergeli tumani" },
      { id: 84, regionId: 14, name: "Uchtepa tumani" },
      { id: 85, regionId: 14, name: "Mirobod tumani" },
      { id: 86, regionId: 14, name: "Yunusobod tumani" }
    ];
    
    const filteredDistricts = districts.filter(district => district.regionId === data.regionId);
      return filteredDistricts
  }

  async Neighborhoods(data) {
    const neighborhoods = [
      // Andijon viloyati
  { districtId: 1, name: "Qahramon mahallasi" },
  { districtId: 1, name: "Gulbahor mahallasi" },
  { districtId: 1, name: "O‘zbekiston mahallasi" },

  { districtId: 2, name: "Azamat mahallasi" },
  { districtId: 2, name: "Mustaqillik mahallasi" },

  { districtId: 3, name: "Yangiobod mahallasi" },
  { districtId: 3, name: "Vatanparvar mahallasi" },

  // Buxoro viloyati
  { id: 1, districtId: 11, name: "Armechan" },
  { id: 2, districtId: 11, name: "Taxtaxon" },
  { id: 3, districtId: 11, name: "G‘ovshun" },
  { id: 4, districtId: 11, name: "Zarangari" },
  { id: 5, districtId: 11, name: "Ko‘kcha" },
  { id: 6, districtId: 11, name: "Pozagari" },
  { id: 7, districtId: 11, name: "Rayonobod" },
  { id: 8, districtId: 11, name: "Soktari" },
  { id: 9, districtId: 11, name: "Sarvari" },
  { id: 10, districtId: 11, name: "Sarmijon" },
  { id: 11, districtId: 11, name: "Ulfatbibi" },
  { id: 12, districtId: 11, name: "Fayzulla Yunusov" },
  { id: 13, districtId: 11, name: "Firishkent" },
  { id: 14, districtId: 11, name: "Gijduvon shahri" },
 

  // Farg'ona viloyati
  { districtId: 16, name: "Yunusobod mahallasi" },
  { districtId: 16, name: "Shahrukh mahallasi" },

  { districtId: 17, name: "Namangan mahallasi" },
  { districtId: 17, name: "Toshkent mahallasi" },

  // Jizzax viloyati
  { districtId: 22, name: "Paxtakor mahallasi" },
  { districtId: 22, name: "Zafarobod mahallasi" },

  { districtId: 23, name: "Guliston mahallasi" },
  { districtId: 23, name: "Sharof Rashidov mahallasi" },

  // Namangan viloyati
  { districtId: 28, name: "Mahmud Mahallasi" },
  { districtId: 28, name: "Imomov mahallasi" },

  { districtId: 29, name: "Qurama Mahallasi" },

  // Navoiy viloyati
  { districtId: 32, name: "O'zbekiston Mahallasi" },
  { districtId: 32, name: "Amir Temur Mahallasi" },

  { districtId: 33, name: "Dilorom Mahallasi" },
  { districtId: 33, name: "Gulzor Mahallasi" },

  // Qashqadaryo viloyati
  { districtId: 38, name: "Tinchlik mahallasi" },
  { districtId: 38, name: "Siyavush mahallasi" },

  // Samarqand viloyati
  { districtId: 44, name: "Gulbahor mahallasi" },
  { districtId: 44, name: "Shahriston mahallasi" },

  // Sirdaryo viloyati
  { districtId: 48, name: "Barkamol mahallasi" },
  { districtId: 48, name: "Bog‘ishamol mahallasi" },

  // Surxondaryo viloyati
  { districtId: 54, name: "Minglar Mahallasi" },
  { districtId: 54, name: "Ko‘ksaroy mahallasi" },

  // Toshkent viloyati
  { districtId: 60, name: "Yangihayot mahallasi" },
  { districtId: 60, name: "Mahmud Mahallasi" },

  // Xorazm viloyati
  { districtId: 64, name: "Xalqobod mahallasi" },
  { districtId: 64, name: "Shovot mahallasi" },

  // Qoraqalpog'iston Respublikasi
  { districtId: 68, name: "Oltin Qishloq mahallasi" },
  { districtId: 68, name: "Kuk Qorcha mahallasi" }


    ]
  
    const filteredNeighborhoods = neighborhoods.filter(neighborhood => neighborhood.districtId === data.districtId);
  return filteredNeighborhoods
  }
   
}

module.exports = new AddressService();
