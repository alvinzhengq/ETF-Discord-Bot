const Discord = require("discord.js");
const client = new Discord.Client();
const { http, https } = require('follow-redirects');
const fs = require('fs');
const csv = require('fast-csv');
const configs = JSON.parse(require('fs').readFileSync("./config.json", "utf-8"))

client.on("ready", () => {

    let etfGuild = client.guilds.cache.get(configs.etf_id)

    client.on("message", (msg) => {
        if(msg.author.bot == false && msg.channel.type == 'dm'){
            if(etfGuild.member(msg.author).roles.cache.find(r => r.name == "Member") != undefined){
                msg.channel.send("You have already been given access to the ETF server")

            }else{
                let name = msg.content.toUpperCase();

                isVerified(name, (result) => {
                    if(result == "ERROR"){
                        msg.channel.send("Something went wrong, please message the bot creator: Cox#5431 for help. Error code: CRANKWORX")

                    }else if(result == true){
                        etfGuild.member(msg.author).setNickname(getProperName(name))
                        .then(() => {
                            etfGuild.member(msg.author).roles.add(etfGuild.roles.cache.find(role => role.name == "Member"))
                            .then(()=>{
                                msg.channel.send("You have been given access to the ETF server, make sure to read over all the rules!")
                            })
                            .catch(()=>{
                                msg.channel.send("Something went wrong, please message the bot creator: Cox#5431 for help. Error code: MILLERS")
                            })
                        })
                        .catch((err)=>{
                            console.log(err)
                            msg.channel.send("Something went wrong, please message the bot creator: Cox#5431 for help. Error code: KEVIN")
                        })

                    }else if(result == false){
                        msg.channel.send("Name not found, please check if you spelled your name correctly(first and last), or fill out the signup form(http://bit.ly/ETFWebDev) if you haven't already.");

                    }
                })
            }
        }
    });

});

function getProperName(name){
    return name
    .toLowerCase()
    .split(' ')
    .map(function(word) {
        return word[0].toUpperCase() + word.substr(1).toLowerCase();
    })
    .join(' ');
}

function isVerified(name, cb){
    downloadFile(()=>{
        var readStream = require('fs').createReadStream("./members.csv")
        .pipe(csv.parse({ headers: true }))
        .on('error', error => cb("ERROR"))
        .on('data', row => {
            if(row["Student Name (first last)"].toUpperCase() == name){
                cb(true);
                readStream.destroy();
            }
        })
        .on('end', rowCount => cb(false));
    })
}

function downloadFile(cb){
    let file = fs.createWriteStream("members.csv");
    https.get(configs.sheet_url, function(response) {
        response.pipe(file);
    });
    file.on("close", ()=>{
        cb();
    })
}

client.login(configs.token);
