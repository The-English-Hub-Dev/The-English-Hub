async function runVcShortcut(interaction, container, channelId, unban = false) {
    const member = interaction.options.getMember('member');
    const reason =
        interaction.options.getString('reason') || 'No reason provided.';
    if (!member) {
        return interaction.reply({
            content: 'You must provide a valid user for this vc action.',
            ephemeral: true,
        });
    }

    const channel = interaction.guild.channels.cache.get(channelId);
    if (!channel) {
        return interaction.reply({
            content: 'The configured voice channel could not be found.',
            ephemeral: true,
        });
    }
    if (
        interaction.member.roles.highest.position <=
        member.roles.highest.position
    ) {
        return interaction.reply({
            content:
                'You may not perform this action on members with equal or higher roles than you.',
            ephemeral: true,
        });
    }

    if (unban) {
        await channel.permissionOverwrites.delete(
            member,
            `VC unban by ${interaction.user.tag}`
        );
        await container.redis.hdel('vcban', `${channel.id}:${member.id}`);
        return interaction.reply(
            `${member} has been unbanned from ${channel}.`
        );
    }

    await channel.permissionOverwrites.edit(
        member,
        { Connect: false, SendMessages: false },
        {
            reason: `VC ban by ${interaction.user.tag} (${interaction.user.id})`,
        }
    );
    if (member.voice.channel === channel)
        await member.voice.disconnect('VC ban');
    await container.redis.hset(
        'vcban',
        `${channel.id}:${member.id}`,
        Date.now()
    );
    return interaction.reply(
        `${member} has been banned from ${channel} for 24 hours.`
    );
}

module.exports = { runVcShortcut };
