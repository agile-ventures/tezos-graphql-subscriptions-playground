import { RpcClient } from '@taquito/rpc';
import { PubSub } from 'graphql-yoga';
import { keys } from './resolvers/keys';
import { Operation, Content, Block } from './types/types'

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
    // will be replaced by call to tezos indexer
    client.getBlock()
        .then(data => processBlock(data, pubSub))
        .catch(err => console.error(err));
}

function processBlock(block: Block, pubSub: PubSub) {
    if (global.Head && global.Head.hash === block.hash) {
        console.log('block ' + block.hash + ' already notified');
        return;
    }

    global.Head = block;
    let operationsCount = 0;

    block.operations.forEach(o => {
        if (!o) {
            return;
        }

        operationsCount += o.length;
        processOperations(o, pubSub);
    })

    console.log('block ' + block.hash + ' processed');
    console.log('operations count ' + operationsCount);
}

function processOperations(operations: Operation[], pubSub: PubSub) {
    operations.forEach(operation => {
        operation.contents.forEach(content => {
            const newOperation: Operation = {
                kind: content.kind,
                hash: operation.hash,
                contents: []
            };
            pubSub.publish(keys.newOperation, newOperation);

            if (newOperation.kind === 'transaction') {
                const newTransaction = {
                    kind: newOperation.kind,
                    hash: newOperation.hash,
                    fee: content.fee,
                    amount: content.amount,
                    source: content.source,
                    destination: content.destination,
                };
                pubSub.publish(keys.newTransaction, newTransaction);
            }

            if (newOperation.kind === 'endorsement') {
                const newEndorsement = {
                    kind: newOperation.kind,
                    hash: newOperation.hash,
                    delegate: content.delegate,
                };
                pubSub.publish(keys.newEndrosement, newEndorsement);
            }

            if (newOperation.kind === 'reveal') {
                const newReveal = {
                    kind: newOperation.kind,
                    hash: newOperation.hash,
                    source: content.source,
                    status: content.status,
                };
                pubSub.publish(keys.newReveal, newReveal);
            }

            global.Operations.push(newOperation);

            if (global.Operations.length > 1000){
                global.Operations.splice(0, 500);
            }
        })
    })
}