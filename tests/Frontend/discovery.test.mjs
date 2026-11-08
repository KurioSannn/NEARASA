import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { watchTiles } from '../../resources/js/components/maps/tile-status.ts';
import { businessCover } from '../../resources/js/types/business-images.ts';

test('an unavailable map can recover after retry without losing tile progress', () => {
  const layer = new EventEmitter();
  const events = [];
  const stop = watchTiles(layer, (status, progress) => events.push({ status, ...progress }));
  layer.emit('loading');
  layer.emit('tileerror');
  layer.emit('tileload');
  layer.emit('load');
  assert.deepEqual(events.at(-1), { status: 'error', loaded: 1, failed: 1 });
  layer.emit('loading');
  layer.emit('tileload');
  layer.emit('load');
  assert.deepEqual(events.at(-1), { status: 'ready', loaded: 1, failed: 0 });
  stop();
});

test('a stalled map times out, and disposal prevents late state updates', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const layer = new EventEmitter();
  const events = [];
  const stop = watchTiles(layer, status => events.push(status));
  layer.emit('loading');
  t.mock.timers.tick(10000);
  assert.deepEqual(events, ['loading', 'error']);
  layer.emit('loading');
  stop();
  const count = events.length;
  layer.emit('load');
  t.mock.timers.tick(10000);
  assert.equal(events.length, count);
  assert.equal(layer.eventNames().length, 0);
});

test('successful tile loading clears the timeout instead of showing a later error', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const layer = new EventEmitter();
  const events = [];
  const stop = watchTiles(layer, status => events.push(status));
  layer.emit('loading');
  layer.emit('tileload');
  layer.emit('load');
  t.mock.timers.tick(20000);
  assert.deepEqual(events, ['loading', 'ready']);
  stop();
});

test('demo storefront assets never replace an owner upload or a real business cover', () => {
  const demo = { slug: 'dapur-griya', is_demo: true, photo: '/images/demo/rice.jpg' };
  assert.equal(businessCover(demo), '/images/demo/places/dapur-griya.png');
  assert.equal(businessCover({ ...demo, photo: '/media/owner-cover.jpg' }), '/media/owner-cover.jpg');
  assert.equal(businessCover({ ...demo, is_demo: false }), demo.photo);
  assert.equal(businessCover({ ...demo, slug: 'other-business' }), demo.photo);
});
