var Discord = require('discord.io');
var auth = require('./auth.json');
// Configure logger settings
    colorize: true

// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
});

function findVoiceChannelByName(channelID, channelName){
    var serverID = bot.channels[channelID].guild_id;

    try{
        return Object.values(bot.servers[serverID].channels).find(c => c.type == 2 && c.name.toUpperCase() == channelName.toUpperCase()).id;
    }
    catch(e)
        {
            console.log("Could not find channel with name "+ channelName);
        }
}

bot.connect();
bot.on('message', function (user, userID, channelID, message, evt) {
    if (message.substring(0, 3).toUpperCase() == '!FL') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        switch(args[0]) {
            case 'join':
                if(args[1] == undefined){
                    bot.sendMessage({
                        to: channelID,
                        message: 'Seems like you forgot the channelname !join [channelname] is how you should use this command.' + args[1] 
                    });
                }
                else{
                    try{
                        bot.joinVoiceChannel(findVoiceChannelByName(channelID, args[1]));
                    }
                    catch(e){
                        bot.sendMessage({
                        to: channelID,
                        message: 'U stoopid, that channel ain\'t even exist.'
                    });}
                }
            break;
            case 'disconnect':
                bot.leaveVoiceChannel(bot.servers[bot.channels[channelID].guild_id].members['558702680693014559'].voice_channel_id);
            break;
            // Just add any case commands if you want to..
         }
     }
});