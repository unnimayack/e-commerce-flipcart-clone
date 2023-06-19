var db = require('../configflip/connectionflip');
var collectionflip = require('../configflip/collectionflip');
var objectId = require('mongodb').ObjectId;
var bcrypt = require('bcrypt');
require('dotenv').config();

module.exports = {

    createLogin: () => {
        return new Promise(async (resolve, reject) => {

            const salt = await bcrypt.genSalt(10)
            let Password = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt)

            let loginObj = {
                Password: Password,
                Username: 'username',
                Name: 'admin'
            }
            db.get().collection(collectionflip.ADMINLOGIN_COLLECTION).insertOne(loginObj).then((data) => {
                resolve(data)
            })
        })
    },
    matchLoginDetails: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let admin = await db.get().collection(collectionflip.ADMINLOGIN_COLLECTION).findOne({ Username: adminData.Username })
            if (admin) {
                bcrypt.compare(adminData.Password, admin.Password).then((status) => {
                    if (status) {
                        console.log('login success')
                        response.admin = admin
                        response.status = true
                        resolve(response)
                    } else {
                        console.log('login failed')
                        resolve({ status: false })
                    }
                })
            } else {
                console.log('login failed')
                resolve({ status: false })
            }

        })
    },

    addProduct: (product, callback) => {
        console.log(product);
        db.get().collection('product').insertOne(product).then((data) => {
            console.log(data)
            callback(data.insertedId)

        })
    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collectionflip.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct: (prodId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collectionflip.PRODUCT_COLLECTION).deleteOne({ _id: new objectId(prodId) }).then((response) => {
                console.log(response)
                resolve(response)

            })
        })

    },
    getProductDetails: (prodId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collectionflip.PRODUCT_COLLECTION).findOne({ _id: new objectId(prodId) }).then((product) => {
                resolve(product)
            })
        })
    },
    updateProduct: (prodId, prodDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collectionflip.PRODUCT_COLLECTION)
                .updateOne({ _id: new objectId(prodId) }, {
                    $set: {
                        Name: prodDetails.Name,
                        Catogory: prodDetails.Catogory,
                        Price: prodDetails.Price,
                        Description: prodDetails.Description
                    }
                }).then((response) => {
                    console.log(response)
                    resolve()
                })
        })
    }
}