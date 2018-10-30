/* This is a very old version of Sudup.
 * I don't know how it can be this ugly.
 * This version is highly incomplete and
 * will definitely not work. Be careful
 * or your eyes may burn!
 *
 * env: TOKEN, MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB, GOOGLE_KEY
 */

const Discord = require('discord.js');
const unirest = require('unirest');
const beautify_js = require('js-beautify').js;
const beautify_css = require('js-beautify').css;
const pretty = require('pretty');
const random = require("random-animal");
const mysql = require('mysql');
var bot = new Discord.Client();

var con = mysql.createConnection({
	host: process.env.MYSQL_HOST,
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASSWORD,
	database: process.env.MYSQL_DB
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

/*var settings = {
prefix: "s!",
id: guild.owner.id
/*connection.query("INSERT INTO prefix SET ?"), [settings], function (err) {
console.log(err)*
}*/

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
    bot.user.setGame("with codes! | s!help | s@help");
});

bot.on('guildCreate', guild => {
	guild.defaultChannel.send("Hello! I'm Sudup, a (currently) basic bot made by SuperOP535. You can see my commands by using `s!help`!");
	guild.createRole({name:"SudupMuted"}).catch(error => { 
		guild.defaultChannel.send("Please reinvite the bot with the proper permissions. (allow manage roles) **The bot will leave in 3 seconds**");
		setTimeout(function(){
			guild.leave();
		}, 3000);
	});
});

bot.on('guildDelete', guild => {
});
 
