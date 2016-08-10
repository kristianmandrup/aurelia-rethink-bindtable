'use strict';

exports.__esModule = true;

function _interopExportWildcard(obj, defaults) { var newObj = defaults({}, obj); delete newObj['default']; return newObj; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

var _bindable = require('./bindable');

_defaults(exports, _interopExportWildcard(_bindable, _defaults));

var _bindtable = require('./bindtable');

_defaults(exports, _interopExportWildcard(_bindtable, _defaults));

var _decorators = require('./decorators');

_defaults(exports, _interopExportWildcard(_decorators, _defaults));