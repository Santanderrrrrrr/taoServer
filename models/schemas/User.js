const mongoose = require('mongoose');
const {isEmail} = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, "firstname can't be blank"]
  },
  lastname: {
    type: String,
    required: [true, "lastname can't be blank"]
  },
  username: {
    type: String,
    unique: true,
    required: [true, "Username can't be blank"]
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, "email can't be blank"],
    index: true,
    validate: [isEmail, "invalid email"]
  },
  telephone: {
    type: String,
    unique: true,
    required: [true, "telephone can't be blank"],
    index: true,
    
  },
  password: {
    type: String,
    required: [true, "password can't be blank"]
  },
  picture: {
    type: String,
    required: [true, "picture can't be blank"]
  },
  followers: [{
    type: String
    }],
  following: [{
        type: String
    }],
  roles:[{
        type: String
    }],
  refreshToken:{
    type: String
  },
  location:{
    type: String
  },
  verified:{
    type: Boolean,
    default: false
  },
  bio:{
    type: String,
    default: "Hi, I buy/sell on BeiYaJioni"
  }
}, {minimize: false, timestamps: true});

userSchema.index({
  // '$**': 'text'
  firstname: "text",
  lastname: "text",
  username: "text",
  email: "text",
})

userSchema.pre('save', function(next){
  const user = this;
  if(!user.isModified('password')) return next();

  bcrypt.genSalt(10, function(err, salt){
    if(err) return next(err);

    bcrypt.hash(user.password, salt, function(err, hash){
      if(err) return next(err);

      user.password = hash
      console.log(hash)
      next();
    })

  })

})



userSchema.methods.toJSON = function(){
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.refreshToken;
  return userObject;
}

userSchema.statics.findByCredentials = async function(email, password) {
  const user = await User.findOne({email});
  if(!user) throw new Error('invalid email or password');

  const isMatch = await bcrypt.compare(password, user.password);
  if(!isMatch) throw new Error('invalid email or password')
  return user
}


const User = mongoose.model('User', userSchema);

module.exports = User
