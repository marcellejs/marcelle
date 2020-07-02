(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('vue')) :
  typeof define === 'function' && define.amd ? define(['exports', 'vue'], factory) :
  (global = global || self, factory(global.marcelle = {}, global.Vue));
}(this, (function (exports, Vue) { 'use strict';

  Vue = Vue && Object.prototype.hasOwnProperty.call(Vue, 'default') ? Vue['default'] : Vue;

  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  // append :: a -> [a] -> [a]
  // a with x appended
  function append(x, a) {
    var l = a.length;
    var b = new Array(l + 1);
    for (var i = 0; i < l; ++i) {
      b[i] = a[i];
    }

    b[l] = x;
    return b;
  }

  // remove :: Int -> [a] -> [a]
  // remove element at index
  function remove(i, a) {
    // eslint-disable-line complexity
    if (i < 0) {
      throw new TypeError('i must be >= 0');
    }

    var l = a.length;
    if (l === 0 || i >= l) {
      // exit early if index beyond end of array
      return a;
    }

    if (l === 1) {
      // exit early if index in bounds and length === 1
      return [];
    }

    return unsafeRemove(i, a, l - 1);
  }

  // unsafeRemove :: Int -> [a] -> Int -> [a]
  // Internal helper to remove element at index
  function unsafeRemove(i, a, l) {
    var b = new Array(l);
    var j = void 0;
    for (j = 0; j < i; ++j) {
      b[j] = a[j];
    }
    for (j = i; j < l; ++j) {
      b[j] = a[j + 1];
    }

    return b;
  }

  // removeAll :: (a -> boolean) -> [a] -> [a]
  // remove all elements matching a predicate
  // @deprecated
  function removeAll(f, a) {
    var l = a.length;
    var b = new Array(l);
    var j = 0;
    for (var x, i = 0; i < l; ++i) {
      x = a[i];
      if (!f(x)) {
        b[j] = x;
        ++j;
      }
    }

    b.length = j;
    return b;
  }

  // findIndex :: a -> [a] -> Int
  // find index of x in a, from the left
  function findIndex(x, a) {
    for (var i = 0, l = a.length; i < l; ++i) {
      if (x === a[i]) {
        return i;
      }
    }
    return -1;
  }

  // curry2 :: ((a, b) -> c) -> (a -> b -> c)
  function curry2(f) {
    function curried(a, b) {
      switch (arguments.length) {
        case 0:
          return curried;
        case 1:
          return function (b) {
            return f(a, b);
          };
        default:
          return f(a, b);
      }
    }
    return curried;
  }

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  /** @license MIT License (c) copyright 2010-2017 original author or authors */

  var ScheduledTask = /*#__PURE__*/function () {
    function ScheduledTask(time, localOffset, period, task, scheduler) {
      classCallCheck(this, ScheduledTask);

      this.time = time;
      this.localOffset = localOffset;
      this.period = period;
      this.task = task;
      this.scheduler = scheduler;
      this.active = true;
    }

    ScheduledTask.prototype.run = function run() {
      return this.task.run(this.time - this.localOffset);
    };

    ScheduledTask.prototype.error = function error(e) {
      return this.task.error(this.time - this.localOffset, e);
    };

    ScheduledTask.prototype.dispose = function dispose() {
      this.active = false;
      this.scheduler.cancel(this);
      return this.task.dispose();
    };

    return ScheduledTask;
  }();

  var RelativeScheduler = /*#__PURE__*/function () {
    function RelativeScheduler(origin, scheduler) {
      classCallCheck(this, RelativeScheduler);

      this.origin = origin;
      this.scheduler = scheduler;
    }

    RelativeScheduler.prototype.currentTime = function currentTime() {
      return this.scheduler.currentTime() - this.origin;
    };

    RelativeScheduler.prototype.scheduleTask = function scheduleTask(localOffset, delay, period, task) {
      return this.scheduler.scheduleTask(localOffset + this.origin, delay, period, task);
    };

    RelativeScheduler.prototype.relative = function relative(origin) {
      return new RelativeScheduler(origin + this.origin, this.scheduler);
    };

    RelativeScheduler.prototype.cancel = function cancel(task) {
      return this.scheduler.cancel(task);
    };

    RelativeScheduler.prototype.cancelAll = function cancelAll(f) {
      return this.scheduler.cancelAll(f);
    };

    return RelativeScheduler;
  }();

  /** @license MIT License (c) copyright 2010-2017 original author or authors */

  var defer = function defer(task) {
    return Promise.resolve(task).then(runTask);
  };

  function runTask(task) {
    try {
      return task.run();
    } catch (e) {
      return task.error(e);
    }
  }

  /** @license MIT License (c) copyright 2010-2017 original author or authors */

  var Scheduler = /*#__PURE__*/function () {
    function Scheduler(timer, timeline) {
      var _this = this;

      classCallCheck(this, Scheduler);

      this.timer = timer;
      this.timeline = timeline;

      this._timer = null;
      this._nextArrival = Infinity;

      this._runReadyTasksBound = function () {
        return _this._runReadyTasks(_this.currentTime());
      };
    }

    Scheduler.prototype.currentTime = function currentTime() {
      return this.timer.now();
    };

    Scheduler.prototype.scheduleTask = function scheduleTask(localOffset, delay, period, task) {
      var time = this.currentTime() + Math.max(0, delay);
      var st = new ScheduledTask(time, localOffset, period, task, this);

      this.timeline.add(st);
      this._scheduleNextRun();
      return st;
    };

    Scheduler.prototype.relative = function relative(offset) {
      return new RelativeScheduler(offset, this);
    };

    Scheduler.prototype.cancel = function cancel(task) {
      task.active = false;
      if (this.timeline.remove(task)) {
        this._reschedule();
      }
    };

    // @deprecated


    Scheduler.prototype.cancelAll = function cancelAll(f) {
      this.timeline.removeAll(f);
      this._reschedule();
    };

    Scheduler.prototype._reschedule = function _reschedule() {
      if (this.timeline.isEmpty()) {
        this._unschedule();
      } else {
        this._scheduleNextRun(this.currentTime());
      }
    };

    Scheduler.prototype._unschedule = function _unschedule() {
      this.timer.clearTimer(this._timer);
      this._timer = null;
    };

    Scheduler.prototype._scheduleNextRun = function _scheduleNextRun() {
      // eslint-disable-line complexity
      if (this.timeline.isEmpty()) {
        return;
      }

      var nextArrival = this.timeline.nextArrival();

      if (this._timer === null) {
        this._scheduleNextArrival(nextArrival);
      } else if (nextArrival < this._nextArrival) {
        this._unschedule();
        this._scheduleNextArrival(nextArrival);
      }
    };

    Scheduler.prototype._scheduleNextArrival = function _scheduleNextArrival(nextArrival) {
      this._nextArrival = nextArrival;
      var delay = Math.max(0, nextArrival - this.currentTime());
      this._timer = this.timer.setTimer(this._runReadyTasksBound, delay);
    };

    Scheduler.prototype._runReadyTasks = function _runReadyTasks() {
      this._timer = null;
      this.timeline.runTasks(this.currentTime(), runTask);
      this._scheduleNextRun();
    };

    return Scheduler;
  }();

  /** @license MIT License (c) copyright 2010-2017 original author or authors */

  var Timeline = /*#__PURE__*/function () {
    function Timeline() {
      classCallCheck(this, Timeline);

      this.tasks = [];
    }

    Timeline.prototype.nextArrival = function nextArrival() {
      return this.isEmpty() ? Infinity : this.tasks[0].time;
    };

    Timeline.prototype.isEmpty = function isEmpty() {
      return this.tasks.length === 0;
    };

    Timeline.prototype.add = function add(st) {
      insertByTime(st, this.tasks);
    };

    Timeline.prototype.remove = function remove(st) {
      var i = binarySearch(getTime(st), this.tasks);

      if (i >= 0 && i < this.tasks.length) {
        var events = this.tasks[i].events;
        var at = findIndex(st, events);
        if (at >= 0) {
          events.splice(at, 1);
          if (events.length === 0) {
            this.tasks.splice(i, 1);
          }
          return true;
        }
      }

      return false;
    };

    // @deprecated


    Timeline.prototype.removeAll = function removeAll$$1(f) {
      for (var i = 0; i < this.tasks.length; ++i) {
        removeAllFrom(f, this.tasks[i]);
      }
    };

    Timeline.prototype.runTasks = function runTasks(t, runTask) {
      var tasks = this.tasks;
      var l = tasks.length;
      var i = 0;

      while (i < l && tasks[i].time <= t) {
        ++i;
      }

      this.tasks = tasks.slice(i);

      // Run all ready tasks
      for (var j = 0; j < i; ++j) {
        this.tasks = runReadyTasks(runTask, tasks[j].events, this.tasks);
      }
    };

    return Timeline;
  }();

  function runReadyTasks(runTask, events, tasks) {
    // eslint-disable-line complexity
    for (var i = 0; i < events.length; ++i) {
      var task = events[i];

      if (task.active) {
        runTask(task);

        // Reschedule periodic repeating tasks
        // Check active again, since a task may have canceled itself
        if (task.period >= 0 && task.active) {
          task.time = task.time + task.period;
          insertByTime(task, tasks);
        }
      }
    }

    return tasks;
  }

  function insertByTime(task, timeslots) {
    var l = timeslots.length;
    var time = getTime(task);

    if (l === 0) {
      timeslots.push(newTimeslot(time, [task]));
      return;
    }

    var i = binarySearch(time, timeslots);

    if (i >= l) {
      timeslots.push(newTimeslot(time, [task]));
    } else {
      insertAtTimeslot(task, timeslots, time, i);
    }
  }

  function insertAtTimeslot(task, timeslots, time, i) {
    var timeslot = timeslots[i];
    if (time === timeslot.time) {
      addEvent(task, timeslot.events);
    } else {
      timeslots.splice(i, 0, newTimeslot(time, [task]));
    }
  }

  function addEvent(task, events) {
    if (events.length === 0 || task.time >= events[events.length - 1].time) {
      events.push(task);
    } else {
      spliceEvent(task, events);
    }
  }

  function spliceEvent(task, events) {
    for (var j = 0; j < events.length; j++) {
      if (task.time < events[j].time) {
        events.splice(j, 0, task);
        break;
      }
    }
  }

  function getTime(scheduledTask) {
    return Math.floor(scheduledTask.time);
  }

  // @deprecated
  function removeAllFrom(f, timeslot) {
    timeslot.events = removeAll(f, timeslot.events);
  }

  function binarySearch(t, sortedArray) {
    // eslint-disable-line complexity
    var lo = 0;
    var hi = sortedArray.length;
    var mid = void 0,
        y = void 0;

    while (lo < hi) {
      mid = Math.floor((lo + hi) / 2);
      y = sortedArray[mid];

      if (t === y.time) {
        return mid;
      } else if (t < y.time) {
        hi = mid;
      } else {
        lo = mid + 1;
      }
    }
    return hi;
  }

  var newTimeslot = function newTimeslot(t, events) {
    return { time: t, events: events };
  };

  /** @license MIT License (c) copyright 2010-2017 original author or authors */

  /* global setTimeout, clearTimeout */

  var ClockTimer = /*#__PURE__*/function () {
    function ClockTimer(clock) {
      classCallCheck(this, ClockTimer);

      this._clock = clock;
    }

    ClockTimer.prototype.now = function now() {
      return this._clock.now();
    };

    ClockTimer.prototype.setTimer = function setTimer(f, dt) {
      return dt <= 0 ? runAsap(f) : setTimeout(f, dt);
    };

    ClockTimer.prototype.clearTimer = function clearTimer(t) {
      return t instanceof Asap ? t.cancel() : clearTimeout(t);
    };

    return ClockTimer;
  }();

  var Asap = /*#__PURE__*/function () {
    function Asap(f) {
      classCallCheck(this, Asap);

      this.f = f;
      this.active = true;
    }

    Asap.prototype.run = function run() {
      return this.active && this.f();
    };

    Asap.prototype.error = function error(e) {
      throw e;
    };

    Asap.prototype.cancel = function cancel() {
      this.active = false;
    };

    return Asap;
  }();

  function runAsap(f) {
    var task = new Asap(f);
    defer(task);
    return task;
  }

  /** @license MIT License (c) copyright 2010-2017 original author or authors */

  /* global performance, process */

  var RelativeClock = /*#__PURE__*/function () {
    function RelativeClock(clock, origin) {
      classCallCheck(this, RelativeClock);

      this.origin = origin;
      this.clock = clock;
    }

    RelativeClock.prototype.now = function now() {
      return this.clock.now() - this.origin;
    };

    return RelativeClock;
  }();

  var HRTimeClock = /*#__PURE__*/function () {
    function HRTimeClock(hrtime, origin) {
      classCallCheck(this, HRTimeClock);

      this.origin = origin;
      this.hrtime = hrtime;
    }

    HRTimeClock.prototype.now = function now() {
      var hrt = this.hrtime(this.origin);
      return (hrt[0] * 1e9 + hrt[1]) / 1e6;
    };

    return HRTimeClock;
  }();

  var clockRelativeTo = function clockRelativeTo(clock) {
    return new RelativeClock(clock, clock.now());
  };

  var newPerformanceClock = function newPerformanceClock() {
    return clockRelativeTo(performance);
  };

  // @deprecated will be removed in 2.0.0
  // Date.now is not monotonic, and performance.now is ubiquitous:
  // See https://caniuse.com/#search=performance.now
  var newDateClock = function newDateClock() {
    return clockRelativeTo(Date);
  };

  var newHRTimeClock = function newHRTimeClock() {
    return new HRTimeClock(process.hrtime, process.hrtime());
  };

  var newPlatformClock = function newPlatformClock() {
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      return newPerformanceClock();
    } else if (typeof process !== 'undefined' && typeof process.hrtime === 'function') {
      return newHRTimeClock();
    }

    return newDateClock();
  };

  // Schedule a task to run as soon as possible, but
  // not in the current call stack
  var asap = /*#__PURE__*/curry2(function (task, scheduler) {
    return scheduler.scheduleTask(0, 0, -1, task);
  });

  var newDefaultScheduler = function newDefaultScheduler() {
    return new Scheduler(newDefaultTimer(), new Timeline());
  };

  var newDefaultTimer = function newDefaultTimer() {
    return new ClockTimer(newPlatformClock());
  };

  var classCallCheck$1 = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  /** @license MIT License (c) copyright 2010-2017 original author or authors */

  var disposeNone = function disposeNone() {
    return NONE;
  };
  var NONE = /*#__PURE__*/new (function () {
    function DisposeNone() {
      classCallCheck$1(this, DisposeNone);
    }

    DisposeNone.prototype.dispose = function dispose() {};

    return DisposeNone;
  }())();

  /** @license MIT License (c) copyright 2010-2017 original author or authors */

  // Wrap an existing disposable (which may not already have been once()d)
  // so that it will only dispose its underlying resource at most once.
  var disposeOnce = function disposeOnce(disposable) {
    return new DisposeOnce(disposable);
  };

  var DisposeOnce = /*#__PURE__*/function () {
    function DisposeOnce(disposable) {
      classCallCheck$1(this, DisposeOnce);

      this.disposed = false;
      this.disposable = disposable;
    }

    DisposeOnce.prototype.dispose = function dispose() {
      if (!this.disposed) {
        this.disposed = true;
        this.disposable.dispose();
        this.disposable = undefined;
      }
    };

    return DisposeOnce;
  }();

  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  function fatalError(e) {
    setTimeout(rethrow, 0, e);
  }

  function rethrow(e) {
    throw e;
  }





  var classCallCheck$2 = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };











  var inherits = function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };











  var possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };

  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var propagateTask$1 = function propagateTask(run, value, sink) {
    return new PropagateTask(run, value, sink);
  };

  var propagateEndTask = function propagateEndTask(sink) {
    return propagateTask$1(runEnd, undefined, sink);
  };

  var PropagateTask = /*#__PURE__*/function () {
    function PropagateTask(run, value, sink) {
      classCallCheck$2(this, PropagateTask);

      this._run = run;
      this.value = value;
      this.sink = sink;
      this.active = true;
    }

    PropagateTask.prototype.dispose = function dispose() {
      this.active = false;
    };

    PropagateTask.prototype.run = function run(t) {
      if (!this.active) {
        return;
      }
      var run = this._run;
      run(t, this.value, this.sink);
    };

    PropagateTask.prototype.error = function error(t, e) {
      // TODO: Remove this check and just do this.sink.error(t, e)?
      if (!this.active) {
        return fatalError(e);
      }
      this.sink.error(t, e);
    };

    return PropagateTask;
  }();

  var runEnd = function runEnd(t, _, sink) {
    return sink.end(t);
  };

  var isCanonicalEmpty = function isCanonicalEmpty(stream) {
    return stream === EMPTY;
  };

  var Empty = /*#__PURE__*/function () {
    function Empty() {
      classCallCheck$2(this, Empty);
    }

    Empty.prototype.run = function run(sink, scheduler$$1) {
      return asap(propagateEndTask(sink), scheduler$$1);
    };

    return Empty;
  }();

  var EMPTY = /*#__PURE__*/new Empty();

  /** @license MIT License (c) copyright 2010-2017 original author or authors */
  /** @author Brian Cavalier */

  var Pipe = /*#__PURE__*/function () {
    function Pipe(sink) {
      classCallCheck$2(this, Pipe);

      this.sink = sink;
    }

    Pipe.prototype.event = function event(t, x) {
      return this.sink.event(t, x);
    };

    Pipe.prototype.end = function end(t) {
      return this.sink.end(t);
    };

    Pipe.prototype.error = function error(t, e) {
      return this.sink.error(t, e);
    };

    return Pipe;
  }();

  /** @license MIT License (c) copyright 2010-2017 original author or authors */

  var SettableDisposable = /*#__PURE__*/function () {
    function SettableDisposable() {
      classCallCheck$2(this, SettableDisposable);

      this.disposable = undefined;
      this.disposed = false;
    }

    SettableDisposable.prototype.setDisposable = function setDisposable(disposable$$1) {
      if (this.disposable !== void 0) {
        throw new Error('setDisposable called more than once');
      }

      this.disposable = disposable$$1;

      if (this.disposed) {
        disposable$$1.dispose();
      }
    };

    SettableDisposable.prototype.dispose = function dispose() {
      if (this.disposed) {
        return;
      }

      this.disposed = true;

      if (this.disposable !== void 0) {
        this.disposable.dispose();
      }
    };

    return SettableDisposable;
  }();

  /** @license MIT License (c) copyright 2010-2017 original author or authors */

  var runEffects$1 = /*#__PURE__*/curry2(function (stream, scheduler$$1) {
    return new Promise(function (resolve, reject) {
      return runStream(stream, scheduler$$1, resolve, reject);
    });
  });

  function runStream(stream, scheduler$$1, resolve, reject) {
    var disposable$$1 = new SettableDisposable();
    var observer = new RunEffectsSink(resolve, reject, disposable$$1);

    disposable$$1.setDisposable(stream.run(observer, scheduler$$1));
  }

  var RunEffectsSink = /*#__PURE__*/function () {
    function RunEffectsSink(end, error, disposable$$1) {
      classCallCheck$2(this, RunEffectsSink);

      this._end = end;
      this._error = error;
      this._disposable = disposable$$1;
      this.active = true;
    }

    RunEffectsSink.prototype.event = function event(t, x) {};

    RunEffectsSink.prototype.end = function end(t) {
      if (!this.active) {
        return;
      }
      this._dispose(this._error, this._end, undefined);
    };

    RunEffectsSink.prototype.error = function error(t, e) {
      this._dispose(this._error, this._error, e);
    };

    RunEffectsSink.prototype._dispose = function _dispose(error, end, x) {
      this.active = false;
      tryDispose$1(error, end, x, this._disposable);
    };

    return RunEffectsSink;
  }();

  function tryDispose$1(error, end, x, disposable$$1) {
    try {
      disposable$$1.dispose();
    } catch (e) {
      error(e);
      return;
    }

    end(x);
  }

  /**
  * Perform a side effect for each item in the stream
  * @param {function(x:*):*} f side effect to execute for each item. The
  *  return value will be discarded.
  * @param {Stream} stream stream to tap
  * @returns {Stream} new stream containing the same items as this stream
  */
  var tap$1 = function tap(f, stream) {
    return new Tap(f, stream);
  };

  var Tap = /*#__PURE__*/function () {
    function Tap(f, source) {
      classCallCheck$2(this, Tap);

      this.source = source;
      this.f = f;
    }

    Tap.prototype.run = function run(sink, scheduler$$1) {
      return this.source.run(new TapSink(this.f, sink), scheduler$$1);
    };

    return Tap;
  }();

  var TapSink = /*#__PURE__*/function (_Pipe) {
    inherits(TapSink, _Pipe);

    function TapSink(f, sink) {
      classCallCheck$2(this, TapSink);

      var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

      _this.f = f;
      return _this;
    }

    TapSink.prototype.event = function event(t, x) {
      var f = this.f;
      f(x);
      this.sink.event(t, x);
    };

    return TapSink;
  }(Pipe);

  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  function tryEvent(t, x, sink) {
    try {
      sink.event(t, x);
    } catch (e) {
      sink.error(t, e);
    }
  }

  function tryEnd(t, sink) {
    try {
      sink.end(t);
    } catch (e) {
      sink.error(t, e);
    }
  }

  var multicast = function multicast(stream) {
    return stream instanceof Multicast || isCanonicalEmpty(stream) ? stream : new Multicast(stream);
  };

  var Multicast = /*#__PURE__*/function () {
    function Multicast(source) {
      classCallCheck$2(this, Multicast);

      this.source = new MulticastSource(source);
    }

    Multicast.prototype.run = function run(sink, scheduler$$1) {
      return this.source.run(sink, scheduler$$1);
    };

    return Multicast;
  }();

  var MulticastSource = /*#__PURE__*/function () {
    function MulticastSource(source) {
      classCallCheck$2(this, MulticastSource);

      this.source = source;
      this.sinks = [];
      this.disposable = disposeNone();
    }

    MulticastSource.prototype.run = function run(sink, scheduler$$1) {
      var n = this.add(sink);
      if (n === 1) {
        this.disposable = this.source.run(this, scheduler$$1);
      }
      return disposeOnce(new MulticastDisposable(this, sink));
    };

    MulticastSource.prototype.dispose = function dispose() {
      var disposable$$1 = this.disposable;
      this.disposable = disposeNone();
      return disposable$$1.dispose();
    };

    MulticastSource.prototype.add = function add(sink) {
      this.sinks = append(sink, this.sinks);
      return this.sinks.length;
    };

    MulticastSource.prototype.remove = function remove$$1(sink) {
      var i = findIndex(sink, this.sinks);
      // istanbul ignore next
      if (i >= 0) {
        this.sinks = remove(i, this.sinks);
      }

      return this.sinks.length;
    };

    MulticastSource.prototype.event = function event(time, value) {
      var s = this.sinks;
      if (s.length === 1) {
        return s[0].event(time, value);
      }
      for (var i = 0; i < s.length; ++i) {
        tryEvent(time, value, s[i]);
      }
    };

    MulticastSource.prototype.end = function end(time) {
      var s = this.sinks;
      for (var i = 0; i < s.length; ++i) {
        tryEnd(time, s[i]);
      }
    };

    MulticastSource.prototype.error = function error(time, err) {
      var s = this.sinks;
      for (var i = 0; i < s.length; ++i) {
        s[i].error(time, err);
      }
    };

    return MulticastSource;
  }();

  var MulticastDisposable = /*#__PURE__*/function () {
    function MulticastDisposable(source, sink) {
      classCallCheck$2(this, MulticastDisposable);

      this.source = source;
      this.sink = sink;
    }

    MulticastDisposable.prototype.dispose = function dispose() {
      if (this.source.remove(this.sink) === 0) {
        this.source.dispose();
      }
    };

    return MulticastDisposable;
  }();

  // -----------------------------------------------------------------------
  // Observing

  var runEffects$$1 = /*#__PURE__*/curry2(runEffects$1);
  var tap$$1 = /*#__PURE__*/curry2(tap$1);

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //

  // import ProjectManager from './ProjectManager.vue';

  var script = {
    name: 'App',
    // components: { ProjectManager },
    props: {
      title: {
        type: String,
        default: 'Marcelle App',
      },
      left: {
        type: Object,
        default: {},
      },
      right: {
        type: Object,
        default: {},
      },
    },
    // data() {
    //   return {
    //     left: { input: ['test'] },
    //     right: {},
    //   };
    // },
  };

  function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
      if (typeof shadowMode !== 'boolean') {
          createInjectorSSR = createInjector;
          createInjector = shadowMode;
          shadowMode = false;
      }
      // Vue.extend constructor export interop.
      const options = typeof script === 'function' ? script.options : script;
      // render functions
      if (template && template.render) {
          options.render = template.render;
          options.staticRenderFns = template.staticRenderFns;
          options._compiled = true;
          // functional template
          if (isFunctionalTemplate) {
              options.functional = true;
          }
      }
      // scopedId
      if (scopeId) {
          options._scopeId = scopeId;
      }
      let hook;
      if (moduleIdentifier) {
          // server build
          hook = function (context) {
              // 2.3 injection
              context =
                  context || // cached call
                      (this.$vnode && this.$vnode.ssrContext) || // stateful
                      (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
              // 2.2 with runInNewContext: true
              if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                  context = __VUE_SSR_CONTEXT__;
              }
              // inject component styles
              if (style) {
                  style.call(this, createInjectorSSR(context));
              }
              // register component module identifier for async chunk inference
              if (context && context._registeredComponents) {
                  context._registeredComponents.add(moduleIdentifier);
              }
          };
          // used by ssr in case component is cached and beforeCreate
          // never gets called
          options._ssrRegister = hook;
      }
      else if (style) {
          hook = shadowMode
              ? function (context) {
                  style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
              }
              : function (context) {
                  style.call(this, createInjector(context));
              };
      }
      if (hook) {
          if (options.functional) {
              // register for functional component in vue file
              const originalRender = options.render;
              options.render = function renderWithStyleInjection(h, context) {
                  hook.call(context);
                  return originalRender(h, context);
              };
          }
          else {
              // inject component registration as beforeCreate hook
              const existing = options.beforeCreate;
              options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
          }
      }
      return script;
  }

  const isOldIE = typeof navigator !== 'undefined' &&
      /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
  function createInjector(context) {
      return (id, style) => addStyle(id, style);
  }
  let HEAD;
  const styles = {};
  function addStyle(id, css) {
      const group = isOldIE ? css.media || 'default' : id;
      const style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
      if (!style.ids.has(id)) {
          style.ids.add(id);
          let code = css.source;
          if (css.map) {
              // https://developer.chrome.com/devtools/docs/javascript-debugging
              // this makes source maps inside style tags work properly in Chrome
              code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
              // http://stackoverflow.com/a/26603875
              code +=
                  '\n/*# sourceMappingURL=data:application/json;base64,' +
                      btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                      ' */';
          }
          if (!style.element) {
              style.element = document.createElement('style');
              style.element.type = 'text/css';
              if (css.media)
                  style.element.setAttribute('media', css.media);
              if (HEAD === undefined) {
                  HEAD = document.head || document.getElementsByTagName('head')[0];
              }
              HEAD.appendChild(style.element);
          }
          if ('styleSheet' in style.element) {
              style.styles.push(code);
              style.element.styleSheet.cssText = style.styles
                  .filter(Boolean)
                  .join('\n');
          }
          else {
              const index = style.ids.size - 1;
              const textNode = document.createTextNode(code);
              const nodes = style.element.childNodes;
              if (nodes[index])
                  style.element.removeChild(nodes[index]);
              if (nodes.length)
                  style.element.insertBefore(textNode, nodes[index]);
              else
                  style.element.appendChild(textNode);
          }
      }
  }

  /* script */
  const __vue_script__ = script;

  /* template */
  var __vue_render__ = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("el-main", { attrs: { id: "app" } }, [
      _c("h1", [_vm._v(_vm._s(_vm.title))]),
      _vm._v(" "),
      _c("div", { staticClass: "row" }, [
        _c(
          "div",
          { staticClass: "left" },
          [
            _c(
              "el-tabs",
              { attrs: { "tab-position": "top" } },
              _vm._l(_vm.left, function(ids, slot) {
                return _c(
                  "el-tab-pane",
                  { key: slot, attrs: { label: slot } },
                  _vm._l(ids, function(id) {
                    return _c("div", {
                      key: id,
                      ref: "id",
                      refInFor: true,
                      attrs: { id: id }
                    })
                  }),
                  0
                )
              }),
              1
            )
          ],
          1
        ),
        _vm._v(" "),
        _c(
          "div",
          { staticClass: "right" },
          [
            _c(
              "el-tabs",
              { attrs: { "tab-position": "top" } },
              _vm._l(_vm.right, function(ids, slot) {
                return _c(
                  "el-tab-pane",
                  { key: slot, attrs: { label: slot } },
                  _vm._l(ids, function(id) {
                    return _c("div", {
                      key: id,
                      ref: "id",
                      refInFor: true,
                      attrs: { id: id }
                    })
                  }),
                  0
                )
              }),
              1
            )
          ],
          1
        )
      ])
    ])
  };
  var __vue_staticRenderFns__ = [];
  __vue_render__._withStripped = true;

    /* style */
    const __vue_inject_styles__ = function (inject) {
      if (!inject) return
      inject("data-v-4484e015_0", { source: "\nhtml,\nbody {\n  font-family: 'Lato', 'Avenir', Helvetica, Arial, sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  margin: 0;\n  padding: 0;\n}\np {\n  font-size: 0.9em;\n  margin: 8px 0;\n}\nh1 {\n  font-size: 1.4em;\n}\n.el-card {\n  margin-bottom: 10px;\n}\n#app {\n  color: #2c3e50;\n}\n#app > .row {\n  display: flex;\n}\n@media (max-width: 874px) {\n#app > .row {\n    flex-direction: column;\n}\n}\n#app > .row > .left {\n  margin-right: 20px;\n  width: 350px;\n  flex-shrink: 0;\n}\n#app > .row > .right {\n  flex-grow: 1;\n  max-width: calc(100% - 370px);\n}\n.el-card {\n  margin: 5px 3px;\n  flex-grow: 1;\n}\n.card-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\n.el-card__header {\n  padding: 2px 10px;\n  font-size: 0.8em;\n  background-color: #ebeef5;\n}\n.el-card__body {\n  padding: 10px;\n}\n.el-form--inline .el-form-item {\n  margin-bottom: 10px;\n}\n.el-tooltip__popper a {\n  color: white;\n}\n.marcelle-row {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: stretch;\n}\n.dataset .el-badge__content.is-fixed.is-dot {\n  right: 8px !important;\n  top: 3px !important;\n}\n", map: {"version":3,"sources":["/Users/jules/Documents/Code/js/marcelle-next/packages/core/src/App.vue"],"names":[],"mappings":";AA0DA;;EAEA,2DAAA;EACA,mCAAA;EACA,kCAAA;EACA,SAAA;EACA,UAAA;AACA;AAEA;EACA,gBAAA;EACA,aAAA;AACA;AAEA;EACA,gBAAA;AACA;AAEA;EACA,mBAAA;AACA;AAEA;EACA,cAAA;AACA;AAEA;EACA,aAAA;AACA;AAEA;AACA;IACA,sBAAA;AACA;AACA;AAEA;EACA,kBAAA;EACA,YAAA;EACA,cAAA;AACA;AAEA;EACA,YAAA;EACA,6BAAA;AACA;AAEA;EACA,eAAA;EACA,YAAA;AACA;AAEA;EACA,aAAA;EACA,mBAAA;EACA,8BAAA;AACA;AAEA;EACA,iBAAA;EACA,gBAAA;EACA,yBAAA;AACA;AAEA;EACA,aAAA;AACA;AAEA;EACA,mBAAA;AACA;AAEA;EACA,YAAA;AACA;AAEA;EACA,aAAA;EACA,eAAA;EACA,oBAAA;AACA;AAEA;EACA,qBAAA;EACA,mBAAA;AACA","file":"App.vue","sourcesContent":["<template>\n  <el-main id=\"app\">\n    <h1>{{title}}</h1>\n    <div class=\"row\">\n      <div class=\"left\">\n        <el-tabs tab-position=\"top\">\n          <el-tab-pane v-for=\"(ids, slot) in left\" :key=\"slot\" :label=\"slot\">\n            <div v-for=\"id in ids\" :key=\"id\" :id=\"id\" ref=\"id\" />\n          </el-tab-pane>\n          <!-- <el-tab-pane label=\"Project\">\n            <project-manager />\n          </el-tab-pane> -->\n        </el-tabs>\n      </div>\n      <div class=\"right\">\n        <!-- <el-tabs tab-position=\"top\">\n          <slot name=\"tabs\" />\n        </el-tabs> -->\n        <el-tabs tab-position=\"top\">\n          <el-tab-pane v-for=\"(ids, slot) in right\" :key=\"slot\" :label=\"slot\">\n            <div v-for=\"id in ids\" :key=\"id\" :id=\"id\" ref=\"id\" />\n          </el-tab-pane>\n        </el-tabs>\n      </div>\n    </div>\n  </el-main>\n</template>\n\n<script>\n// import ProjectManager from './ProjectManager.vue';\n\nexport default {\n  name: 'App',\n  // components: { ProjectManager },\n  props: {\n    title: {\n      type: String,\n      default: 'Marcelle App',\n    },\n    left: {\n      type: Object,\n      default: {},\n    },\n    right: {\n      type: Object,\n      default: {},\n    },\n  },\n  // data() {\n  //   return {\n  //     left: { input: ['test'] },\n  //     right: {},\n  //   };\n  // },\n};\n</script>\n\n<style>\nhtml,\nbody {\n  font-family: 'Lato', 'Avenir', Helvetica, Arial, sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  margin: 0;\n  padding: 0;\n}\n\np {\n  font-size: 0.9em;\n  margin: 8px 0;\n}\n\nh1 {\n  font-size: 1.4em;\n}\n\n.el-card {\n  margin-bottom: 10px;\n}\n\n#app {\n  color: #2c3e50;\n}\n\n#app > .row {\n  display: flex;\n}\n\n@media (max-width: 874px) {\n  #app > .row {\n    flex-direction: column;\n  }\n}\n\n#app > .row > .left {\n  margin-right: 20px;\n  width: 350px;\n  flex-shrink: 0;\n}\n\n#app > .row > .right {\n  flex-grow: 1;\n  max-width: calc(100% - 370px);\n}\n\n.el-card {\n  margin: 5px 3px;\n  flex-grow: 1;\n}\n\n.card-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\n\n.el-card__header {\n  padding: 2px 10px;\n  font-size: 0.8em;\n  background-color: #ebeef5;\n}\n\n.el-card__body {\n  padding: 10px;\n}\n\n.el-form--inline .el-form-item {\n  margin-bottom: 10px;\n}\n\n.el-tooltip__popper a {\n  color: white;\n}\n\n.marcelle-row {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: stretch;\n}\n\n.dataset .el-badge__content.is-fixed.is-dot {\n  right: 8px !important;\n  top: 3px !important;\n}\n</style>\n"]}, media: undefined });

    };
    /* scoped */
    const __vue_scope_id__ = undefined;
    /* module identifier */
    const __vue_module_identifier__ = undefined;
    /* functional template */
    const __vue_is_functional_template__ = false;
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__ = /*#__PURE__*/normalizeComponent(
      { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
      __vue_inject_styles__,
      __vue_script__,
      __vue_scope_id__,
      __vue_is_functional_template__,
      __vue_module_identifier__,
      false,
      createInjector,
      undefined,
      undefined
    );

  class Application {
      constructor(title = 'Hello, Marcelle!', author = 'author', datasets = []) {
          this.title = title;
          this.author = author;
          this.datasets = datasets;
          this.started = false;
          // input: Module | undefined;
          this.modules = {};
          this.ui = { left: {}, right: {} };
          this.streams = [];
          this.scheduler = newDefaultScheduler();
          this.dashboards = [];
      }
      //   /**
      //    * Add a new tab
      //    * @param {String} name Tab name
      //    */
      //   tab(name) {
      //     if (!Object.keys(this.tabs).includes(name)) {
      //       this.tabs[name] = new Tab(name);
      //     }
      //     return this.tabs[name];
      //   }
      //   watch(path, callback) {
      //     this.watchers.push({ path, callback });
      //     if (this.running) {
      //       runWatchers(this.$root, this.watchers);
      //     }
      //   }
      //   observable(name, value = undefined) {
      //     const obsExists = Object.keys(this.observables).includes(name);
      //     if (this.running && obsExists && value === undefined) {
      //       return this.$root.$observables[name];
      //     }
      //     this.observables[name] = value;
      //     if (this.running) {
      //       return this.$root.$observables[name];
      //     }
      //     return value;
      //   }
      use(module) {
          this.modules[module.id] = module;
          // if (this.started) {
          //   module.run(this.scheduler);
          // }
      }
      run(stream) {
          this.streams.push(stream);
          if (this.started) {
              runEffects$$1(stream, this.scheduler);
          }
      }
      input(module) {
          if (!Object.keys(this.modules).includes(module.id)) {
              throw new Error(`Module '${module.id}' hasn't been registered on the application.
        Use \`app.use()\`
      `);
          }
          // const d = document.createElement('div');
          // d.id = module.id;
          // const leftContainer = document.querySelector('#left');
          // leftContainer?.appendChild(d);
          if (!Object.keys(this.ui.left).includes('input')) {
              this.ui.left.input = [];
          }
          this.ui.left.input.push(module.id);
      }
      dashboard(dashboardName) {
          if (!Object.keys(this.ui.right).includes(dashboardName)) {
              this.ui.right[dashboardName] = [];
          }
          // let dashboardIndex: number;
          // if (!this.dashboards.includes(dashboardName)) {
          //   dashboardIndex = this.dashboards.push(dashboardName) - 1;
          //   const d = document.createElement('el-tab-pane');
          //   d.id = `dashboard-${dashboardIndex}`;
          //   const rightContainer = document.querySelector('#right');
          //   rightContainer?.appendChild(d);
          // } else {
          //   dashboardIndex = this.dashboards.indexOf(dashboardName);
          // }
          // const dashboardContainer = document.querySelector(`#dashboard-${dashboardIndex}`);
          return {
              use: (module) => {
                  if (!Object.keys(this.modules).includes(module.id)) {
                      throw new Error(`Module '${module.id}' hasn't been registered on the application.
            Use \`app.use()\`
          `);
                  }
                  this.ui.right[dashboardName].push(module.id);
              },
          };
      }
      async start() {
          console.log('title', this.title);
          console.log('author', this.author);
          console.log('datasets', this.datasets);
          const app = new Vue({
              el: '#app',
              // template: '<App :title="title" />',
              // components: { App },
              // data: {
              //   title: this.title,
              //   left: {
              //     input: ['test'],
              //   },
              //   right: {
              //     yo: ['test'],
              //   },
              // },
              render: (h) => h(__vue_component__, {
                  props: {
                      title: this.title,
                      left: this.ui.left,
                      right: this.ui.right,
                  },
              }),
          });
          console.log('app.$data', app.$data);
          // app.$data.left = {
          //   input: ['test'],
          // };
          console.log('app', app);
          Object.values(this.ui.left)
              .reduce((x, y) => x.concat(y), [])
              .concat(Object.values(this.ui.right).reduce((x, y) => x.concat(y), []))
              .forEach((id) => {
              this.modules[id].run(this.scheduler);
          });
          this.streams.forEach((s) => {
              runEffects$$1(s, this.scheduler);
          });
          //     const data = {
          //       slots: this.plugins.map((x) => x.slot).filter((x) => !!x),
          //       ...this.plugins.reduce((c, x) => ({ ...c, ...x.data }), {}),
          //       ...Object.values(this.tabs).reduce((x, y) => ({ ...x, ...y.data }), {}),
          //       observables: this.observables,
          //     };
          //     Vue.use(coreVuePlugin);
          //     const store = new Vuex.Store();
          //     const setupPlugins = this.plugins.map(
          //       ({ plugin }) =>
          //         new Promise((resolve, reject) => {
          //           try {
          //             Vue.use(plugin, {
          //               store,
          //               appSpec: this,
          //               loaded() {
          //                 resolve();
          //               },
          //             });
          //           } catch (e) {
          //             reject(e);
          //           }
          //         }),
          //     );
          //     await Promise.all(setupPlugins);
          //     this.$root = new Vue({
          //       el: '#app',
          //       store,
          //       components: this.components,
          //       data,
          //       template: this.markup,
          //     });
          //     runWatchers(this.$root, this.watchers);
          //     this.running = true;
          this.started = true;
          return this;
      }
  }
  function createApp(options) {
      return new Application(options.title, options.author, options.datasets);
  }

  var createAdapter = function () {
      var sinks = [];
      return [function (a) { return broadcast(sinks, a); }, new FanoutPortStream(sinks)];
  };
  var broadcast = function (sinks, a) {
      return sinks.forEach(function (_a) {
          var sink = _a.sink, scheduler = _a.scheduler;
          return tryEvent$1(scheduler.currentTime(), a, sink);
      });
  };
  var FanoutPortStream = /** @class */ (function () {
      function FanoutPortStream(sinks) {
          this.sinks = sinks;
      }
      FanoutPortStream.prototype.run = function (sink, scheduler) {
          var s = { sink: sink, scheduler: scheduler };
          this.sinks.push(s);
          return new RemovePortDisposable(s, this.sinks);
      };
      return FanoutPortStream;
  }());
  var RemovePortDisposable = /** @class */ (function () {
      function RemovePortDisposable(sink, sinks) {
          this.sink = sink;
          this.sinks = sinks;
      }
      RemovePortDisposable.prototype.dispose = function () {
          var i = this.sinks.indexOf(this.sink);
          if (i >= 0) {
              this.sinks.splice(i, 1);
          }
      };
      return RemovePortDisposable;
  }());
  function tryEvent$1(t, a, sink) {
      try {
          sink.event(t, a);
      }
      catch (e) {
          sink.error(t, e);
      }
  }

  class Module {
      constructor(options) {
          this.options = options;
          this.out = {};
          this.component = undefined;
          this.ui = undefined;
          // protected vue = Vue;
          this.watchers = [];
          this.id = `module-${String(Module.moduleId++).padStart(3, '0')}`;
      }
      setup() {
          if (this.component) {
              this.ui = new this.component();
              this.watchers.forEach((w) => {
                  this.wrapWatcher(w);
              });
          }
      }
      run(scheduler) {
          if (this.ui) {
              this.ui.$mount(`#${this.id}`);
          }
          Object.values(this.out).forEach((s) => {
              runEffects$$1(s, scheduler);
          });
      }
      wrapWatcher(propertyName) {
          if (!this.ui)
              return;
          const [induce, events] = createAdapter();
          induce(this.ui[propertyName]);
          this.ui.$watch('active', (newVal) => {
              console.log(`[wrapWatcher]: ${propertyName} = ${newVal}`);
              induce(newVal);
          });
          this.out[`$${propertyName}`] = multicast(tap$$1((x) => console.log('yo', x), events));
      }
  }
  Module.moduleId = 0;
  Module.isModule = true;
  Module.moduleType = 'generic';

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //

  var script$1 = {
    name: 'CardWrapper',
    props: {
      title: {
        type: String,
        required: true,
      },
      options: {
        type: String,
        default: () => '',
      },
    },
    data() {
      return {
        error: null,
      };
    },
    computed: {
      optionsObj() {
        if (!this.options) return {};
        const opts = {};
        this.options
          .split(';')
          .filter(x => !!x)
          .forEach(opt => {
            const [key, val] = opt.split('=');
            opts[key] = val;
          });
        return opts;
      },
    },
    errorCaptured(e) {
      this.error = e;
      this.$notify.error({
        title: 'Error',
        duration: 4000,
        message: e.toString(),
      });
    },
  };

  /* script */
  const __vue_script__$1 = script$1;

  /* template */
  var __vue_render__$1 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c(
      "el-card",
      { attrs: { shadow: "hover" } },
      [
        _c(
          "div",
          {
            staticClass: "clearfix card-header",
            attrs: { slot: "header" },
            slot: "header"
          },
          [
            _c("span", [_vm._v(_vm._s(_vm.title))]),
            _vm._v(" "),
            _c(
              "div",
              [
                _vm._l(_vm.optionsObj, function(opt, key) {
                  return _c(
                    "el-tooltip",
                    {
                      key: "tag_" + key,
                      attrs: { effect: "dark", placement: "top-end" }
                    },
                    [
                      _c("div", { attrs: { slot: "content" }, slot: "content" }, [
                        _vm._v(_vm._s(key))
                      ]),
                      _vm._v(" "),
                      _c("el-tag", { attrs: { size: "mini" } }, [
                        _vm._v(_vm._s(opt))
                      ])
                    ],
                    1
                  )
                }),
                _vm._v(" "),
                _c(
                  "el-tooltip",
                  { attrs: { effect: "dark", placement: "top-end" } },
                  [
                    _c(
                      "div",
                      { attrs: { slot: "content" }, slot: "content" },
                      [_vm._t("description")],
                      2
                    ),
                    _vm._v(" "),
                    _c("el-tag", { attrs: { size: "mini", type: "info" } }, [
                      _c("i", { staticClass: "el-icon-question" })
                    ])
                  ],
                  1
                )
              ],
              2
            )
          ]
        ),
        _vm._v(" "),
        !!_vm.error
          ? _c("el-alert", {
              attrs: {
                title: _vm.error.toString(),
                "show-icon": "",
                type: "error"
              }
            })
          : _vm._e(),
        _vm._v(" "),
        _vm._t("default")
      ],
      2
    )
  };
  var __vue_staticRenderFns__$1 = [];
  __vue_render__$1._withStripped = true;

    /* style */
    const __vue_inject_styles__$1 = undefined;
    /* scoped */
    const __vue_scope_id__$1 = undefined;
    /* module identifier */
    const __vue_module_identifier__$1 = undefined;
    /* functional template */
    const __vue_is_functional_template__$1 = false;
    /* style inject */
    
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__$1 = /*#__PURE__*/normalizeComponent(
      { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
      __vue_inject_styles__$1,
      __vue_script__$1,
      __vue_scope_id__$1,
      __vue_is_functional_template__$1,
      __vue_module_identifier__$1,
      false,
      undefined,
      undefined,
      undefined
    );

  //

  var script$2 = {
    name: 'Webcam',
    components: { CardWrapper: __vue_component__$1 },
    props: {
      width: {
        type: [Number, String],
        default: 400,
      },
      height: {
        type: [Number, String],
        default: 300,
      },
      screenshotFormat: {
        type: String,
        default: 'image/jpeg',
      },
      video: {
        type: Boolean,
        default: false,
      },
      resolution: {
        type: Object,
        default: null,
        validator(value) {
          return value.height && value.width;
        },
      },
    },
    data() {
      // this.$input.setup(this);
      return {
        type: 'image',
        source: null,
        canvas: null,
        camerasListEmitted: false,
        cameras: [],
        deviceId: null,
        active: false,
        instances: [],
        cid: null,
        recording: false,
        firstFrame: null,
      };
    },
    watch: {
      active(v) {
        if (v) {
          if (!this.camerasListEmitted) {
            this.loadCameras();
          } else {
            this.start();
          }
        } else {
          this.stop();
        }
      },
    },
    beforeDestroy() {
      this.stop();
    },
    mounted() {
      this.setupMedia();
    },
    methods: {
      capture() {
        return this.$refs.video;
      },
      startRecording() {
        this.instances = [];
        this.recording = true;
        this.firstFrame = this.record();
      },
      async record() {
        if (!this.recording) return;
        this.instances.push({
          type: 'image',
          features: await this.$input.preprocess(this.capture()),
          thumbnail: this.captureSnapshot(),
          rawData: new Blob([], { type: 'text/txt' }),
        });
        this.cid = window.requestAnimationFrame(this.record);
      },
      async stopRecording() {
        this.recording = false;
        await this.firstFrame;
        if (this.cid) {
          window.cancelAnimationFrame(this.cid);
        }
        return this.instances;
      },
      captureSnapshot() {
        return this.getCanvas().toDataURL(this.screenshotFormat);
      },
      legacyGetUserMediaSupport() {
        return constraints => {
          // First get ahold of the legacy getUserMedia, if present
          const getUserMedia =
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia ||
            navigator.oGetUserMedia;
          // Some browsers just don't implement it - return a rejected promise with an error
          // to keep a consistent interface
          if (!getUserMedia) {
            return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
          }
          // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
          return new Promise((resolve, reject) => {
            getUserMedia.call(navigator, constraints, resolve, reject);
          });
        };
      },
      setupMedia() {
        if (navigator.mediaDevices === undefined) {
          navigator.mediaDevices = {};
        }
        if (navigator.mediaDevices.getUserMedia === undefined) {
          navigator.mediaDevices.getUserMedia = this.legacyGetUserMediaSupport();
        }
        // this.testMediaAccess();
      },
      loadCameras() {
        navigator.mediaDevices
          .enumerateDevices()
          .then(deviceInfos => {
            for (let i = 0; i !== deviceInfos.length; i += 1) {
              const deviceInfo = deviceInfos[i];
              if (deviceInfo.kind === 'videoinput') {
                this.cameras.push(deviceInfo);
              }
            }
          })
          .then(() => {
            if (!this.camerasListEmitted) {
              this.$emit('cameras', this.cameras);
              this.camerasListEmitted = true;
            }
            if (this.cameras.length === 1) {
              this.deviceId = this.cameras[0].deviceId;
              this.loadCamera(this.cameras[0].deviceId);
            }
          })
          .catch(error => this.$emit('notsupported', error));
      },
      /**
       * change to a different camera stream, like front and back camera on phones
       */
      changeCamera(deviceId) {
        this.stop();
        this.$emit('camera-change', deviceId);
        this.loadCamera(deviceId);
      },
      /**
       * load the stream to the
       */
      loadSrcStream(stream) {
        if ('srcObject' in this.$refs.video) {
          // new browsers api
          this.$refs.video.srcObject = stream;
        } else {
          // old broswers
          this.source = window.HTMLMediaElement.srcObject(stream);
        }
        // Emit video start/live event
        this.$refs.video.onloadedmetadata = () => {
          this.$emit('video-live', stream);
        };
        this.$emit('started', stream);
      },
      /**
       * stop the selected streamed video to change camera
       */
      stopStreamedVideo(videoElem) {
        const stream = videoElem.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => {
          // stops the video track
          track.stop();
          this.$emit('stopped', stream);
          this.$refs.video.srcObject = null;
          this.source = null;
        });
      },
      // Stop the video
      stop() {
        if (this.$refs.video !== null && this.$refs.video.srcObject) {
          this.stopStreamedVideo(this.$refs.video);
        }
        this.$emit('active', false);
      },
      // Start the video
      start() {
        if (this.deviceId) {
          this.loadCamera(this.deviceId);
          this.$emit('active', true);
        }
      },
      pause() {
        if (this.$refs.video !== null && this.$refs.video.srcObject) {
          this.$refs.video.pause();
        }
      },
      resume() {
        if (this.$refs.video !== null && this.$refs.video.srcObject) {
          this.$refs.video.play();
        }
      },
      /**
       * test access
       */
      async testMediaAccess() {
        const constraints = { video: true };
        if (this.resolution) {
          constraints.video = {};
          constraints.video.height = this.resolution.height;
          constraints.video.width = this.resolution.width;
        }
        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          // Make sure to stop this MediaStream
          const tracks = stream.getTracks();
          tracks.forEach(track => {
            track.stop();
          });
          this.loadCameras();
        } catch (e) {
          this.$emit('error', e);
        }
      },
      /**
       * load the Camera passed as index!
       */
      loadCamera(device) {
        const constraints = { video: { deviceId: { exact: device } } };
        if (this.resolution) {
          constraints.video.height = this.resolution.height;
          constraints.video.width = this.resolution.width;
        }
        navigator.mediaDevices
          .getUserMedia(constraints)
          .then(stream => this.loadSrcStream(stream))
          .catch(error => this.$emit('error', error));
      },
      getCanvas() {
        const { video } = this.$refs;
        if (!this.ctx) {
          const canvas = document.createElement('canvas');
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          this.canvas = canvas;
          this.ctx = canvas.getContext('2d');
        }
        const { ctx, canvas } = this;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas;
      },
    },
  };

  /* script */
  const __vue_script__$2 = script$2;

  /* template */
  var __vue_render__$2 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c(
      "card-wrapper",
      { attrs: { title: "Webcam" } },
      [
        _c("template", { slot: "description" }, [
          _vm._v("\n    Love on the beat\n  ")
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "webcam" }, [
          _c("div", { staticClass: "webcam-container" }, [
            _c("video", {
              ref: "video",
              attrs: {
                id: "webcam-video",
                height: _vm.height,
                src: _vm.source,
                width: _vm.width,
                autoplay: "",
                muted: "",
                playsinline: ""
              },
              domProps: { muted: true }
            })
          ]),
          _vm._v(" "),
          _c(
            "div",
            { staticStyle: { "margin-left": "10px" } },
            [
              _c("el-switch", {
                model: {
                  value: _vm.active,
                  callback: function($$v) {
                    _vm.active = $$v;
                  },
                  expression: "active"
                }
              }),
              _vm._v(" "),
              _c("span", { staticStyle: { "margin-left": "10px" } }, [
                _vm._v("activate video")
              ])
            ],
            1
          )
        ])
      ],
      2
    )
  };
  var __vue_staticRenderFns__$2 = [];
  __vue_render__$2._withStripped = true;

    /* style */
    const __vue_inject_styles__$2 = function (inject) {
      if (!inject) return
      inject("data-v-13cee698_0", { source: "\n.webcam[data-v-13cee698] {\n  width: 100%;\n  display: flex;\n  flex-direction: column;\n}\n.webcam .webcam-container[data-v-13cee698] {\n  width: 300px;\n  height: 300px;\n  overflow: hidden;\n  display: flex;\n  justify-content: center;\n  margin: 10px;\n  border: 1px solid grey;\n}\nvideo[data-v-13cee698] {\n  transform: scaleX(-1);\n}\n", map: {"version":3,"sources":["/Users/jules/Documents/Code/js/marcelle-next/packages/core/src/Webcam.vue"],"names":[],"mappings":";AAmSA;EACA,WAAA;EACA,aAAA;EACA,sBAAA;AACA;AAEA;EACA,YAAA;EACA,aAAA;EACA,gBAAA;EACA,aAAA;EACA,uBAAA;EACA,YAAA;EACA,sBAAA;AACA;AAEA;EACA,qBAAA;AACA","file":"Webcam.vue","sourcesContent":["<template>\n  <card-wrapper title=\"Webcam\">\n    <template slot=\"description\">\n      Love on the beat\n    </template>\n    <div class=\"webcam\">\n    <div class=\"webcam-container\">\n      <video\n        id=\"webcam-video\"\n        ref=\"video\"\n        :height=\"height\"\n        :src=\"source\"\n        :width=\"width\"\n        autoplay\n        muted\n        playsinline\n      />\n      </div>\n      <div style=\"margin-left: 10px;\">\n        <el-switch v-model=\"active\" />\n        <span style=\"margin-left: 10px;\">activate video</span>\n      </div>\n    </div>\n  </card-wrapper>\n</template>\n\n<script>\nimport CardWrapper from \"./CardWrapper.vue\";\n\nexport default {\n  name: 'Webcam',\n  components: { CardWrapper },\n  props: {\n    width: {\n      type: [Number, String],\n      default: 400,\n    },\n    height: {\n      type: [Number, String],\n      default: 300,\n    },\n    screenshotFormat: {\n      type: String,\n      default: 'image/jpeg',\n    },\n    video: {\n      type: Boolean,\n      default: false,\n    },\n    resolution: {\n      type: Object,\n      default: null,\n      validator(value) {\n        return value.height && value.width;\n      },\n    },\n  },\n  data() {\n    // this.$input.setup(this);\n    return {\n      type: 'image',\n      source: null,\n      canvas: null,\n      camerasListEmitted: false,\n      cameras: [],\n      deviceId: null,\n      active: false,\n      instances: [],\n      cid: null,\n      recording: false,\n      firstFrame: null,\n    };\n  },\n  watch: {\n    active(v) {\n      if (v) {\n        if (!this.camerasListEmitted) {\n          this.loadCameras();\n        } else {\n          this.start();\n        }\n      } else {\n        this.stop();\n      }\n    },\n  },\n  beforeDestroy() {\n    this.stop();\n  },\n  mounted() {\n    this.setupMedia();\n  },\n  methods: {\n    capture() {\n      return this.$refs.video;\n    },\n    startRecording() {\n      this.instances = [];\n      this.recording = true;\n      this.firstFrame = this.record();\n    },\n    async record() {\n      if (!this.recording) return;\n      this.instances.push({\n        type: 'image',\n        features: await this.$input.preprocess(this.capture()),\n        thumbnail: this.captureSnapshot(),\n        rawData: new Blob([], { type: 'text/txt' }),\n      });\n      this.cid = window.requestAnimationFrame(this.record);\n    },\n    async stopRecording() {\n      this.recording = false;\n      await this.firstFrame;\n      if (this.cid) {\n        window.cancelAnimationFrame(this.cid);\n      }\n      return this.instances;\n    },\n    captureSnapshot() {\n      return this.getCanvas().toDataURL(this.screenshotFormat);\n    },\n    legacyGetUserMediaSupport() {\n      return constraints => {\n        // First get ahold of the legacy getUserMedia, if present\n        const getUserMedia =\n          navigator.getUserMedia ||\n          navigator.webkitGetUserMedia ||\n          navigator.mozGetUserMedia ||\n          navigator.msGetUserMedia ||\n          navigator.oGetUserMedia;\n        // Some browsers just don't implement it - return a rejected promise with an error\n        // to keep a consistent interface\n        if (!getUserMedia) {\n          return Promise.reject(new Error('getUserMedia is not implemented in this browser'));\n        }\n        // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise\n        return new Promise((resolve, reject) => {\n          getUserMedia.call(navigator, constraints, resolve, reject);\n        });\n      };\n    },\n    setupMedia() {\n      if (navigator.mediaDevices === undefined) {\n        navigator.mediaDevices = {};\n      }\n      if (navigator.mediaDevices.getUserMedia === undefined) {\n        navigator.mediaDevices.getUserMedia = this.legacyGetUserMediaSupport();\n      }\n      // this.testMediaAccess();\n    },\n    loadCameras() {\n      navigator.mediaDevices\n        .enumerateDevices()\n        .then(deviceInfos => {\n          for (let i = 0; i !== deviceInfos.length; i += 1) {\n            const deviceInfo = deviceInfos[i];\n            if (deviceInfo.kind === 'videoinput') {\n              this.cameras.push(deviceInfo);\n            }\n          }\n        })\n        .then(() => {\n          if (!this.camerasListEmitted) {\n            this.$emit('cameras', this.cameras);\n            this.camerasListEmitted = true;\n          }\n          if (this.cameras.length === 1) {\n            this.deviceId = this.cameras[0].deviceId;\n            this.loadCamera(this.cameras[0].deviceId);\n          }\n        })\n        .catch(error => this.$emit('notsupported', error));\n    },\n    /**\n     * change to a different camera stream, like front and back camera on phones\n     */\n    changeCamera(deviceId) {\n      this.stop();\n      this.$emit('camera-change', deviceId);\n      this.loadCamera(deviceId);\n    },\n    /**\n     * load the stream to the\n     */\n    loadSrcStream(stream) {\n      if ('srcObject' in this.$refs.video) {\n        // new browsers api\n        this.$refs.video.srcObject = stream;\n      } else {\n        // old broswers\n        this.source = window.HTMLMediaElement.srcObject(stream);\n      }\n      // Emit video start/live event\n      this.$refs.video.onloadedmetadata = () => {\n        this.$emit('video-live', stream);\n      };\n      this.$emit('started', stream);\n    },\n    /**\n     * stop the selected streamed video to change camera\n     */\n    stopStreamedVideo(videoElem) {\n      const stream = videoElem.srcObject;\n      const tracks = stream.getTracks();\n      tracks.forEach(track => {\n        // stops the video track\n        track.stop();\n        this.$emit('stopped', stream);\n        this.$refs.video.srcObject = null;\n        this.source = null;\n      });\n    },\n    // Stop the video\n    stop() {\n      if (this.$refs.video !== null && this.$refs.video.srcObject) {\n        this.stopStreamedVideo(this.$refs.video);\n      }\n      this.$emit('active', false);\n    },\n    // Start the video\n    start() {\n      if (this.deviceId) {\n        this.loadCamera(this.deviceId);\n        this.$emit('active', true);\n      }\n    },\n    pause() {\n      if (this.$refs.video !== null && this.$refs.video.srcObject) {\n        this.$refs.video.pause();\n      }\n    },\n    resume() {\n      if (this.$refs.video !== null && this.$refs.video.srcObject) {\n        this.$refs.video.play();\n      }\n    },\n    /**\n     * test access\n     */\n    async testMediaAccess() {\n      const constraints = { video: true };\n      if (this.resolution) {\n        constraints.video = {};\n        constraints.video.height = this.resolution.height;\n        constraints.video.width = this.resolution.width;\n      }\n      try {\n        const stream = await navigator.mediaDevices.getUserMedia(constraints);\n        // Make sure to stop this MediaStream\n        const tracks = stream.getTracks();\n        tracks.forEach(track => {\n          track.stop();\n        });\n        this.loadCameras();\n      } catch (e) {\n        this.$emit('error', e);\n      }\n    },\n    /**\n     * load the Camera passed as index!\n     */\n    loadCamera(device) {\n      const constraints = { video: { deviceId: { exact: device } } };\n      if (this.resolution) {\n        constraints.video.height = this.resolution.height;\n        constraints.video.width = this.resolution.width;\n      }\n      navigator.mediaDevices\n        .getUserMedia(constraints)\n        .then(stream => this.loadSrcStream(stream))\n        .catch(error => this.$emit('error', error));\n    },\n    getCanvas() {\n      const { video } = this.$refs;\n      if (!this.ctx) {\n        const canvas = document.createElement('canvas');\n        canvas.height = video.videoHeight;\n        canvas.width = video.videoWidth;\n        this.canvas = canvas;\n        this.ctx = canvas.getContext('2d');\n      }\n      const { ctx, canvas } = this;\n      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);\n      return canvas;\n    },\n  },\n};\n</script>\n\n<style scoped>\n.webcam {\n  width: 100%;\n  display: flex;\n  flex-direction: column;\n}\n\n.webcam .webcam-container {\n  width: 300px;\n  height: 300px;\n  overflow: hidden;\n  display: flex;\n  justify-content: center;\n  margin: 10px;\n  border: 1px solid grey;\n}\n\nvideo {\n  transform: scaleX(-1);\n}\n</style>\n"]}, media: undefined });

    };
    /* scoped */
    const __vue_scope_id__$2 = "data-v-13cee698";
    /* module identifier */
    const __vue_module_identifier__$2 = undefined;
    /* functional template */
    const __vue_is_functional_template__$2 = false;
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__$2 = /*#__PURE__*/normalizeComponent(
      { render: __vue_render__$2, staticRenderFns: __vue_staticRenderFns__$2 },
      __vue_inject_styles__$2,
      __vue_script__$2,
      __vue_scope_id__$2,
      __vue_is_functional_template__$2,
      __vue_module_identifier__$2,
      false,
      createInjector,
      undefined,
      undefined
    );

  class Webcam extends Module {
      constructor(options) {
          super(options);
          this.name = 'webcam';
          this.description = 'Webcam input module';
          this.component = Vue.extend(__vue_component__$2);
          this.watchers = ['active'];
          this.setup();
      }
  }
  function webcam(options) {
      return new Webcam(options);
  }

  exports.createApp = createApp;
  exports.webcam = webcam;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
