/* eslint-disable require-atomic-updates */

const { actionsSDK } = require("./register");
const { VoiceMachine } = require("./VoiceMachine");
const { Visualizer } = require("./Visualizer");
const { SoundManager } = require("./SoundManager");

module.exports = {
  VoiceMachine,
  VoiceMachineForActionsSDK: actionsSDK,
  Visualizer,
  SoundManager
};
