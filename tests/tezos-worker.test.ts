import { BlockResponse, RpcClient } from "@taquito/rpc";
import { assert, expect } from "chai";
import NodeCache from "node-cache";
import { cacheKeys } from "../src/cache-keys";
import { TezosWorker } from "../src/tezos-worker";
import { Block, IOperationNotification } from "../src/types/types";
import sinon from "sinon";

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
      const hash = "xz1X7fu4GXBXp9A8fchu1px3zzMDKtagDBk5";
      const expected = <BlockResponse> { hash: hash };
      
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
});
