import test from 'node:test';
import assert from 'node:assert/strict';
import {buildCatalog,buildPurchased,recommendCourses,selectNewCourses} from '../src/pages/dashboard/learnerData.mjs';
test('hidden entitled metadata preserves learning progress but never enters recommendations or new courses',()=>{
 const videos=[{id:101,subject_id:10,scholar_user_id:7,approved:1,sequence_index:1,subject_name:'Hidden owned course',public_hidden:true,created_at:'2026-11-01T00:00:00Z'},{id:102,subject_id:10,scholar_user_id:7,approved:1,sequence_index:2,public_hidden:true}];
 const catalog=buildCatalog(videos),purchased=buildPurchased(catalog,[{subject_id:10,scholar_id:7,is_active:1,is_access_active:1,access_expires_at:'2027-03-01T00:00:00Z'}],[],[{video_id:101,watched:1,progress_seconds:50,watched_at:'2026-11-16T00:00:00Z'}],Date.parse('2026-11-16T00:00:00Z'));
 assert.equal(purchased[0].active,true);assert.equal(purchased[0].videos.length,2);assert.equal(purchased[0].progress.percent,50);assert.equal(purchased[0].progress.started,true);assert.deepEqual(recommendCourses(catalog,[],{}),[]);assert.deepEqual(selectNewCourses(catalog,[]),[]);
});
