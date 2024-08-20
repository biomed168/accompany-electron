"use strict";
const SUFFIX = "electron";
const THEME_MODE_CURRENT_CHANNEL = "theme-mode:current";
const THEME_MODE_TOGGLE_CHANNEL = "theme-mode:toggle";
const THEME_MODE_DARK_CHANNEL = "theme-mode:dark";
const THEME_MODE_LIGHT_CHANNEL = "theme-mode:light";
const THEME_MODE_SYSTEM_CHANNEL = "theme-mode:system";
function exposeThemeContext() {
  const { ipcRenderer } = window.require("electron");
  return {
    themeMode: {
      current: () => ipcRenderer.invoke(THEME_MODE_CURRENT_CHANNEL),
      toggle: () => ipcRenderer.invoke(THEME_MODE_TOGGLE_CHANNEL),
      dark: () => ipcRenderer.invoke(THEME_MODE_DARK_CHANNEL),
      light: () => ipcRenderer.invoke(THEME_MODE_LIGHT_CHANNEL),
      system: () => ipcRenderer.invoke(THEME_MODE_SYSTEM_CHANNEL)
    }
  };
}
const WIN_MINIMIZE_CHANNEL = "window:minimize";
const WIN_MAXIMIZE_CHANNEL = "window:maximize";
const WIN_CLOSE_CHANNEL = "window:close";
function exposeWindowContext() {
  const { ipcRenderer } = window.require("electron");
  return {
    electronWindow: {
      minimize: () => ipcRenderer.invoke(WIN_MINIMIZE_CHANNEL),
      maximize: () => ipcRenderer.invoke(WIN_MAXIMIZE_CHANNEL),
      close: () => ipcRenderer.invoke(WIN_CLOSE_CHANNEL)
    }
  };
}
const SETTINGS_MODE_GET = "settings-mode:get";
const SETTINGS_MODE_SET = "settings-mode:set";
const SETTINGS_MODE_GET_LIBRARY = "settings-mode:get-library";
const SETTINGS_MODE_SET_LIBRARY = "settings-mode:set-library";
function exposeSettingsContext() {
  const { ipcRenderer } = window.require("electron");
  return {
    settingsMode: {
      set: () => ipcRenderer.invoke(SETTINGS_MODE_GET),
      get: () => ipcRenderer.invoke(SETTINGS_MODE_SET),
      getLibrary: () => ipcRenderer.invoke(SETTINGS_MODE_GET_LIBRARY),
      setLibrary: () => ipcRenderer.invoke(SETTINGS_MODE_SET_LIBRARY)
    }
  };
}
function exposeContexts() {
  const { contextBridge } = window.require("electron");
  contextBridge.exposeInMainWorld(SUFFIX, {
    ...exposeWindowContext(),
    ...exposeThemeContext(),
    ...exposeSettingsContext()
  });
}
exposeContexts();
