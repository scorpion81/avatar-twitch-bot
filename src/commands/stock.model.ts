import { IStockItem } from "src/inventory.interface";
import { IChatCommand, IChatCommandResult } from "../chat-command.interface";
import { getTwitchClient, globals } from "../twitch-client";

export class StockCommand implements IChatCommand {
    trigger = "!stock";

    error(s: string, msg: string) {
        getTwitchClient().say(globals.channels[0], `Hey @${s}, ${msg}`);

        return {
            isSuccessful: false,
            error: msg,
        };
    }

    execute(recipient: string | string[] | null, sender?: string): IChatCommandResult {
        if (sender === undefined) return { isSuccessful: false, error: "no sender" };

        let normalizedRecipients: string[] = [];
        if (recipient) {
            if (Array.isArray(recipient)) {
                normalizedRecipients = recipient.map((x) => x.replace("@", ""));
            } else {
                normalizedRecipients = [recipient.replace("@", "")];
            }
        }

        const s: string = sender;

        if (!(s in globals.storage.players)) {
            return this.error(s, "You cannot view the stock inventory because you are not registered as player!");
        }

        if (normalizedRecipients.length === 0) {
            const user: string = s;
            return this.handleDisplayStock(user);
        }

        return this.error(s, "Too many parameters for this command, expected 0 additional parameters.");
    }

    handleDisplayStock(user: string) {
        let data: string = "";
        const items: Array<IStockItem> = globals.storage.stock;
        items.forEach((it: IStockItem) => {
            const str: string = `${it.item.name}: ${it.amount}; `;
            data = data.concat(str);
        });
        getTwitchClient().say(globals.channels[0], `Hey @${user}, Today we have ${data} in stock.`);

        return {
            isSuccessful: true,
        };
    }
}
