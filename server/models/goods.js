var mongoose  = require('mongoose');
var Schema = mongoose.Schema;
var productSchema = new Schema({
    "productId": String,
    "productName": String,
    "salePrice": Number,
    "productImage": String,
    "checked":String,
    "productNum":Number
})

module.exports = mongoose.model('good',productSchema);