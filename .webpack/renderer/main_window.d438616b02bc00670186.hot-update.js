/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdatehockey_pr"]("main_window",{

/***/ "./node_modules/env-paths/index.js":
/*!*****************************************!*\
  !*** ./node_modules/env-paths/index.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\nconst path = __webpack_require__(/*! path */ \"?05a5\");\nconst os = __webpack_require__(/*! os */ \"?5b5b\");\n\nconst homedir = os.homedir();\nconst tmpdir = os.tmpdir();\nconst {env} = process;\n\nconst macos = name => {\n\tconst library = path.join(homedir, 'Library');\n\n\treturn {\n\t\tdata: path.join(library, 'Application Support', name),\n\t\tconfig: path.join(library, 'Preferences', name),\n\t\tcache: path.join(library, 'Caches', name),\n\t\tlog: path.join(library, 'Logs', name),\n\t\ttemp: path.join(tmpdir, name)\n\t};\n};\n\nconst windows = name => {\n\tconst appData = env.APPDATA || path.join(homedir, 'AppData', 'Roaming');\n\tconst localAppData = env.LOCALAPPDATA || path.join(homedir, 'AppData', 'Local');\n\n\treturn {\n\t\t// Data/config/cache/log are invented by me as Windows isn't opinionated about this\n\t\tdata: path.join(localAppData, name, 'Data'),\n\t\tconfig: path.join(appData, name, 'Config'),\n\t\tcache: path.join(localAppData, name, 'Cache'),\n\t\tlog: path.join(localAppData, name, 'Log'),\n\t\ttemp: path.join(tmpdir, name)\n\t};\n};\n\n// https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html\nconst linux = name => {\n\tconst username = path.basename(homedir);\n\n\treturn {\n\t\tdata: path.join(env.XDG_DATA_HOME || path.join(homedir, '.local', 'share'), name),\n\t\tconfig: path.join(env.XDG_CONFIG_HOME || path.join(homedir, '.config'), name),\n\t\tcache: path.join(env.XDG_CACHE_HOME || path.join(homedir, '.cache'), name),\n\t\t// https://wiki.debian.org/XDGBaseDirectorySpecification#state\n\t\tlog: path.join(env.XDG_STATE_HOME || path.join(homedir, '.local', 'state'), name),\n\t\ttemp: path.join(tmpdir, username, name)\n\t};\n};\n\nconst envPaths = (name, options) => {\n\tif (typeof name !== 'string') {\n\t\tthrow new TypeError(`Expected string, got ${typeof name}`);\n\t}\n\n\toptions = Object.assign({suffix: 'nodejs'}, options);\n\n\tif (options.suffix) {\n\t\t// Add suffix to prevent possible conflict with native apps\n\t\tname += `-${options.suffix}`;\n\t}\n\n\tif (process.platform === 'darwin') {\n\t\treturn macos(name);\n\t}\n\n\tif (process.platform === 'win32') {\n\t\treturn windows(name);\n\t}\n\n\treturn linux(name);\n};\n\nmodule.exports = envPaths;\n// TODO: Remove this for the next major release\nmodule.exports[\"default\"] = envPaths;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9ub2RlX21vZHVsZXMvZW52LXBhdGhzL2luZGV4LmpzIiwibWFwcGluZ3MiOiJBQUFhO0FBQ2IsYUFBYSxtQkFBTyxDQUFDLG1CQUFNO0FBQzNCLFdBQVcsbUJBQU8sQ0FBQyxpQkFBSTs7QUFFdkI7QUFDQTtBQUNBLE9BQU8sS0FBSzs7QUFFWjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSw4Q0FBOEMsWUFBWTtBQUMxRDs7QUFFQSwwQkFBMEIsaUJBQWlCOztBQUUzQztBQUNBO0FBQ0EsY0FBYyxlQUFlO0FBQzdCOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EseUJBQXNCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vaG9ja2V5LXByLy4vbm9kZV9tb2R1bGVzL2Vudi1wYXRocy9pbmRleC5qcz9mYTg3Il0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBvcyA9IHJlcXVpcmUoJ29zJyk7XG5cbmNvbnN0IGhvbWVkaXIgPSBvcy5ob21lZGlyKCk7XG5jb25zdCB0bXBkaXIgPSBvcy50bXBkaXIoKTtcbmNvbnN0IHtlbnZ9ID0gcHJvY2VzcztcblxuY29uc3QgbWFjb3MgPSBuYW1lID0+IHtcblx0Y29uc3QgbGlicmFyeSA9IHBhdGguam9pbihob21lZGlyLCAnTGlicmFyeScpO1xuXG5cdHJldHVybiB7XG5cdFx0ZGF0YTogcGF0aC5qb2luKGxpYnJhcnksICdBcHBsaWNhdGlvbiBTdXBwb3J0JywgbmFtZSksXG5cdFx0Y29uZmlnOiBwYXRoLmpvaW4obGlicmFyeSwgJ1ByZWZlcmVuY2VzJywgbmFtZSksXG5cdFx0Y2FjaGU6IHBhdGguam9pbihsaWJyYXJ5LCAnQ2FjaGVzJywgbmFtZSksXG5cdFx0bG9nOiBwYXRoLmpvaW4obGlicmFyeSwgJ0xvZ3MnLCBuYW1lKSxcblx0XHR0ZW1wOiBwYXRoLmpvaW4odG1wZGlyLCBuYW1lKVxuXHR9O1xufTtcblxuY29uc3Qgd2luZG93cyA9IG5hbWUgPT4ge1xuXHRjb25zdCBhcHBEYXRhID0gZW52LkFQUERBVEEgfHwgcGF0aC5qb2luKGhvbWVkaXIsICdBcHBEYXRhJywgJ1JvYW1pbmcnKTtcblx0Y29uc3QgbG9jYWxBcHBEYXRhID0gZW52LkxPQ0FMQVBQREFUQSB8fCBwYXRoLmpvaW4oaG9tZWRpciwgJ0FwcERhdGEnLCAnTG9jYWwnKTtcblxuXHRyZXR1cm4ge1xuXHRcdC8vIERhdGEvY29uZmlnL2NhY2hlL2xvZyBhcmUgaW52ZW50ZWQgYnkgbWUgYXMgV2luZG93cyBpc24ndCBvcGluaW9uYXRlZCBhYm91dCB0aGlzXG5cdFx0ZGF0YTogcGF0aC5qb2luKGxvY2FsQXBwRGF0YSwgbmFtZSwgJ0RhdGEnKSxcblx0XHRjb25maWc6IHBhdGguam9pbihhcHBEYXRhLCBuYW1lLCAnQ29uZmlnJyksXG5cdFx0Y2FjaGU6IHBhdGguam9pbihsb2NhbEFwcERhdGEsIG5hbWUsICdDYWNoZScpLFxuXHRcdGxvZzogcGF0aC5qb2luKGxvY2FsQXBwRGF0YSwgbmFtZSwgJ0xvZycpLFxuXHRcdHRlbXA6IHBhdGguam9pbih0bXBkaXIsIG5hbWUpXG5cdH07XG59O1xuXG4vLyBodHRwczovL3NwZWNpZmljYXRpb25zLmZyZWVkZXNrdG9wLm9yZy9iYXNlZGlyLXNwZWMvYmFzZWRpci1zcGVjLWxhdGVzdC5odG1sXG5jb25zdCBsaW51eCA9IG5hbWUgPT4ge1xuXHRjb25zdCB1c2VybmFtZSA9IHBhdGguYmFzZW5hbWUoaG9tZWRpcik7XG5cblx0cmV0dXJuIHtcblx0XHRkYXRhOiBwYXRoLmpvaW4oZW52LlhER19EQVRBX0hPTUUgfHwgcGF0aC5qb2luKGhvbWVkaXIsICcubG9jYWwnLCAnc2hhcmUnKSwgbmFtZSksXG5cdFx0Y29uZmlnOiBwYXRoLmpvaW4oZW52LlhER19DT05GSUdfSE9NRSB8fCBwYXRoLmpvaW4oaG9tZWRpciwgJy5jb25maWcnKSwgbmFtZSksXG5cdFx0Y2FjaGU6IHBhdGguam9pbihlbnYuWERHX0NBQ0hFX0hPTUUgfHwgcGF0aC5qb2luKGhvbWVkaXIsICcuY2FjaGUnKSwgbmFtZSksXG5cdFx0Ly8gaHR0cHM6Ly93aWtpLmRlYmlhbi5vcmcvWERHQmFzZURpcmVjdG9yeVNwZWNpZmljYXRpb24jc3RhdGVcblx0XHRsb2c6IHBhdGguam9pbihlbnYuWERHX1NUQVRFX0hPTUUgfHwgcGF0aC5qb2luKGhvbWVkaXIsICcubG9jYWwnLCAnc3RhdGUnKSwgbmFtZSksXG5cdFx0dGVtcDogcGF0aC5qb2luKHRtcGRpciwgdXNlcm5hbWUsIG5hbWUpXG5cdH07XG59O1xuXG5jb25zdCBlbnZQYXRocyA9IChuYW1lLCBvcHRpb25zKSA9PiB7XG5cdGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBzdHJpbmcsIGdvdCAke3R5cGVvZiBuYW1lfWApO1xuXHR9XG5cblx0b3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe3N1ZmZpeDogJ25vZGVqcyd9LCBvcHRpb25zKTtcblxuXHRpZiAob3B0aW9ucy5zdWZmaXgpIHtcblx0XHQvLyBBZGQgc3VmZml4IHRvIHByZXZlbnQgcG9zc2libGUgY29uZmxpY3Qgd2l0aCBuYXRpdmUgYXBwc1xuXHRcdG5hbWUgKz0gYC0ke29wdGlvbnMuc3VmZml4fWA7XG5cdH1cblxuXHRpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2RhcndpbicpIHtcblx0XHRyZXR1cm4gbWFjb3MobmFtZSk7XG5cdH1cblxuXHRpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJykge1xuXHRcdHJldHVybiB3aW5kb3dzKG5hbWUpO1xuXHR9XG5cblx0cmV0dXJuIGxpbnV4KG5hbWUpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBlbnZQYXRocztcbi8vIFRPRE86IFJlbW92ZSB0aGlzIGZvciB0aGUgbmV4dCBtYWpvciByZWxlYXNlXG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gZW52UGF0aHM7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./node_modules/env-paths/index.js\n");

