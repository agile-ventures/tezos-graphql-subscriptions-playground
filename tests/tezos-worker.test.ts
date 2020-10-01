import { BlockResponse, OperationEntry, RpcClient } from "@taquito/rpc";
import { assert, expect } from "chai";
import NodeCache from "node-cache";
import { cacheKeys } from "../src/cache-keys";
import { TezosWorker } from "../src/tezos-worker";
import { IOperationNotification, IEndorsementNotification } from "../src/types/types";
import sinon from "sinon";
import { PubSub } from "graphql-yoga";
import { keys } from '../src/resolvers/keys';
import { MonitorBlockHeader } from '../src/tezos-monitor';

describe('TezosWorker', () => {
  describe('async onNewBlock(blockHeader: MonitorBlockHeader)', () => {
    it('should return head block from rpc client', async () => {
      // arrange
      const cache = new NodeCache({ useClones: false });
      const hash = "xz1X7fu4GXBXp9A8fchu1px3zzMDKtagDBk5";
      const blockHeader = <MonitorBlockHeader>{ hash, level: 666 };
      let receivedArgs: any;

      const block = <BlockResponse> { hash: hash };
      cache.set(cacheKeys.head, block);

      const callback = sinon.spy();
      const client = <RpcClient> {
        getBlock: function (args): Promise<any> { 
          receivedArgs = args;
          callback();
          return new Promise((resolve, reject) => resolve({ hash }));
        }
      };
      const worker = new TezosWorker(client, null, cache);
      
      // act
      await worker.onNewBlock(blockHeader);

      // assert
      assert.deepEqual(receivedArgs, { block: hash });
      assert.equal(true, callback.calledOnce);
    }); 
  });

  describe('processBlock(block: BlockResponse)', () => {
    it('should not pusn any operations notifications because block was already processed', () => {
      // arrange
      const cache = new NodeCache({ useClones: false });
      const worker = new TezosWorker(null, null, cache);
      const expected = <BlockResponse> { hash: "xz1X7fu4GXBXp9A8fchu1px3zzMDKtagDBk5" };
      
      cache.set(cacheKeys.head, expected);
      cache.set(cacheKeys.operations, new Array<IOperationNotification>());
      
      // act
      worker.processBlock(expected);

      // assert
      const actual = cache.get<BlockResponse>(cacheKeys.head);
      assert.deepEqual(expected, actual);

      const actualOperations = cache.get<Array<IOperationNotification>>(cacheKeys.operations);
      assert.equal(0, actualOperations.length);
    }); 
  });

  describe('processBlock(block: BlockResponse)', () => {
    it('should not push any operations notifications because there are no operations on the block', () => {
      // arrange
      const callback = sinon.spy();
      const pubSub = <PubSub> {
        publish: function(kind: any, payload: any) :boolean { 
          callback();
          return true;
        }
      };

      const cache = new NodeCache({ useClones: false });
      const worker = new TezosWorker(null, pubSub, cache);
      const head = <BlockResponse> { 
        hash: "xz1X7fu4GXBXp9A8fchu1px3zzMDKtagDBk5",
        operations: [[]]
      };
      
      cache.set(cacheKeys.head, head);
      cache.set(cacheKeys.operations, new Array<IOperationNotification>());
      
      // act
      worker.processBlock(head);

      // assert
      const actualOperations = cache.get<Array<IOperationNotification>>(cacheKeys.operations);
      assert.equal(0, actualOperations.length);
      assert.equal(true, callback.notCalled);
    });
  });

  describe('processBlock(block: BlockResponse)', () => {
    var tests = [
      { args: [0, keys.newEndorsement], expected: 11 },
      { args: [2, keys.newActivateAccount], expected: 1 },
      { args: [3, keys.newTransaction], expected: 4 },
    ];

    // silent console loging in test output
    sinon.stub(console, "log");

    tests.forEach(function(test) {
      it('should push ' + test.expected + ' notifications for operation kind ' + test.args[1], () => {
        // arrange
        const callback = sinon.spy();
        const pubSubMock = <PubSub> {
          publish: function(kind: any, payload: any): boolean { 
            callback(kind, payload.data);
            return true;
          }
        };

        const cache = new NodeCache({ useClones: false });
        const worker = new TezosWorker(null, pubSubMock, cache);
        const oldHead = <BlockResponse> { hash: "tr9X7fu4GXBXp9A8fchu1px3zzMDKtagDJd7" };
        const head = getTestBlock();

        let expectedNotifications = [];
        let operations = head.operations[test.args[0]];
        operations.forEach((o: any) => 
          o.contents.forEach((c: any) => {
            expectedNotifications.push(<IOperationNotification> { 
              kind: keys.newOperation,
              data: c
            });
            expectedNotifications.push(<IOperationNotification> { 
              kind: test.args[1],
              data: c
            });
          }
        ));

        cache.set(cacheKeys.head, oldHead);
        cache.set(cacheKeys.operations, new Array<IOperationNotification>());
        
        // act
        worker.processBlock(head);

        // assert
        assert.equal(test.expected, callback.withArgs(test.args[1]).callCount);

        expectedNotifications.forEach((n: any) => {
          assert.equal(1, callback.withArgs(keys.newOperation, n.data).callCount);
          assert.equal(1, callback.withArgs(test.args[1], n.data).callCount);
        });
      });
    });
  });
});

function getTestBlock() : any {
  const fs = require('fs');
  return JSON.parse(fs.readFileSync('./tests/block.json'));
}
