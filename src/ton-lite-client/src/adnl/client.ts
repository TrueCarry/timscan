import EventEmitter from 'events'
import WebSocket from 'isomorphic-ws';
import { ADNLAESParams } from './params'
import { ADNLPacket } from './packet'
import { ADNLAddress } from './address'
import { ADNLKeys } from './keys'
import aesjs from 'aes-js'



enum ADNLClientState {
    CONNECTING,
    OPEN,
    CLOSING,
    CLOSED
}

interface ADNLClientOptions {
    type: 'tcp4' | 'udp4'
}

interface ADNLClient {
    emit(event: 'connect'): boolean
    emit(event: 'ready'): boolean
    emit(event: 'close'): boolean
    emit(event: 'data', data: Buffer): boolean
    emit(event: 'error', error: Error): boolean

    on(event: 'connect', listener: () => void): this
    on(event: 'ready', listener: () => void): this
    on(event: 'close', listener: () => void): this
    on(event: 'data', listener: (data: Buffer) => void): this
    on(event: 'error', listener: (error: Error, close: boolean) => void): this

    once(event: 'connect', listener: () => void): this
    once(event: 'ready', listener: () => void): this
    once(event: 'close', listener: () => void): this
    once(event: 'data', listener: (data: Buffer) => void): this
    once(event: 'error', listener: (error: Error, close: boolean) => void): this
}

class ADNLClient extends EventEmitter {
    private socket: WebSocket

    private address: ADNLAddress

    private params: ADNLAESParams

    private keys: ADNLKeys

    private cipher: aesjs.ModeOfOperation.ModeOfOperationCTR

    private decipher: aesjs.ModeOfOperation.ModeOfOperationCTR

    private _state = ADNLClientState.CONNECTING

    private inBuff: Buffer = Buffer.alloc(0)

    constructor (host: string, port: number, peerPublicKey: Uint8Array | string, options?: ADNLClientOptions) {
        super()

        const { type = 'tcp4' } = options || {}

        this.address = new ADNLAddress(peerPublicKey)
        this.keys = new ADNLKeys(this.address.publicKey)
        this.params = new ADNLAESParams()
        this.cipher = new aesjs.ModeOfOperation.ctr(this.params.txKey, new aesjs.Counter(this.params.txNonce))
        this.decipher = new aesjs.ModeOfOperation.ctr(this.params.rxKey, new aesjs.Counter(this.params.rxNonce))

        // this.cipher = crypto.createCipheriv('aes-256-ctr', this.params.txKey, this.params.txNonce)
        // this.decipher = crypto.createDecipheriv('aes-256-ctr', this.params.rxKey, this.params.rxNonce)

        if (type === 'tcp4') {
            this.socket = new WebSocket(`ws://localhost:5999/${host}:${port}`)// ({ host, port })) // createConnection
            this.socket.onopen = this.onConnect.bind(this)
            // .on('ready', this.handshake.bind(this))
            this.socket.onclose = this.onClose.bind(this)
            this.socket.onmessage = this.onData.bind(this)
            this.socket.onerror = this.onError.bind(this)
        } 
        // else if (type === 'udp4') {
        //     this.socket = createSocket(type)
        //         .on('connect', this.onConnect.bind(this))
        //         .on('close', this.onClose.bind(this))
        //         .on('message', this.onData.bind(this))
        //         .on('error', this.onError.bind(this))

        //     this.socket.connect(port, host, this.handshake.bind(this))
        // } 
        else {
            throw new Error('ADNLClient: Type must be "tcp4" or "udp4"')
        }
    }

    public get state (): ADNLClientState {
        return this._state
    }

    public write (data: Buffer): void {
        const packet = new ADNLPacket(data)
        const encrypted = this.encrypt(packet.data)

        // console.log('write', data)
        this.socket.send(encrypted)

        // this.socket instanceof WebSocket
        //     ? this.socket.write(encrypted)
        //     : null // this.socket.send(encrypted)
    }

    public end (): void {
        this.socket.close()
        // this.socket instanceof WebSocket
        //     ? this.socket.end()
        //     : null // this.socket.disconnect()
    }

    private onConnect () {
        console.log('on connect')
        this.emit('connect')
        this.handshake()
    }

