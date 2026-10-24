"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = function(cb, mod) {
  return function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
};

// ../../../private/tmp/test-ws/node_modules/ultron/index.js
var require_ultron = __commonJS({
  "../../../private/tmp/test-ws/node_modules/ultron/index.js": function(exports2, module2) {
    "use strict";
    var has = Object.prototype.hasOwnProperty;
    var id = 0;
    function Ultron(ee) {
      if (!(this instanceof Ultron)) return new Ultron(ee);
      this.id = id++;
      this.ee = ee;
    }
    Ultron.prototype.on = function on(event, fn, context) {
      fn.__ultron = this.id;
      this.ee.on(event, fn, context);
      return this;
    };
    Ultron.prototype.once = function once(event, fn, context) {
      fn.__ultron = this.id;
      this.ee.once(event, fn, context);
      return this;
    };
    Ultron.prototype.remove = function remove() {
      var args = arguments, event;
      if (args.length === 1 && "string" === typeof args[0]) {
        args = args[0].split(/[, ]+/);
      } else if (!args.length) {
        args = [];
        for (event in this.ee._events) {
          if (has.call(this.ee._events, event)) args.push(event);
        }
      }
      for (var i = 0; i < args.length; i++) {
        var listeners = this.ee.listeners(args[i]);
        for (var j = 0; j < listeners.length; j++) {
          event = listeners[j];
          if (event.listener) {
            if (event.listener.__ultron !== this.id) continue;
            delete event.listener.__ultron;
          } else {
            if (event.__ultron !== this.id) continue;
            delete event.__ultron;
          }
          this.ee.removeListener(args[i], event);
        }
      }
      return this;
    };
    Ultron.prototype.destroy = function destroy() {
      if (!this.ee) return false;
      this.remove();
      this.ee = null;
      return true;
    };
    module2.exports = Ultron;
  }
});

// ../../../private/tmp/test-ws/node_modules/options/lib/options.js
var require_options = __commonJS({
  "../../../private/tmp/test-ws/node_modules/options/lib/options.js": function(exports2, module2) {
    var fs = require("fs");
    function Options(defaults) {
      var internalValues = {};
      var values = this.value = {};
      Object.keys(defaults).forEach(function(key) {
        internalValues[key] = defaults[key];
        Object.defineProperty(values, key, {
          get: function() {
            return internalValues[key];
          },
          configurable: false,
          enumerable: true
        });
      });
      this.reset = function() {
        Object.keys(defaults).forEach(function(key) {
          internalValues[key] = defaults[key];
        });
        return this;
      };
      this.merge = function(options, required) {
        options = options || {};
        if (Object.prototype.toString.call(required) === "[object Array]") {
          var missing = [];
          for (var i = 0, l = required.length; i < l; ++i) {
            var key = required[i];
            if (!(key in options)) {
              missing.push(key);
            }
          }
          if (missing.length > 0) {
            if (missing.length > 1) {
              throw new Error("options " + missing.slice(0, missing.length - 1).join(", ") + " and " + missing[missing.length - 1] + " must be defined");
            } else throw new Error("option " + missing[0] + " must be defined");
          }
        }
        Object.keys(options).forEach(function(key2) {
          if (key2 in internalValues) {
            internalValues[key2] = options[key2];
          }
        });
        return this;
      };
      this.copy = function(keys) {
        var obj = {};
        Object.keys(defaults).forEach(function(key) {
          if (keys.indexOf(key) !== -1) {
            obj[key] = values[key];
          }
        });
        return obj;
      };
      this.read = function(filename, cb) {
        if (typeof cb == "function") {
          var self = this;
          fs.readFile(filename, function(error, data) {
            if (error) return cb(error);
            var conf2 = JSON.parse(data);
            self.merge(conf2);
            cb();
          });
        } else {
          var conf = JSON.parse(fs.readFileSync(filename));
          this.merge(conf);
        }
        return this;
      };
      this.isDefined = function(key) {
        return typeof values[key] != "undefined";
      };
      this.isDefinedAndNonNull = function(key) {
        return typeof values[key] != "undefined" && values[key] !== null;
      };
      Object.freeze(values);
      Object.freeze(this);
    }
    module2.exports = Options;
  }
});

// ../../../private/tmp/test-ws/node_modules/ws/lib/ErrorCodes.js
var require_ErrorCodes = __commonJS({
  "../../../private/tmp/test-ws/node_modules/ws/lib/ErrorCodes.js": function(exports2, module2) {
    module2.exports = {
      isValidErrorCode: function(code) {
        return code >= 1e3 && code <= 1011 && code != 1004 && code != 1005 && code != 1006 || code >= 3e3 && code <= 4999;
      },
      1e3: "normal",
      1001: "going away",
      1002: "protocol error",
      1003: "unsupported data",
      1004: "reserved",
      1005: "reserved for extensions",
      1006: "reserved for extensions",
      1007: "inconsistent or invalid data",
      1008: "policy violation",
      1009: "message too big",
      1010: "extension handshake missing",
      1011: "an unexpected condition prevented the request from being fulfilled"
    };
  }
});

// ../../../private/tmp/test-ws/node_modules/ws/lib/BufferUtil.fallback.js
var require_BufferUtil_fallback = __commonJS({
  "../../../private/tmp/test-ws/node_modules/ws/lib/BufferUtil.fallback.js": function(exports2) {
    exports2.BufferUtil = {
      merge: function(mergedBuffer, buffers) {
        var offset = 0;
        for (var i = 0, l = buffers.length; i < l; ++i) {
          var buf = buffers[i];
          buf.copy(mergedBuffer, offset);
          offset += buf.length;
        }
      },
      mask: function(source, mask, output, offset, length) {
        var maskNum = mask.readUInt32LE(0, true);
        var i = 0;
        for (; i < length - 3; i += 4) {
          var num = maskNum ^ source.readUInt32LE(i, true);
          if (num < 0) num = 4294967296 + num;
          output.writeUInt32LE(num, offset + i, true);
        }
        switch (length % 4) {
          case 3:
            output[offset + i + 2] = source[i + 2] ^ mask[2];
          case 2:
            output[offset + i + 1] = source[i + 1] ^ mask[1];
          case 1:
            output[offset + i] = source[i] ^ mask[0];
          case 0:
            ;
        }
      },
      unmask: function(data, mask) {
        var maskNum = mask.readUInt32LE(0, true);
        var length = data.length;
        var i = 0;
        for (; i < length - 3; i += 4) {
          var num = maskNum ^ data.readUInt32LE(i, true);
          if (num < 0) num = 4294967296 + num;
          data.writeUInt32LE(num, i, true);
        }
        switch (length % 4) {
          case 3:
            data[i + 2] = data[i + 2] ^ mask[2];
          case 2:
            data[i + 1] = data[i + 1] ^ mask[1];
          case 1:
            data[i] = data[i] ^ mask[0];
          case 0:
            ;
        }
      }
    };
  }
});

// ../../../private/tmp/test-ws/node_modules/ws/lib/BufferUtil.js
var require_BufferUtil = __commonJS({
  "../../../private/tmp/test-ws/node_modules/ws/lib/BufferUtil.js": function(exports2, module2) {
    "use strict";
    var bufferUtil;
    try {
      bufferUtil = require("bufferutil");
    } catch (e) {
      bufferUtil = require_BufferUtil_fallback();
    }
    module2.exports = bufferUtil.BufferUtil || bufferUtil;
  }
});

// ../../../private/tmp/test-ws/node_modules/ws/lib/PerMessageDeflate.js
var require_PerMessageDeflate = __commonJS({
  "../../../private/tmp/test-ws/node_modules/ws/lib/PerMessageDeflate.js": function(exports2, module2) {
    var zlib = require("zlib");
    var AVAILABLE_WINDOW_BITS = [8, 9, 10, 11, 12, 13, 14, 15];
    var DEFAULT_WINDOW_BITS = 15;
    var DEFAULT_MEM_LEVEL = 8;
    PerMessageDeflate.extensionName = "permessage-deflate";
    function PerMessageDeflate(options, isServer, maxPayload) {
      if (this instanceof PerMessageDeflate === false) {
        throw new TypeError("Classes can't be function-called");
      }
      this._options = options || {};
      this._isServer = !!isServer;
      this._inflate = null;
      this._deflate = null;
      this.params = null;
      this._maxPayload = maxPayload || 0;
    }
    PerMessageDeflate.prototype.offer = function() {
      var params = {};
      if (this._options.serverNoContextTakeover) {
        params.server_no_context_takeover = true;
      }
      if (this._options.clientNoContextTakeover) {
        params.client_no_context_takeover = true;
      }
      if (this._options.serverMaxWindowBits) {
        params.server_max_window_bits = this._options.serverMaxWindowBits;
      }
      if (this._options.clientMaxWindowBits) {
        params.client_max_window_bits = this._options.clientMaxWindowBits;
      } else if (this._options.clientMaxWindowBits == null) {
        params.client_max_window_bits = true;
      }
      return params;
    };
    PerMessageDeflate.prototype.accept = function(paramsList) {
      paramsList = this.normalizeParams(paramsList);
      var params;
      if (this._isServer) {
        params = this.acceptAsServer(paramsList);
      } else {
        params = this.acceptAsClient(paramsList);
      }
      this.params = params;
      return params;
    };
    PerMessageDeflate.prototype.cleanup = function() {
      if (this._inflate) {
        if (this._inflate.writeInProgress) {
          this._inflate.pendingClose = true;
        } else {
          if (this._inflate.close) this._inflate.close();
          this._inflate = null;
        }
      }
      if (this._deflate) {
        if (this._deflate.writeInProgress) {
          this._deflate.pendingClose = true;
        } else {
          if (this._deflate.close) this._deflate.close();
          this._deflate = null;
        }
      }
    };
    PerMessageDeflate.prototype.acceptAsServer = function(paramsList) {
      var accepted = {};
      var result = paramsList.some(function(params) {
        accepted = {};
        if (this._options.serverNoContextTakeover === false && params.server_no_context_takeover) {
          return;
        }
        if (this._options.serverMaxWindowBits === false && params.server_max_window_bits) {
          return;
        }
        if (typeof this._options.serverMaxWindowBits === "number" && typeof params.server_max_window_bits === "number" && this._options.serverMaxWindowBits > params.server_max_window_bits) {
          return;
        }
        if (typeof this._options.clientMaxWindowBits === "number" && !params.client_max_window_bits) {
          return;
        }
        if (this._options.serverNoContextTakeover || params.server_no_context_takeover) {
          accepted.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          accepted.client_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover !== false && params.client_no_context_takeover) {
          accepted.client_no_context_takeover = true;
        }
        if (typeof this._options.serverMaxWindowBits === "number") {
          accepted.server_max_window_bits = this._options.serverMaxWindowBits;
        } else if (typeof params.server_max_window_bits === "number") {
          accepted.server_max_window_bits = params.server_max_window_bits;
        }
        if (typeof this._options.clientMaxWindowBits === "number") {
          accepted.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits !== false && typeof params.client_max_window_bits === "number") {
          accepted.client_max_window_bits = params.client_max_window_bits;
        }
        return true;
      }, this);
      if (!result) {
        throw new Error("Doesn't support the offered configuration");
      }
      return accepted;
    };
    PerMessageDeflate.prototype.acceptAsClient = function(paramsList) {
      var params = paramsList[0];
      if (this._options.clientNoContextTakeover != null) {
        if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
          throw new Error('Invalid value for "client_no_context_takeover"');
        }
      }
      if (this._options.clientMaxWindowBits != null) {
        if (this._options.clientMaxWindowBits === false && params.client_max_window_bits) {
          throw new Error('Invalid value for "client_max_window_bits"');
        }
        if (typeof this._options.clientMaxWindowBits === "number" && (!params.client_max_window_bits || params.client_max_window_bits > this._options.clientMaxWindowBits)) {
          throw new Error('Invalid value for "client_max_window_bits"');
        }
      }
      return params;
    };
    PerMessageDeflate.prototype.normalizeParams = function(paramsList) {
      return paramsList.map(function(params) {
        Object.keys(params).forEach(function(key) {
          var value = params[key];
          if (value.length > 1) {
            throw new Error("Multiple extension parameters for " + key);
          }
          value = value[0];
          switch (key) {
            case "server_no_context_takeover":
            case "client_no_context_takeover":
              if (value !== true) {
                throw new Error("invalid extension parameter value for " + key + " (" + value + ")");
              }
              params[key] = true;
              break;
            case "server_max_window_bits":
            case "client_max_window_bits":
              if (typeof value === "string") {
                value = parseInt(value, 10);
                if (!~AVAILABLE_WINDOW_BITS.indexOf(value)) {
                  throw new Error("invalid extension parameter value for " + key + " (" + value + ")");
                }
              }
              if (!this._isServer && value === true) {
                throw new Error("Missing extension parameter value for " + key);
              }
              params[key] = value;
              break;
            default:
              throw new Error("Not defined extension parameter (" + key + ")");
          }
        }, this);
        return params;
      }, this);
    };
    PerMessageDeflate.prototype.decompress = function(data, fin, callback) {
      var endpoint = this._isServer ? "client" : "server";
      if (!this._inflate) {
        var maxWindowBits = this.params[endpoint + "_max_window_bits"];
        this._inflate = zlib.createInflateRaw({
          windowBits: "number" === typeof maxWindowBits ? maxWindowBits : DEFAULT_WINDOW_BITS
        });
      }
      this._inflate.writeInProgress = true;
      var self = this;
      var buffers = [];
      var cumulativeBufferLength = 0;
      this._inflate.on("error", onError).on("data", onData);
      this._inflate.write(data);
      if (fin) {
        this._inflate.write(new Buffer([0, 0, 255, 255]));
      }
      this._inflate.flush(function() {
        cleanup();
        callback(null, Buffer.concat(buffers));
      });
      function onError(err) {
        cleanup();
        callback(err);
      }
      function onData(data2) {
        if (self._maxPayload !== void 0 && self._maxPayload !== null && self._maxPayload > 0) {
          cumulativeBufferLength += data2.length;
          if (cumulativeBufferLength > self._maxPayload) {
            buffers = [];
            cleanup();
            var err = { type: 1009 };
            callback(err);
            return;
          }
        }
        buffers.push(data2);
      }
      function cleanup() {
        if (!self._inflate) return;
        self._inflate.removeListener("error", onError);
        self._inflate.removeListener("data", onData);
        self._inflate.writeInProgress = false;
        if (fin && self.params[endpoint + "_no_context_takeover"] || self._inflate.pendingClose) {
          if (self._inflate.close) self._inflate.close();
          self._inflate = null;
        }
      }
    };
    PerMessageDeflate.prototype.compress = function(data, fin, callback) {
      var endpoint = this._isServer ? "server" : "client";
      if (!this._deflate) {
        var maxWindowBits = this.params[endpoint + "_max_window_bits"];
        this._deflate = zlib.createDeflateRaw({
          flush: zlib.Z_SYNC_FLUSH,
          windowBits: "number" === typeof maxWindowBits ? maxWindowBits : DEFAULT_WINDOW_BITS,
          memLevel: this._options.memLevel || DEFAULT_MEM_LEVEL
        });
      }
      this._deflate.writeInProgress = true;
      var self = this;
      var buffers = [];
      this._deflate.on("error", onError).on("data", onData);
      this._deflate.write(data);
      this._deflate.flush(function() {
        cleanup();
        var data2 = Buffer.concat(buffers);
        if (fin) {
          data2 = data2.slice(0, data2.length - 4);
        }
        callback(null, data2);
      });
      function onError(err) {
        cleanup();
        callback(err);
      }
      function onData(data2) {
        buffers.push(data2);
      }
      function cleanup() {
        if (!self._deflate) return;
        self._deflate.removeListener("error", onError);
        self._deflate.removeListener("data", onData);
        self._deflate.writeInProgress = false;
        if (fin && self.params[endpoint + "_no_context_takeover"] || self._deflate.pendingClose) {
          if (self._deflate.close) self._deflate.close();
          self._deflate = null;
        }
      }
    };
    module2.exports = PerMessageDeflate;
  }
});

