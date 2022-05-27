import { ApplicationCommandRegistry, ILogger, SapphireClient } from "@sapphire/framework";
import { Utility } from "../utility";

declare module '@sapphire/pieces' {
	interface Container {
		client: SapphireClient;
		utility: Utility;
		stores: StoreRegistry;
		logger: ILogger;
		applicationCommandRegistries: ApplicationCommandRegistry;
	}
}