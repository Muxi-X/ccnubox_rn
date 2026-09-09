'use strict';

const Clipboard = require('@react-native-oh-tpl/clipboard').default;

async function setStringAsync(value) {
  Clipboard.setString(String(value));
  return true;
}

async function getStringAsync() {
  return Clipboard.getString();
}

async function hasStringAsync() {
  return Clipboard.hasString();
}

async function setUrlAsync(value) {
  Clipboard.setString(String(value));
}

async function getUrlAsync() {
  const value = await Clipboard.getString();
  return value || null;
}

async function setImageAsync(value) {
  Clipboard.setImage(String(value));
}

async function getImageAsync() {
  return Clipboard.getImagePNG();
}

module.exports = {
  setStringAsync,
  getStringAsync,
  hasStringAsync,
  setUrlAsync,
  getUrlAsync,
  setImageAsync,
  getImageAsync,
};