// ../../../private/tmp/test-ws/node_modules/ws/lib/Sender.js
var require_Sender = __commonJS({
  "../../../private/tmp/test-ws/node_modules/ws/lib/Sender.js": function(exports2, module2) {
    var events = require("events");
    var util = require("util");
    var crypto = require("crypto");
    var EventEmitter = events.EventEmitter;
    var ErrorCodes = require_ErrorCodes();
    var bufferUtil = require_BufferUtil();
    var PerMessageDeflate = require_PerMessageDeflate();
    function Sender(socket, extensions) {
      if (this instanceof Sender === false) {
        throw new TypeError("Classes can't be function-called");
      }
      events.EventEmitter.call(this);
      this._socket = socket;
      this.extensions = extensions || {};
      this.firstFragment = true;
      this.compress = false;
      this.messageHandlers = [];
      this.processing = false;
    }
    util.inherits(Sender, events.EventEmitter);
    Sender.prototype.close = function(code, data, mask, cb) {
      if (typeof code !== "undefined") {
        if (typeof code !== "number" || !ErrorCodes.isValidErrorCode(code)) throw new Error("first argument must be a valid error code number");
      }
      code = code || 1e3;
      var dataBuffer = new Buffer(2 + (data ? Buffer.byteLength(data) : 0));
      writeUInt16BE.call(dataBuffer, code, 0);
      if (dataBuffer.length > 2) dataBuffer.write(data, 2);
      var self = this;
      this.messageHandlers.push(function() {
        self.frameAndSend(8, dataBuffer, true, mask);
        if (typeof cb == "function") cb();
      });
      this.flush();
    };
    Sender.prototype.ping = function(data, options) {
      var mask = options && options.mask;
      var self = this;
      this.messageHandlers.push(function() {
        self.frameAndSend(9, data || "", true, mask);
      });
      this.flush();
    };
    Sender.prototype.pong = function(data, options) {
      var mask = options && options.mask;
      var self = this;
      this.messageHandlers.push(function() {
        self.frameAndSend(10, data || "", true, mask);
      });
      this.flush();
    };
    Sender.prototype.send = function(data, options, cb) {
      var finalFragment = options && options.fin === false ? false : true;
      var mask = options && options.mask;
      var compress = options && options.compress;
      var opcode = options && options.binary ? 2 : 1;
      if (this.firstFragment === false) {
        opcode = 0;
        compress = false;
      } else {
        this.firstFragment = false;
        this.compress = compress;
      }
      if (finalFragment) this.firstFragment = true;
      var compressFragment = this.compress;
      var self = this;
      this.messageHandlers.push(function() {
        if (!data || !compressFragment) {
          self.frameAndSend(opcode, data, finalFragment, mask, compress, cb);
          return;
        }
        self.processing = true;
        self.applyExtensions(data, finalFragment, compressFragment, function(err, data2) {
          if (err) {
            if (typeof cb == "function") cb(err);
            else self.emit("error", err);
            return;
          }
          self.frameAndSend(opcode, data2, finalFragment, mask, compress, cb);
          self.processing = false;
          self.flush();
        });
      });
      this.flush();
    };
    Sender.prototype.frameAndSend = function(opcode, data, finalFragment, maskData, compressed, cb) {
      var canModifyData = false;
      if (!data) {
        try {
          this._socket.write(new Buffer([opcode | (finalFragment ? 128 : 0), 0 | (maskData ? 128 : 0)].concat(maskData ? [0, 0, 0, 0] : [])), "binary", cb);
        } catch (e) {
          if (typeof cb == "function") cb(e);
          else this.emit("error", e);
        }
        return;
      }
      if (!Buffer.isBuffer(data)) {
        canModifyData = true;
        if (data && (typeof data.byteLength !== "undefined" || typeof data.buffer !== "undefined")) {
          data = getArrayBuffer(data);
        } else {
          if (typeof data === "number") data = data.toString();
          data = new Buffer(data);
        }
      }
      var dataLength = data.length, dataOffset = maskData ? 6 : 2, secondByte = dataLength;
      if (dataLength >= 65536) {
        dataOffset += 8;
        secondByte = 127;
      } else if (dataLength > 125) {
        dataOffset += 2;
        secondByte = 126;
      }
      var mergeBuffers = dataLength < 32768 || maskData && !canModifyData;
      var totalLength = mergeBuffers ? dataLength + dataOffset : dataOffset;
      var outputBuffer = new Buffer(totalLength);
      outputBuffer[0] = finalFragment ? opcode | 128 : opcode;
      if (compressed) outputBuffer[0] |= 64;
      switch (secondByte) {
        case 126:
          writeUInt16BE.call(outputBuffer, dataLength, 2);
          break;
        case 127:
          writeUInt32BE.call(outputBuffer, 0, 2);
          writeUInt32BE.call(outputBuffer, dataLength, 6);
      }
      if (maskData) {
        outputBuffer[1] = secondByte | 128;
        var mask = getRandomMask();
        outputBuffer[dataOffset - 4] = mask[0];
        outputBuffer[dataOffset - 3] = mask[1];
        outputBuffer[dataOffset - 2] = mask[2];
        outputBuffer[dataOffset - 1] = mask[3];
        if (mergeBuffers) {
          bufferUtil.mask(data, mask, outputBuffer, dataOffset, dataLength);
          try {
            this._socket.write(outputBuffer, "binary", cb);
          } catch (e) {
            if (typeof cb == "function") cb(e);
            else this.emit("error", e);
          }
        } else {
          bufferUtil.mask(data, mask, data, 0, dataLength);
          try {
            this._socket.write(outputBuffer, "binary");
            this._socket.write(data, "binary", cb);
          } catch (e) {
            if (typeof cb == "function") cb(e);
            else this.emit("error", e);
          }
        }
      } else {
        outputBuffer[1] = secondByte;
        if (mergeBuffers) {
          data.copy(outputBuffer, dataOffset);
          try {
            this._socket.write(outputBuffer, "binary", cb);
          } catch (e) {
            if (typeof cb == "function") cb(e);
            else this.emit("error", e);
          }
        } else {
          try {
            this._socket.write(outputBuffer, "binary");
            this._socket.write(data, "binary", cb);
          } catch (e) {
            if (typeof cb == "function") cb(e);
            else this.emit("error", e);
          }
        }
      }
    };
    Sender.prototype.flush = function() {
      while (!this.processing && this.messageHandlers.length) {
        this.messageHandlers.shift()();
      }
    };
    Sender.prototype.applyExtensions = function(data, fin, compress, callback) {
      if ((data.buffer || data) instanceof ArrayBuffer) {
        data = getArrayBuffer(data);
      }
      this.extensions[PerMessageDeflate.extensionName].compress(data, fin, callback);
    };
    module2.exports = Sender;
    function writeUInt16BE(value, offset) {
      this[offset] = (value & 65280) >> 8;
      this[offset + 1] = value & 255;
    }
    function writeUInt32BE(value, offset) {
      this[offset] = (value & 4278190080) >> 24;
      this[offset + 1] = (value & 16711680) >> 16;
      this[offset + 2] = (value & 65280) >> 8;
      this[offset + 3] = value & 255;
    }
    function getArrayBuffer(data) {
      var array = new Uint8Array(data.buffer || data), l = data.byteLength || data.length, o = data.byteOffset || 0, buffer = new Buffer(l);
      for (var i = 0; i < l; ++i) {
        buffer[i] = array[o + i];
      }
      return buffer;
    }
    function getRandomMask() {
      return crypto.randomBytes(4);
    }
  }
});

