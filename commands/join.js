const {SlashCommandBuilder, EmbedBuilder}=require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('join')
		.setDescription('チームメンバー追加')
        .addIntegerOption(option=>
            option
                .setName("team")
                .setDescription("チームナンバー")
                .setRequired(true))
        .addUserOption(option=>
            option
                .setName("target")
                .setDescription("チームに追加する人を選んでください")
                .setRequired(true)
        ),
	async execute(interaction) {
        if(interaction.channel.status!=1){
            await interaction.reply("チーム分けが開始されていません");
            await wait(2000);
            await interaction.deleteReply();
            return;
        }
        let num = interaction.options.getInteger("team");
        let target = interaction.guild.members.cache.get(interaction.options.getUser("target").id);
        let T = interaction.channel.TEAM;
        
        if(!(0<num && num<=T.num)){
            await interaction.reply("チームがありません");
            await wait(2000);
            await interaction.deleteReply();
            return;
        }
        let tmp = getArray(T.teams,num-1);
        if(target.weight==null)target.weight=1;
        leaveTeam(T.teams,target);
        tmp.push(target);
        console.log("add team"+num+":"+target.displayName);
        T.teams[num-1]=tmp;

        let embed = createEmbed(T.members,T.num,T.teams);
        T.msg.edit({embeds:[embed]});

        await interaction.reply(`${target.displayName}をメンバーに追加しました`);
        await wait(1000);
        await interaction.deleteReply();
	}
}
function getArray(array,index){
    let tmp = new Array();
    for(let i in array[index]){
        tmp.push(array[index][i]);
    }
    return tmp;
}
function leaveTeam(teams,member){
    for(let i in teams){
        for(let j in teams[i]){
            if(teams[i][j]==member){
                let tmp = getArray(teams,i);
                tmp.splice(j,1);
                teams.splice(i,1,tmp);
                console.log(member.displayName+" leaved team"+(i+1));
                break;
            }
        }
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