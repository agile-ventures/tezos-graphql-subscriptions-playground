import { BlockResponse, RpcClient } from '@taquito/rpc';
import { PubSub } from 'graphql-yoga';
import { keys } from './resolvers/keys';
import { Block, IMonitorBlockHeaderNotification, IOperationNotification, OperationEntry } from './types/types'
import NodeCache from "node-cache";
import { cacheKeys } from './cache-keys';
import { MonitorBlockHeader, TezosMonitor } from './tezos-monitor';

export class TezosWorker {
    constructor(
        private readonly client: RpcClient,
        private readonly pubSub: PubSub,
        private readonly cache: NodeCache) {
        }

    startListening(monitor: TezosMonitor) {
        // NOTE keeping operations in memory for dev and testing purposes
        this.cache.set(cacheKeys.operations, []);
        monitor.blockHeaders.subscribe(b => this.onNewBlock(b));
    }

    async onNewBlock(blockHeader: MonitorBlockHeader) {
        const payload: any = <IMonitorBlockHeaderNotification> { 
            data: blockHeader
        };
        this.pubSub.publish(keys.newMonitorBlockHeader, payload);

        var block: BlockResponse;
        try {
            block = await this.getBlockWithRetries(blockHeader, this.client, this.getBlock)
        }
        catch (error)
        {
            console.error(error);
            return;
        }

        this.processBlock(block);
    }

    getBlockWithRetries(blockHeader: MonitorBlockHeader, client: RpcClient, getBlockFunction: 
        (blockHeader: MonitorBlockHeader, client: RpcClient) => Promise<BlockResponse>, retries = 10, delay = 5000) : Promise<BlockResponse> {
            return new Promise(async (resolve, reject) => {
                try {
                    const value = await getBlockFunction(blockHeader, client);
                    return resolve(value);
                } catch (error) {
                    if (retries === 1) {
                        reject(error);
                        return;
                    }

                    setTimeout(() => {
                        console.log('retries: ', retries);
                        this.getBlockWithRetries(blockHeader, client, getBlockFunction, retries - 1, delay)
                            .then(resolve, reject);
                    }, delay);
                }
            })
    }
    
    getBlock(blockHeader: MonitorBlockHeader, client: RpcClient) : Promise<BlockResponse>
    {
        return client.getBlock({ block: blockHeader.hash });
    }

    processBlock(block: BlockResponse) {
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
        // NOTE: mapping operation kind to upper case to fit typescript enum type
        op.kind = this.Map(op.kind);

        const payload: any = <IOperationNotification> { 
            kind: op.kind,
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
            case 'activate_account': {
                return keys.newActivateAccount;
            }
            case 'ballot': {
                return keys.newBallot;
            }
            case 'delegation': {
                return keys.newDelegation;
            }
            case 'double_baking_evidence': {
                return keys.newDoubleBakingEvidence;
            }
            case 'double_endorsement_evidence': {
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
            case 'seed_nonce_revelation': {
                return keys.newSeedNonceRevelation;
            }
            case 'transaction': {
                return keys.newTransaction;
            }
            default: {
                console.warn(kind + ' operation kind is not supported');
                return null;
            }
        }
    }
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}