import test from 'node:test';
import assert from 'node:assert/strict';
import {dotIndices,swipeDirection,shouldMinimize} from '../gallery.js';
test('gallery dots remain bounded and include the active image',()=>{
 for(const total of [1,2,7,20,100])for(let current=0;current<total;current++){
  const dots=dotIndices(total,current);assert.ok(dots.length<=7);assert.ok(dots.includes(current));assert.ok(dots.every(n=>n>=0&&n<total));
 }
});
test('horizontal swipes change images without mistaking vertical scrolling for navigation',()=>{
 assert.equal(swipeDirection(-100,10),1);assert.equal(swipeDirection(100,10),-1);assert.equal(swipeDirection(10,100),0);assert.equal(swipeDirection(20,10),0);
});
test('downward header swipe minimizes but lateral gestures and taps do not',()=>{
 assert.ok(shouldMinimize(5,90));assert.equal(shouldMinimize(90,5),false);assert.equal(shouldMinimize(5,15),false);assert.equal(shouldMinimize(5,-90),false);
});
