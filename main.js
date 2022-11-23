import { registerAppEvent } from "../../private/playbackLoader.js";
import { genCombine } from "@proxtx/combine-rest/request.js";
import { genModule } from "@proxtx/combine/combine.js";

export class App {
  updateCheckInterval = 1 * 60 * 1000;

  constructor(config) {
    this.config = config;
    (async () => {
      this.triggerApi = await genCombine(
        this.config.apiUrl,
        "public/actions.js",
        genModule
      );

      while (true) {
        (async () => {
          try {
            await this.checkForNewLogs();
          } catch {}
        })();
        await new Promise((r) => setTimeout(r, this.updateCheckInterval));
      }
    })();
  }

  async checkForNewLogs() {
    let logs = await this.triggerApi.getLog(this.config.pwd);

    logs.reverse();

    for (let log of logs)
      if (log && log.time > Date.now() - this.updateCheckInterval) {
        registerAppEvent({
          app: "Trigger",
          type: "Triggered",
          text: `${log.actionName} triggered.`,
          media: [],
          time: log.time,
          points: this.config.points,
        });
      }
  }
}
