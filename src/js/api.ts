import axios from 'axios';
import { LITE_API_ENDPOINT } from './config.js';
import { base64ToHex, hexToAddress, dechex } from '~/utils.js';
import { LiteClient } from '../ton-lite-client/src';
import { Address, RawAccountStorage, RawCurrencyCollection, RawStorageInfo } from '@/ton/src';
import { tonNode_blockIdExt } from '../ton-lite-client/src/schema';

/**
 * @param  {String} address
 * @return {Promise<Object>}
 */
export const detectAddress = async function (address) {
    const { data } = await axios.get(`${LITE_API_ENDPOINT}/detectAddress`, { params: { address }});

    if (! data.ok) {
        throw data.error;
    }

    return data.result;
};


export interface AccountState {
    state: {
        address: Address | null;
        storageStat: RawStorageInfo;
        storage: RawAccountStorage;
    } | null;
    lastTx: {
        lt: string;
        hash: Buffer;
    } | null;
    balance: RawCurrencyCollection;
    raw: Buffer;
    proof: Buffer;
    block: tonNode_blockIdExt;
    shardBlock: tonNode_blockIdExt;
    shardProof: Buffer;
}
/**
 * @param  {String} address
 * @return {Promise<Object>}
 */
export const getAddressInfo = async function (lc: LiteClient, address: string): Promise<AccountState> {
    console.log('get address info ====== ', address);
    let result: AccountState;

    try {
        const block = await lc.getMasterchainInfo()
        const response = await lc.getAccountState(Address.parse(address), block.last)
        console.log('got address=====', address)
        // const response = await axios.get(`${LITE_API_ENDPOINT}/getWalletInformation`, { params: { address }});
        result = response as unknown as AccountState;

    } catch (error) {
        // if ('response' in error && !error.response.data.ok) {
        //     return { invalid: true };
        // }

        // See ya in Sentry!
        console.log('error', error)
        console.error(error)
        throw error;
    }
    console.log('got res=======', result)

    return result

    // return Object.freeze({ address,
    //     invalid: false,
    //     is_wallet: result.wallet,
    //     balance: result.balance,
    //     is_active: result.account_state === 'active',
    //     is_frozen: result.account_state === 'frozen',
    //     wallet_type: result.wallet_type || 'Unknown',
    //     last_tx_lt: result.last_transaction_id?.lt,
    //     last_tx_hash: result.last_transaction_id?.hash,
    // });
};

/**
 * @param  {String} address
 * @param  {Number} lt
 * @param  {String} hash
 * @param  {Number} limit
 * @return {Promise<Array>}
 */
export const getTransactions = async function (address, lt, hash, limit = 50) {
    const query = { 
        address, lt, limit,
        hash: base64ToHex(hash),
        api_key: 'd852b54d062f631565761042cccea87fa6337c41eb19b075e6c7fb88898a3992'
    };

    const { data: { result }} = await axios.get(`${LITE_API_ENDPOINT}/getTransactions`, { params: query,  });

    return result.map((tx) => {
        const is_service = !tx.in_msg && tx.out_msgs.length < 1;

        const sourceAddress = tx.in_msg?.source?.account_address || tx.out_msgs[0]?.source || tx.in_msg?.source;
        const destAddress = tx.out_msgs[0]?.destination?.account_state || tx.out_msgs[0]?.destination || tx.in_msg?.destination;

        const is_out = query.address == sourceAddress;
        const from = is_out ? query.address : sourceAddress;
        const to = is_out ? destAddress : query.address;

        const transaction_id = Object.freeze({
            lt: tx.transaction_id.lt,
            hash: tx.transaction_id.hash,
        });

        const msgObject = is_out ? tx.out_msgs[0] : tx.in_msg;

        const message = msgObject?.msg_data?.['@type'] == 'msg.dataText' ? msgObject?.message : null;
        const amount = msgObject?.value;

        return Object.freeze({
            is_service, is_out, message, transaction_id,
            amount: amount || 0,
            to: to || query.address,
            from: (from?.account_address ?? from) || query.address,
            timestamp: parseInt(tx.utime + '000'),
            fee: tx.fee,
        });
    });
};

/**
 * @param  {String} options.address
 * @param  {Number} options.lt
 * @param  {String} options.hash
 * @param  {Number} options.to_lt
 * @return {Promise<Object>}
 */
export const getTransaction = async function ({ address, lt, hash, to_lt }) {
    const query = { address, lt, to_lt,
        limit: 1,
        hash: base64ToHex(hash),
    };

    const { data: { result }} = await axios.get(`${LITE_API_ENDPOINT}/getTransactions`, { params: query,  });

    return Object.freeze(result.find(tx => tx.transaction_id?.hash == hash)); 
};

/**
 * @param  {Number} options.workchain
 * @param  {Number} options.shard
 * @param  {Number} options.seqno
 * @return {Promise<Object>}
 */
export const getBlockHeader = async function ({ workchain, shard, seqno }) {
    const query = { workchain, shard, seqno };

    const { data: { result }} = await axios.get(`${LITE_API_ENDPOINT}/getBlockHeader`, { params: query });

    // Convert shard decimal id to hex:
    result.prev_blocks.forEach(block => block.shard = dechex(block.shard));

    return Object.freeze(result);
};

/**
 * @param  {Number} options.workchain
 * @param  {Number} options.shard
 * @param  {Number} options.seqno
 * @return {Promise<Object>}
 */
export const getBlockTransactions = async function ({ workchain, shard, seqno }) {
    const query = { workchain, shard, seqno };

    const { data: { result }} = await axios.get(`${LITE_API_ENDPOINT}/getBlockTransactions`, { params: query });

    // Convert address hex notation to base64:
    result.transactions.forEach(tx => tx.account = hexToAddress(tx.account));

    return result;
};

/**
 * @param  {Number} options.seqno
 * @return {Promise<Object>}
 */
export const getShards = async function ({ seqno }) {
    const { data: { result }} = await axios.get(`${LITE_API_ENDPOINT}/shards`, { params: { seqno }});

    // Convert shard decimal id to hex:
    result.shards.forEach(block => block.shard = dechex(block.shard));

    return result;
};

/**
 * @return {Promise<Object>}
 */
export const getLastBlock = async function () {
    const { data: { result }} = await axios.get(`${LITE_API_ENDPOINT}/getMasterchainInfo`);

    result.last.shard = dechex(result.last.shard);

    return Object.freeze(result.last);
};
