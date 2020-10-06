import { BlockResponse, RpcClient } from '@taquito/rpc';
import { PubSub } from 'graphql-yoga';
import NodeCache from 'node-cache';

import { cacheKeys } from './cache-keys';
import { keys } from './resolvers/keys';
import { MonitorBlockHeader, TezosMonitor } from './tezos-monitor';
import { IMonitorBlockHeaderNotification, IOperationNotification, OperationEntry } from './types/types';

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
        catch (error) {
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
                        console.log('retry: ', retries);
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
        const payload: IOperationNotification = { 
            key: op.kind,
            data: op
        };

        payload.data.operation = {
            protocol: oe.protocol,
            chain_id: oe.chain_id,
            hash: oe.hash,
            branch: oe.branch,
            signature: oe.signature
        }

        // publish generic operation notification
        this.pubSub.publish(keys.newOperation, payload);
        
        // publish specific operation notification
        this.pubSub.publish(payload.key, payload);

        // NOTE keeping operations in memory for dev and testing purposes
        // node cache is initialized with useClones: false so reference to variable is stored
        let operations = this.cache.get<Array<IOperationNotification>>(cacheKeys.operations);
        operations.push(payload);

        if (operations.length > 5000) {
            operations.splice(0, 1000);
        }
    }
}