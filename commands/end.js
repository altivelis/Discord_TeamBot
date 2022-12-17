const {SlashCommandBuilder}=require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('end')
		.setDescription('チーム分け終了'),
	async execute(interaction) {
        interaction.channel.status=0;
        interaction.reply("チーム分けを終了します");
	}
}