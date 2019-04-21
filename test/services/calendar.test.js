const assert = require('assert');
const app = require('../.././backend/app');

describe('\'calendar\' service', () => {
  it('registered the service', () => {
    const service = app.service('api/calendar');

    assert.ok(service, 'Registered the service');
  });
});
