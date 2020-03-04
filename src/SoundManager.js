class SoundManager {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.buffer = [];
  }

  addSound(src, txt) {
    this.buffer.push(
      `<audio src="${this.baseUrl}/${encodeURIComponent(src)}">
        ${txt}
      </audio>`
    );
  }

  addPause(ms = 500) {
    this.buffer.push(`<break time="${ms}ms" />`);
  }
  addEarcon() {
    this.buffer.push(
      `<audio src="${this.baseUrl}/earcon.ogg">
        &lt;earcon&gt;
      </audio>`
    );
  }

  flush(conv, end = false) {
    if (end) {
      conv.close(`<speak>${this.buffer.join("\n")}</speak>`);
    } else {
      conv.ask(`<speak>${this.buffer.join("\n")}</speak>`);
    }
    this.buffer = [];
  }
}

module.exports.SoundManager = SoundManager;
