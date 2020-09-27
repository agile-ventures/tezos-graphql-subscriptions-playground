import { RpcClient } from '@taquito/rpc';
import { PubSub } from 'graphql-yoga';
import { keys } from './resolvers/keys';
import { OperationEntry, Block } from './types/types'
import NodeCache from "node-cache";
import { cacheKeys } from './cache-keys';

export class TezosWorker {
    client: RpcClient;
    pubSub: PubSub;
    cache: NodeCache;

    constructor(client: RpcClient, pubSub: PubSub, cache: NodeCache){
        this.client = client;
        this.pubSub = pubSub;
        this.cache = cache;
    }

    start() {
        // NOTE keeping operations in memory for dev and testing purposes
        this.cache.set(cacheKeys.operations, []);

        // getBlock(client, pubSub);
        let interval = setInterval(() => {
            this.getBlock();
        }, 5000);
    }

    getBlock()
    {
        // NOTE: will be replaced by call to tezos indexer
        this.client.getBlock()
            .then(data => this.processBlock(data))
            .catch(err => console.error(err));
    }

    processBlock(block: any) {
        let head = this.cache.get<any>(cacheKeys.head);
        if (head && head.hash === block.hash) {
            console.log('block ' + block.hash + ' already notified');
            return;
        }

        this.cache.set(cacheKeys.head, block);
        let operationsCount = 0;

        block.operations.forEach((o: any[]) => {
            if (!o) return;

            operationsCount += o.length;
            this.processOperations(o);
        })

        console.log('block ' + block.hash + ' processed');
        console.log('operations count ' + operationsCount);
    }

    processOperations(operations: OperationEntry[]) {
        
        operations
            .forEach((oe: any) => oe.contents
                .forEach((oc: any) => this.publishNotification(oe, oc)));
    }

    publishNotification(oe: any, oc: any)
    {
        var payload: any;
        var key: string;
        switch (oc.kind)
        {
            case 'activation':{
                payload = {
                    hash: oe.hash,
                    kind: keys.newActivateAccount,
                    pkh: oc.pkh,
                    secret: oc.secret,
                };
                key = keys.newActivateAccount;
                break;
            }
            case 'ballot':{
                payload = {
                    hash: oe.hash,
                    kind: keys.newBallot,
                    source: oc.source,
                    period: oc.period,
                    proposal: oc.proposal,
                    ballot: oc.ballot,
                };
                key = keys.newBallot;
                break;
            }
            case 'delegation':{
                payload = {
                    hash: oe.hash,
                    kind: keys.newDelegation,
                    source: oc.source,
                    fee: oc.fee,
                    counter: oc.counter,
                    gasLimit: oc.gasLimit,
                    storateLimit: oc.storateLimit,
                    delegate: oc.metadata.delegate,
                };
                key = keys.newDelegation;
                break;
            }
            case 'doubleBakingEvidence':{
                payload = {
                    hash: oe.hash,
                    kind: keys.newDoubleBakingEvidence,
                    bh1: oc.bh1,
                    bh2: oc.bh2,
                };
                key = keys.newDoubleBakingEvidence;
                break;
            }
            case 'doubleEndorsementEvidence':{
                payload = {
                    hash: oe.hash,
                    kind: keys.newDoubleEndorsementEvidence,
                    op1: oc.op1,
                    op2: oc.op2,
                };
                key = keys.newDoubleEndorsementEvidence;
                break;
            }
            case 'endorsement':{
                payload = {
                    hash: oe.hash,
                    kind: keys.newEndorsement,
                    delegate: oc.metadata.delegate,
                };
                key = keys.newEndorsement;
                break;
            }
            case 'origination':{
                payload = {
                    hash: oe.hash,
                    kind: keys.newOrigination,
                    source: oc.source,
                    delegate: oc.metadata.delegate,
                };
                key = keys.newOrigination;
                break;
            }
            case 'proposals':{
                payload = {
                    hash: oe.hash,
                    kind: keys.newProposals,
                    source: oc.source,
                    period: oc.period,
                    proposals: oc.proposals
                };
                key = keys.newProposals;
                break;
            }
            case 'reveal':{
                payload = {
                    hash: oe.hash,
                    kind: keys.newReveal,
                    source: oc.source,
                };
                key = keys.newReveal;
                break;
            }
            case 'seedNonceRevelation':{
                payload = {
                    hash: oe.hash,
                    kind: keys.newSeedNonceRevelation,
                    level: oc.level,
                    nonce: oc.nonce,
                };
                key = keys.newSeedNonceRevelation;
                break;
            }
            case 'transaction':{
                payload = {
                    hash: oe.hash,
                    kind: keys.newTransaction,
                    fee: oc.fee,
                    amount: oc.amount,
                    source: oc.source,
                    destination: oc.destination,
                };
                key = keys.newTransaction;
                break;
            }
            default: {
                console.log(oc.kind);
            }
        }

        // publish generic operation notification
        this.pubSub.publish(keys.newOperation, payload);
        
        // publish specific operation notification
        this.pubSub.publish(key, payload);

        // NOTE keeping operations in memory for dev and testing purposes
        this.cache.get<any>(cacheKeys.operations).push(payload);
    }
}