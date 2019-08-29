const express = require("express");
var router = express.Router();

router.get('/', (req, res) => {

  res.json({

    success: true,
    message: 'hello from api'

  })

})

router.use('/stats', require('./stats'));

module.exports = router;
