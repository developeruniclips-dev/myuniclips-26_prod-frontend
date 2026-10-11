import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {courseCover} from '../src/utils/courseCovers.mjs';
import {publishedCourses} from '../src/utils/publicCourses.mjs';

const courses=[[1478,18,23],[1479,18,29],[1435,23,35],[1439,25,49],[1374,31,53],[2301,30,64],[2308,30,74]];
test('each Published course resolves its actual first lesson to a local JPEG cover',()=>{
 for(const [subject,scholar,first] of courses){
  const image=courseCover(subject,scholar,first);
  assert.match(image,new RegExp('^/course-covers/lesson-'+first+'-[a-f0-9]{12}\\.jpg$'));
  const bytes=fs.readFileSync(new URL('../public'+image,import.meta.url));
  assert.equal(bytes[0],255);assert.equal(bytes[1],216);assert.equal(bytes[2],255);
  assert.ok(bytes.length>1000&&bytes.length<2000000);
  assert.equal(courseCover(String(subject),String(scholar),String(first)),image);
 }
});
test('a different Scholar, Draft/test course, missing IDs and changed first lesson do not borrow a cover',()=>{
 for(const ids of [[1478,31,23],[1390,29,62],[1376,16,87],[1478,18,24],[undefined,18],[1478,undefined],['../1478',18],[1478,'18?video_url=secret']])
  assert.equal(courseCover(...ids),'/course-fallback.svg');
});
test('public course grouping selects the first lesson even when catalogue rows arrive out of order',()=>{
 const videos=[{id:24,subject_id:1478,scholar_user_id:18,sequence_index:2,approved:1,is_free:0},{id:23,subject_id:1478,scholar_user_id:18,sequence_index:1,approved:1,is_free:1,video_url:'https://untrusted.invalid/private'}];
 const [course]=publishedCourses(videos);
 assert.equal(course.thumbnailUrl,courseCover(1478,18,23));
 assert.equal(course.firstVideoFree,true);
 assert.equal(course.totalVideos,2);
 assert.equal(publishedCourses([{...videos[0],sequence_index:1}])[0].thumbnailUrl,'/course-fallback.svg');
});
test('cover lookup contains no provider address, provider video identifier or playback request',()=>{
 const source=fs.readFileSync(new URL('../src/utils/courseCovers.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(source,/vimeo\.com|vimeocdn|vumbnail|player_url|video_url|fetch\(|axios/);
 for(const providerId of ['1157149380','1157157494','1161848258','1175902055','1176003279','1188848807','1197529693'])
  assert.equal(source.includes(providerId),false);
});
