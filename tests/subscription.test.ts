import { assert, expect } from "chai";
import { canReturn, getMembers } from "../src/resolvers/subscription";

describe('Subscription', () => {
  describe('canReturn(payload: any, variables: any)', () => {
    it('should return true, because filter arguments are empty', () => {
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

  describe('canReturn(payload: any, variables: any)', () => {
    it('should return true, because payload properties match arguments', () => {
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

  describe('canReturn(payload: any, variables: any)', () => {
    it('should return false, because filter arguments are empty', () => {
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

  describe('canReturn(payload: any, variables: any)', () => {
    it('should return true, because filter arguments are not present in payload', () => {
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

  describe('getMembers(instance: any)', () => {
    it('should return all arguments values from the object', () => {
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