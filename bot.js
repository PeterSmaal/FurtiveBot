var Discord = require('discord.io');
var auth = require('./auth.json');
// Configure logger settings
    colorize: true
var shane = '231832972700024833';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
});

//used in pin command
var pinning = false;

var fs = require('fs');
var ffmpeg = require('ffmpeg');

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
            console.log('Could not find channel with name '+ channelName);
        }
}

function findRoleByName(channelID, roleName){
   return Object.values(bot.servers[bot.channels[channelID].guild_id].roles).find(c => c.name.toUpperCase() == roleName.toUpperCase()).id;
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
            case 'info':
                bot.sendMessage({
                    to: channelID,
                    message: 'I listen furtively in the background when asked to do so, I remember what I hear but only the last 30 seconds #goldfish'
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
                        message: 'Okay okay, I\'ll leave...'
                });
            break;

            //Show all commands
            case 'help':
                bot.sendMessage({
                    to: channelID,
                    message: 'The following commands can be used:\n\n!fl info - shows info about the bot\n!fl join [voicechannel name] - joins the voicechannel with the name provided\n!fl disconnect - disconnects from the voicechannel it\'s connected to\n!fl clear - Removes all the commands sent to me and my own messages within the last 100 messages\n!fl pin [message] - pins the message (admin only needs to be added)\n\n\nDev commands:\n\n!fl removeAllPins - removes all pinned messages(only access for shane currently)\n!fl getRoleID [name] - returns the id of the role with the given name\n\n\nWorking on:\n\n!fl start - to start recording and saving audio of voice channel, currently creates .wav but stays empty'
                });
            break;
                
            //create a pinned message
            case 'pin':
                //Remove first element of the array args, "pin"
                args.shift();
                
                //resend the message as confirmation and to get a messageID to pin
                bot.sendMessage({
                    to: channelID,
                    message: '"' + args.join(' ') + '" - Pinned by ' + bot.users[userID].username
                }, function(error, response){
                    //pin the message we just created with the id
                    bot.pinMessage({
                        channelID: channelID,
                        messageID: response.id
                    });
                    //delete the original command message "!fl pin ...."
                    bot.deleteMessage({
                        channelID: channelID,
                        messageID: evt.d.id
                    });
                });
            break;    
            
            //Removes all messages with "!fl" or from the bot, keeps pinned messages, only checks last 100 messages (100 is limit)
            case 'clear':
                var messageArray = [];
                bot.getMessages({
                    channelID: channelID,
                    limit: 20 
                }, function (error, array){
                                        
                    var messagesToDelete = [];
                    
                    array.forEach(function(element){
                        if(element.content.indexOf(' - Pinned by ') < 0){
                            if(element.author.username === 'Furtive Listener' || element.content.indexOf('!fl') >= 0){
                                messagesToDelete.push(element.id);
                            }
                        }
                        
                    });
                
                    bot.deleteMessages({
                        channelID: channelID,
                        messageIDs: messagesToDelete
                    });
                    
                });
            break;
                
            //Removes all pins, only access by username shane [this cannot be undone].    
            case 'removeAllPins':
                if(bot.users[userID].username === "Shane"){
                     bot.getPinnedMessages({
                        channelID: channelID
                    }, function(error, response){
                        response.forEach(function(element){
                            bot.deletePinnedMessage({
                                channelID: channelID,
                                messageID: element.id
                            });
                        });
                    });
                }else{
                    bot.sendMessage({
                        to: channelID,
                        message: 'You\'re not important enough to do this command.' 
                    })
                }
               
            break;
            //Dev command, returns the id of the rolename given    
            case 'getRoleID':
                rolename = args[1];
                bot.sendMessage({
                    to: channelID,
                    message: rolename + ': ' + findRoleByName(channelID, rolename)
                });
            break;    
                
            case 'start':
                var user = userID;
                console.log(user);
                var voiceChannelID = bot.servers[bot.channels[channelID].guild_id].members[bot.id].voice_channel_id; 
                bot.getAudioContext({channelID: voiceChannelID, maxStreamSize: 50 * 1024}, function(error, stream){
                    console.log('error: ' + error);
                    if(stream.members[shane]){
                        stream.members[shane].read();    
                    }else{
                        console.log('User: ' + shane + ' not found.');
                    }
                    stream.pipe(fs.createWriteStream('./everyone.wav'));
                    stream.on('incoming', function(SSRC, buffer){});
                });
            break;
            // Just add any case commands if you want to..
         }
     }
});
