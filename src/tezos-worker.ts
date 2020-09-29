import { BlockResponse, RpcClient } from '@taquito/rpc';
import { PubSub } from 'graphql-yoga';
import { keys } from './resolvers/keys';
import { IOperationNotification, OperationEntry } from './types/types'
import NodeCache from "node-cache";
import { cacheKeys } from './cache-keys';
import { 
    IActivationNotification, 
    IBallotNotification, 
    IDelegationNotification, 
    IDoubleBakingEvidenceNotification, 
    IDoubleEndorsementEvidenceNotification, 
    ITransactionNotification,
    IEndorsementNotification,
    IOriginationNotification,
    IProposals,
    IRevealNotification,
    ISeedNonceRevelationNotification
} from './types/types'

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

        let interval = setInterval(() => {
            this.getHead();
        }, 5000);
    }
    getHead() {
        // NOTE: will be replaced by call to tezos indexer
        this.client.getBlock()
            .then((data: BlockResponse) => this.processBlock(data))
            .catch(err => console.error(err));
    }

    processBlock(block: BlockResponse) {
        let head = this.cache.get<BlockResponse>(cacheKeys.head);
        if (head && head.hash === block.hash) {
            console.log('.');
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
        switch (oc.kind)
        {
            case 'activation': {
                payload = <IActivationNotification> { 
                    hash: oe.hash,
                    kind: keys.newActivateAccount,
                    pkh: oc.pkh,
                    secret: oc.secret,
                };
                break;
            }
            case 'ballot': {
                payload = <IBallotNotification> {
                    hash: oe.hash,
                    kind: keys.newBallot,
                    source: oc.source,
                    period: oc.period,
                    proposal: oc.proposal,
                    ballot: oc.ballot,
                };
                break;
            }
            case 'delegation': {
                payload = <IDelegationNotification> {
                    hash: oe.hash,
                    kind: keys.newDelegation,
                    source: oc.source,
                    fee: oc.fee,
                    counter: oc.counter,
                    gasLimit: oc.gasLimit,
                    storateLimit: oc.storateLimit,
                    delegate: oc.metadata.delegate,
                };
                break;
            }
            case 'doubleBakingEvidence': {
                payload = <IDoubleBakingEvidenceNotification> {
                    hash: oe.hash,
                    kind: keys.newDoubleBakingEvidence,
                    bh1: oc.bh1,
                    bh2: oc.bh2,
                };
                break;
            }
            case 'doubleEndorsementEvidence': {
                payload = <IDoubleEndorsementEvidenceNotification> {
                    hash: oe.hash,
                    kind: keys.newDoubleEndorsementEvidence,
                    op1: oc.op1,
                    op2: oc.op2,
                };
                break;
            }
            case 'endorsement': {
                payload = <IEndorsementNotification> {
                    hash: oe.hash,
                    kind: keys.newEndorsement,
                    delegate: oc.metadata.delegate,
                };
                break;
            }
            case 'origination': {
                payload = <IOriginationNotification> {
                    hash: oe.hash,
                    kind: keys.newOrigination,
                    source: oc.source,
                    delegate: oc.metadata.delegate,
                };
                break;
            }
            case 'proposals': {
                payload = <IProposals> {
                    hash: oe.hash,
                    kind: keys.newProposals,
                    source: oc.source,
                    period: oc.period,
                    proposals: oc.proposals
                };
                break;
            }
            case 'reveal': {
                payload = <IRevealNotification> {
                    hash: oe.hash,
                    kind: keys.newReveal,
                    source: oc.source,
                };
                break;
            }
            case 'seedNonceRevelation': {
                payload = <ISeedNonceRevelationNotification> {
                    hash: oe.hash,
                    kind: keys.newSeedNonceRevelation,
                    level: oc.level,
                    nonce: oc.nonce,
                };
                break;
            }
            case 'transaction': {
                payload = <ITransactionNotification> { 
                    hash: oe.hash,
                    kind: keys.newTransaction,
                    fee: oc.fee,
                    amount: oc.amount,
                    source: oc.source,
                    destination: oc.destination
                };
                break;
            }
            default: {
                console.warn(oc.kind + ' operation is not supported');
                return;
            }
        }

        // publish generic operation notification
        this.pubSub.publish(keys.newOperation, payload);
        
        // publish specific operation notification
        this.pubSub.publish(payload.kind, payload);

        // NOTE keeping operations in memory for dev and testing purposes
        // node cache is initialized with useClones: false so reference to variable is stored
        let operations = this.cache.get<Array<IOperationNotification>>(cacheKeys.operations);
        operations.push(payload);

        // NOTE keeping operations in memory for dev and testing purposes
        if (operations.length > 5000) {
            operations.splice(0, 1000);
        }
    }
}