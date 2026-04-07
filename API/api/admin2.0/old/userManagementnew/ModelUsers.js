const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  services: {
    password: {
      bcrypt: String, // current pwd
      bcrypt1: String, // earlier pwd
      bcrypt2: String, // 2 pwd ago
    },
    resume: {
      loginTokens: [
        {
          loginTimeStamp: { type: Date },
          logoutTimeStamp: { type: Date },
          ValidateTill: { type: Date },
          hashedToken: String,
        },
      ],
    },
  },
  username: { type: String },
  authService: String,
  social_media_id: String,
  department : String,
  orgLevel   : String,
  designation: String,
  reporting_id : { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  profile: {
    center_id		: { type: mongoose.Schema.Types.ObjectId, ref: "centers" }, //for lupin only
		centerName	: String,  //for lupin only
    company_id: { type: mongoose.Schema.Types.ObjectId, ref: "enterprise" },
    companyID: Number,
    employeeID: Number,
    companyName: String,
    firstname: String,
    lastname: String,
    fullName: String,
    mobile: String,
    image: String,
    pincode: String,
    countryCode: String,
    isdCode: String,
    email: String,
    otpEmail: String,
    otpMobile: String,
    emailVerified: Boolean,
    mobileVerified: Boolean,
    status: String,
    createdOn: String,
    userLinkedinProfile: Object,
    entLinkedinProfile: Object,
    userBusinessInfo: Object,
    wrongPwdAttempts:Number,
  },

  address: {
    addressLine: String,
    city: String,
    state: String,
    country: String,
    pincode: String,
  },
  roles: [String],
  approvalStatus: {type:String,default:'Pending'},
  statusLog   : [
    {
      status 				      : String,
      updatedAt           : Date,
      updatedBy           : String,
    }
  ]
});

module.exports = mongoose.model("user", userSchema);
