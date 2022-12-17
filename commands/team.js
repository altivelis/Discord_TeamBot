const {SlashCommandBuilder, EmbedBuilder}=require('discord.js');

module.exports={
    data: new SlashCommandBuilder()
        .setName("team")
        .setDescription("チーム分け開始"),
    async execute(interaction){
    //初期設定
    interaction.channel.status = 1;
    let vc = interaction.member.voice.channel;
    let members=[];
    if(vc!=null){
        for(let member of vc.members.values()){
            members.push(member);
            member.weight=1;
            console.log(`add from vc=>${member.displayName}`);
        }
    }
    let num = 2;
    let teams = new Array(num);
    for(let i in teams){
        teams[i]=new Array();
    }
    let embed = new EmbedBuilder();
    embed = createEmbed(members,num,teams);
    let test = {msg:null,members:null,num:null,teams:null};
    test.msg = await interaction.channel.send({embeds:[embed]});
    test.members=members;
    test.num=num;
    test.teams=teams;
    interaction.channel.TEAM = test;
    //初期設定終了
    interaction.reply("チーム分けを開始します");
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
