import test from 'node:test';
import assert from 'node:assert/strict';
import { activityDateLabel, groupBusinessLocations, menuPriceRange, publicOwnerBackUrl } from '../../resources/js/types/consumer-pages.ts';

test('business grouping uses business IDs and keeps distinct posts with their own state',()=>{
  const cards=[{id:1,name:'Nama sama',post:{id:2,is_open:false}},{id:2,name:'Nama sama',post:{id:5,is_open:true}},{id:1,name:'Nama sama',post:{id:3,is_open:true}},{id:1,name:'Nama sama',post:{id:2,is_open:false}}];
  const groups=groupBusinessLocations(cards);
  assert.deepEqual(groups.map(group=>group.map(card=>card.post.id)),[[2,3],[5]]);
  assert.equal(groups[0][0].post.is_open,false);
  assert.equal(groups[0][1].post.is_open,true);
});
test('catalog price ranges exclude drinks when food exists and retain sold-out catalog prices',()=>{
  assert.deepEqual(menuPriceRange([{group:'Minuman',price:5000},{group:'Makanan',price:18000,sold_out:true},{group:'Jajanan',price:12000}]),{label:'Harga makanan',min:12000,max:18000});
  assert.deepEqual(menuPriceRange([{group:'Minuman',price:8000}]),{label:'Harga minuman',min:8000,max:8000});
  assert.equal(menuPriceRange([{group:'Makanan',price:0},{group:'Makanan',price:NaN}]),null);
});
test('owner return rejects external and malformed destinations',()=>{
  for(const value of [null,'https://evil.example/','//evil.example/','javascript:alert(1)','/\\evil.example','/akun','/usaha/a%2fb','/usaha/../akun']) assert.equal(publicOwnerBackUrl(value),'/jelajah');
});
test('owner return retains selected post and allowed map filters without customer coordinates',()=>{
  const from='/peta?q=ayam&radius=5&post=2&latitude=-7.4&longitude=112.7';
  const result=new URL(publicOwnerBackUrl('/usaha/dapur-griya?post=2&from='+encodeURIComponent(from)+'&email=private'),'https://nearasa.invalid');
  assert.equal(result.pathname,'/usaha/dapur-griya');assert.equal(result.searchParams.get('post'),'2');
  assert.equal(result.searchParams.get('from'),'/peta?q=ayam&radius=5&post=2');assert.equal(result.searchParams.has('email'),false);
  assert.equal(publicOwnerBackUrl('/usaha/dapur-griya?post=-1&from=https%3A%2F%2Fevil.example'),'/usaha/dapur-griya');
});
test('activity timestamps are formatted in WIB without inventing missing dates',()=>{
  assert.match(activityDateLabel('2026-11-01T00:00:00Z'),/07[.:]00 WIB$/);
  assert.equal(activityDateLabel('invalid'),null);assert.equal(activityDateLabel(null),null);
});
