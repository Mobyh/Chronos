const Discord = require('discord.js');
const moment = require('moment-timezone');
const ct = require('countries-and-timezones');
var _ = require('lodash');
require('dotenv').config();
const prefix = "?";

//Country stuff
const countries = ct.getAllCountries();

function findNestedObj(entireObj, keyToFind, valToFind){
  try{  
    let foundObj;
      JSON.stringify(entireObj, (_, nestedValue) => {
        if (nestedValue && nestedValue[keyToFind] === valToFind) {
          foundObj = nestedValue;
        }
        return nestedValue;
      });
      return foundObj;
  }
  catch(err){
    return null;
  }
};


//Discord Stuff
const client = new Discord.Client();

client.on('ready', () => {
    console.log('My body is ready');
});

client.login(process.env.BOT_TOKEN)

client.on('message', (message) => {
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
    
    if(command === "time")
    var result = findNestedObj(countries , "name" ,args.join(" "))
    if(!result){
      return
    }

    let filter = m => m.author.id === message.author.id
    var timezones = result.timezones
    var out = "";
    for (var i = 0; i<timezones.length; i++){
      out = out + "\n" + (i+1) +"- "+timezones[i]
    }
    message.channel.send('Which timezone would you like to use? ' + out).then(msg => {
      message.channel.awaitMessages(filter, {
          max: 1,
          time: 30000,
          errors: ['time']
        })
        .then(message => {
          message = message.first()

        if(parseInt(message.content) <= 0 || message.content > result.timezones.length){
            console.log(message)
            console.log(result.timezones.length)
            message.channel.send("Invalid choice")
            return
          }
          else
          var currentTime = moment().format() //get current time from heroku
          var formatedCurrentTime = moment.tz(currentTime, "America/Chicago").format('DD/MM/YYYY HH:mm')
          var newTimeZone = result.timezones[message.content-1]
          var newTime = moment.tz(currentTime, newTimeZone).format('DD/MM/YYYY HH:mm') //format it to the new timezone
          message.channel.send("Current time CST (Texas and stuff): " + formatedCurrentTime + "\ncurrent time " + newTimeZone + ": " + newTime).then(()=>{
            message.delete()
            msg.delete()
          })
        
        })
        .catch(collected => {
            console.log(collected)
            message.channel.send('Timeout');
            msg.delete()
        });
    })
});