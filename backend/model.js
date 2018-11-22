const redis = require('redis-promisify');
const client = redis.createClient();

const getGigKey = id => `gigs::${id}`;

const execMulti = commands => {
  const multi = client.multi();
  commands.forEach(([method, args]) => {
    console.log('run', method, ...args)
    multi[method](...args);
  });
  return multi.execAsync();
}

const model = {
  nextId: () => client.incrAsync('gig_id'),
	updateGig:  gig => {
    const key = getGigKey(gig.id);
    const timestamp = Date.parse(gig.date);
    return execMulti([
      ['hmset', [key, gig]],
      ['zadd', ["gigindex", timestamp, key]],
    ])
      .then((res) => console.log('hey', res) || Promise.resolve(gig));
  },
	deleteGig:  (id) => {
    const key = getGigKey(id);
    return execMulti([
      ['zrem', ["gigindex", key]],
      ['del', [key]],
    ])
      .then(() => id);
  },
  fetchGig: id => {
    const key = getGigKey(id);
    return client.hgetallAsync(key)
  },
	fetchGigs:  () => {
    return client.zrangebyscoreAsync('gigindex', -Infinity, Infinity)
      .then(keys => {
        return execMulti(keys.map(key => ['hgetall', [key]]))
      })
  }
}

module.exports = model;
