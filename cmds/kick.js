const Discord = require("discord.js");
const guilds = require("../data/guilds.json")

module.exports.run = async (bot, message, args) => {
    if (!(message.channel.type === "text")) return;
    console.log("kicking...");
    const logChannel = message.guild.channels.get(guilds[message.guild.id].logChannelID);
    if (!message.member.hasPermission("KICK_MEMBERS")) return console.log(`${message.author.username} attempted to kick without sufficient permissions!`); //check permission
    let target = message.mentions.members.first() || message.guild.members.get(args[0]); //get mentioned member
    if (!target) {
        console.log(`${message.author.username} failed to specify a target user!`);
        (await message.channel.send(`Please specify a target user.`)).delete(5000);
        return; //check if user mentioned
    }
    if (target.hasPermission("MANAGE_MESSAGES")) {
        console.log(`Error: Target user is a moderator.`);
        (await message.channel.send(`${target.user.username} is a moderator!`)).delete(5000);
        return;
    } //Moderators cannot ban other moderators.
    let reason = args.splice(1).join(' ');
    console.log(`${target.user.username} kicked. ${reason}`);
    if (!reason) {
        response(bot, message, target);
        target.kick(`Moderator: ${message.author.username}`);
        bot.utils.logChannel(bot, message.guild.id, bot.colours.red, `Member kicked!`, target.user, message.author)
    }
    if (reason) {
        // notify user
        target.send(`**You have been kicked for the following reason:** ${reason}`)
            .catch(console.error)
            .then(() => {
                // kick
                target.kick(`Moderator: ${message.author.username}. Reason: ${reason}`);
            })
        await bot.utils.warning(bot, message.guild.id, target.id, message.author.id, `**Kick:** ${reason}`, 5, (err, result) => {
            if (err) {
                console.log(err);
                return message.channel.send(`Oops! I didn't manage to correctly log this.`);
            }
            else {
                // notify channel
                response(bot, message, target); 
                // notify logchannel
                bot.utils.logChannel(bot, message.guild.id, bot.colours.red, `Member kicked!`, target.user, message.author, reason, '', `\n**Warn ID:** ${result}`);
            }
        })
    }
    return;
}

module.exports.help = {
    name: "kick",
    usage: "kick <username> <reason>",
    type: "Moderation",
    description: "Kicks the specified user, with an optional reason."
}

response = (bot, message, target) => {
    if(bot.thanos.includes(message.author.id)) { // For the doc
        message.channel.send(new Discord.RichEmbed()
                                                    .setImage('https://media1.tenor.com/images/e36fb32cfc3b63075adf0f1843fdc43a/tenor.gif?itemid=12502580')
                                                    .setColor(bot.colour)
                                                    .setDescription(`${target.user.username} kicked! <a:blurpleinfinitygauntlet:537198451188957186>`))
        .catch(console.error);
    }
    else {
        message.channel.send(`${target.user.username} kicked!`)
        .catch(console.error);
    }
}