/**
 * Based heavily on https://github.com/webpack/webpack/blob/
 *  c0afdf9c6abc1dd70707c594e473802a566f7b6e/hot/only-dev-server.js
 * Original copyright Tobias Koppers @sokra (MIT license)
 */

/* global window __webpack_hash__ */

if (!module.hot) {
  throw new Error("[HMR] Hot Module Replacement is disabled.");
}

var lastHash;
var failureStatuses = { abort: 1, fail: 1 };
var applyOptions = { ignoreUnaccepted: true };

function upToDate(hash) {
  if (hash) lastHash = hash;
  return lastHash == __webpack_hash__;
}

module.exports = function(hash, moduleMap, reload) {
  if (!upToDate(hash) && module.hot.status() == "idle") {
    console.log("[HMR] Checking for updates on the server...");
    check();
  }

  function check() {
    module.hot.check(function(err, updatedModules) {
      if (err) return handleError(err);

      if(!updatedModules) {
        console.warn("[HMR] Cannot find update (Full reload needed)");
        console.warn("[HMR] (Probably because of restarting the server)");
        performReload();
        return null;
      }

      module.hot.apply(applyOptions, function(applyErr, renewedModules) {
        if (applyErr) return handleError(applyErr);

        if (!upToDate()) check();

        logUpdates(updatedModules, renewedModules);
      });
    });
  }

  function logUpdates(updatedModules, renewedModules) {
    var unacceptedModules = updatedModules.filter(function(moduleId) {
      return renewedModules && renewedModules.indexOf(moduleId) < 0;
    });

    if(unacceptedModules.length > 0) {
      console.warn(
        "[HMR] The following modules couldn't be hot updated: " +
        "(Full reload needed)"
      );
      unacceptedModules.forEach(function(moduleId) {
        console.warn("[HMR]  - " + moduleMap[moduleId]);
      });
      performReload();
      return;
    }

    if(!renewedModules || renewedModules.length === 0) {
      console.log("[HMR] Nothing hot updated.");
    } else {
      console.log("[HMR] Updated modules:");
      renewedModules.forEach(function(moduleId) {
        console.log("[HMR]  - " + moduleMap[moduleId]);
      });
    }

    if (upToDate()) {
      console.log("[HMR] App is up to date.");
    }
  }

  function handleError(err) {
    if (module.hot.status() in failureStatuses) {
      console.warn("[HMR] Cannot check for update (Full reload needed)");
      console.warn("[HMR] " + err.stack || err.message);
      performReload();
      return;
    }
    console.warn("[HMR] Update check failed: " + err.stack || err.message);
  }

  function performReload() {
    console.warn("[HMR] Reloading page");
    if (reload) window.location.reload();
  }
};
