"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/faculty/biometric/register/route";
exports.ids = ["app/api/faculty/biometric/register/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "punycode":
/*!***************************!*\
  !*** external "punycode" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("punycode");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Ffaculty%2Fbiometric%2Fregister%2Froute&page=%2Fapi%2Ffaculty%2Fbiometric%2Fregister%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ffaculty%2Fbiometric%2Fregister%2Froute.ts&appDir=%2FUsers%2Fmr_singh_7112%2FDesktop%2Fcampus%20mind%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fmr_singh_7112%2FDesktop%2Fcampus%20mind&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Ffaculty%2Fbiometric%2Fregister%2Froute&page=%2Fapi%2Ffaculty%2Fbiometric%2Fregister%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ffaculty%2Fbiometric%2Fregister%2Froute.ts&appDir=%2FUsers%2Fmr_singh_7112%2FDesktop%2Fcampus%20mind%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fmr_singh_7112%2FDesktop%2Fcampus%20mind&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   headerHooks: () => (/* binding */ headerHooks),\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage),\n/* harmony export */   staticGenerationBailout: () => (/* binding */ staticGenerationBailout)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_mr_singh_7112_Desktop_campus_mind_src_app_api_faculty_biometric_register_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/faculty/biometric/register/route.ts */ \"(rsc)/./src/app/api/faculty/biometric/register/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/faculty/biometric/register/route\",\n        pathname: \"/api/faculty/biometric/register\",\n        filename: \"route\",\n        bundlePath: \"app/api/faculty/biometric/register/route\"\n    },\n    resolvedPagePath: \"/Users/mr_singh_7112/Desktop/campus mind/src/app/api/faculty/biometric/register/route.ts\",\n    nextConfigOutput,\n    userland: _Users_mr_singh_7112_Desktop_campus_mind_src_app_api_faculty_biometric_register_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks, headerHooks, staticGenerationBailout } = routeModule;\nconst originalPathname = \"/api/faculty/biometric/register/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZmYWN1bHR5JTJGYmlvbWV0cmljJTJGcmVnaXN0ZXIlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmZhY3VsdHklMkZiaW9tZXRyaWMlMkZyZWdpc3RlciUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmZhY3VsdHklMkZiaW9tZXRyaWMlMkZyZWdpc3RlciUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRm1yX3NpbmdoXzcxMTIlMkZEZXNrdG9wJTJGY2FtcHVzJTIwbWluZCUyRnNyYyUyRmFwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9JTJGVXNlcnMlMkZtcl9zaW5naF83MTEyJTJGRGVza3RvcCUyRmNhbXB1cyUyMG1pbmQmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQXNHO0FBQ3ZDO0FBQ2M7QUFDd0M7QUFDckg7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdIQUFtQjtBQUMzQztBQUNBLGNBQWMseUVBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSx1R0FBdUc7QUFDL0c7QUFDQTtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUM2Sjs7QUFFN0oiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jYW1wdXMtbWluZC8/ZDFjMyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCIvVXNlcnMvbXJfc2luZ2hfNzExMi9EZXNrdG9wL2NhbXB1cyBtaW5kL3NyYy9hcHAvYXBpL2ZhY3VsdHkvYmlvbWV0cmljL3JlZ2lzdGVyL3JvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9mYWN1bHR5L2Jpb21ldHJpYy9yZWdpc3Rlci9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2ZhY3VsdHkvYmlvbWV0cmljL3JlZ2lzdGVyXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9mYWN1bHR5L2Jpb21ldHJpYy9yZWdpc3Rlci9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIi9Vc2Vycy9tcl9zaW5naF83MTEyL0Rlc2t0b3AvY2FtcHVzIG1pbmQvc3JjL2FwcC9hcGkvZmFjdWx0eS9iaW9tZXRyaWMvcmVnaXN0ZXIvcm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgaGVhZGVySG9va3MsIHN0YXRpY0dlbmVyYXRpb25CYWlsb3V0IH0gPSByb3V0ZU1vZHVsZTtcbmNvbnN0IG9yaWdpbmFsUGF0aG5hbWUgPSBcIi9hcGkvZmFjdWx0eS9iaW9tZXRyaWMvcmVnaXN0ZXIvcm91dGVcIjtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgc2VydmVySG9va3MsXG4gICAgICAgIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgaGVhZGVySG9va3MsIHN0YXRpY0dlbmVyYXRpb25CYWlsb3V0LCBvcmlnaW5hbFBhdGhuYW1lLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Ffaculty%2Fbiometric%2Fregister%2Froute&page=%2Fapi%2Ffaculty%2Fbiometric%2Fregister%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ffaculty%2Fbiometric%2Fregister%2Froute.ts&appDir=%2FUsers%2Fmr_singh_7112%2FDesktop%2Fcampus%20mind%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fmr_singh_7112%2FDesktop%2Fcampus%20mind&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./src/app/api/faculty/biometric/register/route.ts":
