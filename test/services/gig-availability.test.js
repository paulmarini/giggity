const assert = require('assert');
const app = require('../.././backend/app');

describe('\'GigAvailability\' service', () => {
  it('registered the service', () => {
    const service = app.service('gig-availability');

    assert.ok(service, 'Registered the service');
  });
});
