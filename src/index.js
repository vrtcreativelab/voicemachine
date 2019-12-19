/* eslint-disable require-atomic-updates */

const { actionsSDK } = require("./register");
const { VoiceMachine } = require("./VoiceMachine");

module.exports = { VoiceMachine, VoiceMachineForActionsSDK: actionsSDK };
