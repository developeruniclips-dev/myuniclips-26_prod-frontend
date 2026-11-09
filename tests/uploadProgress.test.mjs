import test from 'node:test';import assert from 'node:assert/strict';
import {uploadProgress} from '../src/utils/uploadProgress.mjs';
test('byte progress is monotonic and never reports completion before server acknowledgement',()=>{
 assert.equal(uploadProgress({loaded:25,total:100}),25);assert.equal(uploadProgress({loaded:100,total:100}),99);assert.equal(uploadProgress({loaded:120,total:100}),99);assert.equal(uploadProgress({loaded:10,total:100},50),50);
 for(const event of [{},{loaded:1},{loaded:NaN,total:1},{loaded:-1,total:2},{loaded:1,total:0},{loaded:1,total:Infinity}])assert.equal(uploadProgress(event,45),45);
});