// ../../../private/tmp/test-ws/node_modules/ws/lib/Validation.fallback.js
var require_Validation_fallback = __commonJS({
  "../../../private/tmp/test-ws/node_modules/ws/lib/Validation.fallback.js": function(exports2) {
    exports2.Validation = {
      isValidUTF8: function(buffer) {
        return true;
      }
    };
  }
});

// ../../../private/tmp/test-ws/node_modules/ws/lib/Validation.js
var require_Validation = __commonJS({
  "../../../private/tmp/test-ws/node_modules/ws/lib/Validation.js": function(exports2, module2) {
    "use strict";
    var isValidUTF8;
    try {
      isValidUTF8 = require("utf-8-validate");
    } catch (e) {
      isValidUTF8 = require_Validation_fallback();
    }
    module2.exports = typeof isValidUTF8 === "object" ? isValidUTF8.Validation.isValidUTF8 : isValidUTF8;
  }
});

// ../../../private/tmp/test-ws/node_modules/ws/lib/BufferPool.js
var require_BufferPool = __commonJS({
  "../../../private/tmp/test-ws/node_modules/ws/lib/BufferPool.js": function(exports2, module2) {
    var util = require("util");
    function BufferPool(initialSize, growStrategy, shrinkStrategy) {
      if (this instanceof BufferPool === false) {
        throw new TypeError("Classes can't be function-called");
      }
      if (typeof initialSize === "function") {
        shrinkStrategy = growStrategy;
        growStrategy = initialSize;
        initialSize = 0;
      } else if (typeof initialSize === "undefined") {
        initialSize = 0;
      }
      this._growStrategy = (growStrategy || function(db, size) {
        return db.used + size;
      }).bind(null, this);
      this._shrinkStrategy = (shrinkStrategy || function(db) {
        return initialSize;
      }).bind(null, this);
      this._buffer = initialSize ? new Buffer(initialSize) : null;
      this._offset = 0;
      this._used = 0;
      this._changeFactor = 0;
      this.__defineGetter__("size", function() {
        return this._buffer == null ? 0 : this._buffer.length;
      });
      this.__defineGetter__("used", function() {
        return this._used;
      });
    }
    BufferPool.prototype.get = function(length) {
      if (this._buffer == null || this._offset + length > this._buffer.length) {
        var newBuf = new Buffer(this._growStrategy(length));
        this._buffer = newBuf;
        this._offset = 0;
      }
      this._used += length;
      var buf = this._buffer.slice(this._offset, this._offset + length);
      this._offset += length;
      return buf;
    };
    BufferPool.prototype.reset = function(forceNewBuffer) {
      var len = this._shrinkStrategy();
      if (len < this.size) this._changeFactor -= 1;
      if (forceNewBuffer || this._changeFactor < -2) {
        this._changeFactor = 0;
        this._buffer = len ? new Buffer(len) : null;
      }
      this._offset = 0;
      this._used = 0;
    };
    module2.exports = BufferPool;
  }
});

