var Discord = require('discord.io');
var auth = require('./auth.json');
// Configure logger settings
    colorize: true

// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
});

//Function used to find a channel ID by the name of the channel
function findVoiceChannelByName(channelID, channelName){
    
    //The current server ID
    var serverID = bot.channels[channelID].guild_id;

    try{
        //Return the ID of the server filtered on the name and the type (0 = Text channel, 2 = Voicechannel)
        return Object.values(bot.servers[serverID].channels).find(c => c.type == 2 && c.name.toUpperCase() == channelName.toUpperCase()).id;
    }
    catch(e)
        {
            console.log("Could not find channel with name "+ channelName);
        }
}

//Connect with the server, this can also be done automatically in the bot initialization.
bot.connect();
bot.on('message', function (user, userID, channelID, message, evt) {
    //Look for !fl in the start of messages to listen for commands
    if (message.substring(0, 3).toUpperCase() == '!FL') {
        //Split the commands
        var args = message.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        switch(args[0]) {
            //Join voicechannel command Listens for 1 argument !fl join [channnelname]
            case 'info':
                bot.sendMessage({
                    to: channelID,
                    message: "I listen furtively in the background when asked to do so, I remember what I hear but only the last 30 seconds #goldfish"
                });
            break;
            //Join voicechannel command Listens for 1 argument !fl join [channnelname]
            case 'join':
                if(args[1] == undefined){
                    bot.sendMessage({
                        to: channelID,
                        message: 'Seems like you forgot the name of the voicechannel !join [voicechannel name] is how you should use this command.' + args[1] 
                    });
                }
                else{
                    try{
                        bot.joinVoiceChannel(findVoiceChannelByName(channelID, args[1]));
                    }
                    catch(e){
                        bot.sendMessage({
                        to: channelID,
                        message: 'U stoopid, that channel ain\'t even exist, I\'m not that easily bamboozled.'
                    });}
                }
            break;
                //Disconnect from voicechannel command, removes the bot from the voicechannel.
            case 'disconnect':
                bot.leaveVoiceChannel(bot.servers[bot.channels[channelID].guild_id].members[bot.id].voice_channel_id);
                bot.sendMessage({
                        to: channelID,
                        message: "Okay okay, I'll leave..."
                });
            break;

            //Show all commands
            case 'help':
                bot.sendMessage({
                    to: channelID,
                    message: "The following commands can be used:\n!fl info - shows info about the bot\n!fl join [voicechannel name] - joins the voicechannel with the name provided\n!fl disconnect - disconnects from the voicechannel it\'s connected to"
                });
            break;
            // Just add any case commands if you want to..
         }
     }
});