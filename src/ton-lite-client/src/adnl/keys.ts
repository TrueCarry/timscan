// import { xed25519_ecdh } from '@tonstack/xed25519'
// import crypto from 'crypto'
// import { sharedKey } from 'curve25519-js';
import * as ed25519 from '@noble/ed25519';
import nacl from 'tweetnacl';

class ADNLKeys {
    // private _private: Uint8Array

    private _public: Uint8Array

    private _shared: Uint8Array

    constructor (peerPublicKey: Uint8Array) {
       const x = async() => {
        const clientPrivateKey = new Uint8Array(nacl.randomBytes(32))
        const publicKey = await ed25519.getPublicKey(clientPrivateKey)
        const shared = await ed25519.getSharedSecret(clientPrivateKey, peerPublicKey)

            this._public = publicKey
            this._shared = shared
        }
        x()
    
    }

    // public get private (): Uint8Array {
    //     return new Uint8Array(this._private)
    // }

    public get public (): Uint8Array {
        return new Uint8Array(this._public)
    }

    public get shared (): Uint8Array {
        return new Uint8Array(this._shared)
    }
}

export { ADNLKeys }

// function ed25519PrivateKeyTox25519PrivateKey(edKey: Uint8Array): Uint8Array {
//     const hash = new Uint8Array(crypto.createHash('sha512').update(edKey).digest())



//     return clampScalar(hash).slice(0, 32)
// }

// function clampScalar(key: Uint8Array): Uint8Array  {
//     key[0] &= 248
//     key[31] &= 127
//     key[31] |= 64

//     return key
// }