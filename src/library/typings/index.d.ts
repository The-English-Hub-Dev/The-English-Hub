import {
    ApplicationCommandRegistry,
    ILogger,
    SapphireClient,
    Command,
    CommandOptions,
} from '@sapphire/framework';
import { ILogger } from '@sapphire/plugin-logger';
import { Duration } from '@sapphire/time-utilities';
import { GuildMember, Guild, Message, User } from 'discord.js';
import { Database } from '../db/database';
import { RedisCommander } from 'ioredis';
import { Punishments } from '../punishments';
import { Utility } from '../utility';
import { AutomodManager } from '../managers/automodManager';
import { Tasks } from '../tasks';
import { TriggerManager } from '../managers/triggerManager';

declare module '@sapphire/pieces' {
    interface Container {
        client: SapphireClient;
        utility: Utility;
        redis: RedisCommander;
        db: Database;
        punishments: Punishments;
        stores: StoreRegistry;
        logger: ILogger;
        tasks: Tasks;
        automodManager: AutomodManager;
        triggerManager: TriggerManager;
        applicationCommandRegistries: ApplicationCommandRegistry;
    }
}

declare module '@sapphire/framework' {
    interface ILogger {
        commandLogs: string[];
        errorLogs: string[];
    }
    interface Command {
        usage?: string | string[];
    }
}

export interface CommandOptions {
    usage?: string | string[];
}

export enum PunishmentType {
    WARN,
    UNMUTE,
    MUTE,
    KICK,
    BAN,
    UNBAN,
}
