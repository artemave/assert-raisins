import EventEmitter from 'node:events'
import { Worker, parentPort, isMainThread, workerData } from 'node:worker_threads'
import os from 'node:os'

const __filename = new URL(import.meta.url).pathname

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
      log(`Worker initialized: ${worker.test_worker_id}`)
      this.#pool.push(worker)
      this.emit('worker_ready')
    }
  }

  async getWorker() {
    const worker = this.#pool.shift()

    if (worker) {
      log(`Worker pulled: ${worker.test_worker_id}`)
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
    log(`Worker released: ${worker.test_worker_id}`)
    this.#pool.push(worker)
    this.emit('worker_ready')
  }
}

export default class ConcurrentJobProcessor {
  static workers
  static pool
  static results

  static async processJobs(jobs, jobFn, onWorkerMessage = msg => { console.log(msg) }) {
    this.numberOfJobsProcessed = 0

    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const numberOfworkers = Math.min(jobs.length, os.availableParallelism() - 1)

      this.workers ||= [...Array(numberOfworkers)].map((_, i) => {
        const worker = new Worker(__filename, {
          env: {
            ...process.env, TEST_WORKER_ID: i
          },
          workerData: jobFn,
        })

        worker.on('message', (msg) => {
          log(`Master received: %O`, msg)

          if (msg.done) {
            this.pool.releaseWorker(worker)

            this.numberOfJobsProcessed += 1

            if (this.numberOfJobsProcessed === jobs.length) {
              resolve()
            }
          } else {
            onWorkerMessage(msg)
          }
        })
        worker.test_worker_id = i
        return worker
      })

      this.pool ||= new WorkerPool(this.workers)

      for (const job of jobs) {
        const worker = await this.pool.getWorker()
        worker.postMessage({ payload: job })
      }
    })
  }
}

if (!isMainThread) {
  const jobFn = eval(workerData)

  parentPort.on('message', async ({ payload }) => {
    log(`Worker ${process.env.TEST_WORKER_ID} processing payload: ${JSON.stringify(payload, null, 2)}`)

    try {
      await jobFn({ payload })
      log(`Worker ${process.env.TEST_WORKER_ID} completed payload: ${JSON.stringify(payload, null, 2)}`)
      parentPort.postMessage({ done: true })
    } catch (e) {
      console.error(e)
      parentPort.postMessage({ done: true })
    }
  })
}
