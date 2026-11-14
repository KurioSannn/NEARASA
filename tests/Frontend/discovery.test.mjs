import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { watchTiles } from '../../resources/js/components/maps/tile-status.ts';
import { addBusinessMarkers } from '../../resources/js/components/maps/marker-layers.ts';
import { parseSearchIntent } from '../../resources/js/components/search-intent.ts';
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

test('nearby business pins keep their coordinates and render tooltip labels as text', t => {
  const originalDocument = globalThis.document;
  t.after(() => { globalThis.document = originalDocument; });
  globalThis.document = {
    createElement(tagName) {
      return {
        tagName, textContent: '', children: [],
        append(child) { this.children.push(child); },
        set innerHTML(_) { assert.fail('Business names must not be inserted as HTML'); },
      };
    },
  };
  const markers = [];
  const leaflet = {
    divIcon: options => options,
    marker(coordinates) {
      return {
        addTo() { return this; },
        on() {},
        getElement() { return null; },
        bindTooltip(tooltip) { markers.push({ coordinates, tooltip }); },
      };
    },
  };
  const first = {
    name: '<b>Warung uji</b>',
    min_price: 15000,
    is_open: true,
    menus: [],
    matched_menu: { name: '<em>Nasi</em>', price: 15000 },
    post: { id: 1, name: 'Pos A', latitude: -7.38, longitude: 112.73 },
  };
  const second = {
    ...first, name: 'Pos kedua', matched_menu: null,
    post: { ...first.post, id: 2, latitude: -7.381, longitude: 112.731 },
  };

  addBusinessMarkers(leaflet, {}, [first, second], 1, () => {});

  assert.deepEqual(markers.map(marker => marker.coordinates), [[-7.38, 112.73], [-7.381, 112.731]]);
  assert.deepEqual(markers[0].tooltip.children.map(child => [child.tagName, child.textContent]), [
    ['strong', '<b>Warung uji</b>'],
    ['small', ' · <em>Nasi</em> (15rb)'],
  ]);
  assert.equal(markers[1].tooltip.children.length, 1);
});

test('discovery search extracts Indonesian budget amounts and preserves the food keyword', () => {
  assert.deepEqual(parseSearchIntent(' ayam   di bawah Rp20.000 '), { q: 'ayam', maxPrice: 20000, chooseBudget: false });
  assert.deepEqual(parseSearchIntent('kopi maksimal Rp20 ribu'), { q: 'kopi', maxPrice: 20000, chooseBudget: false });
  assert.deepEqual(parseSearchIntent('bakso 17,5rb'), { q: 'bakso', maxPrice: 17500, chooseBudget: false });
});

test('discovery search asks for a budget when murah has no explicit amount', () => {
  assert.deepEqual(parseSearchIntent('ayam murah'), { q: 'ayam', maxPrice: null, chooseBudget: true });
  assert.deepEqual(parseSearchIntent('makan murah dekat sini'), { q: '', maxPrice: null, chooseBudget: true });
});
