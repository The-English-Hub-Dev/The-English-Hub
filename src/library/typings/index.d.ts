import {
    ApplicationCommandRegistry,
    ILogger,
    SapphireClient,
} from '@sapphire/framework';
import { Duration } from '@sapphire/time-utilities';
import { GuildMember, Guild, Message, User } from 'discord.js';
import { Database } from '../db/database';
import { Utility } from '../utility';

declare module '@sapphire/pieces' {
    interface Container {
        client: SapphireClient;
        utility: Utility;
        db: Database;
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
    type: PunishmentType;
    moderator_id: string;
    target_user_id: string;
    duration?: Duration;
}
