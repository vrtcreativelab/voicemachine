const VoiceMachine = require("./VoiceMachine");

const { find } = require("lodash");
const { writeFile } = require("fs").promises;

class FakeConv {
  ask() {}

  add() {}
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

class Visualizer {
  constructor(flow) {
    this.machine = new VoiceMachine(flow);
    this.states = this.machine.states;
    this.currentState = this.states[0].id;
    this.conv = new FakeConv();
  }

  async createDotFile(path = "./graph.dot") {
    let lines = ["digraph G {"];
    let labels = {};

    this.states.forEach(state => {
      if (
        state.options &&
        state.options.visualizer &&
        state.options.visualizer.label
      ) {
        labels[state.id] = state.options.visualizer.label;
      } else {
        labels[state.id] = state.id;
      }
    });

    await asyncForEach(this.states, async state => {
      if (
        state.options &&
        state.options.visualizer &&
        state.options.visualizer.input
      ) {
        await asyncForEach(state.options.visualizer.input, async input => {
          try {
            const { next } = await state.action({
              conv: this.conv,
              machine: this.machine,
              input
            });
            lines.push(
              `  "${labels[state.id]}" -> "${
                labels[next]
              }"  [ label=" ${input}"]`
            );
          } catch (e) {
            console.warn(`No next for ${state.id}`);
          }
        });
      } else {
        try {
          const { next } = await state.action({
            conv: this.conv,
            machine: this.machine,
            input: null
          });
          lines.push(`  "${labels[state.id]}" -> "${labels[next]}"`);
        } catch (e) {
          console.warn(`No next for ${state.id}`);
        }
      }
    });
    lines.push("}");

    await writeFile(path, lines.join("\n"));
    return;
  }
}
module.exports = { Visualizer };
