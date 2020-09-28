import { BlockResponse, OperationEntry, RpcClient } from "@taquito/rpc";
import { assert, expect } from "chai";
import NodeCache from "node-cache";
import { cacheKeys } from "../src/cache-keys";
import { TezosWorker } from "../src/tezos-worker";
import { Block, IOperationNotification } from "../src/types/types";
import sinon from "sinon";
import { PubSub } from "graphql-yoga";

describe('tezos worker', () => {
  describe('getHead', () => {
    it('returns head from rpc client', () => {
      // arrange
      const hash = "xz1X7fu4GXBXp9A8fchu1px3zzMDKtagDBk5";
      const expected = { hash: hash };
      var actual: { hash: string; };

      const callback = sinon.spy();
      const client = <RpcClient> {
        getBlock: function(): Promise<any> { 
          actual = expected;
          callback();
          return new Promise((resolve, reject) => { return expected });
        }
      };
      const mock = sinon.mock(client);
      const worker = new TezosWorker(client, null, null);
      
      // act
      worker.getHead();

      // assert
      assert.deepEqual(expected, actual);
      assert.equal(true, callback.calledOnce);
    }); 
  });

  describe('processBlock', () => {
    it('block is already processed', () => {
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

  describe('processBlock', () => {
    it('block with no operations', () => {
      // arrange
      const callback = sinon.spy();
      const pubSub = <PubSub> {
        publish: function(kind: any, payload:any) :boolean { 
          callback();
          return true;
        }
      };

      const cache = new NodeCache({ useClones: false });
      const worker = new TezosWorker(null, null, cache);
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
});

describe('processBlock', () => {
  it('block with operations (endorsements and transactions)', () => {
    // arrange
    const callback = sinon.spy();
    const pubSubMock = <PubSub> {
      publish: function(kind: any, payload:any): boolean { 
        callback(kind, payload);
        return true;
      }
    };

    const cache = new NodeCache({ useClones: false });
    const worker = new TezosWorker(null, pubSubMock, cache);
    const oldHead = <BlockResponse> { hash: "tr9X7fu4GXBXp9A8fchu1px3zzMDKtagDJd7" };
    const head = getBlock();
    
    cache.set(cacheKeys.head, oldHead);
    cache.set(cacheKeys.operations, new Array<IOperationNotification>());
    
    // act
    worker.processBlock(head);

    // assert
    const actualOperations = cache.get<Array<IOperationNotification>>(cacheKeys.operations);
    assert.equal(15, actualOperations.length);

    assert.equal(11, callback.withArgs("ENDORSEMENT").callCount);
    assert.equal(4, callback.withArgs("TRANSACTION").callCount);
    assert.equal(30, callback.callCount);
  });
});

function getBlock() : any {
  const fs = require('fs');
  var json = fs.readFileSync('./tests/block.json');
  let block = JSON.parse(json);
  return block;
}
