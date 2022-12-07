const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Events, EmbedBuilder } = require('discord.js'); //discord.js からClientとIntentsを読み込む
const {token,guildId} = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages
  ]
});  //clientインスタンスを作成する

const commands = {};

const commandsPath = path.join(__dirname,'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if('data' in command && 'execute' in command){
        commands[command.data.name] = command;
    }else{
        console.log(`[WARNING] The command at ${filePath} is missing a required \"data\" or \"execute\" property.`);
    }
}

client.once(Events.ClientReady, async () => {
    const data = []
    for (const commandName in commands) {
        data.push(commands[commandName].data)
    }
    await client.application.commands.set(data, guildId);
    
    console.log("Ready!");
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }
    const command = commands[interaction.commandName];
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true,
        })
    }
});

const prefix = "^";
//返答
client.on(Events.MessageCreate, message => {
    if (message.author.bot) {
        return;
    }
    let ms = message;
    if(!ms.content.startsWith(prefix)) return;
    const [command, ...args] = ms.content.slice(prefix.length).split(/\s+/);
    switch(command){
        case "team":f_teams(ms);break;
    }
});

async function f_teams(ms){
    ms.channel.status = 1;
    let vc = ms.member.voice.channel;
    let members=[];
    if(vc){
        for(let member of vc.members.values()){
            members.push(member);
        }
    }
    let num = 2;
    let teams = new Array(num);
    for(let i in teams){
        teams[i]=new Array();
    }
    let embed = new EmbedBuilder();
    console.log(members.join("\n").toString());
    embed = createEmbed(members,num,teams);
    let sended = await ms.channel.send({embeds:[embed]});
    sended.members=members;
    sended.num=num;
    sended.teams=teams;
    client.once(Events.MessageCreate, function code(message){
        if(message.author.bot ||
            !message.content.startsWith(prefix) ||
            message.channelId != sended.channelId){
            client.once(Events.MessageCreate,code);
            return;
        }
        const[command,...args] = message.content.slice(prefix.length).split(/\s+/);
        let mentions = message.mentions.members;
        switch(command){
            case "end":sended.delete();
                ms.channel.status=0;
                return;
            case "add": mentions.forEach(member => {
                sended.members.push(member);
                member.weight=1;
            });
                console.log("add "+sended.members);
                break;
            case "remove": mentions.forEach(member=> {
                for(let i=0;i<members.length;i++){
                    if(sended.members[i]==member){
                        sended.members.splice(i,1);
                        break;
                    }
                }
                console.log(sended.members.join("\n").toString());
            });break;
            case "join":if(!args[0]){
                    break;
                }
                let tn = parseInt(args[0],10);
                console.log(args[0]);
                if(!(0<tn && tn<=sended.num)){
                    break;
                }
                let tmp = new Array();
                for(let i in sended.teams[tn-1]){
                    tmp.push(sended.teams[tn-1][i]);
                }
                mentions.forEach(member => {
                    if(member.weight==null)member.weight=1;
                    tmp.push(member);
                });
                sended.teams[tn-1]=tmp;
                console.log(sended.teams[0].toString());
                break;
            case "leave": mentions.forEach(member=>{
                for(let i in sended.teams){
                    for(let j in sended.teams[i]){
                        if(sended.teams[i][j]==member){
                            let tmp = new Array();
                            for(let k in sended.teams[i]){
                                tmp.push(sended.teams[i][k]);
                            }
                            tmp.splice(j,1);
                            sended.teams.splice(i,1,tmp);
                            console.log(member.toString()+" leaved team"+(i+1));
                            break;
                        }
                    }
                }
            });
                break;
            case "num":sended.num=(args[0]!=null && parseInt(args[0],10)>=0)?parseInt(args[0],10):sended.num;
                break;
            case "weight":if(args[0]==null)break;
                let w = parseInt(args[0],10);
                mentions.forEach(member=>{
                    member.weight=w;
                });
                break;
            case "random":let random = new Array(sended.num);
                for(let i in random){
                    random[i]=new Array();
                }
                let array = randomArray(sended.members);
                passArray(random,array,sended.num);
                sended.teams=random;
                break;
            case "balance":let balance = new Array(sended.num);
                for(let i in balance){
                    balance[i]=new Array();
                }
                let arr = sended.members.slice(0,sended.members.length);
                arr.sort(function (a,b){
                    if(a?.weight<b?.weight) return 1;
                    else if(a?.weight>b?.weight) return -1;
                    else return Math.floor(Math.random()*3)-1
                });
                balanceArray(balance,arr,sended.num);
                sended.teams=balance;
                break;
            case "pick":let choose, str;
                if(args[0]==null){
                    choose = sended.members[Math.floor(Math.random()*sended.members.length)];
                    str="メンバー";
                }else{
                    str="チーム"+args[0];
                    let num = parseInt(args[0],10);
                    if(0<num&&num<=sended.num){
                        let array = getArray(sended.teams,num-1);
                        choose = array[Math.floor(Math.random()*array.length)];
                    }
                }
                sended.channel.send(`pick[${str}] => ${choose.toString()}`);
                break;
        }
        embed = createEmbed(sended.members,sended.num,sended.teams);
        sended.edit({embeds:[embed]});
        message.delete();
        if(sended) client.once(Events.MessageCreate,code);
    });
    return;
};
function createEmbed(members,num,teams){
    let embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle("チーム割り振り")
    if(members[0]){
        embed.addFields({name:"メンバー",value:createMembers(members)});
    }else{
        embed.addFields({name:"メンバー",value:"Not found"});
    }
    
    for(let i=0; i<num; i++){
        if(teams[i]?.length){
            embed.addFields({name:`チーム${i+1}[${sumWeight(teams[i])}]`,value:createMembers(teams[i]),inline:true});
        }else{
            embed.addFields({name:`チーム${i+1}`,value:"Not found",inline:true});
        }
    }
    return embed;
};
function createMembers(members){
    let str = new Array();
    members.forEach(function(value,index,array){
        str.push(`${value.toString()}[${value?.weight}]`);
    });
    return str.join("\n");
}
function sumWeight(members){
    let sum = 0;
    members.forEach(function(value,index,array){
        sum+=value?.weight;
    });
    return sum;
}
function randomArray(array){
    let result = array.slice(0,array.length);
    for (let i = result.length - 1; i >= 0; i--) {
        let rand = Math.floor(Math.random() * (i + 1));
        [result[i], result[rand]] = [result[rand], result[i]]
    }
    return result;
}
function passArray(origin,array,num){
    for(let i=0;i<array.length;i++){
        let index = i%num;
        let tmp = new Array();
        for(let j in origin[index]){
            tmp.push(origin[index][j]);
        }
        tmp.push(array[i]);
        origin.splice(index,1,tmp);
    }
}
function balanceArray(origin,array,num){
    let max = Math.ceil(array.length/num);
    while(array.length!=0){
        let member = array.shift();
        let wsum = new Array(origin.length);
        for(let i=0;i<num;i++){
            wsum[i]=sumWeight(getArray(origin,i));
        }
        let index;
        while(1){
            let i = minIndex(wsum);
            let tmp = getArray(origin,i);
            if(tmp.length==max){
                
                continue;
            }
            index = i;
            break;
        };
        let tmp = getArray(origin,index);
        tmp.push(member);
        origin.splice(index,1,tmp);
    }
}
function minIndex(a){
    let index = 0;
    let value = Infinity;
    for(let i=0;i<a.length;i++){
        if(value>a[i]){
            value=a[i];
            index=i;
        }
    }
    return index;
}
function getArray(array,index){
    let tmp = new Array();
    for(let i in array[index]){
        tmp.push(array[index][i]);
    }
    return tmp;
}
client.login(token);