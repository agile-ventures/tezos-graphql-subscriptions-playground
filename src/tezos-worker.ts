import { RpcClient } from '@taquito/rpc';
import { PubSub } from 'graphql-yoga';
import { keys } from './resolvers/keys';
import { OperationEntry, Block } from './types/types'

export class TezosWorker {
    static start(pubSub: PubSub) {
        global.Operations = [];

        const provider = 'https://testnet-tezos.giganode.io'; //'https://api.tezos.org.ua';
        let client = new RpcClient(provider);
        getBlock(client, pubSub);
        let interval = setInterval(() => {
            getBlock(client, pubSub);
        }, 5000);
    }
}

function getBlock(client: RpcClient, pubSub: PubSub)
{
    // NOTE: will be replaced by call to tezos indexer
    client.getBlock()
        .then(data => processBlock(data, pubSub))
        .catch(err => console.error(err));
}

function processBlock(block: any, pubSub: PubSub) {
    if (global.Head && global.Head.hash === block.hash) {
        console.log('block ' + block.hash + ' already notified');
        return;
    }

    global.Head = block;
    let operationsCount = 0;

    block.operations.forEach((o: any[]) => {
        if (!o) return;

        operationsCount += o.length;
        processOperations(o, pubSub);
    })

    console.log('block ' + block.hash + ' processed');
    console.log('operations count ' + operationsCount);
}

function processOperations(operations: OperationEntry[], pubSub: PubSub) {
    operations.forEach((oe: any) => {
        oe.contents.forEach((oc: any) => {
            const newOperation = {
                kind: oc.kind,
                hash: oe.hash
            };
            pubSub.publish(keys.newOperation, newOperation);

            if (oc.kind === 'transaction') {
                const newTransaction = {
                    kind: oc.kind,
                    hash: oe.hash,
                    fee: oc.fee,
                    amount: oc.amount,
                    source: oc.source,
                    destination: oc.destination,
                };
                pubSub.publish(keys.newTransaction, newTransaction);
                global.Operations.push(newTransaction);
            }
            else if (oc.kind === 'endorsement') {
                const newEndorsement = {
                    kind: oc.kind,
                    hash: oe.hash,
                    delegate: oc.metadata.delegate,
                };
                pubSub.publish(keys.newEndrosement, newEndorsement);
                global.Operations.push(newEndorsement);
            }
            else if (oc.kind === 'reveal') {
                const newReveal = {
                    kind: oc.kind,
                    hash: oe.hash,
                    source: oc.source,
                };
                pubSub.publish(keys.newReveal, newReveal);
                global.Operations.push(newReveal);
            }
            else if (oc.kind === 'origination') {
                const newOrigination = {
                    kind: oc.kind,
                    hash: oe.hash,
                    source: oc.source,
                    delegate: oc.metadata.delegate,
                };
                pubSub.publish(keys.newOrigination, newOrigination);
                global.Operations.push(newOrigination);
            }
            else if (oc.kind === 'delegation') {
                const newDelegation = {
                    kind: oc.kind,
                    hash: oe.hash,
                    source: oc.source,
                    delegate: oc.metadata.delegate,
                };
                pubSub.publish(keys.newDelegation, newDelegation);
                global.Operations.push(newDelegation);
            }
            else {
                global.Operations.push(newOperation);
            }

            if (global.Operations.length > 1000){
                global.Operations.splice(0, 500);
            }
        })
    })
}