    private onReady (): void {
        this._state = ADNLClientState.OPEN
        this.emit('ready')
    }

    private onClose (): void {
        this._state = ADNLClientState.CLOSED
        this.emit('close')
    }

    private tryProcess(chunk: Buffer) {
        const decrypted = this.decrypt(chunk)
        this.inBuff = Buffer.concat([this.inBuff, decrypted])
        let canParse = ADNLPacket.containsFullPacket(this.inBuff)

        if (!canParse) {
            console.log('cant parse yet')
            return
        }
        const {packet, extra} = ADNLPacket.parse(this.inBuff)

        this.inBuff = extra


    }
    private async  onData (data: WebSocket.MessageEvent): Promise<void> {
        // console.log('got data', data.data)
        // data
        let buffer: Buffer
        if (typeof data.data === 'string') {
            buffer = Buffer.from(data.data)
        } else if (data.data instanceof Buffer) {
            // console.log('is buffer!!!!')
            buffer = data.data
        } else if (data.data instanceof ArrayBuffer) {
            // console.log('array buffer !!!!!!!!!!!!!!')
            buffer = Buffer.from([0])
            // data.data.arrayBuffer()
        } else {
            const buf = await (data.data as unknown as Blob).arrayBuffer()
            buffer = Buffer.from(buf)
            // console.log('else !!!!!!!!!!!!!!', buffer)
        }
        // const buffer = await data.data.arrayBuffer()
        // console.log('buffer', typeof data.data, buffer)
        const decrypted = this.decrypt(buffer)



        // console.log('hex', decrypted.toString('hex'))
        this.inBuff = Buffer.concat([this.inBuff, decrypted])


        while (this.inBuff.byteLength > 0) {
            let canParse = ADNLPacket.containsFullPacket(this.inBuff)

            if (!canParse) {
                // console.log('cant parse yet')
                return
            }
            const {packet, extra} = ADNLPacket.parse(this.inBuff)
            this.inBuff = extra

            switch (this.state) {
                case ADNLClientState.CONNECTING:
                    // if (packet.payload.length === 0) {
                    //     this.onReady()
                    // } else {
                    //     this.onError(new Error('ADNLClient: Bad handshake.'), true)
                    // }
                    console.log('state connected')
                    return packet.payload.length === 0
                        ? this.onReady()
                        : this.onError({
                            error: new Error('ADNLClient: Bad handshake.'),
                            message: 'ADNLClient: Bad handshake.',
                            type: 'error',
                            target: this.socket
                        })
                default:
                    this.emit('data', packet.payload)

                    // return undefined
            }
        }



    }

    private onError (event: WebSocket.ErrorEvent) {    //(error: Error, close = false): void {
        // if (event.type) {
        //     this.socket.close()
        //     // this.socket instanceof WebSocket
        //     //     ? this.socket.end()
        //     //     : null // this.socket.disconnect()
        // }

        this.emit('error', event.error)
        // error)
    }

    private handshake (): void {
        const key = Buffer.concat([ this.keys.shared.slice(0, 16), this.params.hash.slice(16, 32) ])
        const nonce = Buffer.concat([ this.params.hash.slice(0, 4), this.keys.shared.slice(20, 32) ])
        // const cipher = crypto.createCipheriv('aes-256-ctr', key, nonce)
        const cipher = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(nonce))
        // const payload = Buffer.concat([ cipher.update(this.params.bytes), cipher.final() ])
        const payload = cipher.encrypt(this.params.bytes)
        const packet = Buffer.concat([ this.address.hash, this.keys.public, this.params.hash, payload ])

        // console.log('handshake', packet)
        this.socket.send(packet)
        // this.socket instanceof WebSocket
        //     ? this.socket.write(packet)
        //     : null // this.socket.send(packet)
    }

    private encrypt (data: Buffer): Buffer {
        // return Buffer.concat([ this.cipher.update(data) ])
        return Buffer.from(this.cipher.encrypt(data))
    }

    private decrypt (data: Buffer): Buffer {
        // console.log('decrypt', data)
        // return Buffer.concat([ this.decipher.update(data) ])
        return Buffer.from(this.decipher.decrypt(data))
    }
}

export { ADNLClient }