// ../../../private/tmp/test-ws/node_modules/ws/lib/Receiver.js
var require_Receiver = __commonJS({
  "../../../private/tmp/test-ws/node_modules/ws/lib/Receiver.js": function(exports2, module2) {
    var util = require("util");
    var isValidUTF8 = require_Validation();
    var ErrorCodes = require_ErrorCodes();
    var BufferPool = require_BufferPool();
    var bufferUtil = require_BufferUtil();
    var PerMessageDeflate = require_PerMessageDeflate();
    function Receiver(extensions, maxPayload) {
      if (this instanceof Receiver === false) {
        throw new TypeError("Classes can't be function-called");
      }
      if (typeof extensions === "number") {
        maxPayload = extensions;
        extensions = {};
      }
      var fragmentedPoolPrevUsed = -1;
      this.fragmentedBufferPool = new BufferPool(1024, function(db, length) {
        return db.used + length;
      }, function(db) {
        return fragmentedPoolPrevUsed = fragmentedPoolPrevUsed >= 0 ? Math.ceil((fragmentedPoolPrevUsed + db.used) / 2) : db.used;
      });
      var unfragmentedPoolPrevUsed = -1;
      this.unfragmentedBufferPool = new BufferPool(1024, function(db, length) {
        return db.used + length;
      }, function(db) {
        return unfragmentedPoolPrevUsed = unfragmentedPoolPrevUsed >= 0 ? Math.ceil((unfragmentedPoolPrevUsed + db.used) / 2) : db.used;
      });
      this.extensions = extensions || {};
      this.maxPayload = maxPayload || 0;
      this.currentPayloadLength = 0;
      this.state = {
        activeFragmentedOperation: null,
        lastFragment: false,
        masked: false,
        opcode: 0,
        fragmentedOperation: false
      };
      this.overflow = [];
      this.headerBuffer = new Buffer(10);
      this.expectOffset = 0;
      this.expectBuffer = null;
      this.expectHandler = null;
      this.currentMessage = [];
      this.currentMessageLength = 0;
      this.messageHandlers = [];
      this.expectHeader(2, this.processPacket);
      this.dead = false;
      this.processing = false;
      this.onerror = function() {
      };
      this.ontext = function() {
      };
      this.onbinary = function() {
      };
      this.onclose = function() {
      };
      this.onping = function() {
      };
      this.onpong = function() {
      };
    }
    module2.exports = Receiver;
    Receiver.prototype.add = function(data) {
      if (this.dead) return;
      var dataLength = data.length;
      if (dataLength == 0) return;
      if (this.expectBuffer == null) {
        this.overflow.push(data);
        return;
      }
      var toRead = Math.min(dataLength, this.expectBuffer.length - this.expectOffset);
      fastCopy(toRead, data, this.expectBuffer, this.expectOffset);
      this.expectOffset += toRead;
      if (toRead < dataLength) {
        this.overflow.push(data.slice(toRead));
      }
      while (this.expectBuffer && this.expectOffset == this.expectBuffer.length) {
        var bufferForHandler = this.expectBuffer;
        this.expectBuffer = null;
        this.expectOffset = 0;
        this.expectHandler.call(this, bufferForHandler);
      }
    };
    Receiver.prototype.cleanup = function() {
      this.dead = true;
      this.overflow = null;
      this.headerBuffer = null;
      this.expectBuffer = null;
      this.expectHandler = null;
      this.unfragmentedBufferPool = null;
      this.fragmentedBufferPool = null;
      this.state = null;
      this.currentMessage = null;
      this.onerror = null;
      this.ontext = null;
      this.onbinary = null;
      this.onclose = null;
      this.onping = null;
      this.onpong = null;
    };
    Receiver.prototype.expectHeader = function(length, handler) {
      if (length == 0) {
        handler(null);
        return;
      }
      this.expectBuffer = this.headerBuffer.slice(this.expectOffset, this.expectOffset + length);
      this.expectHandler = handler;
      var toRead = length;
      while (toRead > 0 && this.overflow.length > 0) {
        var fromOverflow = this.overflow.pop();
        if (toRead < fromOverflow.length) this.overflow.push(fromOverflow.slice(toRead));
        var read = Math.min(fromOverflow.length, toRead);
        fastCopy(read, fromOverflow, this.expectBuffer, this.expectOffset);
        this.expectOffset += read;
        toRead -= read;
      }
    };
    Receiver.prototype.expectData = function(length, handler) {
      if (length == 0) {
        handler(null);
        return;
      }
      this.expectBuffer = this.allocateFromPool(length, this.state.fragmentedOperation);
      this.expectHandler = handler;
      var toRead = length;
      while (toRead > 0 && this.overflow.length > 0) {
        var fromOverflow = this.overflow.pop();
        if (toRead < fromOverflow.length) this.overflow.push(fromOverflow.slice(toRead));
        var read = Math.min(fromOverflow.length, toRead);
        fastCopy(read, fromOverflow, this.expectBuffer, this.expectOffset);
        this.expectOffset += read;
        toRead -= read;
      }
    };
    Receiver.prototype.allocateFromPool = function(length, isFragmented) {
      return (isFragmented ? this.fragmentedBufferPool : this.unfragmentedBufferPool).get(length);
    };
    Receiver.prototype.processPacket = function(data) {
      if (this.extensions[PerMessageDeflate.extensionName]) {
        if ((data[0] & 48) != 0) {
          this.error("reserved fields (2, 3) must be empty", 1002);
          return;
        }
      } else {
        if ((data[0] & 112) != 0) {
          this.error("reserved fields must be empty", 1002);
          return;
        }
      }
      this.state.lastFragment = (data[0] & 128) == 128;
      this.state.masked = (data[1] & 128) == 128;
      var compressed = (data[0] & 64) == 64;
      var opcode = data[0] & 15;
      if (opcode === 0) {
        if (compressed) {
          this.error("continuation frame cannot have the Per-message Compressed bits", 1002);
          return;
        }
        this.state.fragmentedOperation = true;
        this.state.opcode = this.state.activeFragmentedOperation;
        if (!(this.state.opcode == 1 || this.state.opcode == 2)) {
          this.error("continuation frame cannot follow current opcode", 1002);
          return;
        }
      } else {
        if (opcode < 3 && this.state.activeFragmentedOperation != null) {
          this.error("data frames after the initial data frame must have opcode 0", 1002);
          return;
        }
        if (opcode >= 8 && compressed) {
          this.error("control frames cannot have the Per-message Compressed bits", 1002);
          return;
        }
        this.state.compressed = compressed;
        this.state.opcode = opcode;
        if (this.state.lastFragment === false) {
          this.state.fragmentedOperation = true;
          this.state.activeFragmentedOperation = opcode;
        } else this.state.fragmentedOperation = false;
      }
      var handler = opcodes[this.state.opcode];
      if (typeof handler == "undefined") this.error("no handler for opcode " + this.state.opcode, 1002);
      else {
        handler.start.call(this, data);
      }
    };
    Receiver.prototype.endPacket = function() {
      if (this.dead) return;
      if (!this.state.fragmentedOperation) this.unfragmentedBufferPool.reset(true);
      else if (this.state.lastFragment) this.fragmentedBufferPool.reset(true);
      this.expectOffset = 0;
      this.expectBuffer = null;
      this.expectHandler = null;
      if (this.state.lastFragment && this.state.opcode === this.state.activeFragmentedOperation) {
        this.state.activeFragmentedOperation = null;
      }
      this.currentPayloadLength = 0;
      this.state.lastFragment = false;
      this.state.opcode = this.state.activeFragmentedOperation != null ? this.state.activeFragmentedOperation : 0;
      this.state.masked = false;
      this.expectHeader(2, this.processPacket);
    };
    Receiver.prototype.reset = function() {
      if (this.dead) return;
      this.state = {
        activeFragmentedOperation: null,
        lastFragment: false,
        masked: false,
        opcode: 0,
        fragmentedOperation: false
      };
      this.fragmentedBufferPool.reset(true);
      this.unfragmentedBufferPool.reset(true);
      this.expectOffset = 0;
      this.expectBuffer = null;
      this.expectHandler = null;
      this.overflow = [];
      this.currentMessage = [];
      this.currentMessageLength = 0;
      this.messageHandlers = [];
      this.currentPayloadLength = 0;
    };
    Receiver.prototype.unmask = function(mask, buf, binary) {
      if (mask != null && buf != null) bufferUtil.unmask(buf, mask);
      if (binary) return buf;
      return buf != null ? buf.toString("utf8") : "";
    };
    Receiver.prototype.error = function(reason, protocolErrorCode) {
      if (this.dead) return;
      this.reset();
      if (typeof reason == "string") {
        this.onerror(new Error(reason), protocolErrorCode);
      } else if (reason.constructor == Error) {
        this.onerror(reason, protocolErrorCode);
      } else {
        this.onerror(new Error("An error occured"), protocolErrorCode);
      }
      return this;
    };
    Receiver.prototype.flush = function() {
      if (this.processing || this.dead) return;
      var handler = this.messageHandlers.shift();
      if (!handler) return;
      this.processing = true;
      var self = this;
      handler(function() {
        self.processing = false;
        self.flush();
      });
    };
    Receiver.prototype.applyExtensions = function(messageBuffer, fin, compressed, callback) {
      var self = this;
      if (compressed) {
        this.extensions[PerMessageDeflate.extensionName].decompress(messageBuffer, fin, function(err, buffer) {
          if (self.dead) return;
          if (err) {
            callback(new Error("invalid compressed data"));
            return;
          }
          callback(null, buffer);
        });
      } else {
        callback(null, messageBuffer);
      }
    };
    Receiver.prototype.maxPayloadExceeded = function(length) {
      if (this.maxPayload === void 0 || this.maxPayload === null || this.maxPayload < 1) {
        return false;
      }
      var fullLength = this.currentPayloadLength + length;
      if (fullLength < this.maxPayload) {
        this.currentPayloadLength = fullLength;
        return false;
      }
      this.error("payload cannot exceed " + this.maxPayload + " bytes", 1009);
      this.messageBuffer = [];
      this.cleanup();
      return true;
    };
    function readUInt16BE(start) {
      return (this[start] << 8) + this[start + 1];
    }
    function readUInt32BE(start) {
      return (this[start] << 24) + (this[start + 1] << 16) + (this[start + 2] << 8) + this[start + 3];
    }
    function fastCopy(length, srcBuffer, dstBuffer, dstOffset) {
      switch (length) {
        default:
          srcBuffer.copy(dstBuffer, dstOffset, 0, length);
          break;
        case 16:
          dstBuffer[dstOffset + 15] = srcBuffer[15];
        case 15:
          dstBuffer[dstOffset + 14] = srcBuffer[14];
        case 14:
          dstBuffer[dstOffset + 13] = srcBuffer[13];
        case 13:
          dstBuffer[dstOffset + 12] = srcBuffer[12];
        case 12:
          dstBuffer[dstOffset + 11] = srcBuffer[11];
        case 11:
          dstBuffer[dstOffset + 10] = srcBuffer[10];
        case 10:
          dstBuffer[dstOffset + 9] = srcBuffer[9];
        case 9:
          dstBuffer[dstOffset + 8] = srcBuffer[8];
        case 8:
          dstBuffer[dstOffset + 7] = srcBuffer[7];
        case 7:
          dstBuffer[dstOffset + 6] = srcBuffer[6];
        case 6:
          dstBuffer[dstOffset + 5] = srcBuffer[5];
        case 5:
          dstBuffer[dstOffset + 4] = srcBuffer[4];
        case 4:
          dstBuffer[dstOffset + 3] = srcBuffer[3];
        case 3:
          dstBuffer[dstOffset + 2] = srcBuffer[2];
        case 2:
          dstBuffer[dstOffset + 1] = srcBuffer[1];
        case 1:
          dstBuffer[dstOffset] = srcBuffer[0];
      }
    }
    function clone(obj) {
      var cloned = {};
      for (var k in obj) {
        if (obj.hasOwnProperty(k)) {
          cloned[k] = obj[k];
        }
      }
      return cloned;
    }
    var opcodes = {
      // text
      "1": {
        start: function(data) {
          var self = this;
          var firstLength = data[1] & 127;
          if (firstLength < 126) {
            if (self.maxPayloadExceeded(firstLength)) {
              self.error("Maximumpayload exceeded in compressed text message. Aborting...", 1009);
              return;
            }
            opcodes["1"].getData.call(self, firstLength);
          } else if (firstLength == 126) {
            self.expectHeader(2, function(data2) {
              var length = readUInt16BE.call(data2, 0);
              if (self.maxPayloadExceeded(length)) {
                self.error("Maximumpayload exceeded in compressed text message. Aborting...", 1009);
                return;
              }
              opcodes["1"].getData.call(self, length);
            });
          } else if (firstLength == 127) {
            self.expectHeader(8, function(data2) {
              if (readUInt32BE.call(data2, 0) != 0) {
                self.error("packets with length spanning more than 32 bit is currently not supported", 1008);
                return;
              }
              var length = readUInt32BE.call(data2, 4);
              if (self.maxPayloadExceeded(length)) {
                self.error("Maximumpayload exceeded in compressed text message. Aborting...", 1009);
                return;
              }
              opcodes["1"].getData.call(self, readUInt32BE.call(data2, 4));
            });
          }
        },
        getData: function(length) {
          var self = this;
          if (self.state.masked) {
            self.expectHeader(4, function(data) {
              var mask = data;
              self.expectData(length, function(data2) {
                opcodes["1"].finish.call(self, mask, data2);
              });
            });
          } else {
            self.expectData(length, function(data) {
              opcodes["1"].finish.call(self, null, data);
            });
          }
        },
        finish: function(mask, data) {
          var self = this;
          var packet = this.unmask(mask, data, true) || new Buffer(0);
          var state = clone(this.state);
          this.messageHandlers.push(function(callback) {
            self.applyExtensions(packet, state.lastFragment, state.compressed, function(err, buffer) {
              if (err) {
                if (err.type === 1009) {
                  return self.error("Maximumpayload exceeded in compressed text message. Aborting...", 1009);
                }
                return self.error(err.message, 1007);
              }
              if (buffer != null) {
                if (self.maxPayload == 0 || self.maxPayload > 0 && self.currentMessageLength + buffer.length < self.maxPayload) {
                  self.currentMessage.push(buffer);
                } else {
                  self.currentMessage = null;
                  self.currentMessage = [];
                  self.currentMessageLength = 0;
                  self.error(new Error("Maximum payload exceeded. maxPayload: " + self.maxPayload), 1009);
                  return;
                }
                self.currentMessageLength += buffer.length;
              }
              if (state.lastFragment) {
                var messageBuffer = Buffer.concat(self.currentMessage);
                self.currentMessage = [];
                self.currentMessageLength = 0;
                if (!isValidUTF8(messageBuffer)) {
                  self.error("invalid utf8 sequence", 1007);
                  return;
                }
                self.ontext(messageBuffer.toString("utf8"), { masked: state.masked, buffer: messageBuffer });
              }
              callback();
            });
          });
          this.flush();
          this.endPacket();
        }
      },
      // binary
      "2": {
        start: function(data) {
          var self = this;
          var firstLength = data[1] & 127;
          if (firstLength < 126) {
            if (self.maxPayloadExceeded(firstLength)) {
              self.error("Max payload exceeded in compressed text message. Aborting...", 1009);
              return;
            }
            opcodes["2"].getData.call(self, firstLength);
          } else if (firstLength == 126) {
            self.expectHeader(2, function(data2) {
              var length = readUInt16BE.call(data2, 0);
              if (self.maxPayloadExceeded(length)) {
                self.error("Max payload exceeded in compressed text message. Aborting...", 1009);
                return;
              }
              opcodes["2"].getData.call(self, length);
            });
          } else if (firstLength == 127) {
            self.expectHeader(8, function(data2) {
              if (readUInt32BE.call(data2, 0) != 0) {
                self.error("packets with length spanning more than 32 bit is currently not supported", 1008);
                return;
              }
              var length = readUInt32BE.call(data2, 4, true);
              if (self.maxPayloadExceeded(length)) {
                self.error("Max payload exceeded in compressed text message. Aborting...", 1009);
                return;
              }
              opcodes["2"].getData.call(self, length);
            });
          }
        },
        getData: function(length) {
          var self = this;
          if (self.state.masked) {
            self.expectHeader(4, function(data) {
              var mask = data;
              self.expectData(length, function(data2) {
                opcodes["2"].finish.call(self, mask, data2);
              });
            });
          } else {
            self.expectData(length, function(data) {
              opcodes["2"].finish.call(self, null, data);
            });
          }
        },
        finish: function(mask, data) {
          var self = this;
          var packet = this.unmask(mask, data, true) || new Buffer(0);
          var state = clone(this.state);
          this.messageHandlers.push(function(callback) {
            self.applyExtensions(packet, state.lastFragment, state.compressed, function(err, buffer) {
              if (err) {
                if (err.type === 1009) {
                  return self.error("Max payload exceeded in compressed binary message. Aborting...", 1009);
                }
                return self.error(err.message, 1007);
              }
              if (buffer != null) {
                if (self.maxPayload == 0 || self.maxPayload > 0 && self.currentMessageLength + buffer.length < self.maxPayload) {
                  self.currentMessage.push(buffer);
                } else {
                  self.currentMessage = null;
                  self.currentMessage = [];
                  self.currentMessageLength = 0;
                  self.error(new Error("Maximum payload exceeded"), 1009);
                  return;
                }
                self.currentMessageLength += buffer.length;
              }
              if (state.lastFragment) {
                var messageBuffer = Buffer.concat(self.currentMessage);
                self.currentMessage = [];
                self.currentMessageLength = 0;
                self.onbinary(messageBuffer, { masked: state.masked, buffer: messageBuffer });
              }
              callback();
            });
          });
          this.flush();
          this.endPacket();
        }
      },
      // close
      "8": {
        start: function(data) {
          var self = this;
          if (self.state.lastFragment == false) {
            self.error("fragmented close is not supported", 1002);
            return;
          }
          var firstLength = data[1] & 127;
          if (firstLength < 126) {
            opcodes["8"].getData.call(self, firstLength);
          } else {
            self.error("control frames cannot have more than 125 bytes of data", 1002);
          }
        },
        getData: function(length) {
          var self = this;
          if (self.state.masked) {
            self.expectHeader(4, function(data) {
              var mask = data;
              self.expectData(length, function(data2) {
                opcodes["8"].finish.call(self, mask, data2);
              });
            });
          } else {
            self.expectData(length, function(data) {
              opcodes["8"].finish.call(self, null, data);
            });
          }
        },
        finish: function(mask, data) {
          var self = this;
          data = self.unmask(mask, data, true);
          var state = clone(this.state);
          this.messageHandlers.push(function() {
            if (data && data.length == 1) {
              self.error("close packets with data must be at least two bytes long", 1002);
              return;
            }
            var code = data && data.length > 1 ? readUInt16BE.call(data, 0) : 1e3;
            if (!ErrorCodes.isValidErrorCode(code)) {
              self.error("invalid error code", 1002);
              return;
            }
            var message = "";
            if (data && data.length > 2) {
              var messageBuffer = data.slice(2);
              if (!isValidUTF8(messageBuffer)) {
                self.error("invalid utf8 sequence", 1007);
                return;
              }
              message = messageBuffer.toString("utf8");
            }
            self.onclose(code, message, { masked: state.masked });
            self.reset();
          });
          this.flush();
        }
      },
      // ping
      "9": {
        start: function(data) {
          var self = this;
          if (self.state.lastFragment == false) {
            self.error("fragmented ping is not supported", 1002);
            return;
          }
          var firstLength = data[1] & 127;
          if (firstLength < 126) {
            opcodes["9"].getData.call(self, firstLength);
          } else {
            self.error("control frames cannot have more than 125 bytes of data", 1002);
          }
        },
        getData: function(length) {
          var self = this;
          if (self.state.masked) {
            self.expectHeader(4, function(data) {
              var mask = data;
              self.expectData(length, function(data2) {
                opcodes["9"].finish.call(self, mask, data2);
              });
            });
          } else {
            self.expectData(length, function(data) {
              opcodes["9"].finish.call(self, null, data);
            });
          }
        },
        finish: function(mask, data) {
          var self = this;
          data = this.unmask(mask, data, true);
          var state = clone(this.state);
          this.messageHandlers.push(function(callback) {
            self.onping(data, { masked: state.masked, binary: true });
            callback();
          });
          this.flush();
          this.endPacket();
        }
      },
      // pong
      "10": {
        start: function(data) {
          var self = this;
          if (self.state.lastFragment == false) {
            self.error("fragmented pong is not supported", 1002);
            return;
          }
          var firstLength = data[1] & 127;
          if (firstLength < 126) {
            opcodes["10"].getData.call(self, firstLength);
          } else {
            self.error("control frames cannot have more than 125 bytes of data", 1002);
          }
        },
        getData: function(length) {
          var self = this;
          if (this.state.masked) {
            this.expectHeader(4, function(data) {
              var mask = data;
              self.expectData(length, function(data2) {
                opcodes["10"].finish.call(self, mask, data2);
              });
            });
          } else {
            this.expectData(length, function(data) {
              opcodes["10"].finish.call(self, null, data);
            });
          }
        },
        finish: function(mask, data) {
          var self = this;
          data = self.unmask(mask, data, true);
          var state = clone(this.state);
          this.messageHandlers.push(function(callback) {
            self.onpong(data, { masked: state.masked, binary: true });
            callback();
          });
          this.flush();
          this.endPacket();
        }
      }
    };
  }
});

