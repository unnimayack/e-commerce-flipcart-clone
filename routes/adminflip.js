var express = require('express');
var router = express.Router();
var productHelpers = require('../helpersflip/productflip-helpers');
var userHelpers = require('../helpersflip/userflip-helpers');


const verifyLogin = ((req, res, next) => {
  if (req.session.adminLoggedIn) {
    next()
  } else {
    res.redirect('/admin/adminLogin')
  }
})
/* GET users listing. */
router.get('/', function (req, res) {
  let adminLogin = req.session.admin
  console.log(adminLogin)

  productHelpers.getAllProducts().then((products) => {
    console.log();
    res.render('adminflip/viewflip-products', { admin: true, products, adminLogin, style: 'adminview' })
  })

});
router.get('/adminLogin', (req, res) => {
  if (req.session.adminLoggedIn) {
    res.redirect('/admin')
  } else {
    productHelpers.createLogin().then((response) => {
      console.log(response);
      res.render('adminflip/admin-login', { admin: true, "loginErr": req.session.adminLoginErr })
      req.session.adminLoginErr = false
    })
  }
})
router.post('/adminlogin', (req, res) => {
  console.log(req.body);

  productHelpers.matchLoginDetails(req.body).then((response) => {
    if (response.status) {
      req.session.admin = response.admin
      req.session.adminLoggedIn = true
      res.redirect('/admin')
    } else {
      req.session.adminLoginErr = "Inavalid usename or password"
      res.redirect('/admin/adminlogin')
    }
  })
})
router.get('/adminlogout', (req, res) => {
  req.session.admin = null
  req.session.adminLoggedIn = false
  res.redirect('/admin')
})
router.get('/addflip-products', verifyLogin, (req, res) => {
  let adminLogin = req.session.admin
  res.render('adminflip/addflip-products', { admin:true, adminLogin })
})
router.post('/addflip-products', (req, res) => {
  console.log(req.body);
  console.log(req.files.Image)
  productHelpers.addProduct(req.body, (insertedId) => {
    let Image = req.files.Image
    Image.mv('./public/product-images/' + insertedId + '.jpg', (err, done) => {
      if (!err) {
        res.render('adminflip/addflip-products',{admin:true})
      } else {
        console.log(err);
      }
    })
    res.render('adminflip/addflip-products',{admin:true})
  })
})
router.get('/delete-product/:id', verifyLogin, (req, res) => {
  let prodId = req.params.id
  console.log(prodId);

  productHelpers.deleteProduct(prodId).then((response) => {
    res.redirect('/admin')
  })
})
router.get('/edit-product/:id', verifyLogin, async (req, res) => {
  let product = await productHelpers.getProductDetails(req.params.id)
  console.log(product)
  res.render('adminflip/editflip-product', { admin: true,adminLogin:req.session.admin, product })
})
router.post('/edit-product/:id', (req, res) => {
  console.log(req.params.id);
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect('/admin')
    if (req.files.Image) {
      let Image = req.files.Image
      let id = req.params.id
      Image.mv('./public/product-images/' + id + '.jpg')
    }
  })
})
router.get('/all-products', verifyLogin, (req, res) => {
  let adminLogin = req.session.admin
  productHelpers.getAllProducts().then((products) => {
    res.render('adminflip/all-productflip', { admin: true, adminLogin, products })

  })
})
router.get('/all-users', verifyLogin, (req, res) => {
  let adminLogin = req.session.admin
  userHelpers.getAllUsers().then((users) => {
    res.render('adminflip/all-usersflip', { admin: true, adminLogin, users })
  })
})
router.get('/all-orders/:id', async (req, res) => {
  userHelpers.getUserOrders(req.params.id).then((orders) => {
    res.render('adminflip/all-ordersflip', { admin: true, orders })
  })
})
router.get('/all-ordered-products/:id', async (req, res) => {
  let products = await userHelpers.getOrderProducts(req.params.id)
  res.render('adminflip/all-ordered-productflip', { admin: true, products })
})


module.exports = router;
