import { IChatCommand, IChatCommandResult } from "../chat-command.interface";
import { getTwitchClient, globals } from "../twitch-client";

export class InventoryCommand implements IChatCommand {
    trigger = "!inventory";

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
            return this.error(s, "You cannot view your inventory because you are not registered as player!");
        }

        if (normalizedRecipients.length === 0) {
            const user: string = s;
            return this.handleDisplayInventory(user);
        }

        return this.error(s, "Too many parameters for this command, expected 0 additional parameters.");
    }

    handleDisplayInventory(user: string): IChatCommandResult {
        let data: string = "";
        const keys: Array<string> = Object.keys(globals.storage.players[user].inventory.slots);
        keys.forEach((k: string) => {
            const a: number = globals.storage.players[user].inventory.slots[k].amount;
            if (a > 0) {
                const str: string = `${k}: ${a}; `;
                data = data.concat(str);
            }
        });

        if (data === "") {
            data = "nothing";
        }

        getTwitchClient().say(globals.channels[0], `Hey @${user}, You have ${data} in your inventory.`);

        return {
            isSuccessful: true,
        };
    }
}