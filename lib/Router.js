'use strict'

const express      = require("express");
const body         = require("body-parser");
const cookieParser = require("cookie-parser");
const utils        = require("./Utils")
const helmet       = require("helmet");

// express routes


var Router = function(port){

  this.port = port;
  this.app = express();
  this.app.use(helmet())
  this.app.use(cookieParser());
  this.app.enable('trust proxy');
  this.app.disable('x-powered-by');
  this.app.use(body.json({ limit: '500mb' }));
  this.app.use(body.urlencoded({ limit: '500mb', extended: true, parameterLimit: 50000 }));
  this.app.set('views', __dirname + '/../views');
  this.app.set('view engine', 'twig');

  this.app.use('/api', require('./routes/api'));
  this.app.use('/static', express.static(__dirname + '/../assets'))/*, {

    maxAge: 3600000,
    etag: true

  }))*/

  this.app.get('/stats/:steamID64', async(req, res) => {

    var id = req.params.steamID64,
        profile_basic = utils.cache[id];

    if(profile_basic === undefined || profile_basic["timeout"] < new Date().getTime / 1000)
      utils.cache[id] = await utils.getProfileBasic(id);

    utils.getCSGOStats(id)
      .then(success => {

        var stats = JSON.parse(success);
        var total_kd = parseInt(stats.playerstats.stats[0].value) + parseInt(stats.playerstats.stats[1].value);
        var k = (100 * stats.playerstats.stats[0].value) / total_kd;
        var d = (100 * stats.playerstats.stats[1].value) / total_kd;

        const uppercaseItems = [
          'NOVA', 'BIZON', 'GALILAR', 'MOLOTOV', 'DECOY', 'TASER', 'HEGRENADE', 'GLOCK', 'DEAGLE',
          'FIVESEVEN', 'HEADSHOT', 'NEGEV', 'SAWEDOFF', 'ELITE', 'KNIFE'
        ],
        removeItem = [
          'headshot', 'enemy_weapon', 'enemy_blinded', 'knife_fight', 'against_zoomed_sniper'
        ];

        /* weapons stuff */

        const weapons = stats.playerstats.stats.filter(item => {

          return item['name'].includes("total_kills_")

        }).map(item => {

          var oldname = item['name'].split('total_kills_')[1];
          var item_name = item['name'].split('total_kills_')[1].replace(/_/g, ' ').toUpperCase();
          if(uppercaseItems.includes(item_name)){
            if(item_name == 'HEGRENADE')
              item_name = 'Grenade'
            if(item_name == 'GALILAR')
              item_name = 'Galil AR'
            else
              item_name = item_name.charAt(0) + item_name.substring(1, item_name.length).toLowerCase();
          }

          return {item_name, value: item['value'], oldname, icon: `/static/csicons/weapon_${oldname}.svg`};

        }).filter(item => {

          return !removeItem.includes(item['oldname'])

        })

        weapons.sort((a, b) => (a.value > b.value) ? -1 : 1)

        var pairs = [];

        for(var i = 0, len = weapons.length; i < len; i++){

          if(i % 2 == 0)
            pairs.push([
              weapons[i],
              (weapons[i + 1] || 'end')
            ]);

        }

        res.render('stats', {

          title: utils.cache[id]["profile"]["steamID"][0],
          stats,
          basic_stats: utils.cache[id]["profile"],
          class: 'white',
          k, d, kd: (k/d).toFixed(2),
          hours: parseInt(stats.playerstats.stats[2].value / 3600),
          weapons: pairs

        })

      })

      .catch(err => {

        console.log(err);
        res.status(err.status || 500).json(err);

      })

  })

  this.app.get('/', (req, res) => {

    res.render('index', {

      title: 'Home',
      class: 'flex'

    })

  })

  this.app.listen(this.port)
  console.log(`started on ${this.port}`);

}

module.exports = Router
