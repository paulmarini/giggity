const assert = require('assert');
const app = require('../.././backend/app');

describe('\'Gigs\' service', () => {
  it('registered the service', () => {
    const service = app.service('gigs');

    assert.ok(service, 'Registered the service');
  });
});
