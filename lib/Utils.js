const parse = require('xml2js').parseString;
const STATS_URL = "http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=730&key=117B456F3D8166B45D58BDF73BAAE550&steamid=";
const request = require('request-promise');
const rp = request.defaults({
  headers: {'User-Agent': 'Mozilla/5.0 (Linux; U; Android 4.4.2; en-us; SCH-I535 Build/KOT49H) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30'}
})
module.exports = {

  cache: {},
  stat_cache: {},

  getCSGOStats: function(steamID64){

    return new Promise(

      (resolve, reject) => {

        rp(STATS_URL + steamID64)
          .then(success => {

            resolve(success)

          })

          .catch(err => {

            reject({success: false, error: 'private_profile', status: 403})

          })

      }

    )

  },

  getProfileBasic: async function(steamID64){

    try{
      var xml = await rp(`https://steamcommunity.com/profiles/${steamID64}?xml=1`);
      var stats = await this.parseXML(xml);
      if(!stats["profile"])
        return null;

      stats["timeout"] = parseInt(new Date().getTime() / 1000);

      return stats;

      }catch(err){

        return err;

      }

  },


  getStats: function(steamID64){

    return new Promise(

      (resolve, reject) => {



      }

    )

  },

  urlToID64: async function(customURL){

    try{

      console.log(customURL);
      var xml = await rp(`https://steamcommunity.com/id/${customURL}?xml=1`);

      var steamID64 = await this.parseXML(xml);
      console.log(steamID64);
      if(!steamID64.hasOwnProperty("profile"))
        return null;

      return steamID64;

    }catch(err){

      console.log(err);
      throw err;

    }

  },

  parseXML: function(xml){

    return new Promise(

      (resolve, reject) => {

        parse(xml, (err, result) => {

          if(err)
            return reject(err);

          return resolve(result)

        })

      }

    )

  }

}
