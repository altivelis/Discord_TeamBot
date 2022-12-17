const {SlashCommandBuilder, EmbedBuilder}=require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add')
		.setDescription('メンバー追加')
        .addUserOption(option=>
            option
                .setName("target")
                .setDescription("メンバーに追加する人を選んでください")
                .setRequired(true)
        ),
	async execute(interaction) {
        if(interaction.channel.status!=1){
            await interaction.reply("チーム分けが開始されていません");
            await wait(2000);
            await interaction.deleteReply();
            return;
        }
        let target = interaction.guild.members.cache.get(interaction.options.getUser("target").id);
        let T = interaction.channel.TEAM;
        
        if(!T.members.includes(target)){
            T.members.push(target);
            target.weight=1;
            console.log("add "+target.displayName);
        }

        let embed = createEmbed(T.members,T.num,T.teams);
        T.msg.edit({embeds:[embed]});

        await interaction.reply(`${target.displayName}をメンバーに追加しました`);
        await wait(1000);
        await interaction.deleteReply();
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