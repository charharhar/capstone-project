var mongoose = require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var Projects = new Schema({
	name: String,
	title: String,
	fullContent: String,
	dateModified: {type: Date, default: Date.now},
	dateCreated: {type: Date, default: Date.now},
	upvotes: [{type: String}],
	owner: {type: ObjectId, ref: 'User'},
	comments: [{body: String, type: String, postedBy: String }]
});

module.exports = mongoose.model('Projects', Projects);