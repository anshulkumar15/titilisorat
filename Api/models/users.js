const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var dataTables = require('mongoose-datatables')

const UserSchema = new mongoose.Schema({
  username:String,
  first_name:String,
  last_name:String,
  role_id:{
    type:Number,
    enum: [1, 2, 3, 4, 5]
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    toLowerCase: true
  },
  idManager:{ type: String,toLowerCase: true},
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 4,
    select: true
  },
  phone: {
    type: String,
    minlength: 6,
    select: true
  },
  upi:{
 type: String,
  },

  qrCode:{
 type: String,
  },
  date_of_bith:{type:Date, default: Date.now },
  gender:String,
  country:String,
  state:String,
  city:String,
  postal_code:String,
  address:String,
  image:String,
  guest_id:String,
  profile_id:String,
  fb_id:String,
  google_id:String,
  refer_id:String,
  otp:String,
  otp_time:String,
  is_login:String,
  otp_verified:String,
  last_login:String,
  device_id:String,
  device_type:String,
  module_access:String,
  current_password:String,
  language:String,
  cash_balance:{  type: Number,default: 0, required :true},
  safe_balance:{  type: Number,default: 0, required :true},
  winning_balance:{  type: Number,default: 0, required :true},
  bonus_amount:{  type: Number,default: 0, required :true},
  coin_balance:{  type: Number,default: 0, required :true},
  vip_level:String,
  status:String,
  is_updated:String,
  email_verified:String,
  verify_string:String,
  sms_notify:String,
  createdby:String,
  bot_type:String,
  point:{  type: Number,default: 0, required :true},
  active_player:String,
  win_amount:{  type: Number,default: 0, required :true},
  admin_number:String,
  playerStatus:String,
  count:{  type: Number,default: 1, required :true}

},{
  timestamps: true,
});

// // Encrypt password using bcrypt
// UserSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) {
//     next();
//   }

//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

  
   


UserSchema.plugin(dataTables);

module.exports = mongoose.model('users', UserSchema);
