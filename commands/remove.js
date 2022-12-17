const {SlashCommandBuilder, EmbedBuilder}=require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription('メンバー削除')
        .addUserOption(option=>
            option
                .setName("target")
                .setDescription("メンバーから削除する人を選んでください")
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

        for(let i=0;i<T.members.length;i++){
            if(T.members[i]==target){
                T.members.splice(i,1);
                break;
            }
        }
        leaveTeam(T.teams,target);
        console.log(target.displayName+" removed.");

        let embed = createEmbed(T.members,T.num,T.teams);
        T.msg.edit({embeds:[embed]});

        await interaction.reply(`${target.displayName}をメンバーから削除しました`);
        await wait(1000);
        await interaction.deleteReply();
	}
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
function getArray(array,index){
    let tmp = new Array();
    for(let i in array[index]){
        tmp.push(array[index][i]);
    }
    return tmp;
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