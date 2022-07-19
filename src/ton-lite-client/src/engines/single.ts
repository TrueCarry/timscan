// import crypto from "crypto";
// import crypto from 'isomorphic-webcrypto'
// import { TLFunction, TLReadBuffer, TLWriteBuffer } from 'ton-tl'
import type { TLFunction } from 'ton-tl'
import { TLReadBuffer } from 'ton-tl/dist/buffer/TLReadBuffer'
import { TLWriteBuffer } from 'ton-tl/dist/buffer/TLWriteBuffer'
import { ADNLClient } from 'adnl'
import { Codecs, Functions } from '../schema'
import { LiteEngine } from './engine'
import nacl from 'tweetnacl'

type QueryReference = {
  f: TLFunction<any, any>
  packet: Buffer
  resolver: (res: any) => void
  reject: (res: any) => void
  timeout: number
}

export class LiteSingleEngine implements LiteEngine {
  readonly host: string
  // readonly port: number
  readonly publicKey: Buffer
  #currentClient: ADNLClient | null = null
  #ready = false
  #closed = false
  #queries: Map<string, QueryReference> = new Map()

  constructor(args: { host: string; publicKey: Buffer }) {
    this.host = args.host
    // this.port = args.port
    this.publicKey = args.publicKey
    this.connect()
  }

  isClosed() {
    return this.#closed
  }

  async query<REQ, RES>(
    f: TLFunction<REQ, RES>,
    req: REQ,
    args: { timeout: number; awaitSeqno?: number }
  ): Promise<RES> {
    if (this.#closed) {
      throw new Error('Engine is closed')
    }

    const id = Buffer.from(nacl.randomBytes(32))
    // let id = await crypto.ensureSecure()
    // hash.
    // crypto.sub
    // randomBytes(32);

    // Request
    const writer = new TLWriteBuffer()
    f.encodeRequest(req, writer)
    const body = writer.build()

    // Lite server query
    const lsQuery = new TLWriteBuffer()
    if (args.awaitSeqno !== undefined) {
      Functions.liteServer_waitMasterchainSeqno.encodeRequest(
        { kind: 'liteServer.waitMasterchainSeqno', seqno: args.awaitSeqno, timeoutMs: 1000 },
        lsQuery
      )
    }
    Functions.liteServer_query.encodeRequest({ kind: 'liteServer.query', data: body }, lsQuery)
    const lsbody = lsQuery.build()

    // ADNL body
    const adnlWriter = new TLWriteBuffer()
    Codecs.adnl_Message.encode(
      { kind: 'adnl.message.query', queryId: id, query: lsbody },
      adnlWriter
    )
    const packet = adnlWriter.build()

    return new Promise<RES>((resolve, reject) => {
      // Send
      if (this.#ready) {
        this.#currentClient!.write(packet)
      }

      // Register query
      this.#queries.set(id.toString('hex'), {
        resolver: resolve,
        reject,
        f,
        packet,
        timeout: args.timeout,
      })

      // Query timeout
      setTimeout(() => {
        const ex = this.#queries.get(id.toString('hex'))
        if (ex) {
          this.#queries.delete(id.toString('hex'))
          ex.reject(new Error('Timeout'))
        }
      }, args.timeout)
    })
  }

  close() {
    this.#closed = true
    if (this.#currentClient) {
      const c = this.#currentClient!
      this.#ready = false
      this.#currentClient = null
      c.end()
    }
  }

  public connect() {
    // Configure new client
    const client = new ADNLClient(
      this.host,
      // this.port,
      this.publicKey
      // {
      //     type: 'udp4'
      // }
    )
    client.connect()
    client.on('connect', () => {
      if (this.#currentClient === client) {
        this.#closed = false
        this.onConencted()
      }
    })
    client.on('close', () => {
      if (this.#currentClient === client) {
        this.onClosed()
      }
    })
    client.on('data', (data) => {
      if (this.#currentClient === client) {
        this.onData(data)
      }
    })
    client.on('ready', async () => {
      if (this.#currentClient === client) {
        this.onReady()
      }
    })
    client.on('error', () => {
      this.close()

      setTimeout(() => {
        this.#closed = false
        this.connect()
      }, 30000)
    })

    // Persist client
    this.#currentClient = client
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onConencted = () => {}

  private onReady = () => {
    this.#ready = true

    // Write all pendings
    for (const q of this.#queries) {
      this.#currentClient!.write(q[1].packet)
    }
  }

  private onData = (data: Buffer) => {
    const answer = Codecs.adnl_Message.decode(new TLReadBuffer(data))
    if (answer.kind === 'adnl.message.answer') {
      const id = answer.queryId.toString('hex')
      const q = this.#queries.get(id)
      if (q) {
        this.#queries.delete(id)

        // Decode response
        if (answer.answer.readInt32LE(0) === -1146494648) {
          q.reject(
            new Error(Codecs.liteServer_Error.decode(new TLReadBuffer(answer.answer)).message)
          )
        } else {
          try {
            const decoded = q.f.decodeResponse(new TLReadBuffer(answer.answer))

            // Resolve
            q.resolver(decoded)
          } catch (e) {
            // Reject
            q.reject(e)
          }
        }
      }
    }
  }

  private onClosed = () => {
    this.#currentClient = null
    this.#ready = false
    this.#closed = true
    // setTimeout(() => {
    //   if (!this.#closed) {
    //     this.connect()
    //   }
    // }, 1000)
  }
}
