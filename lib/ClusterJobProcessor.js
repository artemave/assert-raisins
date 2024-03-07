import EventEmitter from 'node:events'
import cluster from 'node:cluster'
import os from 'node:os'

function log(text, ...opts) {
  if (process.env.DEBUG) {
    console.info(text, ...opts)
  }
}

class WorkerPool extends EventEmitter {
  #pool = []

  constructor(workers) {
    super()

    log('Creating worker pool')

    for (const worker of workers) {
      worker.on('message', msg => {
        if (msg === 'ready') {
          log(`Worker initialized: ${worker.id}`)
          this.#pool.push(worker)
          this.emit('worker_ready')
        }
      })
    }
  }

  async getWorker() {
    const worker = this.#pool.shift()

    if (worker) {
      log(`Worker pulled: ${worker.id}`)
      return worker
    }

    return new Promise((resolve) => {
      this.once('worker_ready', async () => {
        const worker = await this.getWorker()
        resolve(worker)
      })
    })
  }

  releaseWorker(worker) {
    log(`Worker released: ${worker.id}`)
    this.#pool.push(worker)
    this.emit('worker_ready')
  }
}

export default class ClusterJobProcessor {
  static workers
  static pool
  static results

  static async addJobs(jobs) {
    // TODO: don't allow calling addJobs more than once at a time
    this.results = []

    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const numberOfworkers = Math.min(jobs.length, os.availableParallelism())

      this.workers ||= [...Array(numberOfworkers)].map((_, i) => {
        const worker = cluster.fork({ TEST_WORKER_ID: i })

        worker.on('message', (msg) => {
          log(`Master received: %O`, msg)

          if (msg.result) {
            this.pool.releaseWorker(worker)

            this.results.push(msg.result)

            if (this.results.length === jobs.length) {
              resolve(this.results)
            }
          }
        })
        return worker
      })

      this.pool ||= new WorkerPool(this.workers)

      for (const job of jobs) {
        const worker = await this.pool.getWorker()
        worker.send({ payload: job })
      }
    })
  }

  static processJobs(jobFn) {
    process.send('ready')

    process.on('message', async ({ payload }) => {
      log(`Worker ${cluster.worker.id} processing payload: %O`, payload)

      try {
        const result = await jobFn(payload)
        log(`Worker ${cluster.worker.id} sends the result: %O`, { result })
        process.send({ result })
      } catch (e) {
        console.error(e)
        process.send({ result: false })
      }
    })
  }
}

