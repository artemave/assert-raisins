import Colors from './colors.js'

export class StdoutReporter {
  #colors
  #stdout
  #messages = []

  constructor(stdout = process.stdout) {
    this.#colors = new Colors({ stdout })
    this.#stdout = stdout
  }

  report(msg) {
    this.#messages.push(msg)

    if (msg.error) {
      this.#colors.red(`\n\n✗ ${msg.fileName} => ${msg.testName} \n\n`)
      this.#prettyError(msg.error)
    } else {
      this.#colors.green('•')
    }
  }

  printSummary() {
    this.#stdout.write('\n\n')

    const groupedByFileName = Object.groupBy(this.#messages, msg => msg.fileName)

    for (const fileName in groupedByFileName) {
      const fileMessages = groupedByFileName[fileName]
      if (fileMessages.some(m => m.error)) {
        const successNumber = fileMessages.filter(m => !m.error).length
        const failureNumber = fileMessages.length - successNumber

        this.#colors.redln(`✗ ${fileName} => ${successNumber}/${failureNumber}`)
      } else {
        this.#colors.greenln(`✓ ${fileName} => ${fileMessages.length}/0`)
      }
    }
  }

  // TODO: this doen't belong to reporter
  get passed() {
    return !this.#messages.some(m => m.error)
  }

  #prettyError(e) {
    const msg = e.stack

    if (!msg) {
      this.#colors.yellow(e)
    } else {
      const i = msg.indexOf('\n')
      this.#colors.yellowln(msg.slice(0, i))
      this.#colors.gray(msg.slice(i))
      console.info('\n')
    }
  }
}