// ../../../private/tmp/test-ws/node_modules/ws/lib/Sender.hixie.js
var require_Sender_hixie = __commonJS({
  "../../../private/tmp/test-ws/node_modules/ws/lib/Sender.hixie.js": function(exports2, module2) {
    var events = require("events");
    var util = require("util");
    var EventEmitter = events.EventEmitter;
    function Sender(socket) {
      if (this instanceof Sender === false) {
        throw new TypeError("Classes can't be function-called");
      }
      events.EventEmitter.call(this);
      this.socket = socket;
      this.continuationFrame = false;
      this.isClosed = false;
    }
    module2.exports = Sender;
    util.inherits(Sender, events.EventEmitter);
    Sender.prototype.send = function(data, options, cb) {
      if (this.isClosed) return;
      var isString = typeof data == "string", length = isString ? Buffer.byteLength(data) : data.length, lengthbytes = length > 127 ? 2 : 1, writeStartMarker = this.continuationFrame == false, writeEndMarker = !options || !(typeof options.fin != "undefined" && !options.fin), buffer = new Buffer((writeStartMarker ? options && options.binary ? 1 + lengthbytes : 1 : 0) + length + (writeEndMarker && !(options && options.binary) ? 1 : 0)), offset = writeStartMarker ? 1 : 0;
      if (writeStartMarker) {
        if (options && options.binary) {
          buffer.write("\x80", "binary");
          if (lengthbytes > 1)
            buffer.write(String.fromCharCode(128 + length / 128), offset++, "binary");
          buffer.write(String.fromCharCode(length & 127), offset++, "binary");
        } else
          buffer.write("\0", "binary");
      }
      if (isString) buffer.write(data, offset, "utf8");
      else data.copy(buffer, offset, 0);
      if (writeEndMarker) {
        if (options && options.binary) {
        } else
          buffer.write("\xFF", offset + length, "binary");
        this.continuationFrame = false;
      } else this.continuationFrame = true;
      try {
        this.socket.write(buffer, "binary", cb);
      } catch (e) {
        this.error(e.toString());
      }
    };
    Sender.prototype.close = function(code, data, mask, cb) {
      if (this.isClosed) return;
      this.isClosed = true;
      try {
        if (this.continuationFrame) this.socket.write(new Buffer([255], "binary"));
        this.socket.write(new Buffer([255, 0]), "binary", cb);
      } catch (e) {
        this.error(e.toString());
      }
    };
    Sender.prototype.ping = function(data, options) {
    };
    Sender.prototype.pong = function(data, options) {
    };
    Sender.prototype.error = function(reason) {
      this.emit("error", reason);
      return this;
    };
  }
});

// ../../../private/tmp/test-ws/node_modules/ws/lib/Receiver.hixie.js
var require_Receiver_hixie = __commonJS({
  "../../../private/tmp/test-ws/node_modules/ws/lib/Receiver.hixie.js": function(exports2, module2) {
    var util = require("util");
    var EMPTY = 0;
    var BODY = 1;
    var BINARYLENGTH = 2;
    var BINARYBODY = 3;
    function Receiver() {
      if (this instanceof Receiver === false) {
        throw new TypeError("Classes can't be function-called");
      }
      this.state = EMPTY;
      this.buffers = [];
      this.messageEnd = -1;
      this.spanLength = 0;
      this.dead = false;
      this.onerror = function() {
      };
      this.ontext = function() {
      };
      this.onbinary = function() {
      };
      this.onclose = function() {
      };
      this.onping = function() {
      };
      this.onpong = function() {
      };
    }
    module2.exports = Receiver;
    Receiver.prototype.add = function(data) {
      if (this.dead) return;
      var self = this;
      function doAdd() {
        if (self.state === EMPTY) {
          if (data.length == 2 && data[0] == 255 && data[1] == 0) {
            self.reset();
            self.onclose();
            return;
          }
          if (data[0] === 128) {
            self.messageEnd = 0;
            self.state = BINARYLENGTH;
            data = data.slice(1);
          } else {
            if (data[0] !== 0) {
              self.error("payload must start with 0x00 byte", true);
              return;
            }
            data = data.slice(1);
            self.state = BODY;
          }
        }
        if (self.state === BINARYLENGTH) {
          var i = 0;
          while (i < data.length && data[i] & 128) {
            self.messageEnd = 128 * self.messageEnd + (data[i] & 127);
            ++i;
          }
          if (i < data.length) {
            self.messageEnd = 128 * self.messageEnd + (data[i] & 127);
            self.state = BINARYBODY;
            ++i;
          }
          if (i > 0)
            data = data.slice(i);
        }
        if (self.state === BINARYBODY) {
          var dataleft = self.messageEnd - self.spanLength;
          if (data.length >= dataleft) {
            self.buffers.push(data);
            self.spanLength += dataleft;
            self.messageEnd = dataleft;
            return self.parse();
          }
          self.buffers.push(data);
          self.spanLength += data.length;
          return;
        }
        self.buffers.push(data);
        if ((self.messageEnd = bufferIndex(data, 255)) != -1) {
          self.spanLength += self.messageEnd;
          return self.parse();
        } else self.spanLength += data.length;
      }
      while (data) data = doAdd();
    };
    Receiver.prototype.cleanup = function() {
      this.dead = true;
      this.state = EMPTY;
      this.buffers = [];
    };
    Receiver.prototype.parse = function() {
      var output = new Buffer(this.spanLength);
      var outputIndex = 0;
      for (var bi = 0, bl = this.buffers.length; bi < bl - 1; ++bi) {
        var buffer = this.buffers[bi];
        buffer.copy(output, outputIndex);
        outputIndex += buffer.length;
      }
      var lastBuffer = this.buffers[this.buffers.length - 1];
      if (this.messageEnd > 0) lastBuffer.copy(output, outputIndex, 0, this.messageEnd);
      if (this.state !== BODY) --this.messageEnd;
      var tail = null;
      if (this.messageEnd < lastBuffer.length - 1) {
        tail = lastBuffer.slice(this.messageEnd + 1);
      }
      this.reset();
      this.ontext(output.toString("utf8"));
      return tail;
    };
    Receiver.prototype.error = function(reason, terminate) {
      if (this.dead) return;
      this.reset();
      if (typeof reason == "string") {
        this.onerror(new Error(reason), terminate);
      } else if (reason.constructor == Error) {
        this.onerror(reason, terminate);
      } else {
        this.onerror(new Error("An error occured"), terminate);
      }
      return this;
    };
    Receiver.prototype.reset = function(reason) {
      if (this.dead) return;
      this.state = EMPTY;
      this.buffers = [];
      this.messageEnd = -1;
      this.spanLength = 0;
    };
    function bufferIndex(buffer, byte) {
      for (var i = 0, l = buffer.length; i < l; ++i) {
        if (buffer[i] === byte) return i;
      }
      return -1;
    }
  }
});

// ../../../private/tmp/test-ws/node_modules/ws/lib/Extensions.js
var require_Extensions = __commonJS({
  "../../../private/tmp/test-ws/node_modules/ws/lib/Extensions.js": function(exports2) {
    var util = require("util");
    exports2.parse = parse;
    exports2.format = format;
    function parse(value) {
      value = value || "";
      var extensions = {};
      value.split(",").forEach(function(v) {
        var params = v.split(";");
        var token = params.shift().trim();
        if (extensions[token] === void 0) {
          extensions[token] = [];
        } else if (!extensions.hasOwnProperty(token)) {
          return;
        }
        var parsedParams = {};
        params.forEach(function(param) {
          var parts = param.trim().split("=");
          var key = parts[0];
          var value2 = parts[1];
          if (typeof value2 === "undefined") {
            value2 = true;
          } else {
            if (value2[0] === '"') {
              value2 = value2.slice(1);
            }
            if (value2[value2.length - 1] === '"') {
              value2 = value2.slice(0, value2.length - 1);
            }
          }
          if (parsedParams[key] === void 0) {
            parsedParams[key] = [value2];
          } else if (parsedParams.hasOwnProperty(key)) {
            parsedParams[key].push(value2);
          }
        });
        extensions[token].push(parsedParams);
      });
      return extensions;
    }
    function format(value) {
      return Object.keys(value).map(function(token) {
        var paramsList = value[token];
        if (!util.isArray(paramsList)) {
          paramsList = [paramsList];
        }
        return paramsList.map(function(params) {
          return [token].concat(Object.keys(params).map(function(k) {
            var p = params[k];
            if (!util.isArray(p)) p = [p];
            return p.map(function(v) {
              return v === true ? k : k + "=" + v;
            }).join("; ");
          })).join("; ");
        }).join(", ");
      }).join(", ");
    }
  }
});

