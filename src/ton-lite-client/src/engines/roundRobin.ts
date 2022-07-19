import type { TLFunction } from 'ton-tl'
import { LiteEngine } from './engine'

export class LiteRoundRobinEngine implements LiteEngine {
  readonly engines: LiteEngine[]

  #closed = false

  constructor(engines: LiteEngine[]) {
    this.engines = engines
  }

  connect(): void {
    throw new Error('Method not implemented.')
  }

  query<REQ, RES>(
    f: TLFunction<REQ, RES>,
    req: REQ,
    args: { timeout: number; awaitSeqno?: number }
  ): Promise<RES> {
    if (this.#closed) {
      throw new Error('Engine is closed')
    }

    let attempts = 0
    // while (true) {
    const id = Math.floor(Math.random() * this.engines.length)
    if (this.engines[id].isClosed()) {
      this.engines[id].connect()
      attempts++
      throw new Error('Client not connected')

      // if (attempts > 200) {
      //   // this.#closed = true
      //   throw new Error('No engines are available')
      // }
      // continue
    }

    return this.engines[id].query(f, req, args)
    // }
  }

  close() {
    for (const q of this.engines) {
      q.close()
    }
    this.#closed = true
  }

  isClosed() {
    return this.#closed
  }
}