bot.on('message', msg => {
	if(msg.author == bot.user) return;
	
	//var sudupAdmin = msg.guild.roles.find("name", "sudupAdmin");
	if(msg.content.charAt(0) == "s" && msg.content.charAt(1) == "!" || msg.content.charAt(0) == "s" && msg.content.charAt(1) == "@"){
		var ripPerms = [];
		var reqPerms = ["READ_MESSAGES", "SEND_MESSAGES", "CREATE_INSTANT_INVITE"];
		reqPerms.forEach(function(e, i, a){
			if(msg.guild.me.hasPermission(a[i])){
				
			} else {
				ripPerms.push(a[i]);
			}
		});
		if(ripPerms.length != 0){
			msg.channel.send("**Looks like I'm missing some permissions:  **" + ripPerms.join(", "));
			return;
		}
	}
	
	var msgs = msg.content.split(" ");
	
	
	
	switch(msgs[0]){
		
		case 's!prefix':
			con.query("SELECT * FROM settings WHERE guild=" + msg.guild.id, (err,result)=>{
				if(err)throw err;
				if (!result.toString()) {
					con.query("INSERT INTO settings (guild, prefix) VALUES ("+msg.guild.id+","+msgs[1]+")", (err,result)=>{
						if(err) throw err;
						console.log(result);
					});
				} else {
					con.query("UPDATE settings SET prefix = "+msgs[1]+" WHERE guild = "+msg.guild.id, function (err, result) {
						if (err) throw err;
						console.log(result.affectedRows + " record(s) updated");
					});
				}
			});
			break;
		case 's!poll':
			msg.channel.send('Started creating a POLL! Please send the name of the POLL!');
			msg.channel.awaitMessages(m => m.author.id == msg.author.id , { max: 1, time: 30000, errors: ['time'] }).then(collected => {
				if(collected.map(mg=>mg.content)){
					var poll_name = collected.map(mg=>mg.content);
					msg.channel.send('Please send the question of the POLL!');
					msg.channel.awaitMessages(m => m.author.id == msg.author.id , { max: 1, time: 30000, errors: ['time'] }).then(collected => {
						if(collected.map(mg=>mg.content)){
							var poll_desc = collected.map(mg=>mg.content);
							msg.channel.send('Please send the time (in hours) this POLL will last!')
							msg.channel.awaitMessages(m => m.author.id == msg.author.id , { max: 1, time: 30000, errors: ['time'] }).then(collected => {
								if(collected.map(mg=>mg.content)){
									var poll_time = parseInt(collected.map(mg=>mg.content));
									msg.channel.send({embed: new Discord.RichEmbed().setTitle(poll_name).setDescription(poll_desc)});
								}
							}).catch(collected => msg.channel.send('You didn\'t send a name!'));
						}
					}).catch(collected => msg.channel.send('You didn\'t send a question!'));
				}
			}).catch(collected => msg.channel.send('You didn\'t send a name!'));
			
			msg.channel.send({embed: new Discord.RichEmbed()
				.setTitle(msgs[0])
			})
			break;
		case 's!shorten':
             unirest.post('https://www.googleapis.com/urlshortener/v1/url?key=' + process.env.GOOGLE_KEY)
            .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
            .send({ "longUrl": msg.content.replace(msgs[0] + " ", "")})
            .end(function (res) {
                msg.channel.send(res.body.id);
            });
			break;
		case 's!botinfo':
			msg.channel.send(`
**owned by:** SuperOP535
**hosted on:** Heroku
**official discord server:** https://discord.gg/p6ASjJe
**invite bot link:** coming soon
**uptime:** ` + format(process.uptime())); // woah. this link was still active until a few weeks ago (removed because of spam-bots)
			break;
		case 's!bulk':
			msg.delete();
			break;
		case 's!avatar':
			if(msg.mentions.users.first() != null){
				msg.channel.send({embed: new Discord.RichEmbed()
				.setTitle(msg.mentions.users.first().username)
				.setDescription(msg.mentions.users.first().avatarURL)
				.setImage(msg.mentions.users.first().avatarURL)});
			} else {
				msg.reply("please mention a user!");
			}
			break;
		case 's!eval':
			//msg.delete();
			if(msg.author.id == "188943534483701760"){
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
			} else {
				msg.reply("no eval for you!");
			}
			break;
		case 's!8ball':
			unirest.get(`https://8ball.delegator.com/magic/JSON/${encodeURIComponent(msg.content.replace(msgs[0] + " ", ""))}`).header("Accept", "application/json").end(res => {
				if(res.status == 200) {
					msg.channel.send(res.body.magic.answer);
				} else {
					msg.channel.send("Failed to fetch 8ball answer");
				}
			});
			break;
		case 's!cat':
		case 's!randomcat':
			random.cat().then(url => {
				msg.channel.send({files: [url]});
			})
			break;
		case 's!dog':
		case 's!randomdog':
			random.dog().then(url => {
				msg.channel.send({files: [url]});
			})
			break;
		case 's!prettyjs':
		case 's!prettyhtml':
		case 's!prettycss':
			if(msgs[1] == null) return;
			var code = msg.content.replace(msgs[0] + " ", "");
			if(code.slice(-3) == "```") code = code.slice(0, -3);
			if(code.substring(0, 3) == "```") code = code.replace("```", "");
			break;
		case 's!prettyjs':
			msg.channel.send("```" + beautify_js(code, { indent_size: 2 }) + "```");
			break;
		case 's!prettyhtml':
			msg.channel.send("```" + pretty(code)  + "```");
			break;
		case 's!prettycss':
			msg.channel.send("```" + beautify_css(code, { indent_size: 2 })  + "```");
			break;
		case 's!serverinfo':
			//msg.delete();
			
			msg.channel.send({embed: {
				color: 3447003, 
				description: `
**Server Name:** ` + msg.guild.name + `
**Server Owner:** ` + msg.guild.owner.user.username + `#` + msg.guild.owner.user.discriminator + ` (` + msg.guild.owner.id + `)
**Server Created:** ` + msg.guild.createdAt + `
**Member count:** ` + msg.guild.memberCount + `
**Online Members:** ` + msg.guild.members.filter(function(member){return member.presence.status == "online";}).size + `
**Offline Members:** ` + msg.guild.members.filter(function(member){return member.presence.status == "offline";}).size + `
**Idle Members** ` + msg.guild.members.filter(function(member){return member.presence.status == "idle";}).size + `
**Members in Do Not Disturb:** ` + msg.guild.members.filter(function(member){return member.presence.status == "dnd";}).size + `
**Text Channels:** #` + msg.guild.channels.filter(function(channel){ return channel.type == "text"}).map(c => c.name).join(", #") + `
**Voice Channels:** #` + msg.guild.channels.filter(function(channel){ return channel.type == "voice"}).map(c => c.name).join(", #") + `
**Roles:** ` + msg.guild.roles.map(r => r.name).filter(function(name){ return name != "@everyone"}).join(", "),
				author: {
					name: "Server Information:",
					icon_url: bot.me
				}
			}});
			break;
		case 's!help':
			msg.channel.send({embed: new Discord.RichEmbed()
			.setTitle("Commands for Sudup:")
			.setDescription("The current prefix is: `s!`\nThe current adminstration prefix is: `s@`")
			.addField("Adminstration", "mute, unmute")
			.addField("Utility", "help, avatar, shorten, prettyjs, prettyhtml, prettycss, serverinfo, botinfo")
			.addField("Fun", "8ball, cat, dog")});
			break;
	}
	switch(msgs[0]){
		case "s#c":
			msg.delete();
			bot.user.lastMessage.delete();
			break;
	}
	
	if(msg.content.substring(0,2) == "s@"){
		if(msg.member.roles.exists("name", "SudupAdmin")){
			switch(msgs[0]){
				case 's@help':
					msg.channel.send("s@mute - mute a user from current channel\ns@unmute - unmute a user from current channel");
				break;
				case 's@setup':
					msg.channel.send("What do you want to setup?\n\n**1** - Mute\n\n**2** - Logging\n\n");
					break;
				case 's@mute':
					if(msg.mentions.users.first() != null){ 
						msg.channel.overwritePermissions(msg.mentions.users.first(), {'SEND_MESSAGES': false});
						msg.channel.send(msg.mentions.users.first() + " can no longer chat in " + msg.channel);
					} else {
						msg.reply("please mention a user!"); return;
					}
					break;
				case 's@unmute':
					if(msg.mentions.users.first() != null){
						msg.channel.overwritePermissions(msg.mentions.users.first(), {'SEND_MESSAGES': true});
						msg.channel.send(msg.mentions.users.first() + " can now chat in " + msg.channel);
					} else {
						msg.reply("please mention a user!"); return;
					}
					break;
				case 's@ban':
					if(msg.mentions.users.first() != null){
						msg.channel.send("Are you sure? Please send y or n! The command will automatically cancel in 30s.")
						msg.channel.awaitMessages(m => m.author.id == msg.author.id , { max: 1, time: 30000, errors: ['time'] })
						.then(collected => { msg.guild.ban(msg.metions.users.first) })
						.catch(collected => msg.channel.send('You didn\'t send y/n!'));
						msg.channel.send(msg.mentions.users.first() + " can now chat in " + msg.channel);
					} else {
						msg.reply("please mention a user!"); return;
					}
			}
		} else {
			msg.reply("You don't have the SudupAdmin role!");
		}
	}
	
});
  
bot.login(process.env.TOKEN);
