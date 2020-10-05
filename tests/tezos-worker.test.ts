import { BlockResponse, OperationEntry, RpcClient } from "@taquito/rpc";
import { assert, expect } from "chai";
import NodeCache from "node-cache";
import { cacheKeys } from "../src/cache-keys";
import { TezosWorker } from "../src/tezos-worker";
import { IOperationNotification, IEndorsementNotification } from "../src/types/types";
import sinon from "sinon";
import { PubSub } from "graphql-yoga";
import { keys } from '../src/resolvers/keys';
import { MonitorBlockHeader } from '../src/tezos/monitor-block-header';

describe('TezosWorker', () => {
  describe('async onNewBlock(blockHeader: MonitorBlockHeader)', () => {
    it('should return head block from rpc client and push notification', async () => {
      // arrange
      const pubSubCallback = sinon.spy();
      const pubSubMock = <PubSub> {
        publish: function(key: any, payload: any): boolean { 
          pubSubCallback(key, payload.data);
          return true;
        }
      };
      
      const cache = new NodeCache({ useClones: false });
      const blockHeader = <MonitorBlockHeader> getTestData('monitor-block-header.json');
      let receivedArgs: any;

      const block = <BlockResponse> { hash: blockHeader.hash, operations: [[]] };
      cache.set(cacheKeys.head, block);

      const clientCallback = sinon.spy();
      const clientMock = <RpcClient> {
        getBlock: function(args): Promise<any> { 
          receivedArgs = args;
          clientCallback();
          return new Promise((resolve, reject) => resolve(block));
        }
      };
      const worker = new TezosWorker(clientMock, pubSubMock, cache);
      
      // act
      await worker.onNewBlock(blockHeader);

      // assert
      assert.equal(1, pubSubCallback.withArgs(keys.newMonitorBlockHeader, blockHeader).callCount);
      assert.deepEqual(receivedArgs, { block: blockHeader.hash });
      assert.equal(true, clientCallback.calledOnce);
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
      { args: [2, keys.newActivateAccount], expected: 2 },
      { args: [1, keys.newBallot], expected: 2 },
      { args: [3, keys.newDelegation], expected: 2 },
      { args: [2, keys.newDoubleBakingEvidence], expected: 2 },
      { args: [2, keys.newDoubleEndorsementEvidence], expected: 2 },
      { args: [3, keys.newOrigination], expected: 1 },
      { args: [1, keys.newProposals], expected: 2 },
      { args: [3, keys.newReveal], expected: 2 },
      { args: [3, keys.newSeedNonceRevelation], expected: 20 },
      { args: [0, keys.newEndorsement], expected: 11 },
      { args: [3, keys.newTransaction], expected: 6 },
    ];

    // silent console loging in test output
    sinon.stub(console, "log");

    tests.forEach(function(test) {
      it('should push ' + test.expected + ' notifications for operation kind ' + test.args[1], () => {
        // arrange
        const pubSubCallback = sinon.spy();
        const pubSubMock = <PubSub> {
          publish: function(key: any, payload: any): boolean { 
            pubSubCallback(key, payload.data);
            return true;
          }
        };

        const cache = new NodeCache({ useClones: false });
        const worker = new TezosWorker(null, pubSubMock, cache);
        const oldHead = <BlockResponse> { hash: "tr9X7fu4GXBXp9A8fchu1px3zzMDKtagDJd7" };
        const head = getTestData('block.json');

        let expectedNotifications = [];
        let operations = head.operations[test.args[0]];
        operations.forEach((o: any) => 
          o.contents.filter((c: { kind: NodeCache.Key; }) => c.kind === test.args[1]).forEach((c: any) => {
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
        assert.equal(test.expected, pubSubCallback.withArgs(test.args[1]).callCount);

        expectedNotifications.forEach((n: any) => {
          assert.equal(1, pubSubCallback.withArgs(keys.newOperation, n.data).callCount);
          assert.equal(1, pubSubCallback.withArgs(test.args[1], n.data).callCount);
        });
      });
    });
  });
});

function getTestData(filename: string) : any {
  const fs = require('fs');
  return JSON.parse(fs.readFileSync('./tests/' + filename));
}
