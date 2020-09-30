import { BlockResponse, RpcClient } from '@taquito/rpc';
import { PubSub } from 'graphql-yoga';
import { keys } from './resolvers/keys';
import { IOperationNotification, OperationEntry } from './types/types'
import NodeCache from "node-cache";
import { cacheKeys } from './cache-keys';
import { MonitorBlockHeader, TezosMonitor } from './tezos-monitor';

export class TezosWorker {
    constructor(
        private readonly client: RpcClient,
        private readonly pubSub: PubSub,
        private readonly cache: NodeCache) {}

    startListening(monitor: TezosMonitor) {
        // NOTE keeping operations in memory for dev and testing purposes
        this.cache.set(cacheKeys.operations, []);
        monitor.blockHeaders.subscribe(b => this.onNewBlock(b));
    }

    async onNewBlock(blockHeader: MonitorBlockHeader) {
        try {
            // NOTE: will be replaced by call to tezos indexer
            let block = await this.client.getBlock({ block: blockHeader.hash });
            this.processBlock(block);
        } catch (err) {
            console.error(err);
        }
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

    private publishNotification(oe: any, op: any)
    {
        const payload: any = <IOperationNotification> { 
            kind: this.Map(op.kind),
            data: op
        };

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

    Map(kind: string) : string
    {
        switch (kind)
        {
            case 'activation': {
                return keys.newActivateAccount;
            }
            case 'ballot': {
                return keys.newBallot;
            }
            case 'delegation': {
                return keys.newDelegation;
            }
            case 'doubleBakingEvidence': {
                return keys.newDoubleBakingEvidence;
            }
            case 'doubleEndorsementEvidence': {
                return keys.newDoubleEndorsementEvidence;
            }
            case 'endorsement': {
                return keys.newEndorsement;
            }
            case 'origination': {
                return keys.newOrigination;
            }
            case 'proposals': {
                return keys.newProposals;
            }
            case 'reveal': {
                return keys.newReveal;
            }
            case 'seedNonceRevelation': {
                return keys.newSeedNonceRevelation;
            }
            case 'transaction': {
                return keys.newTransaction;
            }
            default: {
                console.warn(kind + ' operation is not supported');
                return null;
            }
        }
    }
}