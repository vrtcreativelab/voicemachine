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
        lines.push(`"${state.id}" [label=" ${labels[state.id]}"]`);
      }
    });

    await asyncForEach(this.states, async state => {
      const { options, action, id } = state;

      if (options && options.visualizer && options.visualizer.memory) {
        for (let p in state.options.visualizer.memory) {
          asyncForEach(state.options.visualizer.memory[p], async memVal => {
            this.machine.memory[p] = memVal;
            if (options.visualizer.input) {
              // Memory && input
              await asyncForEach(options.visualizer.input, async input => {
                try {
                  const { next } = await action({
                    conv: this.conv,
                    machine: this.machine,
                    input
                  });
                  lines.push(
                    `  "${id}" -> "${next}"  [ label=" ${input} ${memVal}"]`
                  );
                } catch (e) {
                  console.warn(`No next for ${id}`);
                }
              });
            } else {
              // only memory
              try {
                const { next } = await action({
                  conv: this.conv,
                  machine: this.machine,
                  input: null
                });
                lines.push(`  "${id}" -> "${next}"  [ label=" ${memVal}"]`);
              } catch (e) {
                console.warn(`No next for ${id}`);
              }
            }
          });
        }
      } else if (options && options.visualizer && options.visualizer.input) {
        // only input
        await asyncForEach(options.visualizer.input, async input => {
          try {
            const { next } = await action({
              conv: this.conv,
              machine: this.machine,
              input
            });
            lines.push(`  "${id}" -> "${next}"  [ label=" ${input}"]`);
          } catch (e) {
            console.warn(`No next for ${id}`);
          }
        });
      } else {
        // nothing
        try {
          const { next } = await action({
            conv: this.conv,
            machine: this.machine,
            input: null
          });
          lines.push(`  "${id}" -> "${next}"`);
        } catch (e) {
          console.warn(`No next for ${id}`);
        }
      }
    });
    lines.push("}");

    await writeFile(path, lines.join("\n"));
    return;
  }
}
module.exports = { Visualizer };