// ../../../private/tmp/test-ws/node_modules/ws/lib/WebSocket.js
var require_WebSocket = __commonJS({
  "../../../private/tmp/test-ws/node_modules/ws/lib/WebSocket.js": function(exports2, module2) {
    "use strict";
    var url = require("url");
    var util = require("util");
    var http = require("http");
    var https = require("https");
    var crypto = require("crypto");
    var stream = require("stream");
    var Ultron = require_ultron();
    var Options = require_options();
    var Sender = require_Sender();
    var Receiver = require_Receiver();
    var SenderHixie = require_Sender_hixie();
    var ReceiverHixie = require_Receiver_hixie();
    var Extensions = require_Extensions();
    var PerMessageDeflate = require_PerMessageDeflate();
    var EventEmitter = require("events").EventEmitter;
    var protocolVersion = 13;
    var closeTimeout = 30 * 1e3;
    function WebSocket(address, protocols, options) {
      if (this instanceof WebSocket === false) {
        return new WebSocket(address, protocols, options);
      }
      EventEmitter.call(this);
      if (protocols && !Array.isArray(protocols) && "object" === typeof protocols) {
        options = protocols;
        protocols = null;
      }
      if ("string" === typeof protocols) {
        protocols = [protocols];
      }
      if (!Array.isArray(protocols)) {
        protocols = [];
      }
      this._socket = null;
      this._ultron = null;
      this._closeReceived = false;
      this.bytesReceived = 0;
      this.readyState = null;
      this.supports = {};
      this.extensions = {};
      this._binaryType = "nodebuffer";
      if (Array.isArray(address)) {
        initAsServerClient.apply(this, address.concat(options));
      } else {
        initAsClient.apply(this, [address, protocols, options]);
      }
    }
    util.inherits(WebSocket, EventEmitter);
    ["CONNECTING", "OPEN", "CLOSING", "CLOSED"].forEach(function each(state, index) {
      WebSocket.prototype[state] = WebSocket[state] = index;
    });
    WebSocket.prototype.close = function close(code, data) {
      if (this.readyState === WebSocket.CLOSED) return;
      if (this.readyState === WebSocket.CONNECTING) {
        this.readyState = WebSocket.CLOSED;
        return;
      }
      if (this.readyState === WebSocket.CLOSING) {
        if (this._closeReceived && this._isServer) {
          this.terminate();
        }
        return;
      }
      var self = this;
      try {
        this.readyState = WebSocket.CLOSING;
        this._closeCode = code;
        this._closeMessage = data;
        var mask = !this._isServer;
        this._sender.close(code, data, mask, function(err) {
          if (err) self.emit("error", err);
          if (self._closeReceived && self._isServer) {
            self.terminate();
          } else {
            clearTimeout(self._closeTimer);
            self._closeTimer = setTimeout(cleanupWebsocketResources.bind(self, true), closeTimeout);
          }
        });
      } catch (e) {
        this.emit("error", e);
      }
    };
    WebSocket.prototype.pause = function pauser() {
      if (this.readyState !== WebSocket.OPEN) throw new Error("not opened");
      return this._socket.pause();
    };
    WebSocket.prototype.ping = function ping(data, options, dontFailWhenClosed) {
      if (this.readyState !== WebSocket.OPEN) {
        if (dontFailWhenClosed === true) return;
        throw new Error("not opened");
      }
      options = options || {};
      if (typeof options.mask === "undefined") options.mask = !this._isServer;
      this._sender.ping(data, options);
    };
    WebSocket.prototype.pong = function(data, options, dontFailWhenClosed) {
      if (this.readyState !== WebSocket.OPEN) {
        if (dontFailWhenClosed === true) return;
        throw new Error("not opened");
      }
      options = options || {};
      if (typeof options.mask === "undefined") options.mask = !this._isServer;
      this._sender.pong(data, options);
    };
    WebSocket.prototype.resume = function resume() {
      if (this.readyState !== WebSocket.OPEN) throw new Error("not opened");
      return this._socket.resume();
    };
    WebSocket.prototype.send = function send(data, options, cb) {
      if (typeof options === "function") {
        cb = options;
        options = {};
      }
      if (this.readyState !== WebSocket.OPEN) {
        if (typeof cb === "function") cb(new Error("not opened"));
        else throw new Error("not opened");
        return;
      }
      if (!data) data = "";
      if (this._queue) {
        var self = this;
        this._queue.push(function() {
          self.send(data, options, cb);
        });
        return;
      }
      options = options || {};
      options.fin = true;
      if (typeof options.binary === "undefined") {
        options.binary = data instanceof ArrayBuffer || data instanceof Buffer || data instanceof Uint8Array || data instanceof Uint16Array || data instanceof Uint32Array || data instanceof Int8Array || data instanceof Int16Array || data instanceof Int32Array || data instanceof Float32Array || data instanceof Float64Array;
      }
      if (typeof options.mask === "undefined") options.mask = !this._isServer;
      if (typeof options.compress === "undefined") options.compress = true;
      if (!this.extensions[PerMessageDeflate.extensionName]) {
        options.compress = false;
      }
      var readable = typeof stream.Readable === "function" ? stream.Readable : stream.Stream;
      if (data instanceof readable) {
        startQueue(this);
        var self = this;
        sendStream(this, data, options, function send2(error) {
          process.nextTick(function tock() {
            executeQueueSends(self);
          });
          if (typeof cb === "function") cb(error);
        });
      } else {
        this._sender.send(data, options, cb);
      }
    };
    WebSocket.prototype.stream = function stream2(options, cb) {
      if (typeof options === "function") {
        cb = options;
        options = {};
      }
      var self = this;
      if (typeof cb !== "function") throw new Error("callback must be provided");
      if (this.readyState !== WebSocket.OPEN) {
        if (typeof cb === "function") cb(new Error("not opened"));
        else throw new Error("not opened");
        return;
      }
      if (this._queue) {
        this._queue.push(function() {
          self.stream(options, cb);
        });
        return;
      }
      options = options || {};
      if (typeof options.mask === "undefined") options.mask = !this._isServer;
      if (typeof options.compress === "undefined") options.compress = true;
      if (!this.extensions[PerMessageDeflate.extensionName]) {
        options.compress = false;
      }
      startQueue(this);
      function send(data, final) {
        try {
          if (self.readyState !== WebSocket.OPEN) throw new Error("not opened");
          options.fin = final === true;
          self._sender.send(data, options);
          if (!final) process.nextTick(cb.bind(null, null, send));
          else executeQueueSends(self);
        } catch (e) {
          if (typeof cb === "function") cb(e);
          else {
            delete self._queue;
            self.emit("error", e);
          }
        }
      }
      process.nextTick(cb.bind(null, null, send));
    };
    WebSocket.prototype.terminate = function terminate() {
      if (this.readyState === WebSocket.CLOSED) return;
      if (this._socket) {
        this.readyState = WebSocket.CLOSING;
        try {
          this._socket.end();
        } catch (e) {
          cleanupWebsocketResources.call(this, true);
          return;
        }
        if (this._closeTimer) {
          clearTimeout(this._closeTimer);
        }
        this._closeTimer = setTimeout(cleanupWebsocketResources.bind(this, true), closeTimeout);
      } else if (this.readyState === WebSocket.CONNECTING) {
        cleanupWebsocketResources.call(this, true);
      }
    };
    Object.defineProperty(WebSocket.prototype, "bufferedAmount", {
      get: function get() {
        var amount = 0;
        if (this._socket) {
          amount = this._socket.bufferSize || 0;
        }
        return amount;
      }
    });
    Object.defineProperty(WebSocket.prototype, "binaryType", {
      get: function get() {
        return this._binaryType;
      },
      set: function set(type) {
        if (type === "arraybuffer" || type === "nodebuffer")
          this._binaryType = type;
        else
          throw new SyntaxError('unsupported binaryType: must be either "nodebuffer" or "arraybuffer"');
      }
    });
    ["open", "error", "close", "message"].forEach(function(method) {
      Object.defineProperty(WebSocket.prototype, "on" + method, {
        /**
         * Returns the current listener
         *
         * @returns {Mixed} the set function or undefined
         * @api public
         */
        get: function get() {
          var listener = this.listeners(method)[0];
          return listener ? listener._listener ? listener._listener : listener : void 0;
        },
        /**
         * Start listening for events
         *
         * @param {Function} listener the listener
         * @returns {Mixed} the set function or undefined
         * @api public
         */
        set: function set(listener) {
          this.removeAllListeners(method);
          this.addEventListener(method, listener);
        }
      });
    });
    WebSocket.prototype.addEventListener = function(method, listener) {
      var target = this;
      function onMessage(data, flags) {
        if (flags.binary && this.binaryType === "arraybuffer")
          data = new Uint8Array(data).buffer;
        listener.call(target, new MessageEvent(data, !!flags.binary, target));
      }
      function onClose(code, message) {
        listener.call(target, new CloseEvent(code, message, target));
      }
      function onError(event) {
        event.type = "error";
        event.target = target;
        listener.call(target, event);
      }
      function onOpen() {
        listener.call(target, new OpenEvent(target));
      }
      if (typeof listener === "function") {
        if (method === "message") {
          onMessage._listener = listener;
          this.on(method, onMessage);
        } else if (method === "close") {
          onClose._listener = listener;
          this.on(method, onClose);
        } else if (method === "error") {
          onError._listener = listener;
          this.on(method, onError);
        } else if (method === "open") {
          onOpen._listener = listener;
          this.on(method, onOpen);
        } else {
          this.on(method, listener);
        }
      }
    };
    module2.exports = WebSocket;
    module2.exports.buildHostHeader = buildHostHeader;
    function MessageEvent(dataArg, isBinary, target) {
      this.type = "message";
      this.data = dataArg;
      this.target = target;
      this.binary = isBinary;
    }
    function CloseEvent(code, reason, target) {
      this.type = "close";
      this.wasClean = typeof code === "undefined" || code === 1e3;
      this.code = code;
      this.reason = reason;
      this.target = target;
    }
    function OpenEvent(target) {
      this.type = "open";
      this.target = target;
    }
    function buildHostHeader(isSecure, hostname, port) {
      var headerHost = hostname;
      if (hostname) {
        if (isSecure && port != 443 || !isSecure && port != 80) {
          headerHost = headerHost + ":" + port;
        }
      }
      return headerHost;
    }
    function initAsServerClient(req, socket, upgradeHead, options) {
      options = new Options({
        protocolVersion: protocolVersion,
        protocol: null,
        extensions: {},
        maxPayload: 0
      }).merge(options);
      this.protocol = options.value.protocol;
      this.protocolVersion = options.value.protocolVersion;
      this.extensions = options.value.extensions;
      this.supports.binary = this.protocolVersion !== "hixie-76";
      this.upgradeReq = req;
      this.readyState = WebSocket.CONNECTING;
      this._isServer = true;
      this.maxPayload = options.value.maxPayload;
      if (options.value.protocolVersion === "hixie-76") {
        establishConnection.call(this, ReceiverHixie, SenderHixie, socket, upgradeHead);
      } else {
        establishConnection.call(this, Receiver, Sender, socket, upgradeHead);
      }
    }
    function initAsClient(address, protocols, options) {
      options = new Options({
        origin: null,
        protocolVersion: protocolVersion,
        host: null,
        headers: null,
        protocol: protocols.join(","),
        agent: null,
        // ssl-related options
        pfx: null,
        key: null,
        passphrase: null,
        cert: null,
        ca: null,
        ciphers: null,
        rejectUnauthorized: null,
        perMessageDeflate: true,
        localAddress: null
      }).merge(options);
      if (options.value.protocolVersion !== 8 && options.value.protocolVersion !== 13) {
        throw new Error("unsupported protocol version");
      }
      var serverUrl = url.parse(address);
      var isUnixSocket = serverUrl.protocol === "ws+unix:";
      if (!serverUrl.host && !isUnixSocket) throw new Error("invalid url");
      var isSecure = serverUrl.protocol === "wss:" || serverUrl.protocol === "https:";
      var httpObj = isSecure ? https : http;
      var port = serverUrl.port || (isSecure ? 443 : 80);
      var auth = serverUrl.auth;
      var extensionsOffer = {};
      var perMessageDeflate;
      if (options.value.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate(typeof options.value.perMessageDeflate !== true ? options.value.perMessageDeflate : {}, false);
        extensionsOffer[PerMessageDeflate.extensionName] = perMessageDeflate.offer();
      }
      this._isServer = false;
      this.url = address;
      this.protocolVersion = options.value.protocolVersion;
      this.supports.binary = this.protocolVersion !== "hixie-76";
      var key = new Buffer(options.value.protocolVersion + "-" + Date.now()).toString("base64");
      var shasum = crypto.createHash("sha1");
      shasum.update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11");
      var expectedServerKey = shasum.digest("base64");
      var agent = options.value.agent;
      var headerHost = buildHostHeader(isSecure, serverUrl.hostname, port);
      var requestOptions = {
        port: port,
        host: serverUrl.hostname,
        headers: {
          "Connection": "Upgrade",
          "Upgrade": "websocket",
          "Host": headerHost,
          "Sec-WebSocket-Version": options.value.protocolVersion,
          "Sec-WebSocket-Key": key
        }
      };
      if (auth) {
        requestOptions.headers.Authorization = "Basic " + new Buffer(auth).toString("base64");
      }
      if (options.value.protocol) {
        requestOptions.headers["Sec-WebSocket-Protocol"] = options.value.protocol;
      }
      if (options.value.host) {
        requestOptions.headers.Host = options.value.host;
      }
      if (options.value.headers) {
        for (var header in options.value.headers) {
          if (options.value.headers.hasOwnProperty(header)) {
            requestOptions.headers[header] = options.value.headers[header];
          }
        }
      }
      if (Object.keys(extensionsOffer).length) {
        requestOptions.headers["Sec-WebSocket-Extensions"] = Extensions.format(extensionsOffer);
      }
      if (options.isDefinedAndNonNull("pfx") || options.isDefinedAndNonNull("key") || options.isDefinedAndNonNull("passphrase") || options.isDefinedAndNonNull("cert") || options.isDefinedAndNonNull("ca") || options.isDefinedAndNonNull("ciphers") || options.isDefinedAndNonNull("rejectUnauthorized")) {
        if (options.isDefinedAndNonNull("pfx")) requestOptions.pfx = options.value.pfx;
        if (options.isDefinedAndNonNull("key")) requestOptions.key = options.value.key;
        if (options.isDefinedAndNonNull("passphrase")) requestOptions.passphrase = options.value.passphrase;
        if (options.isDefinedAndNonNull("cert")) requestOptions.cert = options.value.cert;
        if (options.isDefinedAndNonNull("ca")) requestOptions.ca = options.value.ca;
        if (options.isDefinedAndNonNull("ciphers")) requestOptions.ciphers = options.value.ciphers;
        if (options.isDefinedAndNonNull("rejectUnauthorized")) requestOptions.rejectUnauthorized = options.value.rejectUnauthorized;
        if (!agent) {
          agent = new httpObj.Agent(requestOptions);
        }
      }
      requestOptions.path = serverUrl.path || "/";
      if (agent) {
        requestOptions.agent = agent;
      }
      if (isUnixSocket) {
        requestOptions.socketPath = serverUrl.pathname;
      }
      if (options.value.localAddress) {
        requestOptions.localAddress = options.value.localAddress;
      }
      if (options.value.origin) {
        if (options.value.protocolVersion < 13) requestOptions.headers["Sec-WebSocket-Origin"] = options.value.origin;
        else requestOptions.headers.Origin = options.value.origin;
      }
      var self = this;
      var req = httpObj.request(requestOptions);
      req.on("error", function onerror(error) {
        self.emit("error", error);
        cleanupWebsocketResources.call(self, error);
      });
      req.once("response", function response(res) {
        var error;
        if (!self.emit("unexpected-response", req, res)) {
          error = new Error("unexpected server response (" + res.statusCode + ")");
          req.abort();
          self.emit("error", error);
        }
        cleanupWebsocketResources.call(self, error);
      });
      req.once("upgrade", function upgrade(res, socket, upgradeHead) {
        if (self.readyState === WebSocket.CLOSED) {
          self.emit("close");
          self.removeAllListeners();
          socket.end();
          return;
        }
        var serverKey = res.headers["sec-websocket-accept"];
        if (typeof serverKey === "undefined" || serverKey !== expectedServerKey) {
          self.emit("error", "invalid server key");
          self.removeAllListeners();
          socket.end();
          return;
        }
        var serverProt = res.headers["sec-websocket-protocol"];
        var protList = (options.value.protocol || "").split(/, */);
        var protError = null;
        if (!options.value.protocol && serverProt) {
          protError = "server sent a subprotocol even though none requested";
        } else if (options.value.protocol && !serverProt) {
          protError = "server sent no subprotocol even though requested";
        } else if (serverProt && protList.indexOf(serverProt) === -1) {
          protError = "server responded with an invalid protocol";
        }
        if (protError) {
          self.emit("error", protError);
          self.removeAllListeners();
          socket.end();
          return;
        } else if (serverProt) {
          self.protocol = serverProt;
        }
        var serverExtensions = Extensions.parse(res.headers["sec-websocket-extensions"]);
        if (perMessageDeflate && serverExtensions[PerMessageDeflate.extensionName]) {
          try {
            perMessageDeflate.accept(serverExtensions[PerMessageDeflate.extensionName]);
          } catch (err) {
            self.emit("error", "invalid extension parameter");
            self.removeAllListeners();
            socket.end();
            return;
          }
          self.extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
        }
        establishConnection.call(self, Receiver, Sender, socket, upgradeHead);
        req.removeAllListeners();
        req = null;
        agent = null;
      });
      req.end();
      this.readyState = WebSocket.CONNECTING;
    }
    function establishConnection(ReceiverClass, SenderClass, socket, upgradeHead) {
      var ultron = this._ultron = new Ultron(socket), called = false, self = this;
      socket.setTimeout(0);
      socket.setNoDelay(true);
      this._receiver = new ReceiverClass(this.extensions, this.maxPayload);
      this._socket = socket;
      ultron.on("end", cleanupWebsocketResources.bind(this));
      ultron.on("close", cleanupWebsocketResources.bind(this));
      ultron.on("error", cleanupWebsocketResources.bind(this));
      function firstHandler(data) {
        if (called || self.readyState === WebSocket.CLOSED) return;
        called = true;
        socket.removeListener("data", firstHandler);
        ultron.on("data", realHandler);
        if (upgradeHead && upgradeHead.length > 0) {
          realHandler(upgradeHead);
          upgradeHead = null;
        }
        if (data) realHandler(data);
      }
      function realHandler(data) {
        self.bytesReceived += data.length;
        self._receiver.add(data);
      }
      ultron.on("data", firstHandler);
      process.nextTick(firstHandler);
      self._receiver.ontext = function ontext(data, flags) {
        flags = flags || {};
        self.emit("message", data, flags);
      };
      self._receiver.onbinary = function onbinary(data, flags) {
        flags = flags || {};
        flags.binary = true;
        self.emit("message", data, flags);
      };
      self._receiver.onping = function onping(data, flags) {
        flags = flags || {};
        self.pong(data, {
          mask: !self._isServer,
          binary: flags.binary === true
        }, true);
        self.emit("ping", data, flags);
      };
      self._receiver.onpong = function onpong(data, flags) {
        self.emit("pong", data, flags || {});
      };
      self._receiver.onclose = function onclose(code, data, flags) {
        flags = flags || {};
        self._closeReceived = true;
        self.close(code, data);
      };
      self._receiver.onerror = function onerror(reason, errorCode) {
        self.close(typeof errorCode !== "undefined" ? errorCode : 1002, "");
        self.emit("error", reason instanceof Error ? reason : new Error(reason));
      };
      this._sender = new SenderClass(socket, this.extensions);
      this._sender.on("error", function onerror(error) {
        self.close(1002, "");
        self.emit("error", error);
      });
      this.readyState = WebSocket.OPEN;
      this.emit("open");
    }
    function startQueue(instance) {
      instance._queue = instance._queue || [];
    }
    function executeQueueSends(instance) {
      var queue = instance._queue;
      if (typeof queue === "undefined") return;
      delete instance._queue;
      for (var i = 0, l = queue.length; i < l; ++i) {
        queue[i]();
      }
    }
    function sendStream(instance, stream2, options, cb) {
      stream2.on("data", function incoming(data) {
        if (instance.readyState !== WebSocket.OPEN) {
          if (typeof cb === "function") cb(new Error("not opened"));
          else {
            delete instance._queue;
            instance.emit("error", new Error("not opened"));
          }
          return;
        }
        options.fin = false;
        instance._sender.send(data, options);
      });
      stream2.on("end", function end() {
        if (instance.readyState !== WebSocket.OPEN) {
          if (typeof cb === "function") cb(new Error("not opened"));
          else {
            delete instance._queue;
            instance.emit("error", new Error("not opened"));
          }
          return;
        }
        options.fin = true;
        instance._sender.send(null, options);
        if (typeof cb === "function") cb(null);
      });
    }
    function cleanupWebsocketResources(error) {
      if (this.readyState === WebSocket.CLOSED) return;
      this.readyState = WebSocket.CLOSED;
      clearTimeout(this._closeTimer);
      this._closeTimer = null;
      if (error || !this._closeReceived) {
        this._closeCode = 1006;
      }
      this.emit("close", this._closeCode || 1e3, this._closeMessage || "");
      if (this._socket) {
        if (this._ultron) this._ultron.destroy();
        this._socket.on("error", function onerror() {
          try {
            this.destroy();
          } catch (e) {
          }
        });
        try {
          if (!error) this._socket.end();
          else this._socket.destroy();
        } catch (e) {
        }
        this._socket = null;
        this._ultron = null;
      }
      if (this._sender) {
        this._sender.removeAllListeners();
        this._sender = null;
      }
      if (this._receiver) {
        this._receiver.cleanup();
        this._receiver = null;
      }
      if (this.extensions[PerMessageDeflate.extensionName]) {
        this.extensions[PerMessageDeflate.extensionName].cleanup();
      }
      this.extensions = null;
      this.removeAllListeners();
      this.on("error", function onerror() {
      });
      delete this._queue;
    }
  }
});

