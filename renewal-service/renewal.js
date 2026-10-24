'use strict';
var DAY = 86400000;
function parseRemaining(response) {
  if (!response || response.result !== 'success' || typeof response.errorMsg !== 'string') return null;
  var m = /^(\d{1,6}):([0-5]\d):([0-5]\d)$/.exec(response.errorMsg);
  return m ? Number(m[1])*3600 + Number(m[2])*60 + Number(m[3]) : null;
}
function validToken(value) {
  return typeof value === 'string' && /^[a-zA-Z0-9]{1,4096}$/.test(value);
}
// One owner per state file. No global timers or application/remote-control actions.
function createRenewal(io, options) {
  options = options || {};
  var running = null;
  function attempt() {
    if (!options.enabled) return Promise.resolve({status:'disabled'});
    var state, now = io.now(), token, failures, retryDelay, result;
    return Promise.resolve().then(function() {
      return io.load();
    }).catch(function() {
      return Promise.reject({status:'storage-error'});
    }).then(function(loaded) {
      state = loaded || {};
      if (typeof state.nextAt === 'number' && now < state.nextAt) {
        return Promise.reject({status:'cooldown', nextAt:state.nextAt});
      }
      return Promise.resolve().then(function() {
        return io.readToken();
      }).catch(function() {
        return '';
      });
    }).then(function(read) {
      token = read;
      if (!validToken(token)) return Promise.reject({status:'unavailable'});
      failures = Math.min(Math.max(Number(state.failures)||0, 0), 3);
      retryDelay = [15*60000, 60*60000, 6*3600000, DAY][failures];
      result = {status:'retry', checkedAt:now, nextAt:now+retryDelay, failures:failures+1};
      return Promise.resolve().then(function() {
        return io.save(result);
      }).catch(function() {
        return Promise.reject({status:'storage-error'});
      });
    }).then(function() {
      var before = null;
      return Promise.resolve().then(function() {
        return io.request('check', token);
      }).then(function(checkRes) {
        before = parseRemaining(checkRes);
        if (before === null) {
          result.status = 'unverified';
          return;
        }
        if (before === 0) {
          result.status = 'expired';
          result.nextAt = now + DAY;
          return;
        }
        if (before > 7 * 86400) {
          result = {status:'healthy', remainingSeconds:before, checkedAt:now, nextAt:now+DAY, failures:0};
          return;
        }
        return Promise.resolve().then(function() {
          return io.readToken();
        }).then(function(currentToken) {
          if (currentToken !== token) {
            result.status = 'session-changed';
            return;
          }
          return Promise.resolve().then(function() {
            return io.request('reset', token);
          }).then(function(resetRes) {
            if (!resetRes || resetRes.result !== 'success') {
              result.status = 'unverified';
              return;
            }
            return Promise.resolve().then(function() {
              return io.readToken();
            }).then(function(currentToken2) {
              if (currentToken2 !== token) {
                result.status = 'session-changed';
                return;
              }
              return Promise.resolve().then(function() {
                return io.request('check', token);
              }).then(function(afterRes) {
                var after = parseRemaining(afterRes);
                if (after !== null && after > before + 60) {
                  result = {status:'renewed', remainingSeconds:after, checkedAt:now, nextAt:now+DAY, failures:0};
                } else {
                  result.status = 'unverified';
                }
              });
            });
          });
        });
      }).catch(function() {
        result.status = 'retry';
      });
    }).then(function() {
      return Promise.resolve().then(function() {
        return io.save(result);
      }).catch(function() {
        return {status:'storage-error'};
      }).then(function() {
        return result;
      });
    }).catch(function(err) {
      if (err && typeof err.status === 'string') return err;
      return {status:'internal-error'};
    });
  }
  return {run:function () {
    if (!running) running = attempt().then(function(value) {running=null; return value;},function() {running=null; return {status:'internal-error'};});
    return running;
  }};
}
module.exports = {createRenewal:createRenewal,parseRemaining:parseRemaining,validToken:validToken};
