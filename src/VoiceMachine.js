const { find } = require("lodash");
const { BasicCard, Image, Suggestions } = require("actions-on-google");

class VoiceMachine {
  constructor(registerStates, options) {
    this.previousStates = [];
    this.memory = {};
    this.cache = {};

    this.debugEnabled = options && options.debug;

    // flow
    this.states = [];
    registerStates(this);
    this.currentState = this.states[0].id;
  }

  debug(obj) {
    if (this.debugEnabled) {
      console.log(obj);
    }
  }

  register(id, action) {
    this.debug(`Registering ${id}`);
    this.states.push({ id, action });
  }

  findState(id) {
    return find(this.states, { id });
  }

  print() {
    this.debug("Enumerating");
    this.debug(
      this.states.map((state, k) => `[${k}] - ${state.id}`).join("\n")
    );
  }

  previous() {
    this.debug("Getting previous state");

    if (this.hasPrevious()) {
      const previous = this.previousStates.pop();
      this.debug(`- Previous: ${previous}`);
      this.currentState = previous;
    } else {
      console.error(`No previous state before ${this.currentState}`);
    }
    return this;
  }

  get() {
    this.debug(`Current state = ${this.currentState}`);
    return this.findState(this.currentState);
  }

  set(id) {
    this.debug(`Setting state to ${id}`);
    this.previousStates.push(this.currentState);
    this.currentState = id;
    return this;
  }

  setByIndex(idx) {
    this.debug(`Setting state index ${idx}`);

    this.previousStates.push(this.currentState);
    this.currentState = this.states[idx].id;
    this.debug(`- Setting state to ${this.currentState}`);

    return this;
  }

  save() {
    return {
      currentState: this.currentState,
      previousStates: this.previousStates,
      memory: this.memory
    };
  }

  hasNext() {
    return this.findState(this.currentState).next;
  }

  hasPrevious() {
    return this.previousStates.length ? true : false;
  }

  restore({ currentState, previousStates, memory }) {
    this.debug(
      `Restoring ${JSON.stringify(
        { currentState, previousStates, memory },
        null,
        2
      )}`
    );
    this.currentState = currentState;
    this.previousStates = previousStates;
    this.memory = memory;
  }

  async run(conv, options) {
    this.debug(
      "-------------------------- RUN STATE ------------------------------"
    );

    if (conv.data.state && !options.skipRestore) {
      this.restore(conv.data.state);
    }
    const input = conv.input ? conv.input.raw : null;
    const step = this.get();

    const proxiedConv = new Proxy(conv, {
      get: (target, prop) => {
        if (prop === "ask" || prop === "add") {
          target.didOutput = true;
        }
        return target[prop];
      }
    });

    const { next, output, skipListen } = await step.action({
      machine: this,
      input: input.toLowerCase(),
      rawInput: input,
      conv: proxiedConv
    });

    // legacy output method
    if (output) {
      const { title, text, audio, image, suggestions } = output;

      if (audio) {
        if (typeof audio === "string") {
          conv.add(`<speak><audio src="${audio}">${text}</audio></speak>`);
        } else if (typeof audio === "object" && audio.isArray()) {
          conv.add(
            `<speak>${output.audio
              .map(a => `<audio src="${a.src}">${a.text}</audio>`)
              .join(
                `<break time="${output.break ? output.break : "0.5"}" />`
              )}</speak>`
          );
        }
      } else {
        conv.add(`<speak>${text}</speak>`);
      }

      conv.ask(
        new BasicCard({
          title: title,
          text: text,
          image: output.image
            ? new Image({
                url: image,
                alt: text
              })
            : null,
          display: "CROPPED"
        })
      );

      if (suggestions) {
        conv.ask(new Suggestions(output.suggestions));
      }
    }

    if ((!output && !conv.didOutput && next) || (skipListen && next)) {
      this.set(next);
      await this.run(conv, { skipRestore: true });
    } else if (next) {
      this.set(next);
      // eslint-disable-next-line require-atomic-updates
      conv.data.state = this.save();
    }

    if (!next) {
      conv.close();
    }

    this.debug(
      "-------------------------- END RUN STATE ------------------------------"
    );
  }
}

module.exports = VoiceMachine;
