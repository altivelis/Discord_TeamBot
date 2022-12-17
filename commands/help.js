const {SlashCommandBuilder, EmbedBuilder}=require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('コマンド一覧'),
	async execute(interaction) {
        let text =
        "\`\`\`\～コマンド一覧\～\n"+
        "/help:コマンド一覧表示\n"+
        "/team:チーム分けを開始します。\n"+
        "/end:終了\n"+
        "/add <@mention>:メンバーにユーザーを追加\n"+
        "/remove <@mention>:メンバーからユーザーを削除\n"+
        "/join <int:n> <@mention>:チームnにユーザーを追加\n"+
        "/leave <@mention>:チームからユーザーを削除\n"+
        "/num <int:n>:チーム数を設定\n"+
        "/weight <int:n> <@mention>:重み(強さ)を設定\n"+
        "/random:ランダムチーム分け\n"+
        "/balance:バランスチーム分け(強さ均等化)\n"+
        "/pick:メンバーからランダム抽選\n"+
        "/pick <int:n>:チームnからランダム抽選\n\n"+
        "おまけ\n"+
        "サイコロが振れます。/dice\n"+
        "クトゥルフ神話TRPG用のダイスもあります。/ccb\n\n"+
        "Created by: altivelis\`\`\`"
        await interaction.reply({content:text,ephemeral:true});
	}
}