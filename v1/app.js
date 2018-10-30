/** This is a very old code and it is awful.
 *  The new Sudup isn't like this but I don't
 *  think I will ever release the source code
 *  of the new one. - SuperOP535
 * 
 * Latest tested discord.js version: stable 11.2.1
 * Latest tested node version: 8.4.0
 * 
 *  Note: Some parts have been removed
 *  and some parts have been modified
 *  WITHOUT testing, you shouldn't
 *  just put this on some VPS and
 *  expect it to work fine. I recommend
 *  making your own bot and taking
 *  parts from this code.
 *  
 *  Full permission given.
 **/

const Discord = require('discord.js'),
bot = new Discord.Client();
const unirest = require('unirest');

var prefix = "s!";
var cooldowns = [];
setInterval(() => cooldowns = [], 5000);


// Ty stackoverflow
function format(seconds){
	function pad(s){
		return (s < 10 ? '0' : '') + s;
	}
	var hours = Math.floor(seconds / (60*60));
	var minutes = Math.floor(seconds % (60*60) / 60);
	seconds = Math.floor(seconds % 60);
	
	return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
}

bot.on('ready', () => {
    console.log("Bot has started!");
    bot.user.setGame("with codes! | s!help");
});
 
bot.on('message', msg => {
	if(msg.author.bot) return;
	
	if(msg.content.startsWith('s!') || msg.content.startsWith('s@')){
		if(!cooldowns.includes(msg.author.id)){
			cooldowns.push(msg.author.id);
		} else {
			msg.channel.send('Please wait ~1-5 seconds.').then((m) => setTimeout(() => m.delete(), 2000));
			return;
		}
	}
	
	if((msg.content.startsWith('s!') || msg.content.startsWith('s@')) && !msg.channel.permissionsFor(msg.guild.me).has('SEND_MESSAGES')){
		return;
	}
	
	if((msg.content.startsWith('s!') || msg.content.startsWith('s@')) && !msg.channel.permissionsFor(msg.guild.me).has('EMBED_LINKS')){
		msg.channel.send('Please give me the EMBED_LINKS permissions (channel permissions denies me to send embeds)');
		return;
	}
	
	var msgs = msg.content.toLowerCase().split(" ");
	
	switch(msgs[0]){
		case prefix + 'pequery':
			if(msgs[1] == null){
				msg.channel.send('Usage: s!pequery <ip> [port]');
				return;
			}
			if(msgs[2] == null) msgs[2] = 19132;
			unirest.get('https://use.gameapis.net/mcpe/query/extensive/' + msgs[1] + ':' + msgs[2]).header("Accept", "application/json").end(res => {
				if(res.status == 200){
					if(res.body.error != null){
						msg.channel.send('Invalid IP or server is offline!');
						return;
					}
					if(res.body.list == null){ 
						res.body.list = ['No players!'];
					} else if(res.body.list.join(', ').length > 1024) res.body.list = ['Too long to send!'];
					if(res.body.plugins == null){ 
						res.body.plugins = ['No plugins!'];
					} else if(typeof res.body.plugins == "string"){ res.body.plugins = [res.body.plugins];
					} else if(res.body.plugins.join(', ').length > 1024) res.body.plugins = ['Too long to send!'];
					msg.channel.send({embed: new Discord.RichEmbed()
						.setTitle(res.body.motd)
						.addField('Software', res.body.software)
						.addField('Version', res.body.version)
						.addField('Map', res.body.map)
						.addField('Plugins', res.body.plugins.join(', '))
						.addField('Players (' + res.body.players.online + '/' + res.body.players.max + ')', res.body.list.join(', '))
					});
				} else {
					msg.channel.send('Failed to send request to query API!');
				}
			});
			break;
		case prefix + 'discrimlist':
		case prefix + 'discrims':
		case prefix + 'discrim':
		case prefix + 'discriminators':
		case prefix + 'discriminator':
			if(msgs[1] == null){ msgs[1] = msg.author.discriminator; } else { msgs[1] = msgs[1].replace('#',''); }
			if(msgs[1].length != 4) return;
			if(bot.users.find('discriminator', msgs[1]) == null) var x = "No users with this discrim.";
			else var x = bot.users.find('discriminator', msgs[1]).username;
			msg.channel.send({embed: new Discord.RichEmbed().setTitle('Users with discrim #' + msgs[1]).setDescription(x)});
			break;
		case prefix + 'shorten':
            unirest.post('https://www.googleapis.com/urlshortener/v1/url?key=' + process.env.GOOGLE_KEY)
            .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
            .send({ "longUrl": msg.content.replace(msgs[0] + " ", "")})
            .end(function (res) {
                msg.channel.send(res.body.id);
            });
			break;
		case prefix + 'unshorten':
             unirest.get('https://www.googleapis.com/urlshortener/v1/url?key=' + process.env.GOOGLE_KEY + '&shortUrl='+msg.content.replace(msgs[0] + " ", ""))
            .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
            .end(function (res) {
                msg.channel.send(res.body.longUrl);
            });
			break;
		case prefix + 'botinfo':
			msg.channel.send({embed: new Discord.RichEmbed()
			.setTitle("__Sudup information:__")
			.addField("Creator", "SuperOP535#2316")
			.addField("Uptime", format(process.uptime()))
			.addField("Guilds", bot.guilds.size)
			.addField("Users", bot.users.size)
			.addField("Discord", "https://discord.gg/p6ASjJe")
			.addField("Invite", "Coming soon!")});
			break;
		case prefix + '8ball':
			unirest.get(`https://8ball.delegator.com/magic/JSON/${encodeURIComponent(msg.content.replace(msgs[0] + " ", ""))}`)
			.header("Accept", "application/json").end(res => {
				if(res.status == 200) {
					msg.channel.send(res.body.magic.answer);
				} else {
					msg.channel.send("Failed to fetch 8ball answer");
				}
			});
			break;
		case prefix + 'cat':
		case prefix + 'randomcat':
		case prefix + 'meow':
			 unirest.get('http://random.cat/meow').end(res => {
				if(res.status == 200){
					msg.channel.send({files: [res.body.file]});
				} else {
					msg.channel.send('Failed to fetch random.cat answer. [HTTP: ' + res.status + ']');
				}
			});
			break;
		case prefix + 'dog':
		case prefix + 'randomdog':
		case prefix + 'woof':
			unirest.get('https://random.dog/woof.json').end(res => {
				if(res.status == 200){
				    if(res.body.url.includes('.mp4')) res.body.url = "https://random.dog/8536-28743-5665.jpg";
					msg.channel.send({files: [res.body.url]});
				} else {
					msg.channel.send('Failed to fetch random.dog answer [HTTP: ' + res.status + ']');
				}
			});
			break;
		case prefix + 'getinfo':
			if(msg.mentions.users.first() != null){
			var embedmsg = new Discord.RichEmbed();
			if(msg.mentions.users.first().bot){
				embedmsg.setTitle('__Bot Information:__');
				embedmsg.addField('Bot-user information', '__ClientID:__ ' + msg.mentions.users.first().id + '\n__Invite Link:__ ' + 'https://discordapp.com/oauth2/authorize?client_id=' + msg.mentions.users.first().id + '&scope=bot');
			} else {
				embedmsg.setTitle('__User Information:__');
			}
				embedmsg.setThumbnail(msg.mentions.users.first().avatarURL);
				embedmsg.addField('Created at', msg.mentions.users.first().createdAt);
				embedmsg.addField('Joined at', msg.mentions.members.first().joinedAt);
				embedmsg.addField('AvatarURL', msg.mentions.users.first().avatarURL);
				msg.channel.send({embed: embedmsg});
			} else {
				msg.channel.send('You didn\'t mention a user!');
			}
			break;
		case prefix + 'thonk':
			msg.channel.send(bot.emojis.find('name', 'thonk').toString());
			break;
		case prefix + 'serverinfo': 
			var infoembed = new Discord.RichEmbed()
			.setTitle("__Server information__")
			.addField("Server Name", msg.guild.name + ' (' + msg.guild.id + ')')
			.addField("Server Owner", msg.guild.owner.user.username + '#' + msg.guild.owner.user.discriminator + ' (' + msg.guild.owner.id + ')')
			.addField("Server Created", msg.guild.createdAt)
			.addField("Member Counts", 'All:' + msg.guild.memberCount + 
			' Online:' + msg.guild.members.filter(function(member){return member.presence.status == "online";}).size +
			' Offline:' + msg.guild.members.filter(function(member){return member.presence.status == "offline";}).size +
			' Idle:' + msg.guild.members.filter(function(member){return member.presence.status == "idle";}).size +
			' DND:' + msg.guild.members.filter(function(member){return member.presence.status == "dnd";}).size)
			.addField("Text Channels", msg.guild.channels.filter(function(channel){ return channel.type == "text"}).map(c => c).join(", "));
			
			if(msg.guild.channels.filter(function(channel){ return channel.type == "voice"}).map(c => c).join(", ") != ""){
				infoembed.addField("Voice Channels", msg.guild.channels.filter(function(channel){ return channel.type == "voice"}).map(c => c).join(", "));
			}
			infoembed.addField("Roles", msg.guild.roles.map(r => r.name).filter(function(name){ return name != "@everyone"}).join(", "));
			msg.channel.send({embed: infoembed});
			break;
		case prefix + 'help':
			msg.channel.send({embed: new Discord.RichEmbed()
			.setTitle("__Commands for Sudup:__")
			.setDescription("The current prefix is: `" + prefix + "`\nThe current adminstration prefix is: `s@`")
			.addField("Adminstration", "mute, unmute")
			.addField("Utility", "help, avatar, shorten, unshorten, serverinfo, botinfo, discrim, pequery, getinfo")
			.addField("Fun", "8ball, cat, dog, thonk")});
			break; 
	}
	
	// Owner-only commands
	if(msg.author.id == "188943534483701760"){
		switch(msgs[0]){
			case 's#say':
				msg.delete();
				msg.channel.send(msg.content.replace(msgs[0] + " ", ""));
				break;
			case 's#eval':
					if(msgs[1] != null){
						var code = msg.content.replace(msgs[0], "");
						try {
							var evall = eval(code);
							msg.channel.send("```" + evall + "```");
						} catch(err){
							msg.channel.send("**An error occured! **" +err);
						}
					} else {
						msg.reply("you cannot eval nothing!");
					}
				break;
			case "s#c":
				msg.delete();
				bot.user.lastMessage.delete();
				break;
		}
	}
	
});
   
bot.login(process.env.TOKEN); 
