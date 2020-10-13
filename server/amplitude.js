const crypto = require('crypto');
const fetch = require('node-fetch');
const config = require('./config');
const pkg = require('../package.json');

const geoip = config.ip_db
  ? require('fxa-geodb')({ dbPath: config.ip_db })
  : () => ({});

function userId(fileId, ownerId) {
  const hash = crypto.createHash('sha256');
  hash.update(fileId);
  hash.update(ownerId);
  return hash.digest('hex').substring(32);
}

function location(ip) {
  try {
    return geoip(ip);
  } catch (e) {
    return {};
  }
}

function statUploadEvent(data) {
  const event = {
    cookie: data.cookie,
    action: `uploaded secure dataset`,
    resource: `${userId(data.id, data.owner)}, valid for ${
      data.dlimit
    } downloads and ${data.timeLimit} seconds`
  };
  return sendBatch(event);
}

function statDownloadEvent(data) {
  const event = {
    cookie: data.cookie,
    action: `downloaded secure dataset`,
    resource: `${userId(data.id, data.owner)}, which is download #${
      data.download_count
    } and expires in ${data.ttl / 1000} seconds`
  };
  return sendBatch(event);
}

function statDeleteEvent(data) {
  const event = {
    cookie: data.cookie,
    action: `deleted secure dataset`,
    resource: `${userId(data.id, data.owner)} after ${
      data.download_count
    } downloads and with ${data.ttl / 1000} seconds left`
  };
  return sendBatch(event);
}

function clientEvent(event, ua, language, session_id, deltaT, platform, ip) {
  const loc = location(ip);
  const ep = event.event_properties || {};
  const up = event.user_properties || {};
  const event_properties = {
    browser: ua.browser.name,
    browser_version: ua.browser.version,
    status: ep.status,

    age: ep.age,
    downloaded: ep.downloaded,
    download_limit: ep.download_limit,
    duration: ep.duration,
    entrypoint: ep.entrypoint,
    file_count: ep.file_count,
    password_protected: ep.password_protected,
    referrer: ep.referrer,
    size: ep.size,
    time_limit: ep.time_limit,
    trigger: ep.trigger,
    ttl: ep.ttl,
    utm_campaign: ep.utm_campaign,
    utm_content: ep.utm_content,
    utm_medium: ep.utm_medium,
    utm_source: ep.utm_source,
    utm_term: ep.utm_term,
    experiment: ep.experiment,
    variant: ep.variant
  };
  const user_properties = {
    active_count: up.active_count,
    anonymous: up.anonymous,
    experiments: up.experiments,
    first_action: up.first_action
  };
  return {
    app_version: pkg.version,
    country: loc.country,
    device_id: event.device_id,
    event_properties,
    event_type: event.event_type,
    language,
    os_name: ua.os.name,
    os_version: ua.os.version,
    platform,
    region: loc.state,
    session_id,
    time: event.time + deltaT,
    user_id: event.user_id,
    user_properties
  };
}

async function sendBatch(event) {
  try {
    const result = await fetch(config.logging_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: event.cookie
      },
      body: JSON.stringify({
        action: event.action,
        resource: event.resource
      })
    });
    console.log({
      action: event.action,
      resource: event.resource
    });
    return result.status;
  } catch (e) {
    console.log(e);
    return 500;
  }
}

module.exports = {
  statUploadEvent,
  statDownloadEvent,
  statDeleteEvent,
  clientEvent
};
