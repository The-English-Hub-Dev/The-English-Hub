const { Command, Args } = require('@sapphire/framework');
const { createCanvas, loadImage, registerFont } = require('canvas');
const { Message, AttachmentBuilder } = require('discord.js');

class ShipCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'ship',
            description: "What? You're checking your compatibility?",
            usage: '<member>',
            aliases: [],
            preconditions: ['FunCmd'],
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const rawMember = await args.pickResult('member');
        if (rawMember.isErr()) {
            return this.container.utility.errReply(
                message,
                'You must mention a member to ship with.'
            );
        }

        if (rawMember.unwrap().id === message.author.id) {
            return this.container.utility.errReply(
                message,
                'You cannot ship yourself with yourself!'
            );
        }

        const percentage = Math.floor(Math.random() * 100) + 1;

        registerFont('src/fonts/ComicSansMS.ttf', {
            family: 'Comic Sans',
        });
        const canvas = createCanvas(600, 320);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#2C2F33';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const curUser = await loadImage(
            message.author.displayAvatarURL({ size: 256, extension: 'png' })
        );
        const mentionedUser = await loadImage(
            rawMember
                .unwrap()
                .user.displayAvatarURL({ size: 256, extension: 'png' })
        );

        ctx.save();
        ctx.beginPath();
        ctx.arc(128, 150, 100, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(curUser, 28, 50, 200, 200);
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.arc(472, 150, 100, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(mentionedUser, 372, 50, 200, 200);
        ctx.restore();

        ctx.fillStyle = '#FF6B6B';

        // Heart
        ctx.beginPath();
        ctx.moveTo(300, 150);
        ctx.bezierCurveTo(300, 120, 270, 100, 240, 120);
        ctx.bezierCurveTo(220, 140, 220, 170, 300, 220);
        ctx.bezierCurveTo(380, 170, 380, 140, 360, 120);
        ctx.bezierCurveTo(330, 100, 300, 120, 300, 150);
        ctx.fill();

        ctx.font = 'bold 20px "Comic Sans"';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(`${percentage}% compatibility`, 300, 280);

        const img = canvas.toBuffer('image/png');

        const attachment = new AttachmentBuilder(img, { name: 'ship.png' });

        return message.channel.send({
            files: [attachment],
            content: `${message.author} and ${rawMember.unwrap()} - ${percentage}% match!`,
            allowedMentions: {
                users: [message.author.id, rawMember.unwrap().id],
                roles: [],
                parse: [],
            },
        });
    }
}
module.exports = { ShipCommand };
