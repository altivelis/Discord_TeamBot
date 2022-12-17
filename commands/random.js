const {SlashCommandBuilder, EmbedBuilder}=require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('random')
		.setDescription('ランダムチーム分け'),
	async execute(interaction) {
        if(interaction.channel.status!=1){
            await interaction.reply("チーム分けが開始されていません");
            await wait(2000);
            await interaction.deleteReply();
            return;
        }
        let T = interaction.channel.TEAM;
        
        let random = new Array(T.num);
        for(let i in random){
            random[i]=new Array();
        }
        let array = randomArray(T.members);
        passArray(random,array,T.num);
        T.teams=random;

        let embed = createEmbed(T.members,T.num,T.teams);
        T.msg.edit({embeds:[embed]});

        await interaction.reply(`ランダムにチーム分けしました`);
        await wait(1000);
        await interaction.deleteReply();
	}
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