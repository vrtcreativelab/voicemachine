const VoiceMachine = require("./VoiceMachine");

const actionsSDK = (app, flow, options) => {
  const debug = options && options.debug ? options.debug : false;

  app.intent("actions.intent.MAIN", async conv => {
    debug
      ? console.log(
          `-------------------------- MAIN REQUEST ------------------------------`
        )
      : null;

    const machine = new VoiceMachine(flow, options);
    conv.data.state = {};
    await machine.run(conv, { skipRestore: true });
    debug
      ? console.log(
          `-------------------------- END MAIN REQUEST --------------------------`
        )
      : null;
  });

  app.intent("actions.intent.TEXT", async conv => {
    debug
      ? console.log(
          `-------------------------- TEXT REQUEST ------------------------------`
        )
      : null;
    const machine = new VoiceMachine(flow, options);
    await machine.run(conv, {});
    debug
      ? console.log(
          `-------------------------- END TEXT REQUEST  --------------------------`
        )
      : null;
  });
};

module.exports = { actionsSDK };
