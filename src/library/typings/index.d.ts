import {
    ApplicationCommandRegistry,
    ILogger,
    SapphireClient,
} from '@sapphire/framework';
import { ILogger } from '@sapphire/plugin-logger';
import { Duration } from '@sapphire/time-utilities';
import { GuildMember, Guild, Message, User } from 'discord.js';
import { Database } from '../db/database';
import { RedisCommander } from 'ioredis';
import { Punishments } from '../punishments';
import { Utility } from '../utility';

declare module '@sapphire/pieces' {
    interface Container {
        client: SapphireClient;
        utility: Utility;
        redis: RedisCommander;
        db: Database;
        punishments: Punishments;
        stores: StoreRegistry;
        logger: ILogger;
        applicationCommandRegistries: ApplicationCommandRegistry;
    }
}

declare module '@sapphire/framework' {
    interface ILogger {
        commandLogs: String[];
        errorLogs: String[];
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
