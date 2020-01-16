/* eslint-disable require-atomic-updates */

const { actionsSDK } = require("./register");
const { VoiceMachine } = require("./VoiceMachine");
const { Visualizer } = require("./Visualizer");

module.exports = {
  VoiceMachine,
  VoiceMachineForActionsSDK: actionsSDK,
  Visualizer
};
