import test from 'node:test';
import assert from 'node:assert/strict';
import { postDayHours } from '../../resources/js/components/business-profile/profile-utils.ts';

test('a today-only overnight change takes precedence over routine hours', () => {
  assert.equal(postDayHours({ today_hours: { opens_at: '22:00', closes_at: '02:00', closes_tomorrow: true }, day_schedule: { label: '07:00–14:00', source: 'Jadwal rutin' } }), '22.00–02.00 WIB (+1 hari)');
});
test('routine hours stay visible without a today-only override', () => {
  assert.equal(postDayHours({ today_hours: null, day_schedule: { label: '16:00–22:00', source: 'Jadwal rutin' } }), '16.00–22.00 WIB');
});
test('a holiday stays a closure label instead of an invented opening time', () => {
  assert.equal(postDayHours({ day_schedule: { label: 'Libur', source: 'Jadwal khusus' } }), 'Libur');
  assert.equal(postDayHours({}), null);
});
