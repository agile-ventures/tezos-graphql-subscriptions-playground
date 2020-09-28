import { assert, expect } from "chai";
import { canReturn, getMembers } from "../src/resolvers/subscription";

describe('subscription', () => {
  describe('canReturn', () => {
    it('args are empty', () => {
      // arrange
      const payload = {
        "delegate": "tz1X7fu4GXBXp9A8fchu1px3zzMDKtagDBk3"
      };
      const args = {};
      const expected = true;
      
      // act
      const actual = canReturn(payload, args);

      // assert
      assert.equal(expected, actual);
    }); 
  });

  describe('canReturn', () => {
    it('payload and args match', () => {
      // arrange
      const payload = { 
        "delegate": "tz1X7fu4GXBXp9A8fchu1px3zzMDKtagDBk3"
      };
      const args = { 
        "delegate": "tz1X7fu4GXBXp9A8fchu1px3zzMDKtagDBk3"
      };
      const expected = true;
      
      // act
      const actual = canReturn(payload, args);

      // assert
      assert.equal(expected, actual);
    }); 
  });

  describe('canReturn', () => {
    it('payload and args dont match', () => {
      // arrange
      const payload = { 
        "delegate": "tz1X7fu4GXBXp9A8fchu1px3zzMDKtagDBk3"
      };
      const args = { 
        "delegate": "xz1X7fu4GXBXp9A8fchu1px3zzMDKtagDBk5"
      };
      const expected = false;
      
      // act
      const actual = canReturn(payload, args);

      // assert
      assert.equal(expected, actual);
    }); 
  });

  describe('canReturn', () => {
    it('args property not in payload', () => {
      // arrange
      const payload = { 
        "delegate": "tz1X7fu4GXBXp9A8fchu1px3zzMDKtagDBk3"
      };
      const args = { 
        "address": "xz1X7fu4GXBXp9A8fchu1px3zzMDKtagDBk5"
      };
      const expected = true;
      
      // act
      const actual = canReturn(payload, args);

      // assert
      assert.equal(expected, actual);
    }); 
  });

  describe('getMembers', () => {
    it('property names correctly returned', () => {
      // arrange
      const args = { 
        "delegate": "tz1X7fu4GXBXp9A8fchu1px3zzMDKtagDBk3",
        "address": "xz1X7fu4GXBXp9A8fchu1px3zzMDKtagDBk5"
      };
      const expected = Array<string>("delegate", "address");
      
      // act
      const actual = getMembers(args);

      // assert
      assert.deepEqual(expected, actual);
    }); 
  });
});