// ../../../private/tmp/test-ws/node_modules/ws/lib/WebSocketServer.js
var require_WebSocketServer = __commonJS({
  "../../../private/tmp/test-ws/node_modules/ws/lib/WebSocketServer.js": function(exports2, module2) {
    var util = require("util");
    var events = require("events");
    var http = require("http");
    var crypto = require("crypto");
    var Options = require_options();
    var WebSocket = require_WebSocket();
    var Extensions = require_Extensions();
    var PerMessageDeflate = require_PerMessageDeflate();
    var tls = require("tls");
    var url = require("url");
    function WebSocketServer(options, callback) {
      if (this instanceof WebSocketServer === false) {
        return new WebSocketServer(options, callback);
      }
      events.EventEmitter.call(this);
      options = new Options({
        host: "0.0.0.0",
        port: null,
        server: null,
        verifyClient: null,
        handleProtocols: null,
        path: null,
        noServer: false,
        disableHixie: false,
        clientTracking: true,
        perMessageDeflate: true,
        maxPayload: 100 * 1024 * 1024
      }).merge(options);
      if (!options.isDefinedAndNonNull("port") && !options.isDefinedAndNonNull("server") && !options.value.noServer) {
        throw new TypeError("`port` or a `server` must be provided");
      }
      var self = this;
      if (options.isDefinedAndNonNull("port")) {
        this._server = http.createServer(function(req, res) {
          var body = http.STATUS_CODES[426];
          res.writeHead(426, {
            "Content-Length": body.length,
            "Content-Type": "text/plain"
          });
          res.end(body);
        });
        this._server.allowHalfOpen = false;
        this._server.listen(options.value.port, options.value.host, callback);
        this._closeServer = function() {
          if (self._server) self._server.close();
        };
      } else if (options.value.server) {
        this._server = options.value.server;
        if (options.value.path) {
          if (this._server._webSocketPaths && options.value.server._webSocketPaths[options.value.path]) {
            throw new Error("two instances of WebSocketServer cannot listen on the same http server path");
          }
          if (typeof this._server._webSocketPaths !== "object") {
            this._server._webSocketPaths = {};
          }
          this._server._webSocketPaths[options.value.path] = 1;
        }
      }
      if (this._server) {
        this._onceServerListening = function() {
          self.emit("listening");
        };
        this._server.once("listening", this._onceServerListening);
      }
      if (typeof this._server != "undefined") {
        this._onServerError = function(error) {
          self.emit("error", error);
        };
        this._server.on("error", this._onServerError);
        this._onServerUpgrade = function(req, socket, upgradeHead) {
          var head = new Buffer(upgradeHead.length);
          upgradeHead.copy(head);
          self.handleUpgrade(req, socket, head, function(client) {
            self.emit("connection" + req.url, client);
            self.emit("connection", client);
          });
        };
        this._server.on("upgrade", this._onServerUpgrade);
      }
      this.options = options.value;
      this.path = options.value.path;
      this.clients = [];
    }
    util.inherits(WebSocketServer, events.EventEmitter);
    WebSocketServer.prototype.close = function(callback) {
      var error = null;
      try {
        for (var i = 0, l = this.clients.length; i < l; ++i) {
          this.clients[i].terminate();
        }
      } catch (e) {
        error = e;
      }
      if (this.path && this._server._webSocketPaths) {
        delete this._server._webSocketPaths[this.path];
        if (Object.keys(this._server._webSocketPaths).length == 0) {
          delete this._server._webSocketPaths;
        }
      }
      try {
        if (typeof this._closeServer !== "undefined") {
          this._closeServer();
        }
      } finally {
        if (this._server) {
          this._server.removeListener("listening", this._onceServerListening);
          this._server.removeListener("error", this._onServerError);
          this._server.removeListener("upgrade", this._onServerUpgrade);
        }
        delete this._server;
      }
      if (callback)
        callback(error);
      else if (error)
        throw error;
    };
    WebSocketServer.prototype.handleUpgrade = function(req, socket, upgradeHead, cb) {
      if (this.options.path) {
        var u = url.parse(req.url);
        if (u && u.pathname !== this.options.path) return;
      }
      if (typeof req.headers.upgrade === "undefined" || req.headers.upgrade.toLowerCase() !== "websocket") {
        abortConnection(socket, 400, "Bad Request");
        return;
      }
      if (req.headers["sec-websocket-key1"]) handleHixieUpgrade.apply(this, arguments);
      else handleHybiUpgrade.apply(this, arguments);
    };
    module2.exports = WebSocketServer;
    function handleHybiUpgrade(req, socket, upgradeHead, cb) {
      var errorHandler = function() {
        try {
          socket.destroy();
        } catch (e) {
        }
      };
      socket.on("error", errorHandler);
      if (!req.headers["sec-websocket-key"]) {
        abortConnection(socket, 400, "Bad Request");
        return;
      }
      var version = parseInt(req.headers["sec-websocket-version"]);
      if ([8, 13].indexOf(version) === -1) {
        abortConnection(socket, 400, "Bad Request");
        return;
      }
      var protocols = req.headers["sec-websocket-protocol"];
      var origin = version < 13 ? req.headers["sec-websocket-origin"] : req.headers["origin"];
      var extensionsOffer = Extensions.parse(req.headers["sec-websocket-extensions"]);
      var self = this;
      var completeHybiUpgrade2 = function(protocol) {
        var key = req.headers["sec-websocket-key"];
        var shasum = crypto.createHash("sha1");
        shasum.update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11");
        key = shasum.digest("base64");
        var headers = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          "Sec-WebSocket-Accept: " + key
        ];
        if (typeof protocol != "undefined") {
          headers.push("Sec-WebSocket-Protocol: " + protocol);
        }
        var extensions = {};
        try {
          extensions = acceptExtensions.call(self, extensionsOffer);
        } catch (err) {
          abortConnection(socket, 400, "Bad Request");
          return;
        }
        if (Object.keys(extensions).length) {
          var serverExtensions = {};
          Object.keys(extensions).forEach(function(token) {
            serverExtensions[token] = [extensions[token].params];
          });
          headers.push("Sec-WebSocket-Extensions: " + Extensions.format(serverExtensions));
        }
        self.emit("headers", headers);
        socket.setTimeout(0);
        socket.setNoDelay(true);
        try {
          socket.write(headers.concat("", "").join("\r\n"));
        } catch (e) {
          try {
            socket.destroy();
          } catch (e2) {
          }
          return;
        }
        var client = new WebSocket([req, socket, upgradeHead], {
          protocolVersion: version,
          protocol: protocol,
          extensions: extensions,
          maxPayload: self.options.maxPayload
        });
        if (self.options.clientTracking) {
          self.clients.push(client);
          client.on("close", function() {
            var index = self.clients.indexOf(client);
            if (index != -1) {
              self.clients.splice(index, 1);
            }
          });
        }
        socket.removeListener("error", errorHandler);
        cb(client);
      };
      var completeHybiUpgrade1 = function() {
        if (typeof self.options.handleProtocols == "function") {
          var protList = (protocols || "").split(/, */);
          var callbackCalled = false;
          var res = self.options.handleProtocols(protList, function(result, protocol) {
            callbackCalled = true;
            if (!result) abortConnection(socket, 401, "Unauthorized");
            else completeHybiUpgrade2(protocol);
          });
          if (!callbackCalled) {
            abortConnection(socket, 501, "Could not process protocols");
          }
          return;
        } else {
          if (typeof protocols !== "undefined") {
            completeHybiUpgrade2(protocols.split(/, */)[0]);
          } else {
            completeHybiUpgrade2();
          }
        }
      };
      if (typeof this.options.verifyClient == "function") {
        var info = {
          origin: origin,
          secure: typeof req.connection.authorized !== "undefined" || typeof req.connection.encrypted !== "undefined",
          req: req
        };
        if (this.options.verifyClient.length == 2) {
          this.options.verifyClient(info, function(result, code, name) {
            if (typeof code === "undefined") code = 401;
            if (typeof name === "undefined") name = http.STATUS_CODES[code];
            if (!result) abortConnection(socket, code, name);
            else completeHybiUpgrade1();
          });
          return;
        } else if (!this.options.verifyClient(info)) {
          abortConnection(socket, 401, "Unauthorized");
          return;
        }
      }
      completeHybiUpgrade1();
    }
    function handleHixieUpgrade(req, socket, upgradeHead, cb) {
      var errorHandler = function() {
        try {
          socket.destroy();
        } catch (e) {
        }
      };
      socket.on("error", errorHandler);
      if (this.options.disableHixie) {
        abortConnection(socket, 401, "Hixie support disabled");
        return;
      }
      if (!req.headers["sec-websocket-key2"]) {
        abortConnection(socket, 400, "Bad Request");
        return;
      }
      var origin = req.headers["origin"], self = this;
      var onClientVerified = function() {
        var wshost;
        if (!req.headers["x-forwarded-host"])
          wshost = req.headers.host;
        else
          wshost = req.headers["x-forwarded-host"];
        var location = (req.headers["x-forwarded-proto"] === "https" || socket.encrypted ? "wss" : "ws") + "://" + wshost + req.url, protocol = req.headers["sec-websocket-protocol"];
        var buildResponseHeader = function() {
          var headers = [
            "HTTP/1.1 101 Switching Protocols",
            "Upgrade: WebSocket",
            "Connection: Upgrade",
            "Sec-WebSocket-Location: " + location
          ];
          if (typeof protocol != "undefined") headers.push("Sec-WebSocket-Protocol: " + protocol);
          if (typeof origin != "undefined") headers.push("Sec-WebSocket-Origin: " + origin);
          return new Buffer(headers.concat("", "").join("\r\n"));
        };
        var handshakeResponse = function() {
          socket.setTimeout(0);
          socket.setNoDelay(true);
          var headerBuffer = buildResponseHeader();
          try {
            socket.write(headerBuffer, "binary", function(err) {
              if (err) socket.removeListener("data", handler);
              return;
            });
          } catch (e) {
            try {
              socket.destroy();
            } catch (e2) {
            }
            return;
          }
          ;
        };
        var completeHandshake = function(nonce2, rest2, headerBuffer) {
          var k1 = req.headers["sec-websocket-key1"], k2 = req.headers["sec-websocket-key2"], md5 = crypto.createHash("md5");
          [k1, k2].forEach(function(k) {
            var n = parseInt(k.replace(/[^\d]/g, "")), spaces = k.replace(/[^ ]/g, "").length;
            if (spaces === 0 || n % spaces !== 0) {
              abortConnection(socket, 400, "Bad Request");
              return;
            }
            n /= spaces;
            md5.update(String.fromCharCode(
              n >> 24 & 255,
              n >> 16 & 255,
              n >> 8 & 255,
              n & 255
            ));
          });
          md5.update(nonce2.toString("binary"));
          socket.setTimeout(0);
          socket.setNoDelay(true);
          try {
            var hashBuffer = new Buffer(md5.digest("binary"), "binary");
            var handshakeBuffer = new Buffer(headerBuffer.length + hashBuffer.length);
            headerBuffer.copy(handshakeBuffer, 0);
            hashBuffer.copy(handshakeBuffer, headerBuffer.length);
            socket.write(handshakeBuffer, "binary", function(err) {
              if (err) return;
              var client = new WebSocket([req, socket, rest2], {
                protocolVersion: "hixie-76",
                protocol: protocol
              });
              if (self.options.clientTracking) {
                self.clients.push(client);
                client.on("close", function() {
                  var index = self.clients.indexOf(client);
                  if (index != -1) {
                    self.clients.splice(index, 1);
                  }
                });
              }
              socket.removeListener("error", errorHandler);
              cb(client);
            });
          } catch (e) {
            try {
              socket.destroy();
            } catch (e2) {
            }
            return;
          }
        };
        var nonceLength = 8;
        if (upgradeHead && upgradeHead.length >= nonceLength) {
          var nonce = upgradeHead.slice(0, nonceLength);
          var rest = upgradeHead.length > nonceLength ? upgradeHead.slice(nonceLength) : null;
          completeHandshake.call(self, nonce, rest, buildResponseHeader());
        } else {
          var nonce = new Buffer(nonceLength);
          upgradeHead.copy(nonce, 0);
          var received = upgradeHead.length;
          var rest = null;
          var handler = function(data) {
            var toRead = Math.min(data.length, nonceLength - received);
            if (toRead === 0) return;
            data.copy(nonce, received, 0, toRead);
            received += toRead;
            if (received == nonceLength) {
              socket.removeListener("data", handler);
              if (toRead < data.length) rest = data.slice(toRead);
              completeHandshake.call(self, nonce, rest, new Buffer(0));
            }
          };
          socket.on("data", handler);
          handshakeResponse();
        }
      };
      if (typeof this.options.verifyClient == "function") {
        var info = {
          origin: origin,
          secure: typeof req.connection.authorized !== "undefined" || typeof req.connection.encrypted !== "undefined",
          req: req
        };
        if (this.options.verifyClient.length == 2) {
          var self = this;
          this.options.verifyClient(info, function(result, code, name) {
            if (typeof code === "undefined") code = 401;
            if (typeof name === "undefined") name = http.STATUS_CODES[code];
            if (!result) abortConnection(socket, code, name);
            else onClientVerified.apply(self);
          });
          return;
        } else if (!this.options.verifyClient(info)) {
          abortConnection(socket, 401, "Unauthorized");
          return;
        }
      }
      onClientVerified();
    }
    function acceptExtensions(offer) {
      var extensions = {};
      var options = this.options.perMessageDeflate;
      var maxPayload = this.options.maxPayload;
      if (options && offer[PerMessageDeflate.extensionName]) {
        var perMessageDeflate = new PerMessageDeflate(options !== true ? options : {}, true, maxPayload);
        perMessageDeflate.accept(offer[PerMessageDeflate.extensionName]);
        extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
      }
      return extensions;
    }
    function abortConnection(socket, code, name) {
      try {
        var response = [
          "HTTP/1.1 " + code + " " + name,
          "Content-type: text/html"
        ];
        socket.write(response.concat("", "").join("\r\n"));
      } catch (e) {
      } finally {
        try {
          socket.destroy();
        } catch (e) {
        }
      }
    }
  }
});

