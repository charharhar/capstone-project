var mongoose 	= require('mongoose');
var bcrypt 		= require('bcrypt-nodejs');

// define the schema for the user model
var userSchema = mongoose.Schema({
	username: String,
	password: String
})

// methods ======================
// generating the hash
userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

// checking if password is valid
userSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User', userSchema);