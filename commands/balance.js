const {SlashCommandBuilder, EmbedBuilder}=require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('balance')
		.setDescription('バランスチーム分け'),
	async execute(interaction) {
        if(interaction.channel.status!=1){
            await interaction.reply("チーム分けが開始されていません");
            await wait(2000);
            await interaction.deleteReply();
            return;
        }
        let T = interaction.channel.TEAM;
        
        let balance = new Array(T.num);
        for(let i in balance){
            balance[i]=new Array();
        }
        let arr = T.members.slice(0,T.members.length);
        arr.sort(function (a,b){
            if(a?.weight<b?.weight) return 1;
            else if(a?.weight>b?.weight) return -1;
            else return Math.floor(Math.random()*3)-1
        });
        balanceArray(balance,arr,T.num);
        T.teams=balance;

        let embed = createEmbed(T.members,T.num,T.teams);
        T.msg.edit({embeds:[embed]});

        await interaction.reply(`均等にチーム分けしました`);
        await wait(1000);
        await interaction.deleteReply();
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