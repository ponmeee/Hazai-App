// https://docs.expo.dev/guides/customizing-metro/
const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// server/ は独立した Node.js パッケージ。バンドル・監視・型付きルートの生成対象から外す
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const serverDir = escapeRegExp(path.resolve(__dirname, 'server')).replace(/\\\\|\//g, '[\\\\/]');
config.resolver.blockList = [new RegExp(`^${serverDir}[\\\\/].*$`)];

module.exports = config;
