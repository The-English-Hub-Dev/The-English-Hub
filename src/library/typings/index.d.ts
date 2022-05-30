import {
    ApplicationCommandRegistry,
    ILogger,
    SapphireClient,
} from '@sapphire/framework';
import { Duration } from '@sapphire/time-utilities';
import { GuildMember, Guild, Message, User } from 'discord.js';
import { Database } from '../db/database';
import { Punishments } from '../punishments';
import { Utility } from '../utility';

declare module '@sapphire/pieces' {
    interface Container {
        client: SapphireClient;
        utility: Utility;
        db: Database;
        punishments: Punishments;
        stores: StoreRegistry;
        logger: ILogger;
        applicationCommandRegistries: ApplicationCommandRegistry;
    }
}

export enum PunishmentType {
    WARN = 'WARN',
    UNMUTE = 'UNMUTE',
    MUTE = 'MUTE',
    KICK = 'KICK',
    BAN = 'BAN',
    UNBAN = 'UNBAN',
}

export interface PunishmentOptions {
    moderator_id: string;
    target_user_id: string;
    guild_id: string;
    duration?: string;
}
