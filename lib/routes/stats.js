const express = require("express");
const utils   = require("../Utils");
var router    = express.Router();

router.get('/', (req, res) => {

  res.json({

    success: true,
    message: 'hello from stats'

  })

})

router.post('/convert', async(req, res) => {

  var param = req.body.stuff,
        steamID64,
        urlRegex = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/),
        no_obj = false;

  try{
    if(param.length == 17 && !isNaN(param)){
      steamID64 = param;
      no_obj = true;
    }
    else{

      if(param.match(urlRegex)){

        var split = param.split("profiles/");

        if(split.length > 1)
          steamID64 = split[1];
        else{
          steamID64 = (await utils.urlToID64(param.split("id/")[1]));
        }

      }

      steamID64 = (await utils.urlToID64(param));

      if(steamID64 == null)
        return res.status(404).json({success: false})

    }

    console.log(steamID64);

    if(no_obj)
      return res.json({success: true, url: `/stats/${steamID64}`});

    steamID64["timeout"] = parseInt(new Date().getTime() / 1000);
    utils.cache[steamID64["profile"]["steamID64"][0]] = steamID64;
    
    res.json({success: true, url: `/stats/${steamID64["profile"]["steamID64"][0]}`});

  }catch(err){

    throw err;

  }

})

module.exports = router;
