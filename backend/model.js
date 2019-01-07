const redis = require('redis-promisify');
const client = redis.createClient();

const getKey = (...args) => args.join('::');

const execMulti = commands => {
  const multi = client.multi();
  commands.forEach(([method, args]) => {
    console.log('run', method, ...args)
    multi[method](...args);
  });
  return multi.execAsync()
    .catch(err => console.err(`REDIS ERROR: ${err}`))
}

const gigModel = {
  nextId: project => client.incrAsync(getKey(project, 'gig_id')),
	update: (project, gig) => {
    const key = getKey(project,'gigs', gig.id);
    const timestamp = Date.parse(gig.date);
    return execMulti([
      ['hmset', [key, gig]],
      ['zadd', [getKey(project, 'gigindex'), timestamp, key]],
    ])
      .then((res) => gig);
  },
	delete: (project, id) => {
    const key = getKey(project,'gigs', id);
    return execMulti([
      ['zrem', [getKey(project, 'gigindex'), key]],
      ['del', [key]],
    ])
      .then(() => id);
  },
  fetch: (project, id) => {
    const key = getKey(project,'gigs', id);
    return execMulti([['hgetall', [key]]])
      .then(([gig]) => console.log('===>', gig) || gig)
  },
	fetchAll: (project) => {
    return client.zrangebyscoreAsync(getKey(project, 'gigindex'), -Infinity, Infinity)
      .then(keys => {
        return execMulti(keys.map(key => ['hgetall', [key]]))
      })
  },
}

const userModel = {
  nextId: project => client.incrAsync(getKey(project, 'user_id')),
	update: (project, user) => {
    const key = getKey(project, 'users', user.id);
    return execMulti([
      ['hmset', [key, user]],
      ['sadd', [getKey(project, 'userindex'), key]],
      ['hmset', [getKey(project, 'useremails'), user.email, key]],
    ])
      .then((res) => user);
  },
	delete: (project, id) => {
    const key = getKey(project, 'users', id);
    return execMulti([
      ['srem', [getKey(project, 'userindex'), key]],
      ['del', [key]],
    ])
      .then(() => id);
  },
  fetchByEmail: (project, email) => {
    return execMulti([['hget', [getKey(project, 'useremails'), email]]])
      .then(key => client.hgetallAsync(key))
  },
  fetch: (project, id) => {
    const key = getKey(project, 'users', id);
    return client.hgetallAsync(key)
  },
	fetchAll: (project) => {
    return client.sortAsync(getKey(project, 'userindex'), 'by', '*->email ALPHA')
      .then(keys => {
        console.log('KEYS', keys);
        return execMulti(keys.map(key => ['hgetall', [key]]))
      })
      .catch(err => console.err(`REDIS ERROR: ${err}`))
  }
}

const model = {
  updateAvailability: ({project, userId, gigId, status}) => {
    return execMulti([
      ['hset', [getKey(project, 'gigs', gigId, 'availability'), userId, status]],
      ['hset', [getKey(project, 'users', userId, 'availability'), gigId, status]],
    ])
  },
  fetchGigAvailability: ({project, gigId}) => {
    return execMulti([
      ['hgetall', [getKey(project, 'gigs', gigId, 'availability')]]
    ])
    .then(([availability]) => availability || {})
  },
  fetchUserAvailability: ({project, userId}) => {
    return execMulti([
      ['hgetall', [getKey(project, 'users', userId, 'availability')]]
    ])
      .then(([availability]) => availability || {})
  }

}

module.exports = {
  gigModel,
  userModel,
  model
};