/*!*********************************************************!*\
  !*** ./src/app/api/faculty/biometric/register/route.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/web/exports/next-response */ \"(rsc)/./node_modules/next/dist/server/web/exports/next-response.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./src/lib/prisma.ts\");\n/* harmony import */ var _simplewebauthn_server__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @simplewebauthn/server */ \"(rsc)/./node_modules/@simplewebauthn/server/esm/index.js\");\n\n\n\nasync function POST(request) {\n    try {\n        const { facultyId } = await request.json();\n        if (!facultyId) {\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                error: \"Faculty ID is required\"\n            }, {\n                status: 400\n            });\n        }\n        // Get faculty details\n        const faculty = await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.facultyMember.findUnique({\n            where: {\n                id: facultyId\n            }\n        });\n        if (!faculty) {\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                error: \"Faculty not found\"\n            }, {\n                status: 404\n            });\n        }\n        // Generate registration options\n        const options = await (0,_simplewebauthn_server__WEBPACK_IMPORTED_MODULE_2__.generateRegistrationOptions)({\n            rpName: \"Campus Mind\",\n            rpID: process.env.WEBAUTHN_RP_ID || \"localhost\",\n            userID: facultyId,\n            userName: faculty.email,\n            attestationType: \"none\",\n            authenticatorSelection: {\n                authenticatorAttachment: \"platform\",\n                requireResidentKey: false,\n                userVerification: \"preferred\"\n            }\n        });\n        // Store challenge in database for verification\n        await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.facultyWebAuthnCredential.create({\n            data: {\n                facultyId,\n                credentialId: \"\",\n                publicKey: \"\"\n            }\n        });\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json(options);\n    } catch (error) {\n        console.error(\"Error in biometric registration:\", error);\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            error: \"Failed to start registration\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS9mYWN1bHR5L2Jpb21ldHJpYy9yZWdpc3Rlci9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQTBDO0FBQ0w7QUFDK0I7QUFFN0QsZUFBZUcsS0FBS0MsT0FBZ0I7SUFDekMsSUFBSTtRQUNGLE1BQU0sRUFBRUMsU0FBUyxFQUFFLEdBQUcsTUFBTUQsUUFBUUUsSUFBSTtRQUV4QyxJQUFJLENBQUNELFdBQVc7WUFDZCxPQUFPTCxrRkFBWUEsQ0FBQ00sSUFBSSxDQUFDO2dCQUFFQyxPQUFPO1lBQXlCLEdBQUc7Z0JBQUVDLFFBQVE7WUFBSTtRQUM5RTtRQUVBLHNCQUFzQjtRQUN0QixNQUFNQyxVQUFVLE1BQU1SLCtDQUFNQSxDQUFDUyxhQUFhLENBQUNDLFVBQVUsQ0FBQztZQUNwREMsT0FBTztnQkFBRUMsSUFBSVI7WUFBVTtRQUN6QjtRQUVBLElBQUksQ0FBQ0ksU0FBUztZQUNaLE9BQU9ULGtGQUFZQSxDQUFDTSxJQUFJLENBQUM7Z0JBQUVDLE9BQU87WUFBb0IsR0FBRztnQkFBRUMsUUFBUTtZQUFJO1FBQ3pFO1FBRUEsZ0NBQWdDO1FBQ2hDLE1BQU1NLFVBQVUsTUFBTVosbUZBQTJCQSxDQUFDO1lBQ2hEYSxRQUFRO1lBQ1JDLE1BQU1DLFFBQVFDLEdBQUcsQ0FBQ0MsY0FBYyxJQUFJO1lBQ3BDQyxRQUFRZjtZQUNSZ0IsVUFBVVosUUFBUWEsS0FBSztZQUN2QkMsaUJBQWlCO1lBQ2pCQyx3QkFBd0I7Z0JBQ3RCQyx5QkFBeUI7Z0JBQ3pCQyxvQkFBb0I7Z0JBQ3BCQyxrQkFBa0I7WUFDcEI7UUFDRjtRQUVBLCtDQUErQztRQUMvQyxNQUFNMUIsK0NBQU1BLENBQUMyQix5QkFBeUIsQ0FBQ0MsTUFBTSxDQUFDO1lBQzVDQyxNQUFNO2dCQUNKekI7Z0JBQ0EwQixjQUFjO2dCQUNkQyxXQUFXO1lBQ2I7UUFDRjtRQUVBLE9BQU9oQyxrRkFBWUEsQ0FBQ00sSUFBSSxDQUFDUTtJQUMzQixFQUFFLE9BQU9QLE9BQVk7UUFDbkIwQixRQUFRMUIsS0FBSyxDQUFDLG9DQUFvQ0E7UUFDbEQsT0FBT1Asa0ZBQVlBLENBQUNNLElBQUksQ0FDdEI7WUFBRUMsT0FBTztRQUErQixHQUN4QztZQUFFQyxRQUFRO1FBQUk7SUFFbEI7QUFDRiIsInNvdXJjZXMiOlsid2VicGFjazovL2NhbXB1cy1taW5kLy4vc3JjL2FwcC9hcGkvZmFjdWx0eS9iaW9tZXRyaWMvcmVnaXN0ZXIvcm91dGUudHM/OTFkMCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVzcG9uc2UgfSBmcm9tICduZXh0L3NlcnZlcidcbmltcG9ydCB7IHByaXNtYSB9IGZyb20gJ0AvbGliL3ByaXNtYSdcbmltcG9ydCB7IGdlbmVyYXRlUmVnaXN0cmF0aW9uT3B0aW9ucyB9IGZyb20gJ0BzaW1wbGV3ZWJhdXRobi9zZXJ2ZXInXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBQT1NUKHJlcXVlc3Q6IFJlcXVlc3QpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCB7IGZhY3VsdHlJZCB9ID0gYXdhaXQgcmVxdWVzdC5qc29uKClcblxuICAgIGlmICghZmFjdWx0eUlkKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ0ZhY3VsdHkgSUQgaXMgcmVxdWlyZWQnIH0sIHsgc3RhdHVzOiA0MDAgfSlcbiAgICB9XG5cbiAgICAvLyBHZXQgZmFjdWx0eSBkZXRhaWxzXG4gICAgY29uc3QgZmFjdWx0eSA9IGF3YWl0IHByaXNtYS5mYWN1bHR5TWVtYmVyLmZpbmRVbmlxdWUoe1xuICAgICAgd2hlcmU6IHsgaWQ6IGZhY3VsdHlJZCB9LFxuICAgIH0pXG5cbiAgICBpZiAoIWZhY3VsdHkpIHtcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnRmFjdWx0eSBub3QgZm91bmQnIH0sIHsgc3RhdHVzOiA0MDQgfSlcbiAgICB9XG5cbiAgICAvLyBHZW5lcmF0ZSByZWdpc3RyYXRpb24gb3B0aW9uc1xuICAgIGNvbnN0IG9wdGlvbnMgPSBhd2FpdCBnZW5lcmF0ZVJlZ2lzdHJhdGlvbk9wdGlvbnMoe1xuICAgICAgcnBOYW1lOiAnQ2FtcHVzIE1pbmQnLFxuICAgICAgcnBJRDogcHJvY2Vzcy5lbnYuV0VCQVVUSE5fUlBfSUQgfHwgJ2xvY2FsaG9zdCcsXG4gICAgICB1c2VySUQ6IGZhY3VsdHlJZCxcbiAgICAgIHVzZXJOYW1lOiBmYWN1bHR5LmVtYWlsLFxuICAgICAgYXR0ZXN0YXRpb25UeXBlOiAnbm9uZScsXG4gICAgICBhdXRoZW50aWNhdG9yU2VsZWN0aW9uOiB7XG4gICAgICAgIGF1dGhlbnRpY2F0b3JBdHRhY2htZW50OiAncGxhdGZvcm0nLFxuICAgICAgICByZXF1aXJlUmVzaWRlbnRLZXk6IGZhbHNlLFxuICAgICAgICB1c2VyVmVyaWZpY2F0aW9uOiAncHJlZmVycmVkJyxcbiAgICAgIH0sXG4gICAgfSlcblxuICAgIC8vIFN0b3JlIGNoYWxsZW5nZSBpbiBkYXRhYmFzZSBmb3IgdmVyaWZpY2F0aW9uXG4gICAgYXdhaXQgcHJpc21hLmZhY3VsdHlXZWJBdXRobkNyZWRlbnRpYWwuY3JlYXRlKHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgZmFjdWx0eUlkLFxuICAgICAgICBjcmVkZW50aWFsSWQ6ICcnLCAvLyBXaWxsIGJlIHVwZGF0ZWQgYWZ0ZXIgdmVyaWZpY2F0aW9uXG4gICAgICAgIHB1YmxpY0tleTogJycsIC8vIFdpbGwgYmUgdXBkYXRlZCBhZnRlciB2ZXJpZmljYXRpb25cbiAgICAgIH0sXG4gICAgfSlcblxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihvcHRpb25zKVxuICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gYmlvbWV0cmljIHJlZ2lzdHJhdGlvbjonLCBlcnJvcilcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICB7IGVycm9yOiAnRmFpbGVkIHRvIHN0YXJ0IHJlZ2lzdHJhdGlvbicgfSxcbiAgICAgIHsgc3RhdHVzOiA1MDAgfVxuICAgIClcbiAgfVxufSAiXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwicHJpc21hIiwiZ2VuZXJhdGVSZWdpc3RyYXRpb25PcHRpb25zIiwiUE9TVCIsInJlcXVlc3QiLCJmYWN1bHR5SWQiLCJqc29uIiwiZXJyb3IiLCJzdGF0dXMiLCJmYWN1bHR5IiwiZmFjdWx0eU1lbWJlciIsImZpbmRVbmlxdWUiLCJ3aGVyZSIsImlkIiwib3B0aW9ucyIsInJwTmFtZSIsInJwSUQiLCJwcm9jZXNzIiwiZW52IiwiV0VCQVVUSE5fUlBfSUQiLCJ1c2VySUQiLCJ1c2VyTmFtZSIsImVtYWlsIiwiYXR0ZXN0YXRpb25UeXBlIiwiYXV0aGVudGljYXRvclNlbGVjdGlvbiIsImF1dGhlbnRpY2F0b3JBdHRhY2htZW50IiwicmVxdWlyZVJlc2lkZW50S2V5IiwidXNlclZlcmlmaWNhdGlvbiIsImZhY3VsdHlXZWJBdXRobkNyZWRlbnRpYWwiLCJjcmVhdGUiLCJkYXRhIiwiY3JlZGVudGlhbElkIiwicHVibGljS2V5IiwiY29uc29sZSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/faculty/biometric/register/route.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/prisma.ts":