// ../../../private/tmp/test-ws/node_modules/ws/index.js
var WS = module.exports = require_WebSocket();
WS.Server = require_WebSocketServer();
WS.Sender = require_Sender();
WS.Receiver = require_Receiver();
WS.createServer = function createServer(options, fn) {
  var server = new WS.Server(options);
  if (typeof fn === "function") {
    server.on("connection", fn);
  }
  return server;
};
WS.connect = WS.createConnection = function connect(address, fn) {
  var client = new WS(address);
  if (typeof fn === "function") {
    client.on("open", fn);
  }
  return client;
};
/*! Bundled license information:

options/lib/options.js:
  (*!
   * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
   * MIT Licensed
   *)

ws/lib/ErrorCodes.js:
ws/lib/BufferUtil.fallback.js:
ws/lib/BufferUtil.js:
ws/lib/Sender.js:
ws/lib/Validation.fallback.js:
ws/lib/Validation.js:
ws/lib/BufferPool.js:
ws/lib/Receiver.js:
ws/lib/Sender.hixie.js:
ws/lib/Receiver.hixie.js:
ws/lib/WebSocket.js:
ws/lib/WebSocketServer.js:
ws/index.js:
  (*!
   * ws: a node.js websocket client
   * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
   * MIT Licensed
   *)
*/
