const path = require('path');
const fs = require('fs');
const sample = new Map();


module.exports = {
   makeid,getRandomName, uploadFile, deletDiskFile, getKey, setkey, roundToTwoDecimals, generateName , getBotProfiles
}

function makeid(length) {
   var result = '';
   var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

// function uploadFile(req, filename, res) {
//    let sampleFile;
//    let uploadPath;
//    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
//    sampleFile = req.files.file;

//    uploadPath = path.resolve(__dirname, '../../assets/' + filename);

//    // Use the mv() method to place the file somewhere on your server
//    req.files.file.mv(uploadPath, function (err) {
//       if (err)
//          return res.status(500).send(err);
//       // res.send('File uploaded!');
//    });

// }




    function uploadFile(file, filename) {
  return new Promise((resolve, reject) => {
    const uploadPath = path.resolve(__dirname, '../../assets/' + filename);

    // Create parent directory if it doesn't exist
    fs.mkdirSync(path.dirname(uploadPath), { recursive: true });

    file.mv(uploadPath, (err) => {
      if (err) return reject(err);
      resolve(true);
    });
  });
};





function deletDiskFile(filePath) {

   fs.exists(filePath, function (exists) {
      if (exists) {
         console.log('File exists. Deleting now ...');
         fs.unlinkSync(filePath);
      } else {
         console.log('File not found, so not deleting.');
      }
   });
}
function getKey(key) {
   return sample.get(key);
}
function setkey(key, v) {

   return sample.set(key, v);

}
function roundToTwoDecimals(value) {
   return Math.round(value * 100) / 100;
}
function generateName(pre = 'Player') {
   const randomTwoDigitNumber = Math.floor(Math.random() * 90) + 10; // Generates a random number between 10 and 99
   return `${pre}_${randomTwoDigitNumber}`;
 }

 function getRandomName() {
   const names = [
        "Khatri", "Salim", "Sherazi", "Jindani", "Karmani", "Raja", "Rayan",
       "Jacob", "Jon", "Ameli", "David", "Adrian", "Harrison", "Alexis", "Asher",
       "Bagchi", "Bajwa", "Bala", "Chandra", "Chawla", "Chib", "Choudhary",
       "Desai", "Jadhav", "Kadam", "Naik", "Dandekar", "Darekar", "Datar", "Dekhmukh",
       "Achari", "Aiyar", "Alva", "Amar", "Amararaja", "Anand", "Aruni", "Dharani",
       "Banerjee", "Barman", "Biswas", "Chakrabarti", "Chatterjee", "Chowdhury", "Das",
       "Ghosh", "Guha", "Mitra", "Dey", "Sen", "Pal", "Ganguly", "Bagchi", "Bose",
       "Rahim", "Zain", "Irfan", "Faiz", "Omar", "Suleman", "Qadir", "Zaki", "Karim",
       "Elijah", "Thomas", "Christopher", "Jeremiah", "Gabriel", "Isaiah", "Sebastian",
       "Menon", "Pillai", "Nair","Ankit", "Kurup", "Warrier", "Panicker", "Thampi", "Kartha",
       "Cyril", "Kurt", "Christian", "Lars", "Marc", "Thorsten", "Jonas", "Felix", "Erik",
       "Neha", "Anita", "Madhavi", "Sneha", "Divya", "Lakshmi", "Priya", "Sangeeta",
       "Meena", "Rani", "Nisha", "Aditi", "Sonal", "Anjali", "Pooja", "Radha", "Vidya",
       "Shilpa", "Kavita", "Geeta", "Rashmi", "Sunita", "Nandini", "Manisha", "Deepa",
       "Aruna", "Sujata", "Asha", "Kiran", "Lata", "Archana", "Rupa", "Bindu", "Kavya",
       "Swati", "Shruti", "Usha", "Vandana", "Shobha", "Kamini", "Anuradha", "Kalpana",
       "Ritu", "Seema", "Rina", "Aarti", "Sita", "Gayatri", "Bhavana", "Tanuja",
       "Gauri", "Hema", "Jaya", "Bharathi", "Indira", "Kusum", "Padma", "Rekha", "Yamini",
       "Savita", "Malini", "Parvati", "Uma", "Varsha", "Roopa", "Sumitra", "Chitra",
       "Harini", "Vimala", "Jyoti", "Kanta", "Shashi", "Mridula", "Kajal", "Pratibha",
       "Padmini", "Sarita", "Bharti", "Bina", "Charu", "Sandhya", "Sushma", "Triveni",
       "Suchitra", "Leela", "Sunaina", "Maya", "Hemalata", "Smita", "Lavanya", "Vasudha",
       "Megha", "Tara", "Nalini", "Rukmini", "Anupama", "Damayanti", "Girija", "Jayashree",
       "Minal", "Sujatha", "Vatsala", "Arpita", "Lalitha", "Mamata", "Pallavi", "Rajani"
   ];

   const randomIndex = Math.floor(Math.random() * names.length);
   return names[randomIndex];
}




 // Path to the profile-picture directory
const directoryPath = path.join(__dirname, 'profile-picture');

function getBotProfiles(){
   try {
     const files = fs.readdirSync(directoryPath);
     const profiles = files.filter(file => /\.(png|jpe?g)$/i.test(file)); // Filter for image files
     return profiles.map(file => `/assets/img/profile-picture/${file}`); // Map to URLs
   } catch (err) {
     console.error("Error reading directory:", err);
     return [];
   }
 };