/***/ }),

/***/ "./src/preload/preload.ts":
/*!********************************!*\
  !*** ./src/preload/preload.ts ***!
  \********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";
eval("\nvar __importDefault = (this && this.__importDefault) || function (mod) {\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst electron_1 = __webpack_require__(/*! electron */ \"electron\");\nconst electron_store_1 = __importDefault(__webpack_require__(/*! electron-store */ \"./node_modules/electron-store/index.js\"));\nconst store = new electron_store_1.default();\n// Exponer funciones seguras al proceso de renderizado\nelectron_1.contextBridge.exposeInMainWorld('electron', {\n    getGithubToken: () => electron_1.ipcRenderer.invoke('get-github-token'),\n    setGithubToken: (token) => electron_1.ipcRenderer.invoke('set-github-token', token)\n});\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvcHJlbG9hZC9wcmVsb2FkLnRzIiwibWFwcGluZ3MiOiJBQUFhO0FBQ2I7QUFDQSw2Q0FBNkM7QUFDN0M7QUFDQSw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0QsbUJBQW1CLG1CQUFPLENBQUMsMEJBQVU7QUFDckMseUNBQXlDLG1CQUFPLENBQUMsOERBQWdCO0FBQ2pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vaG9ja2V5LXByLy4vc3JjL3ByZWxvYWQvcHJlbG9hZC50cz83ZWNhIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgZWxlY3Ryb25fMSA9IHJlcXVpcmUoXCJlbGVjdHJvblwiKTtcbmNvbnN0IGVsZWN0cm9uX3N0b3JlXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImVsZWN0cm9uLXN0b3JlXCIpKTtcbmNvbnN0IHN0b3JlID0gbmV3IGVsZWN0cm9uX3N0b3JlXzEuZGVmYXVsdCgpO1xuLy8gRXhwb25lciBmdW5jaW9uZXMgc2VndXJhcyBhbCBwcm9jZXNvIGRlIHJlbmRlcml6YWRvXG5lbGVjdHJvbl8xLmNvbnRleHRCcmlkZ2UuZXhwb3NlSW5NYWluV29ybGQoJ2VsZWN0cm9uJywge1xuICAgIGdldEdpdGh1YlRva2VuOiAoKSA9PiBlbGVjdHJvbl8xLmlwY1JlbmRlcmVyLmludm9rZSgnZ2V0LWdpdGh1Yi10b2tlbicpLFxuICAgIHNldEdpdGh1YlRva2VuOiAodG9rZW4pID0+IGVsZWN0cm9uXzEuaXBjUmVuZGVyZXIuaW52b2tlKCdzZXQtZ2l0aHViLXRva2VuJywgdG9rZW4pXG59KTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/preload/preload.ts\n");

/***/ }),

/***/ "?05a5":
/*!**********************!*\
  !*** path (ignored) ***!
  \**********************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "?5b5b":
/*!********************!*\
  !*** os (ignored) ***!
  \********************/
/***/ (() => {

/* (ignored) */

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("41df91df611130b80b67")
/******/ })();
/******/ 
/******/ }
);