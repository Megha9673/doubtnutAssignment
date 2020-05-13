const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var userSchema = new Schema({
    name: { type: 'string', required: true },

    title: { type: 'string'},

    emailId: { type: 'string', required: true },

    pdfInput: { type: {
        question : {type: 'string'},
        answer: {type: 'string'}
    }},

    pdfTime: { type: 'date'},

    createdAt: { type: 'date',default:Date.now() },

    updatedAt: { type: 'date',default:Date.now() }
    
});

    //  on every save, add the date
userSchema.pre('save', function(next) {
    var currentDate = new Date();
    this.role = parseInt(this.role);
    this.updatedAt = currentDate;
    if (!this.createdAt)
        this.createdAt = currentDate;
    next();
});

userSchema.pre('update', function(next) {
  this.update({},{ $set: { updatedAt: new Date() } });
  next();
});

var User = mongoose.model('users', userSchema);

module.exports = User;