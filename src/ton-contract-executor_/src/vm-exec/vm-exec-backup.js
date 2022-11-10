import wasmInit from './vm-exec.wasm?init'

const Module = (() => {
  let _scriptDir =
    typeof document !== 'undefined' && document.currentScript
      ? document.currentScript.src
      : undefined
  if (typeof __filename !== 'undefined') _scriptDir = _scriptDir || __filename
  return function (Module) {
    Module = Module || {}

    var Module = typeof Module !== 'undefined' ? Module : {}
    let readyPromiseResolve, readyPromiseReject
    Module.ready = new Promise(function (resolve, reject) {
      readyPromiseResolve = resolve
      readyPromiseReject = reject
    })
    let moduleOverrides = Object.assign({}, Module)
    let arguments_ = []
    let thisProgram = './this.program'
    let quit_ = (status, toThrow) => {
      throw toThrow
    }
    const ENVIRONMENT_IS_WEB = typeof window === 'object'
    const ENVIRONMENT_IS_WORKER = typeof importScripts === 'function'
    const ENVIRONMENT_IS_NODE =
      typeof process === 'object' &&
      typeof process.versions === 'object' &&
      typeof process.versions.node === 'string'
    let scriptDirectory = ''

    function locateFile(path) {
      if (Module.locateFile) {
        return Module.locateFile(path, scriptDirectory)
      }
      return scriptDirectory + path
    }
    let read_, readAsync, readBinary, setWindowTitle

    function logExceptionOnExit(e) {
      if (e instanceof ExitStatus) return
      const toLog = e
      err('exiting due to exception: ' + toLog)
    }
    let fs
    let nodePath
    let requireNodeFS
    if (ENVIRONMENT_IS_NODE) {
      if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = require('path').dirname(scriptDirectory) + '/'
      } else {
        scriptDirectory = __dirname + '/'
      }
      requireNodeFS = () => {
        if (!nodePath) {
          fs = require('fs')
          nodePath = require('path')
        }
      }
      read_ = function shell_read(filename, binary) {
        requireNodeFS()
        filename = nodePath.normalize(filename)
        return fs.readFileSync(filename, binary ? undefined : 'utf8')
      }
      readBinary = (filename) => {
        let ret = read_(filename, true)
        if (!ret.buffer) {
          ret = new Uint8Array(ret)
        }
        return ret
      }
      readAsync = (filename, onload, onerror) => {
        requireNodeFS()
        filename = nodePath.normalize(filename)
        fs.readFile(filename, function (err, data) {
          if (err) onerror(err)
          else onload(data.buffer)
        })
      }
      if (process.argv.length > 1) {
        thisProgram = process.argv[1].replace(/\\/g, '/')
      }
      arguments_ = process.argv.slice(2)
      process.on('uncaughtException', function (ex) {
        if (!(ex instanceof ExitStatus)) {
          throw ex
        }
      })
      process.on('unhandledRejection', function (reason) {
        throw reason
      })
      quit_ = (status, toThrow) => {
        if (keepRuntimeAlive()) {
          process.exitCode = status
          throw toThrow
        }
        logExceptionOnExit(toThrow)
        process.exit(status)
      }
      Module.inspect = function () {
        return '[Emscripten Module object]'
      }
    } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
      if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = self.location.href
      } else if (typeof document !== 'undefined' && document.currentScript) {
        scriptDirectory = document.currentScript.src
      }
      if (_scriptDir) {
        scriptDirectory = _scriptDir
      }
      if (scriptDirectory.indexOf('blob:') !== 0) {
        scriptDirectory = scriptDirectory.substr(
          0,
          scriptDirectory.replace(/[?#].*/, '').lastIndexOf('/') + 1
        )
      } else {
        scriptDirectory = ''
      }
      {
        read_ = (url) => {
          const xhr = new XMLHttpRequest()
          xhr.open('GET', url, false)
          xhr.send(null)
          return xhr.responseText
        }
        if (ENVIRONMENT_IS_WORKER) {
          readBinary = (url) => {
            const xhr = new XMLHttpRequest()
            xhr.open('GET', url, false)
            xhr.responseType = 'arraybuffer'
            xhr.send(null)
            return new Uint8Array(xhr.response)
          }
        }
        readAsync = (url, onload, onerror) => {
          const xhr = new XMLHttpRequest()
          xhr.open('GET', url, true)
          xhr.responseType = 'arraybuffer'
          xhr.onload = () => {
            if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
              onload(xhr.response)
              return
            }
            onerror()
          }
          xhr.onerror = onerror
          xhr.send(null)
        }
      }
      setWindowTitle = (title) => (document.title = title)
    } else {
    }
    const out = Module.print || console.log.bind(console)
    var err = Module.printErr || console.warn.bind(console)
    Object.assign(Module, moduleOverrides)
    moduleOverrides = null
    if (Module.arguments) arguments_ = Module.arguments
    if (Module.thisProgram) thisProgram = Module.thisProgram
    if (Module.quit) quit_ = Module.quit

    function warnOnce(text) {
      if (!warnOnce.shown) warnOnce.shown = {}
      if (!warnOnce.shown[text]) {
        warnOnce.shown[text] = 1
        err(text)
      }
    }
    let tempRet0 = 0
    const setTempRet0 = (value) => {
      tempRet0 = value
    }
    const getTempRet0 = () => tempRet0
    let wasmBinary
    if (Module.wasmBinary) wasmBinary = Module.wasmBinary
    const noExitRuntime = Module.noExitRuntime || true
    if (typeof WebAssembly !== 'object') {
      abort('no native wasm support detected')
    }
    let wasmMemory
    let ABORT = false
    let EXITSTATUS
    const ALLOC_NORMAL = 0
    const ALLOC_STACK = 1

    function allocate(slab, allocator) {
      let ret
      if (allocator == ALLOC_STACK) {
        ret = stackAlloc(slab.length)
      } else {
        ret = _malloc(slab.length)
      }
      if (!slab.subarray && !slab.slice) {
        slab = new Uint8Array(slab)
      }
      HEAPU8.set(slab, ret)
      return ret
    }
    const UTF8Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf8') : undefined

    function UTF8ArrayToString(heapOrArray, idx, maxBytesToRead) {
      const endIdx = idx + maxBytesToRead
      let endPtr = idx
      while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr
      if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
        return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr))
      } else {
        var str = ''
        while (idx < endPtr) {
          let u0 = heapOrArray[idx++]
          if (!(u0 & 128)) {
            str += String.fromCharCode(u0)
            continue
          }
          const u1 = heapOrArray[idx++] & 63
          if ((u0 & 224) == 192) {
            str += String.fromCharCode(((u0 & 31) << 6) | u1)
            continue
          }
          const u2 = heapOrArray[idx++] & 63
          if ((u0 & 240) == 224) {
            u0 = ((u0 & 15) << 12) | (u1 << 6) | u2
          } else {
            u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63)
          }
          if (u0 < 65536) {
            str += String.fromCharCode(u0)
          } else {
            const ch = u0 - 65536
            str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023))
          }
        }
      }
      return str
    }

    function UTF8ToString(ptr, maxBytesToRead) {
      return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : ''
    }

    function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
      if (!(maxBytesToWrite > 0)) return 0
      const startIdx = outIdx
      const endIdx = outIdx + maxBytesToWrite - 1
      for (let i = 0; i < str.length; ++i) {
        let u = str.charCodeAt(i)
        if (u >= 55296 && u <= 57343) {
          const u1 = str.charCodeAt(++i)
          u = (65536 + ((u & 1023) << 10)) | (u1 & 1023)
        }
        if (u <= 127) {
          if (outIdx >= endIdx) break
          heap[outIdx++] = u
        } else if (u <= 2047) {
          if (outIdx + 1 >= endIdx) break
          heap[outIdx++] = 192 | (u >> 6)
          heap[outIdx++] = 128 | (u & 63)
        } else if (u <= 65535) {
          if (outIdx + 2 >= endIdx) break
          heap[outIdx++] = 224 | (u >> 12)
          heap[outIdx++] = 128 | ((u >> 6) & 63)
          heap[outIdx++] = 128 | (u & 63)
        } else {
          if (outIdx + 3 >= endIdx) break
          heap[outIdx++] = 240 | (u >> 18)
          heap[outIdx++] = 128 | ((u >> 12) & 63)
          heap[outIdx++] = 128 | ((u >> 6) & 63)
          heap[outIdx++] = 128 | (u & 63)
        }
      }
      heap[outIdx] = 0
      return outIdx - startIdx
    }

    function lengthBytesUTF8(str) {
      let len = 0
      for (let i = 0; i < str.length; ++i) {
        let u = str.charCodeAt(i)
        if (u >= 55296 && u <= 57343)
          u = (65536 + ((u & 1023) << 10)) | (str.charCodeAt(++i) & 1023)
        if (u <= 127) ++len
        else if (u <= 2047) len += 2
        else if (u <= 65535) len += 3
        else len += 4
      }
      return len
    }

    function writeArrayToMemory(array, buffer) {
      HEAP8.set(array, buffer)
    }

    function writeAsciiToMemory(str, buffer, dontAddNull) {
      for (let i = 0; i < str.length; ++i) {
        HEAP8[buffer++ >> 0] = str.charCodeAt(i)
      }
      if (!dontAddNull) HEAP8[buffer >> 0] = 0
    }
    let buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64

    function updateGlobalBufferAndViews(buf) {
      buffer = buf
      Module.HEAP8 = HEAP8 = new Int8Array(buf)
      Module.HEAP16 = HEAP16 = new Int16Array(buf)
      Module.HEAP32 = HEAP32 = new Int32Array(buf)
      Module.HEAPU8 = HEAPU8 = new Uint8Array(buf)
      Module.HEAPU16 = HEAPU16 = new Uint16Array(buf)
      Module.HEAPU32 = HEAPU32 = new Uint32Array(buf)
      Module.HEAPF32 = HEAPF32 = new Float32Array(buf)
      Module.HEAPF64 = HEAPF64 = new Float64Array(buf)
    }
    const INITIAL_MEMORY = Module.INITIAL_MEMORY || 16777216
    let wasmTable
    const __ATPRERUN__ = []
    const __ATINIT__ = []
    const __ATPOSTRUN__ = []
    let runtimeInitialized = false

    function keepRuntimeAlive() {
      return noExitRuntime
    }

    function preRun() {
      if (Module.preRun) {
        if (typeof Module.preRun === 'function') Module.preRun = [Module.preRun]
        while (Module.preRun.length) {
          addOnPreRun(Module.preRun.shift())
        }
      }
      callRuntimeCallbacks(__ATPRERUN__)
    }

    function initRuntime() {
      runtimeInitialized = true
      callRuntimeCallbacks(__ATINIT__)
    }

    function postRun() {
      if (Module.postRun) {
        if (typeof Module.postRun === 'function') Module.postRun = [Module.postRun]
        while (Module.postRun.length) {
          addOnPostRun(Module.postRun.shift())
        }
      }
      callRuntimeCallbacks(__ATPOSTRUN__)
    }

    function addOnPreRun(cb) {
      __ATPRERUN__.unshift(cb)
    }

    function addOnInit(cb) {
      __ATINIT__.unshift(cb)
    }

    function addOnPostRun(cb) {
      __ATPOSTRUN__.unshift(cb)
    }
    let runDependencies = 0
    let runDependencyWatcher = null
    let dependenciesFulfilled = null

    function addRunDependency(id) {
      runDependencies++
      if (Module.monitorRunDependencies) {
        Module.monitorRunDependencies(runDependencies)
      }
    }

    function removeRunDependency(id) {
      runDependencies--
      if (Module.monitorRunDependencies) {
        Module.monitorRunDependencies(runDependencies)
      }
      if (runDependencies == 0) {
        if (runDependencyWatcher !== null) {
          clearInterval(runDependencyWatcher)
          runDependencyWatcher = null
        }
        if (dependenciesFulfilled) {
          const callback = dependenciesFulfilled
          dependenciesFulfilled = null
          callback()
        }
      }
    }
    Module.preloadedImages = {}
    Module.preloadedAudios = {}

    function abort(what) {
      {
        if (Module.onAbort) {
          Module.onAbort(what)
        }
      }
      what = 'Aborted(' + what + ')'
      err(what)
      ABORT = true
      EXITSTATUS = 1
      what += '. Build with -s ASSERTIONS=1 for more info.'
      const e = new WebAssembly.RuntimeError(what)
      readyPromiseReject(e)
      throw e
    }
    const dataURIPrefix = 'data:application/octet-stream;base64,'

    function isDataURI(filename) {
      return filename.startsWith(dataURIPrefix)
    }

    function isFileURI(filename) {
      return filename.startsWith('file://')
    }
    // var wasmBinaryFile;
    // wasmBinaryFile = "/src/js/ton-contract-executor/src/vm-exec/vm-exec.wasm";
    // if (!isDataURI(wasmBinaryFile)) {
    // 	wasmBinaryFile = locateFile(wasmBinaryFile)
    // }

    // function getBinary(file) {
    // 	try {
    // 		if (file == wasmBinaryFile && wasmBinary) {
    // 			return new Uint8Array(wasmBinary)
    // 		}
    // 		if (readBinary) {
    // 			return readBinary(file)
    // 		} else {
    // 			throw "both async and sync fetching of the wasm failed"
    // 		}
    // 	} catch (err) {
    // 		abort(err)
    // 	}
    // }

    // function getBinaryPromise() {
    // 	if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
    // 		if (typeof fetch == "function" && !isFileURI(wasmBinaryFile)) {
    // 			return fetch(wasmBinaryFile, {
    // 				credentials: "same-origin"
    // 			}).then(function(response) {
    // 				if (!response["ok"]) {
    // 					throw "failed to load wasm binary file at '" + wasmBinaryFile + "'"
    // 				}
    // 				return response["arrayBuffer"]()
    // 			}).catch(function() {
    // 				return getBinary(wasmBinaryFile)
    // 			})
    // 		} else {
    // 			if (readAsync) {
    // 				return new Promise(function(resolve, reject) {
    // 					readAsync(wasmBinaryFile, function(response) {
    // 						resolve(new Uint8Array(response))
    // 					}, reject)
    // 				})
    // 			}
    // 		}
    // 	}
    // 	return Promise.resolve().then(function() {
    // 		return getBinary(wasmBinaryFile)
    // 	})
    // }

    function createWasm() {
      const info = {
        a: asmLibraryArg,
      }

      function receiveInstance(instance, module) {
        const exports = instance.exports
        Module.asm = exports
        wasmMemory = Module.asm.da
        updateGlobalBufferAndViews(wasmMemory.buffer)
        wasmTable = Module.asm.ha
        addOnInit(Module.asm.ea)
        removeRunDependency('wasm-instantiate')
      }
      addRunDependency('wasm-instantiate')

      function receiveInstantiationResult(result) {
        console.log('receiveInstantiationResult', result)
        receiveInstance(result)
      }

      function instantiateArrayBuffer(receiver) {
        // return getBinaryPromise().then(function(binary) {
        // return WebAssembly.instantiate(binary, info)

        // })
        return wasmInit(info)
          .then(function (instance) {
            return instance
          })
          .then(receiveInstantiationResult, function (reason) {
            err('failed to asynchronously prepare wasm: ' + reason)
            abort(reason)
          })
      }
      instantiateArrayBuffer().catch(readyPromiseReject)

      // function instantiateAsync() {
      // 	if (!wasmBinary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(wasmBinaryFile) && !isFileURI(wasmBinaryFile) && typeof fetch == "function") {
      // 		return fetch(wasmBinaryFile, {
      // 			credentials: "same-origin"
      // 		}).then(function(response) {
      // 			var result = WebAssembly.instantiateStreaming(response, info);
      // 			return result.then(receiveInstantiationResult, function(reason) {
      // 				err("wasm streaming compile failed: " + reason);
      // 				err("falling back to ArrayBuffer instantiation");
      // 				return instantiateArrayBuffer(receiveInstantiationResult)
      // 			})
      // 		})
      // 	} else {
      // 		return instantiateArrayBuffer(receiveInstantiationResult)
      // 	}
      // }
      // if (Module["instantiateWasm"]) {
      // 	try {
      // 		var exports = Module["instantiateWasm"](info, receiveInstance);
      // 		return exports
      // 	} catch (e) {
      // 		err("Module.instantiateWasm callback failed with error: " + e);
      // 		return false
      // 	}
      // }
      // instantiateAsync().catch(readyPromiseReject);
      // return {}
    }
    const ASM_CONSTS = {
      425108: function ($0) {
        throw UTF8ToString($0)
      },
    }

    function callRuntimeCallbacks(callbacks) {
      while (callbacks.length > 0) {
        const callback = callbacks.shift()
        if (typeof callback === 'function') {
          callback(Module)
          continue
        }
        const func = callback.func
        if (typeof func === 'number') {
          if (callback.arg === undefined) {
            getWasmTableEntry(func)()
          } else {
            getWasmTableEntry(func)(callback.arg)
          }
        } else {
          func(callback.arg === undefined ? null : callback.arg)
        }
      }
    }

    function getWasmTableEntry(funcPtr) {
      return wasmTable.get(funcPtr)
    }

    function jsStackTrace() {
      let error = new Error()
      if (!error.stack) {
        try {
          throw new Error()
        } catch (e) {
          error = e
        }
        if (!error.stack) {
          return '(no stack trace available)'
        }
      }
      return error.stack.toString()
    }

    function ___assert_fail(condition, filename, line, func) {
      abort(
        'Assertion failed: ' +
          UTF8ToString(condition) +
          ', at: ' +
          [
            filename ? UTF8ToString(filename) : 'unknown filename',
            line,
            func ? UTF8ToString(func) : 'unknown function',
          ]
      )
    }

    function ___cxa_allocate_exception(size) {
      return _malloc(size + 16) + 16
    }

    function ExceptionInfo(excPtr) {
      this.excPtr = excPtr
      this.ptr = excPtr - 16
      this.set_type = function (type) {
        HEAP32[(this.ptr + 4) >> 2] = type
      }
      this.get_type = function () {
        return HEAP32[(this.ptr + 4) >> 2]
      }
      this.set_destructor = function (destructor) {
        HEAP32[(this.ptr + 8) >> 2] = destructor
      }
      this.get_destructor = function () {
        return HEAP32[(this.ptr + 8) >> 2]
      }
      this.set_refcount = function (refcount) {
        HEAP32[this.ptr >> 2] = refcount
      }
      this.set_caught = function (caught) {
        caught = caught ? 1 : 0
        HEAP8[(this.ptr + 12) >> 0] = caught
      }
      this.get_caught = function () {
        return HEAP8[(this.ptr + 12) >> 0] != 0
      }
      this.set_rethrown = function (rethrown) {
        rethrown = rethrown ? 1 : 0
        HEAP8[(this.ptr + 13) >> 0] = rethrown
      }
      this.get_rethrown = function () {
        return HEAP8[(this.ptr + 13) >> 0] != 0
      }
      this.init = function (type, destructor) {
        this.set_type(type)
        this.set_destructor(destructor)
        this.set_refcount(0)
        this.set_caught(false)
        this.set_rethrown(false)
      }
      this.add_ref = function () {
        const value = HEAP32[this.ptr >> 2]
        HEAP32[this.ptr >> 2] = value + 1
      }
      this.release_ref = function () {
        const prev = HEAP32[this.ptr >> 2]
        HEAP32[this.ptr >> 2] = prev - 1
        return prev === 1
      }
    }

    function CatchInfo(ptr) {
      this.free = function () {
        _free(this.ptr)
        this.ptr = 0
      }
      this.set_base_ptr = function (basePtr) {
        HEAP32[this.ptr >> 2] = basePtr
      }
      this.get_base_ptr = function () {
        return HEAP32[this.ptr >> 2]
      }
      this.set_adjusted_ptr = function (adjustedPtr) {
        HEAP32[(this.ptr + 4) >> 2] = adjustedPtr
      }
      this.get_adjusted_ptr_addr = function () {
        return this.ptr + 4
      }
      this.get_adjusted_ptr = function () {
        return HEAP32[(this.ptr + 4) >> 2]
      }
      this.get_exception_ptr = function () {
        const isPointer = ___cxa_is_pointer_type(this.get_exception_info().get_type())
        if (isPointer) {
          return HEAP32[this.get_base_ptr() >> 2]
        }
        const adjusted = this.get_adjusted_ptr()
        if (adjusted !== 0) return adjusted
        return this.get_base_ptr()
      }
      this.get_exception_info = function () {
        return new ExceptionInfo(this.get_base_ptr())
      }
      if (ptr === undefined) {
        this.ptr = _malloc(8)
        this.set_adjusted_ptr(0)
      } else {
        this.ptr = ptr
      }
    }
    const exceptionCaught = []

    function exception_addRef(info) {
      info.add_ref()
    }
    let uncaughtExceptionCount = 0

    function ___cxa_begin_catch(ptr) {
      const catchInfo = new CatchInfo(ptr)
      const info = catchInfo.get_exception_info()
      if (!info.get_caught()) {
        info.set_caught(true)
        uncaughtExceptionCount--
      }
      info.set_rethrown(false)
      exceptionCaught.push(catchInfo)
      exception_addRef(info)
      return catchInfo.get_exception_ptr()
    }
    let exceptionLast = 0

    function ___cxa_free_exception(ptr) {
      return _free(new ExceptionInfo(ptr).ptr)
    }

    function exception_decRef(info) {
      if (info.release_ref() && !info.get_rethrown()) {
        const destructor = info.get_destructor()
        if (destructor) {
          getWasmTableEntry(destructor)(info.excPtr)
        }
        ___cxa_free_exception(info.excPtr)
      }
    }

    function ___cxa_end_catch() {
      _setThrew(0)
      const catchInfo = exceptionCaught.pop()
      exception_decRef(catchInfo.get_exception_info())
      catchInfo.free()
      exceptionLast = 0
    }

    function ___resumeException(catchInfoPtr) {
      const catchInfo = new CatchInfo(catchInfoPtr)
      const ptr = catchInfo.get_base_ptr()
      if (!exceptionLast) {
        exceptionLast = ptr
      }
      catchInfo.free()
      throw ptr
    }

    function ___cxa_find_matching_catch_2() {
      const thrown = exceptionLast
      if (!thrown) {
        setTempRet0(0)
        return 0 | 0
      }
      const info = new ExceptionInfo(thrown)
      const thrownType = info.get_type()
      const catchInfo = new CatchInfo()
      catchInfo.set_base_ptr(thrown)
      catchInfo.set_adjusted_ptr(thrown)
      if (!thrownType) {
        setTempRet0(0)
        return catchInfo.ptr | 0
      }
      const typeArray = Array.prototype.slice.call(arguments)
      for (let i = 0; i < typeArray.length; i++) {
        const caughtType = typeArray[i]
        if (caughtType === 0 || caughtType === thrownType) {
          break
        }
        if (___cxa_can_catch(caughtType, thrownType, catchInfo.get_adjusted_ptr_addr())) {
          setTempRet0(caughtType)
          return catchInfo.ptr | 0
        }
      }
      setTempRet0(thrownType)
      return catchInfo.ptr | 0
    }

    function ___cxa_find_matching_catch_3() {
      const thrown = exceptionLast
      if (!thrown) {
        setTempRet0(0)
        return 0 | 0
      }
      const info = new ExceptionInfo(thrown)
      const thrownType = info.get_type()
      const catchInfo = new CatchInfo()
      catchInfo.set_base_ptr(thrown)
      catchInfo.set_adjusted_ptr(thrown)
      if (!thrownType) {
        setTempRet0(0)
        return catchInfo.ptr | 0
      }
      const typeArray = Array.prototype.slice.call(arguments)
      for (let i = 0; i < typeArray.length; i++) {
        const caughtType = typeArray[i]
        if (caughtType === 0 || caughtType === thrownType) {
          break
        }
        if (___cxa_can_catch(caughtType, thrownType, catchInfo.get_adjusted_ptr_addr())) {
          setTempRet0(caughtType)
          return catchInfo.ptr | 0
        }
      }
      setTempRet0(thrownType)
      return catchInfo.ptr | 0
    }

    function ___cxa_find_matching_catch_5() {
      const thrown = exceptionLast
      if (!thrown) {
        setTempRet0(0)
        return 0 | 0
      }
      const info = new ExceptionInfo(thrown)
      const thrownType = info.get_type()
      const catchInfo = new CatchInfo()
      catchInfo.set_base_ptr(thrown)
      catchInfo.set_adjusted_ptr(thrown)
      if (!thrownType) {
        setTempRet0(0)
        return catchInfo.ptr | 0
      }
      const typeArray = Array.prototype.slice.call(arguments)
      for (let i = 0; i < typeArray.length; i++) {
        const caughtType = typeArray[i]
        if (caughtType === 0 || caughtType === thrownType) {
          break
        }
        if (___cxa_can_catch(caughtType, thrownType, catchInfo.get_adjusted_ptr_addr())) {
          setTempRet0(caughtType)
          return catchInfo.ptr | 0
        }
      }
      setTempRet0(thrownType)
      return catchInfo.ptr | 0
    }

    function ___cxa_throw(ptr, type, destructor) {
      const info = new ExceptionInfo(ptr)
      info.init(type, destructor)
      exceptionLast = ptr
      uncaughtExceptionCount++
      throw ptr
    }
    var SYSCALLS = {
      buffers: [null, [], []],
      printChar: function (stream, curr) {
        const buffer = SYSCALLS.buffers[stream]
        if (curr === 0 || curr === 10) {
          ;(stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0))
          buffer.length = 0
        } else {
          buffer.push(curr)
        }
      },
      varargs: undefined,
      get: function () {
        SYSCALLS.varargs += 4
        const ret = HEAP32[(SYSCALLS.varargs - 4) >> 2]
        return ret
      },
      getStr: function (ptr) {
        const ret = UTF8ToString(ptr)
        return ret
      },
      get64: function (low, high) {
        return low
      },
    }

    function ___syscall_fcntl64(fd, cmd, varargs) {
      SYSCALLS.varargs = varargs
      return 0
    }

    function ___syscall_fstat64(fd, buf) {}

    function ___syscall_getdents64(fd, dirp, count) {}

    function ___syscall_ioctl(fd, op, varargs) {
      SYSCALLS.varargs = varargs
      return 0
    }

    function ___syscall_lstat64(path, buf) {}

    function ___syscall_newfstatat(dirfd, path, buf, flags) {}

    function ___syscall_openat(dirfd, path, flags, varargs) {
      SYSCALLS.varargs = varargs
    }

    function ___syscall_stat64(path, buf) {}

    function __dlopen_js(filename, flag) {
      abort(
        "To use dlopen, you need to use Emscripten's linking support, see https://github.com/emscripten-core/emscripten/wiki/Linking"
      )
    }

    function __dlsym_js(handle, symbol) {
      abort(
        "To use dlopen, you need to use Emscripten's linking support, see https://github.com/emscripten-core/emscripten/wiki/Linking"
      )
    }

    function __emscripten_date_now() {
      return Date.now()
    }
    const nowIsMonotonic = true

    function __emscripten_get_now_is_monotonic() {
      return nowIsMonotonic
    }

    function __munmap_js(addr, len, prot, flags, fd, offset) {}

    function _abort() {
      abort('')
    }
    const readAsmConstArgsArray = []

    function readAsmConstArgs(sigPtr, buf) {
      readAsmConstArgsArray.length = 0
      let ch
      buf >>= 2
      while ((ch = HEAPU8[sigPtr++])) {
        const readAsmConstArgsDouble = ch < 105
        if (readAsmConstArgsDouble && buf & 1) buf++
        readAsmConstArgsArray.push(readAsmConstArgsDouble ? HEAPF64[buf++ >> 1] : HEAP32[buf])
        ++buf
      }
      return readAsmConstArgsArray
    }

    function _emscripten_asm_const_int(code, sigPtr, argbuf) {
      const args = readAsmConstArgs(sigPtr, argbuf)
      return ASM_CONSTS[code].apply(null, args)
    }
    let _emscripten_get_now
    if (ENVIRONMENT_IS_NODE) {
      _emscripten_get_now = () => {
        const t = process.hrtime()
        return t[0] * 1e3 + t[1] / 1e6
      }
    } else _emscripten_get_now = () => performance.now()

    function reallyNegative(x) {
      return x < 0 || (x === 0 && 1 / x === -Infinity)
    }

    function convertI32PairToI53(lo, hi) {
      return (lo >>> 0) + hi * 4294967296
    }

    function convertU32PairToI53(lo, hi) {
      return (lo >>> 0) + (hi >>> 0) * 4294967296
    }

    function reSign(value, bits) {
      if (value <= 0) {
        return value
      }
      const half = bits <= 32 ? Math.abs(1 << (bits - 1)) : Math.pow(2, bits - 1)
      if (value >= half && (bits <= 32 || value > half)) {
        value = -2 * half + value
      }
      return value
    }

    function unSign(value, bits) {
      if (value >= 0) {
        return value
      }
      return bits <= 32 ? 2 * Math.abs(1 << (bits - 1)) + value : Math.pow(2, bits) + value
    }

    function formatString(format, varargs) {
      let textIndex = format
      let argIndex = varargs

      function prepVararg(ptr, type) {
        if (type === 'double' || type === 'i64') {
          if (ptr & 7) {
            ptr += 4
          }
        } else {
        }
        return ptr
      }

      function getNextArg(type) {
        let ret
        argIndex = prepVararg(argIndex, type)
        if (type === 'double') {
          ret = Number(HEAPF64[argIndex >> 3])
          argIndex += 8
        } else if (type == 'i64') {
          ret = [HEAP32[argIndex >> 2], HEAP32[(argIndex + 4) >> 2]]
          argIndex += 8
        } else {
          type = 'i32'
          ret = HEAP32[argIndex >> 2]
          argIndex += 4
        }
        return ret
      }
      let ret = []
      let curr, next, currArg
      while (1) {
        const startTextIndex = textIndex
        curr = HEAP8[textIndex >> 0]
        if (curr === 0) break
        next = HEAP8[(textIndex + 1) >> 0]
        if (curr == 37) {
          let flagAlwaysSigned = false
          let flagLeftAlign = false
          let flagAlternative = false
          let flagZeroPad = false
          let flagPadSign = false
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true
                break
              case 45:
                flagLeftAlign = true
                break
              case 35:
                flagAlternative = true
                break
              case 48:
                if (flagZeroPad) {
                  break flagsLoop
                } else {
                  flagZeroPad = true
                  break
                }
              case 32:
                flagPadSign = true
                break
              default:
                break flagsLoop
            }
            textIndex++
            next = HEAP8[(textIndex + 1) >> 0]
          }
          let width = 0
          if (next == 42) {
            width = getNextArg('i32')
            textIndex++
            next = HEAP8[(textIndex + 1) >> 0]
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48)
              textIndex++
              next = HEAP8[(textIndex + 1) >> 0]
            }
          }
          let precisionSet = false
          let precision = -1
          if (next == 46) {
            precision = 0
            precisionSet = true
            textIndex++
            next = HEAP8[(textIndex + 1) >> 0]
            if (next == 42) {
              precision = getNextArg('i32')
              textIndex++
            } else {
              while (1) {
                const precisionChr = HEAP8[(textIndex + 1) >> 0]
                if (precisionChr < 48 || precisionChr > 57) break
                precision = precision * 10 + (precisionChr - 48)
                textIndex++
              }
            }
            next = HEAP8[(textIndex + 1) >> 0]
          }
          if (precision < 0) {
            precision = 6
            precisionSet = false
          }
          var argSize
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[(textIndex + 2) >> 0]
              if (nextNext == 104) {
                textIndex++
                argSize = 1
              } else {
                argSize = 2
              }
              break
            case 'l':
              var nextNext = HEAP8[(textIndex + 2) >> 0]
              if (nextNext == 108) {
                textIndex++
                argSize = 8
              } else {
                argSize = 4
              }
              break
            case 'L':
            case 'q':
            case 'j':
              argSize = 8
              break
            case 'z':
            case 't':
            case 'I':
              argSize = 4
              break
            default:
              argSize = null
          }
          if (argSize) textIndex++
          next = HEAP8[(textIndex + 1) >> 0]
          switch (String.fromCharCode(next)) {
            case 'd':
            case 'i':
            case 'u':
            case 'o':
            case 'x':
            case 'X':
            case 'p': {
              const signed = next == 100 || next == 105
              argSize = argSize || 4
              currArg = getNextArg('i' + argSize * 8)
              var argText
              if (argSize == 8) {
                currArg =
                  next == 117
                    ? convertU32PairToI53(currArg[0], currArg[1])
                    : convertI32PairToI53(currArg[0], currArg[1])
              }
              if (argSize <= 4) {
                const limit = Math.pow(256, argSize) - 1
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8)
              }
              const currAbsArg = Math.abs(currArg)
              let prefix = ''
              if (next == 100 || next == 105) {
                argText = reSign(currArg, 8 * argSize).toString(10)
              } else if (next == 117) {
                argText = unSign(currArg, 8 * argSize).toString(10)
                currArg = Math.abs(currArg)
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8)
              } else if (next == 120 || next == 88) {
                prefix = flagAlternative && currArg != 0 ? '0x' : ''
                if (currArg < 0) {
                  currArg = -currArg
                  argText = (currAbsArg - 1).toString(16)
                  const buffer = []
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((15 - parseInt(argText[i], 16)).toString(16))
                  }
                  argText = buffer.join('')
                  while (argText.length < argSize * 2) argText = 'f' + argText
                } else {
                  argText = currAbsArg.toString(16)
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase()
                  argText = argText.toUpperCase()
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)'
                } else {
                  prefix = '0x'
                  argText = currAbsArg.toString(16)
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText
                }
              }
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix
                } else if (flagPadSign) {
                  prefix = ' ' + prefix
                }
              }
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix
                argText = argText.substr(1)
              }
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' '
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText
                  } else {
                    prefix = ' ' + prefix
                  }
                }
              }
              argText = prefix + argText
              argText.split('').forEach(function (chr) {
                ret.push(chr.charCodeAt(0))
              })
              break
            }
            case 'f':
            case 'F':
            case 'e':
            case 'E':
            case 'g':
            case 'G': {
              currArg = getNextArg('double')
              var argText
              if (isNaN(currArg)) {
                argText = 'nan'
                flagZeroPad = false
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf'
                flagZeroPad = false
              } else {
                let isGeneral = false
                let effectivePrecision = Math.min(precision, 20)
                if (next == 103 || next == 71) {
                  isGeneral = true
                  precision = precision || 1
                  const exponent = parseInt(
                    currArg.toExponential(effectivePrecision).split('e')[1],
                    10
                  )
                  if (precision > exponent && exponent >= -4) {
                    next = (next == 103 ? 'f' : 'F').charCodeAt(0)
                    precision -= exponent + 1
                  } else {
                    next = (next == 103 ? 'e' : 'E').charCodeAt(0)
                    precision--
                  }
                  effectivePrecision = Math.min(precision, 20)
                }
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision)
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1)
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision)
                  if (currArg === 0 && reallyNegative(currArg)) {
                    argText = '-' + argText
                  }
                }
                const parts = argText.split('e')
                if (isGeneral && !flagAlternative) {
                  while (
                    parts[0].length > 1 &&
                    parts[0].includes('.') &&
                    (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')
                  ) {
                    parts[0] = parts[0].slice(0, -1)
                  }
                } else {
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.'
                  while (precision > effectivePrecision++) parts[0] += '0'
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '')
                if (next == 69) argText = argText.toUpperCase()
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText
                  } else if (flagPadSign) {
                    argText = ' ' + argText
                  }
                }
              }
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' '
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1)
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText
                  }
                }
              }
              if (next < 97) argText = argText.toUpperCase()
              argText.split('').forEach(function (chr) {
                ret.push(chr.charCodeAt(0))
              })
              break
            }
            case 's': {
              let arg = getNextArg('i8*')
              let argLength = arg ? _strlen(arg) : '(null)'.length
              if (precisionSet) argLength = Math.min(argLength, precision)
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32)
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[arg++ >> 0])
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true))
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32)
                }
              }
              break
            }
            case 'c': {
              if (flagLeftAlign) ret.push(getNextArg('i8'))
              while (--width > 0) {
                ret.push(32)
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'))
              break
            }
            case 'n': {
              const ptr = getNextArg('i32*')
              HEAP32[ptr >> 2] = ret.length
              break
            }
            case '%': {
              ret.push(curr)
              break
            }
            default: {
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[i >> 0])
              }
            }
          }
          textIndex += 2
        } else {
          ret.push(curr)
          textIndex += 1
        }
      }
      return ret
    }

    function traverseStack(args) {
      if (!args || !args.callee || !args.callee.name) {
        return [null, '', '']
      }
      const funstr = args.callee.toString()
      const funcname = args.callee.name
      let str = '('
      let first = true
      for (const i in args) {
        const a = args[i]
        if (!first) {
          str += ', '
        }
        first = false
        if (typeof a === 'number' || typeof a === 'string') {
          str += a
        } else {
          str += '(' + typeof a + ')'
        }
      }
      str += ')'
      const caller = args.callee.caller
      args = caller ? caller.arguments : []
      if (first) str = ''
      return [args, funcname, str]
    }

    function _emscripten_get_callstack_js(flags) {
      let callstack = jsStackTrace()
      const iThisFunc = callstack.lastIndexOf('_emscripten_log')
      const iThisFunc2 = callstack.lastIndexOf('_emscripten_get_callstack')
      const iNextLine = callstack.indexOf('\n', Math.max(iThisFunc, iThisFunc2)) + 1
      callstack = callstack.slice(iNextLine)
      if (flags & 32) {
        warnOnce('EM_LOG_DEMANGLE is deprecated; ignoring')
      }
      if (flags & 8 && typeof emscripten_source_map === 'undefined') {
        warnOnce(
          'Source map information is not available, emscripten_log with EM_LOG_C_STACK will be ignored. Build with "--pre-js $EMSCRIPTEN/src/emscripten-source-map.min.js" linker flag to add source map loading to code.'
        )
        flags ^= 8
        flags |= 16
      }
      let stack_args = null
      if (flags & 128) {
        stack_args = traverseStack(arguments)
        while (stack_args[1].includes('_emscripten_')) stack_args = traverseStack(stack_args[0])
      }
      const lines = callstack.split('\n')
      callstack = ''
      const newFirefoxRe = new RegExp('\\s*(.*?)@(.*?):([0-9]+):([0-9]+)')
      const firefoxRe = new RegExp('\\s*(.*?)@(.*):(.*)(:(.*))?')
      const chromeRe = new RegExp('\\s*at (.*?) \\((.*):(.*):(.*)\\)')
      for (const l in lines) {
        const line = lines[l]
        let symbolName = ''
        let file = ''
        let lineno = 0
        let column = 0
        let parts = chromeRe.exec(line)
        if (parts && parts.length == 5) {
          symbolName = parts[1]
          file = parts[2]
          lineno = parts[3]
          column = parts[4]
        } else {
          parts = newFirefoxRe.exec(line)
          if (!parts) parts = firefoxRe.exec(line)
          if (parts && parts.length >= 4) {
            symbolName = parts[1]
            file = parts[2]
            lineno = parts[3]
            column = parts[4] | 0
          } else {
            callstack += line + '\n'
            continue
          }
        }
        let haveSourceMap = false
        if (flags & 8) {
          const orig = emscripten_source_map.originalPositionFor({
            line: lineno,
            column,
          })
          haveSourceMap = orig && orig.source
          if (haveSourceMap) {
            if (flags & 64) {
              orig.source = orig.source.substring(
                orig.source.replace(/\\/g, '/').lastIndexOf('/') + 1
              )
            }
            callstack +=
              '    at ' +
              symbolName +
              ' (' +
              orig.source +
              ':' +
              orig.line +
              ':' +
              orig.column +
              ')\n'
          }
        }
        if (flags & 16 || !haveSourceMap) {
          if (flags & 64) {
            file = file.substring(file.replace(/\\/g, '/').lastIndexOf('/') + 1)
          }
          callstack +=
            (haveSourceMap ? '     = ' + symbolName : '    at ' + symbolName) +
            ' (' +
            file +
            ':' +
            lineno +
            ':' +
            column +
            ')\n'
        }
        if (flags & 128 && stack_args[0]) {
          if (stack_args[1] == symbolName && stack_args[2].length > 0) {
            callstack = callstack.replace(/\s+$/, '')
            callstack += ' with values: ' + stack_args[1] + stack_args[2] + '\n'
          }
          stack_args = traverseStack(stack_args[0])
        }
      }
      callstack = callstack.replace(/\s+$/, '')
      return callstack
    }

    function _emscripten_log_js(flags, str) {
      if (flags & 24) {
        str = str.replace(/\s+$/, '')
        str += (str.length > 0 ? '\n' : '') + _emscripten_get_callstack_js(flags)
      }
      if (flags & 1) {
        if (flags & 4) {
          console.error(str)
        } else if (flags & 2) {
          console.warn(str)
        } else if (flags & 512) {
          console.info(str)
        } else if (flags & 256) {
          console.debug(str)
        } else {
          console.log(str)
        }
      } else if (flags & 6) {
        err(str)
      } else {
        out(str)
      }
    }

    function _emscripten_log(flags, format, varargs) {
      const result = formatString(format, varargs)
      const str = UTF8ArrayToString(result, 0)
      _emscripten_log_js(flags, str)
    }

    function _emscripten_get_heap_max() {
      return 2147483648
    }

    function emscripten_realloc_buffer(size) {
      try {
        wasmMemory.grow((size - buffer.byteLength + 65535) >>> 16)
        updateGlobalBufferAndViews(wasmMemory.buffer)
        return 1
      } catch (e) {}
    }

    function _emscripten_resize_heap(requestedSize) {
      const oldSize = HEAPU8.length
      requestedSize = requestedSize >>> 0
      const maxHeapSize = _emscripten_get_heap_max()
      if (requestedSize > maxHeapSize) {
        return false
      }
      const alignUp = (x, multiple) => x + ((multiple - (x % multiple)) % multiple)
      for (let cutDown = 1; cutDown <= 4; cutDown *= 2) {
        let overGrownHeapSize = oldSize * (1 + 0.2 / cutDown)
        overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296)
        const newSize = Math.min(
          maxHeapSize,
          alignUp(Math.max(requestedSize, overGrownHeapSize), 65536)
        )
        const replacement = emscripten_realloc_buffer(newSize)
        if (replacement) {
          return true
        }
      }
      return false
    }
    const ENV = {}

    function getExecutableName() {
      return thisProgram || './this.program'
    }

    function getEnvStrings() {
      if (!getEnvStrings.strings) {
        const lang =
          (
            (typeof navigator === 'object' && navigator.languages && navigator.languages[0]) ||
            'C'
          ).replace('-', '_') + '.UTF-8'
        const env = {
          USER: 'web_user',
          LOGNAME: 'web_user',
          PATH: '/',
          PWD: '/',
          HOME: '/home/web_user',
          LANG: lang,
          _: getExecutableName(),
        }
        for (var x in ENV) {
          if (ENV[x] === undefined) delete env[x]
          else env[x] = ENV[x]
        }
        const strings = []
        for (var x in env) {
          strings.push(x + '=' + env[x])
        }
        getEnvStrings.strings = strings
      }
      return getEnvStrings.strings
    }

    function _environ_get(__environ, environ_buf) {
      let bufSize = 0
      getEnvStrings().forEach(function (string, i) {
        const ptr = environ_buf + bufSize
        HEAP32[(__environ + i * 4) >> 2] = ptr
        writeAsciiToMemory(string, ptr)
        bufSize += string.length + 1
      })
      return 0
    }

    function _environ_sizes_get(penviron_count, penviron_buf_size) {
      const strings = getEnvStrings()
      HEAP32[penviron_count >> 2] = strings.length
      let bufSize = 0
      strings.forEach(function (string) {
        bufSize += string.length + 1
      })
      HEAP32[penviron_buf_size >> 2] = bufSize
      return 0
    }

    function _fd_close(fd) {
      return 0
    }

    function _fd_read(fd, iov, iovcnt, pnum) {
      const stream = SYSCALLS.getStreamFromFD(fd)
      const num = SYSCALLS.doReadv(stream, iov, iovcnt)
      HEAP32[pnum >> 2] = num
      return 0
    }

    function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {}

    function _fd_write(fd, iov, iovcnt, pnum) {
      let num = 0
      for (let i = 0; i < iovcnt; i++) {
        const ptr = HEAP32[iov >> 2]
        const len = HEAP32[(iov + 4) >> 2]
        iov += 8
        for (let j = 0; j < len; j++) {
          SYSCALLS.printChar(fd, HEAPU8[ptr + j])
        }
        num += len
      }
      HEAP32[pnum >> 2] = num
      return 0
    }

    function _getTempRet0() {
      return getTempRet0()
    }

    function _llvm_eh_typeid_for(type) {
      return type
    }

    function _setTempRet0(val) {
      setTempRet0(val)
    }

    function __isLeapYear(year) {
      return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
    }

    function __arraySum(array, index) {
      let sum = 0
      for (let i = 0; i <= index; sum += array[i++]) {}
      return sum
    }
    const __MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    const __MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    function __addDays(date, days) {
      const newDate = new Date(date.getTime())
      while (days > 0) {
        const leap = __isLeapYear(newDate.getFullYear())
        const currentMonth = newDate.getMonth()
        const daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth]
        if (days > daysInCurrentMonth - newDate.getDate()) {
          days -= daysInCurrentMonth - newDate.getDate() + 1
          newDate.setDate(1)
          if (currentMonth < 11) {
            newDate.setMonth(currentMonth + 1)
          } else {
            newDate.setMonth(0)
            newDate.setFullYear(newDate.getFullYear() + 1)
          }
        } else {
          newDate.setDate(newDate.getDate() + days)
          return newDate
        }
      }
      return newDate
    }

    function _strftime(s, maxsize, format, tm) {
      const tm_zone = HEAP32[(tm + 40) >> 2]
      const date = {
        tm_sec: HEAP32[tm >> 2],
        tm_min: HEAP32[(tm + 4) >> 2],
        tm_hour: HEAP32[(tm + 8) >> 2],
        tm_mday: HEAP32[(tm + 12) >> 2],
        tm_mon: HEAP32[(tm + 16) >> 2],
        tm_year: HEAP32[(tm + 20) >> 2],
        tm_wday: HEAP32[(tm + 24) >> 2],
        tm_yday: HEAP32[(tm + 28) >> 2],
        tm_isdst: HEAP32[(tm + 32) >> 2],
        tm_gmtoff: HEAP32[(tm + 36) >> 2],
        tm_zone: tm_zone ? UTF8ToString(tm_zone) : '',
      }
      let pattern = UTF8ToString(format)
      const EXPANSION_RULES_1 = {
        '%c': '%a %b %d %H:%M:%S %Y',
        '%D': '%m/%d/%y',
        '%F': '%Y-%m-%d',
        '%h': '%b',
        '%r': '%I:%M:%S %p',
        '%R': '%H:%M',
        '%T': '%H:%M:%S',
        '%x': '%m/%d/%y',
        '%X': '%H:%M:%S',
        '%Ec': '%c',
        '%EC': '%C',
        '%Ex': '%m/%d/%y',
        '%EX': '%H:%M:%S',
        '%Ey': '%y',
        '%EY': '%Y',
        '%Od': '%d',
        '%Oe': '%e',
        '%OH': '%H',
        '%OI': '%I',
        '%Om': '%m',
        '%OM': '%M',
        '%OS': '%S',
        '%Ou': '%u',
        '%OU': '%U',
        '%OV': '%V',
        '%Ow': '%w',
        '%OW': '%W',
        '%Oy': '%y',
      }
      for (var rule in EXPANSION_RULES_1) {
        pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_1[rule])
      }
      const WEEKDAYS = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ]
      const MONTHS = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ]

      function leadingSomething(value, digits, character) {
        let str = typeof value === 'number' ? value.toString() : value || ''
        while (str.length < digits) {
          str = character[0] + str
        }
        return str
      }

      function leadingNulls(value, digits) {
        return leadingSomething(value, digits, '0')
      }

      function compareByDay(date1, date2) {
        function sgn(value) {
          return value < 0 ? -1 : value > 0 ? 1 : 0
        }
        let compare
        if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
          if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
            compare = sgn(date1.getDate() - date2.getDate())
          }
        }
        return compare
      }

      function getFirstWeekStartDate(janFourth) {
        switch (janFourth.getDay()) {
          case 0:
            return new Date(janFourth.getFullYear() - 1, 11, 29)
          case 1:
            return janFourth
          case 2:
            return new Date(janFourth.getFullYear(), 0, 3)
          case 3:
            return new Date(janFourth.getFullYear(), 0, 2)
          case 4:
            return new Date(janFourth.getFullYear(), 0, 1)
          case 5:
            return new Date(janFourth.getFullYear() - 1, 11, 31)
          case 6:
            return new Date(janFourth.getFullYear() - 1, 11, 30)
        }
      }

      function getWeekBasedYear(date) {
        const thisDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday)
        const janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4)
        const janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4)
        const firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear)
        const firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear)
        if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
          if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
            return thisDate.getFullYear() + 1
          } else {
            return thisDate.getFullYear()
          }
        } else {
          return thisDate.getFullYear() - 1
        }
      }
      const EXPANSION_RULES_2 = {
        '%a': function (date) {
          return WEEKDAYS[date.tm_wday].substring(0, 3)
        },
        '%A': function (date) {
          return WEEKDAYS[date.tm_wday]
        },
        '%b': function (date) {
          return MONTHS[date.tm_mon].substring(0, 3)
        },
        '%B': function (date) {
          return MONTHS[date.tm_mon]
        },
        '%C': function (date) {
          const year = date.tm_year + 1900
          return leadingNulls((year / 100) | 0, 2)
        },
        '%d': function (date) {
          return leadingNulls(date.tm_mday, 2)
        },
        '%e': function (date) {
          return leadingSomething(date.tm_mday, 2, ' ')
        },
        '%g': function (date) {
          return getWeekBasedYear(date).toString().substring(2)
        },
        '%G': function (date) {
          return getWeekBasedYear(date)
        },
        '%H': function (date) {
          return leadingNulls(date.tm_hour, 2)
        },
        '%I': function (date) {
          let twelveHour = date.tm_hour
          if (twelveHour == 0) twelveHour = 12
          else if (twelveHour > 12) twelveHour -= 12
          return leadingNulls(twelveHour, 2)
        },
        '%j': function (date) {
          return leadingNulls(
            date.tm_mday +
              __arraySum(
                __isLeapYear(date.tm_year + 1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR,
                date.tm_mon - 1
              ),
            3
          )
        },
        '%m': function (date) {
          return leadingNulls(date.tm_mon + 1, 2)
        },
        '%M': function (date) {
          return leadingNulls(date.tm_min, 2)
        },
        '%n': function () {
          return '\n'
        },
        '%p': function (date) {
          if (date.tm_hour >= 0 && date.tm_hour < 12) {
            return 'AM'
          } else {
            return 'PM'
          }
        },
        '%S': function (date) {
          return leadingNulls(date.tm_sec, 2)
        },
        '%t': function () {
          return '\t'
        },
        '%u': function (date) {
          return date.tm_wday || 7
        },
        '%U': function (date) {
          const days = date.tm_yday + 7 - date.tm_wday
          return leadingNulls(Math.floor(days / 7), 2)
        },
        '%V': function (date) {
          let val = Math.floor((date.tm_yday + 7 - ((date.tm_wday + 6) % 7)) / 7)
          if ((date.tm_wday + 371 - date.tm_yday - 2) % 7 <= 2) {
            val++
          }
          if (!val) {
            val = 52
            const dec31 = (date.tm_wday + 7 - date.tm_yday - 1) % 7
            if (dec31 == 4 || (dec31 == 5 && __isLeapYear((date.tm_year % 400) - 1))) {
              val++
            }
          } else if (val == 53) {
            const jan1 = (date.tm_wday + 371 - date.tm_yday) % 7
            if (jan1 != 4 && (jan1 != 3 || !__isLeapYear(date.tm_year))) val = 1
          }
          return leadingNulls(val, 2)
        },
        '%w': function (date) {
          return date.tm_wday
        },
        '%W': function (date) {
          const days = date.tm_yday + 7 - ((date.tm_wday + 6) % 7)
          return leadingNulls(Math.floor(days / 7), 2)
        },
        '%y': function (date) {
          return (date.tm_year + 1900).toString().substring(2)
        },
        '%Y': function (date) {
          return date.tm_year + 1900
        },
        '%z': function (date) {
          let off = date.tm_gmtoff
          const ahead = off >= 0
          off = Math.abs(off) / 60
          off = (off / 60) * 100 + (off % 60)
          return (ahead ? '+' : '-') + String('0000' + off).slice(-4)
        },
        '%Z': function (date) {
          return date.tm_zone
        },
        '%%': function () {
          return '%'
        },
      }
      pattern = pattern.replace(/%%/g, '\0\0')
      for (var rule in EXPANSION_RULES_2) {
        if (pattern.includes(rule)) {
          pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_2[rule](date))
        }
      }
      pattern = pattern.replace(/\0\0/g, '%')
      const bytes = intArrayFromString(pattern, false)
      if (bytes.length > maxsize) {
        return 0
      }
      writeArrayToMemory(bytes, s)
      return bytes.length - 1
    }

    function _strftime_l(s, maxsize, format, tm) {
      return _strftime(s, maxsize, format, tm)
    }

    function intArrayFromString(stringy, dontAddNull, length) {
      const len = length > 0 ? length : lengthBytesUTF8(stringy) + 1
      const u8array = new Array(len)
      const numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length)
      if (dontAddNull) u8array.length = numBytesWritten
      return u8array
    }
    var asmLibraryArg = {
      h: ___assert_fail,
      c: ___cxa_allocate_exception,
      u: ___cxa_begin_catch,
      B: ___cxa_end_catch,
      b: ___cxa_find_matching_catch_2,
      k: ___cxa_find_matching_catch_3,
      $: ___cxa_find_matching_catch_5,
      ca: ___cxa_free_exception,
      d: ___cxa_throw,
      i: ___resumeException,
      z: ___syscall_fcntl64,
      R: ___syscall_fstat64,
      K: ___syscall_getdents64,
      S: ___syscall_ioctl,
      O: ___syscall_lstat64,
      P: ___syscall_newfstatat,
      y: ___syscall_openat,
      Q: ___syscall_stat64,
      A: __dlopen_js,
      V: __dlsym_js,
      v: __emscripten_date_now,
      U: __emscripten_get_now_is_monotonic,
      L: __munmap_js,
      n: _abort,
      W: _emscripten_asm_const_int,
      T: _emscripten_get_now,
      t: _emscripten_log,
      J: _emscripten_resize_heap,
      M: _environ_get,
      N: _environ_sizes_get,
      s: _fd_close,
      w: _fd_read,
      D: _fd_seek,
      x: _fd_write,
      a: _getTempRet0,
      Y: invoke_i,
      g: invoke_ii,
      e: invoke_iii,
      l: invoke_iiii,
      ba: invoke_iiiii,
      aa: invoke_iiiiii,
      X: invoke_iiiiiii,
      p: invoke_iiiiiiii,
      _: invoke_iiiiiiiiii,
      E: invoke_iij,
      F: invoke_ji,
      o: invoke_v,
      q: invoke_vi,
      f: invoke_vii,
      j: invoke_viii,
      r: invoke_viiii,
      m: invoke_viiiii,
      Z: invoke_viiiiiii,
      G: invoke_vij,
      C: _llvm_eh_typeid_for,
      H: _setTempRet0,
      I: _strftime_l,
    }
    const asm = createWasm()
    var ___wasm_call_ctors = (Module.___wasm_call_ctors = function () {
      return (___wasm_call_ctors = Module.___wasm_call_ctors = Module.asm.ea).apply(null, arguments)
    })
    var _vm_exec = (Module._vm_exec = function () {
      return (_vm_exec = Module._vm_exec = Module.asm.fa).apply(null, arguments)
    })
    var _strlen = (Module._strlen = function () {
      return (_strlen = Module._strlen = Module.asm.ga).apply(null, arguments)
    })
    var _malloc = (Module._malloc = function () {
      return (_malloc = Module._malloc = Module.asm.ia).apply(null, arguments)
    })
    var _free = (Module._free = function () {
      return (_free = Module._free = Module.asm.ja).apply(null, arguments)
    })
    var _setThrew = (Module._setThrew = function () {
      return (_setThrew = Module._setThrew = Module.asm.ka).apply(null, arguments)
    })
    var stackSave = (Module.stackSave = function () {
      return (stackSave = Module.stackSave = Module.asm.la).apply(null, arguments)
    })
    var stackRestore = (Module.stackRestore = function () {
      return (stackRestore = Module.stackRestore = Module.asm.ma).apply(null, arguments)
    })
    var stackAlloc = (Module.stackAlloc = function () {
      return (stackAlloc = Module.stackAlloc = Module.asm.na).apply(null, arguments)
    })
    var ___cxa_can_catch = (Module.___cxa_can_catch = function () {
      return (___cxa_can_catch = Module.___cxa_can_catch = Module.asm.oa).apply(null, arguments)
    })
    var ___cxa_is_pointer_type = (Module.___cxa_is_pointer_type = function () {
      return (___cxa_is_pointer_type = Module.___cxa_is_pointer_type = Module.asm.pa).apply(
        null,
        arguments
      )
    })
    var dynCall_vij = (Module.dynCall_vij = function () {
      return (dynCall_vij = Module.dynCall_vij = Module.asm.qa).apply(null, arguments)
    })
    var dynCall_ji = (Module.dynCall_ji = function () {
      return (dynCall_ji = Module.dynCall_ji = Module.asm.ra).apply(null, arguments)
    })
    var dynCall_iij = (Module.dynCall_iij = function () {
      return (dynCall_iij = Module.dynCall_iij = Module.asm.sa).apply(null, arguments)
    })

    function invoke_iii(index, a1, a2) {
      const sp = stackSave()
      try {
        return getWasmTableEntry(index)(a1, a2)
      } catch (e) {
        stackRestore(sp)
        if (e !== e + 0) throw e
        _setThrew(1, 0)
      }
    }

    function invoke_ii(index, a1) {
      const sp = stackSave()
      try {
        return getWasmTableEntry(index)(a1)
      } catch (e) {
        stackRestore(sp)
        if (e !== e + 0) throw e
        _setThrew(1, 0)
      }
    }

    function invoke_viii(index, a1, a2, a3) {
      const sp = stackSave()
      try {
        getWasmTableEntry(index)(a1, a2, a3)
      } catch (e) {
        stackRestore(sp)
        if (e !== e + 0) throw e
        _setThrew(1, 0)
      }
    }

    function invoke_vii(index, a1, a2) {
      const sp = stackSave()
      try {
        getWasmTableEntry(index)(a1, a2)
      } catch (e) {
        stackRestore(sp)
        if (e !== e + 0) throw e
        _setThrew(1, 0)
      }
    }

    function invoke_iiii(index, a1, a2, a3) {
      const sp = stackSave()
      try {
        return getWasmTableEntry(index)(a1, a2, a3)
      } catch (e) {
        stackRestore(sp)
        if (e !== e + 0) throw e
        _setThrew(1, 0)
      }
    }

    function invoke_vi(index, a1) {
      const sp = stackSave()
      try {
        getWasmTableEntry(index)(a1)
      } catch (e) {
        stackRestore(sp)
        if (e !== e + 0) throw e
        _setThrew(1, 0)
      }
    }

    function invoke_iiiii(index, a1, a2, a3, a4) {
      const sp = stackSave()
      try {
        return getWasmTableEntry(index)(a1, a2, a3, a4)
      } catch (e) {
        stackRestore(sp)
        if (e !== e + 0) throw e
        _setThrew(1, 0)
      }
    }

    function invoke_iiiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
      const sp = stackSave()
      try {
        return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7)
      } catch (e) {
        stackRestore(sp)
        if (e !== e + 0) throw e
        _setThrew(1, 0)
      }
    }

    function invoke_viiiii(index, a1, a2, a3, a4, a5) {
      const sp = stackSave()
      try {
        getWasmTableEntry(index)(a1, a2, a3, a4, a5)
      } catch (e) {
        stackRestore(sp)
        if (e !== e + 0) throw e
        _setThrew(1, 0)
      }
    }

    function invoke_iiiiii(index, a1, a2, a3, a4, a5) {
      const sp = stackSave()
      try {
        return getWasmTableEntry(index)(a1, a2, a3, a4, a5)
      } catch (e) {
        stackRestore(sp)
        if (e !== e + 0) throw e
        _setThrew(1, 0)
      }
    }

    function invoke_viiii(index, a1, a2, a3, a4) {
      const sp = stackSave()
      try {
        getWasmTableEntry(index)(a1, a2, a3, a4)
      } catch (e) {
        stackRestore(sp)
        if (e !== e + 0) throw e
        _setThrew(1, 0)
      }
    }

    function invoke_v(index) {
      const sp = stackSave()
      try {
        getWasmTableEntry(index)()
      } catch (e) {
        stackRestore(sp)
        if (e !== e + 0) throw e
        _setThrew(1, 0)
      }
    }

    function invoke_iiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
      const sp = stackSave()
      try {
        return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9)
      } catch (e) {
        stackRestore(sp)
        if (e !== e + 0) throw e
        _setThrew(1, 0)
      }
    }

    function invoke_viiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
      const sp = stackSave()
      try {
        getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7)
      } catch (e) {
        stackRestore(sp)
        if (e !== e + 0) throw e
        _setThrew(1, 0)
      }
    }

    function invoke_i(index) {
      const sp = stackSave()
      try {
        return getWasmTableEntry(index)()
      } catch (e) {
        stackRestore(sp)
        if (e !== e + 0) throw e
        _setThrew(1, 0)
      }
    }

    function invoke_iiiiiii(index, a1, a2, a3, a4, a5, a6) {
      const sp = stackSave()
      try {
        return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6)
      } catch (e) {
        stackRestore(sp)
        if (e !== e + 0) throw e
        _setThrew(1, 0)
      }
    }

    function invoke_vij(index, a1, a2, a3) {
      const sp = stackSave()
      try {
        dynCall_vij(index, a1, a2, a3)
      } catch (e) {
        stackRestore(sp)
        if (e !== e + 0) throw e
        _setThrew(1, 0)
      }
    }

    function invoke_ji(index, a1) {
      const sp = stackSave()
      try {
        return dynCall_ji(index, a1)
      } catch (e) {
        stackRestore(sp)
        if (e !== e + 0) throw e
        _setThrew(1, 0)
      }
    }

    function invoke_iij(index, a1, a2, a3) {
      const sp = stackSave()
      try {
        return dynCall_iij(index, a1, a2, a3)
      } catch (e) {
        stackRestore(sp)
        if (e !== e + 0) throw e
        _setThrew(1, 0)
      }
    }
    Module.intArrayFromString = intArrayFromString
    Module.allocate = allocate
    Module.UTF8ToString = UTF8ToString
    Module.ALLOC_NORMAL = ALLOC_NORMAL
    let calledRun

    function ExitStatus(status) {
      this.name = 'ExitStatus'
      this.message = 'Program terminated with exit(' + status + ')'
      this.status = status
    }
    dependenciesFulfilled = function runCaller() {
      if (!calledRun) run()
      if (!calledRun) dependenciesFulfilled = runCaller
    }

    function run(args) {
      args = args || arguments_
      if (runDependencies > 0) {
        return
      }
      preRun()
      if (runDependencies > 0) {
        return
      }

      function doRun() {
        if (calledRun) return
        calledRun = true
        Module.calledRun = true
        if (ABORT) return
        initRuntime()
        readyPromiseResolve(Module)
        if (Module.onRuntimeInitialized) Module.onRuntimeInitialized()
        postRun()
      }
      if (Module.setStatus) {
        Module.setStatus('Running...')
        setTimeout(function () {
          setTimeout(function () {
            Module.setStatus('')
          }, 1)
          doRun()
        }, 1)
      } else {
        doRun()
      }
    }
    Module.run = run
    if (Module.preInit) {
      if (typeof Module.preInit === 'function') Module.preInit = [Module.preInit]
      while (Module.preInit.length > 0) {
        Module.preInit.pop()()
      }
    }
    run()

    return Module.ready
  }
})()
if (typeof exports === 'object' && typeof module === 'object') module.exports = Module
else if (typeof define === 'function' && define.amd)
  define([], function () {
    return Module
  })
else if (typeof exports === 'object') exports.Module = Module

export default Module