/*!***************************!*\
  !*** ./src/lib/prisma.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst globalForPrisma = global;\nconst prisma = globalForPrisma.prisma || new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient({\n    log: [\n        \"query\"\n    ]\n});\nif (true) globalForPrisma.prisma = prisma;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL3ByaXNtYS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBNkM7QUFFN0MsTUFBTUMsa0JBQWtCQztBQUVqQixNQUFNQyxTQUNYRixnQkFBZ0JFLE1BQU0sSUFDdEIsSUFBSUgsd0RBQVlBLENBQUM7SUFDZkksS0FBSztRQUFDO0tBQVE7QUFDaEIsR0FBRTtBQUVKLElBQUlDLElBQXlCLEVBQWNKLGdCQUFnQkUsTUFBTSxHQUFHQSIsInNvdXJjZXMiOlsid2VicGFjazovL2NhbXB1cy1taW5kLy4vc3JjL2xpYi9wcmlzbWEudHM/MDFkNyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQcmlzbWFDbGllbnQgfSBmcm9tICdAcHJpc21hL2NsaWVudCdcblxuY29uc3QgZ2xvYmFsRm9yUHJpc21hID0gZ2xvYmFsIGFzIHVua25vd24gYXMgeyBwcmlzbWE6IFByaXNtYUNsaWVudCB9XG5cbmV4cG9ydCBjb25zdCBwcmlzbWEgPVxuICBnbG9iYWxGb3JQcmlzbWEucHJpc21hIHx8XG4gIG5ldyBQcmlzbWFDbGllbnQoe1xuICAgIGxvZzogWydxdWVyeSddLFxuICB9KVxuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykgZ2xvYmFsRm9yUHJpc21hLnByaXNtYSA9IHByaXNtYSAiXSwibmFtZXMiOlsiUHJpc21hQ2xpZW50IiwiZ2xvYmFsRm9yUHJpc21hIiwiZ2xvYmFsIiwicHJpc21hIiwibG9nIiwicHJvY2VzcyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/prisma.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/tslib","vendor-chunks/@peculiar","vendor-chunks/@simplewebauthn","vendor-chunks/node-fetch","vendor-chunks/@levischuck","vendor-chunks/@hexagon","vendor-chunks/pvutils","vendor-chunks/pvtsutils","vendor-chunks/cross-fetch","vendor-chunks/asn1js"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Ffaculty%2Fbiometric%2Fregister%2Froute&page=%2Fapi%2Ffaculty%2Fbiometric%2Fregister%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ffaculty%2Fbiometric%2Fregister%2Froute.ts&appDir=%2FUsers%2Fmr_singh_7112%2FDesktop%2Fcampus%20mind%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fmr_singh_7112%2FDesktop%2Fcampus%20mind&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();