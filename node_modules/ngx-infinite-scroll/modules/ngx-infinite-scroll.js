import { Directive, ElementRef, EventEmitter, Input, NgModule, NgZone, Output } from '@angular/core';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/sampleTime';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

/**
 * @param {?} selector
 * @param {?} scrollWindow
 * @param {?} defaultElement
 * @param {?} fromRoot
 * @return {?}
 */
function resolveContainerElement(selector, scrollWindow, defaultElement, fromRoot) {
    const /** @type {?} */ hasWindow = window && !!window.document && window.document.documentElement;
    let /** @type {?} */ container = hasWindow && scrollWindow ? window : defaultElement;
    if (selector) {
        const /** @type {?} */ containerIsString = selector && hasWindow && typeof selector === 'string';
        container = containerIsString
            ? findElement(selector, defaultElement.nativeElement, fromRoot)
            : selector;
        if (!container) {
            throw new Error('ngx-infinite-scroll {resolveContainerElement()}: selector for');
        }
    }
    return container;
}
/**
 * @param {?} selector
 * @param {?} customRoot
 * @param {?} fromRoot
 * @return {?}
 */
function findElement(selector, customRoot, fromRoot) {
    const /** @type {?} */ rootEl = fromRoot ? window.document : customRoot;
    return rootEl.querySelector(selector);
}
/**
 * @param {?} prop
 * @return {?}
 */
function inputPropChanged(prop) {
    return prop && !prop.firstChange;
}
/**
 * @return {?}
 */
function hasWindowDefined() {
    return typeof window !== 'undefined';
}

class AxisResolver {
    /**
     * @param {?=} vertical
     */
    constructor(vertical = true) {
        this.vertical = vertical;
    }
    /**
     * @return {?}
     */
    clientHeightKey() { return this.vertical ? 'clientHeight' : 'clientWidth'; }
    /**
     * @return {?}
     */
    offsetHeightKey() { return this.vertical ? 'offsetHeight' : 'offsetWidth'; }
    /**
     * @return {?}
     */
    scrollHeightKey() { return this.vertical ? 'scrollHeight' : 'scrollWidth'; }
    /**
     * @return {?}
     */
    pageYOffsetKey() { return this.vertical ? 'pageYOffset' : 'pageXOffset'; }
    /**
     * @return {?}
     */
    offsetTopKey() { return this.vertical ? 'offsetTop' : 'offsetLeft'; }
    /**
     * @return {?}
     */
    scrollTopKey() { return this.vertical ? 'scrollTop' : 'scrollLeft'; }
    /**
     * @return {?}
     */
    topKey() { return this.vertical ? 'top' : 'left'; }
}

/**
 * @param {?} alwaysCallback
 * @param {?} shouldFireScrollEvent
 * @param {?} isTriggeredCurrentTotal
 * @return {?}
 */
function shouldTriggerEvents(alwaysCallback, shouldFireScrollEvent, isTriggeredCurrentTotal) {
    return (alwaysCallback || shouldFireScrollEvent) && !isTriggeredCurrentTotal;
}

/**
 * @param {?} __0
 * @return {?}
 */
function createResolver({ windowElement, axis }) {
    return createResolverWithContainer({ axis, isWindow: isElementWindow(windowElement) }, windowElement);
}
/**
 * @param {?} resolver
 * @param {?} windowElement
 * @return {?}
 */
function createResolverWithContainer(resolver, windowElement) {
    const /** @type {?} */ container = resolver.isWindow || (windowElement && !windowElement.nativeElement)
        ? windowElement
        : windowElement.nativeElement;
    return Object.assign({}, resolver, { container });
}
/**
 * @param {?} windowElement
 * @return {?}
 */
function isElementWindow(windowElement) {
    const /** @type {?} */ isWindow = ['Window', 'global'].some((obj) => Object.prototype.toString.call(windowElement).includes(obj));
    return isWindow;
}
/**
 * @param {?} isContainerWindow
 * @param {?} windowElement
 * @return {?}
 */
function getDocumentElement(isContainerWindow, windowElement) {
    return isContainerWindow ? windowElement.document.documentElement : null;
}
/**
 * @param {?} element
 * @param {?} resolver
 * @return {?}
 */
function calculatePoints(element, resolver) {
    const /** @type {?} */ height = extractHeightForElement(resolver);
    return resolver.isWindow
        ? calculatePointsForWindow(height, element, resolver)
        : calculatePointsForElement(height, element, resolver);
}
/**
 * @param {?} height
 * @param {?} element
 * @param {?} resolver
 * @return {?}
 */
function calculatePointsForWindow(height, element, resolver) {
    const { axis, container, isWindow } = resolver;
    const { offsetHeightKey, clientHeightKey } = extractHeightPropKeys(axis);
    // scrolled until now / current y point
    const /** @type {?} */ scrolled = height +
        getElementPageYOffset(getDocumentElement(isWindow, container), axis, isWindow);
    // total height / most bottom y point
    const /** @type {?} */ nativeElementHeight = getElementHeight(element.nativeElement, isWindow, offsetHeightKey, clientHeightKey);
    const /** @type {?} */ totalToScroll = getElementOffsetTop(element.nativeElement, axis, isWindow) +
        nativeElementHeight;
    return { height, scrolled, totalToScroll };
}
/**
 * @param {?} height
 * @param {?} element
 * @param {?} resolver
 * @return {?}
 */
function calculatePointsForElement(height, element, resolver) {
    const { axis, container } = resolver;
    // perhaps use container.offsetTop instead of 'scrollTop'
    const /** @type {?} */ scrolled = container[axis.scrollTopKey()];
    const /** @type {?} */ totalToScroll = container[axis.scrollHeightKey()];
    return { height, scrolled, totalToScroll };
}
/**
 * @param {?} axis
 * @return {?}
 */
function extractHeightPropKeys(axis) {
    return {
        offsetHeightKey: axis.offsetHeightKey(),
        clientHeightKey: axis.clientHeightKey()
    };
}
/**
 * @param {?} __0
 * @return {?}
 */
function extractHeightForElement({ container, isWindow, axis }) {
    const { offsetHeightKey, clientHeightKey } = extractHeightPropKeys(axis);
    return getElementHeight(container, isWindow, offsetHeightKey, clientHeightKey);
}
/**
 * @param {?} elem
 * @param {?} isWindow
 * @param {?} offsetHeightKey
 * @param {?} clientHeightKey
 * @return {?}
 */
function getElementHeight(elem, isWindow, offsetHeightKey, clientHeightKey) {
    if (isNaN(elem[offsetHeightKey])) {
        return getDocumentElement(isWindow, elem)[clientHeightKey];
    }
    else {
        return elem[offsetHeightKey];
    }
}
/**
 * @param {?} elem
 * @param {?} axis
 * @param {?} isWindow
 * @return {?}
 */
function getElementOffsetTop(elem, axis, isWindow) {
    const /** @type {?} */ topKey = axis.topKey();
    // elem = elem.nativeElement;
    if (!elem.getBoundingClientRect) {
        // || elem.css('none')) {
        return;
    }
    return (elem.getBoundingClientRect()[topKey] +
        getElementPageYOffset(elem, axis, isWindow));
}
/**
 * @param {?} elem
 * @param {?} axis
 * @param {?} isWindow
 * @return {?}
 */
function getElementPageYOffset(elem, axis, isWindow) {
    const /** @type {?} */ pageYOffset = axis.pageYOffsetKey();
    const /** @type {?} */ scrollTop = axis.scrollTopKey();
    const /** @type {?} */ offsetTop = axis.offsetTopKey();
    if (isNaN(window[pageYOffset])) {
        return getDocumentElement(isWindow, elem)[scrollTop];
    }
    else if (elem.ownerDocument) {
        return elem.ownerDocument.defaultView[pageYOffset];
    }
    else {
        return elem[offsetTop];
    }
}

/**
 * @param {?} container
 * @param {?} distance
 * @param {?} scrollingDown
 * @return {?}
 */
function shouldFireScrollEvent(container, distance, scrollingDown) {
    let /** @type {?} */ remaining;
    let /** @type {?} */ containerBreakpoint;
    const /** @type {?} */ scrolledUntilNow = container.height + container.scrolled;
    if (scrollingDown) {
        remaining = (container.totalToScroll - scrolledUntilNow) / container.totalToScroll;
        containerBreakpoint = distance.down / 10;
    }
    else {
        remaining = scrolledUntilNow / container.totalToScroll;
        containerBreakpoint = distance.up / 10;
    }
    const /** @type {?} */ shouldFireEvent = remaining <= containerBreakpoint;
    return shouldFireEvent;
}
/**
 * @param {?} lastScrollPosition
 * @param {?} container
 * @return {?}
 */
function isScrollingDownwards(lastScrollPosition, container) {
    return lastScrollPosition < container.scrolled;
}
/**
 * @param {?} lastScrollPosition
 * @param {?} container
 * @param {?} distance
 * @return {?}
 */
function getScrollStats(lastScrollPosition, container, distance) {
    const /** @type {?} */ scrollDown = isScrollingDownwards(lastScrollPosition, container);
    return {
        fire: shouldFireScrollEvent(container, distance, scrollDown),
        scrollDown
    };
}
/**
 * @param {?} position
 * @param {?} scrollState
 * @return {?}
 */
function updateScrollPosition(position, scrollState) {
    return (scrollState.lastScrollPosition = position);
}
/**
 * @param {?} totalToScroll
 * @param {?} scrollState
 * @return {?}
 */
function updateTotalToScroll(totalToScroll, scrollState) {
    if (scrollState.lastTotalToScroll !== totalToScroll) {
        scrollState.lastTotalToScroll = scrollState.totalToScroll;
        scrollState.totalToScroll = totalToScroll;
    }
}
/**
 * @param {?} scrollState
 * @return {?}
 */

/**
 * @param {?} scroll
 * @param {?} scrollState
 * @param {?} triggered
 * @param {?} isScrollingDown
 * @return {?}
 */
function updateTriggeredFlag(scroll, scrollState, triggered, isScrollingDown) {
    if (isScrollingDown) {
        scrollState.triggered.down = scroll;
    }
    else {
        scrollState.triggered.up = scroll;
    }
}
/**
 * @param {?} totalToScroll
 * @param {?} scrollState
 * @param {?} isScrollingDown
 * @return {?}
 */
function isTriggeredScroll(totalToScroll, scrollState, isScrollingDown) {
    return isScrollingDown
        ? scrollState.triggered.down === totalToScroll
        : scrollState.triggered.up === totalToScroll;
}
/**
 * @param {?} scrollState
 * @param {?} scrolledUntilNow
 * @param {?} totalToScroll
 * @return {?}
 */
function updateScrollState(scrollState, scrolledUntilNow, totalToScroll) {
    updateScrollPosition(scrolledUntilNow, scrollState);
    updateTotalToScroll(totalToScroll, scrollState);
    // const isSameTotal = isSameTotalToScroll(scrollState);
    // if (!isSameTotal) {
    //   updateTriggeredFlag(scrollState, false, isScrollingDown);
    // }
}

/**
 * @param {?} config
 * @return {?}
 */
function createScroller(config) {
    const { scrollContainer, scrollWindow, element, fromRoot } = config;
    const /** @type {?} */ resolver = createResolver({
        axis: new AxisResolver(!config.horizontal),
        windowElement: resolveContainerElement(scrollContainer, scrollWindow, element, fromRoot)
    });
    const { totalToScroll: startWithTotal } = calculatePoints(element, resolver);
    const /** @type {?} */ scrollState = {
        lastScrollPosition: 0,
        lastTotalToScroll: 0,
        totalToScroll: startWithTotal,
        triggered: {
            down: 0,
            up: 0
        }
    };
    const /** @type {?} */ options = {
        container: resolver.container,
        throttle: config.throttle
    };
    const /** @type {?} */ distance = {
        up: config.upDistance,
        down: config.downDistance
    };
    return attachScrollEvent(options)
        .mergeMap((ev) => of(calculatePoints(element, resolver)))
        .map((positionStats) => toInfiniteScrollParams(scrollState.lastScrollPosition, positionStats, distance))
        .do(({ stats, scrollDown }) => updateScrollState(scrollState, stats.scrolled, stats.totalToScroll))
        .filter(({ fire, scrollDown, stats: { totalToScroll } }) => shouldTriggerEvents(fire, config.alwaysCallback, isTriggeredScroll(totalToScroll, scrollState, scrollDown)))
        .do(({ scrollDown, stats: { totalToScroll } }) => {
        updateTriggeredFlag(totalToScroll, scrollState, true, scrollDown);
    })
        .map(toInfiniteScrollAction);
}
/**
 * @param {?} options
 * @return {?}
 */
function attachScrollEvent(options) {
    return Observable
        .fromEvent(options.container, 'scroll')
        .sampleTime(options.throttle);
}
/**
 * @param {?} lastScrollPosition
 * @param {?} stats
 * @param {?} distance
 * @return {?}
 */
function toInfiniteScrollParams(lastScrollPosition, stats, distance) {
    const { scrollDown, fire } = getScrollStats(lastScrollPosition, stats, distance);
    return {
        scrollDown,
        fire,
        stats
    };
}
const InfiniteScrollActions = {
    DOWN: '[NGX_ISE] DOWN',
    UP: '[NGX_ISE] UP'
};
/**
 * @param {?} response
 * @return {?}
 */
function toInfiniteScrollAction(response) {
    const { scrollDown, stats: { scrolled: currentScrollPosition } } = response;
    return {
        type: scrollDown ? InfiniteScrollActions.DOWN : InfiniteScrollActions.UP,
        payload: {
            currentScrollPosition
        }
    };
}

class InfiniteScrollDirective {
    /**
     * @param {?} element
     * @param {?} zone
     */
    constructor(element, zone) {
        this.element = element;
        this.zone = zone;
        this.scrolled = new EventEmitter();
        this.scrolledUp = new EventEmitter();
        this.infiniteScrollDistance = 2;
        this.infiniteScrollUpDistance = 1.5;
        this.infiniteScrollThrottle = 300;
        this.infiniteScrollDisabled = false;
        this.infiniteScrollContainer = null;
        this.scrollWindow = true;
        this.immediateCheck = false;
        this.horizontal = false;
        this.alwaysCallback = false;
        this.fromRoot = false;
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        if (!this.infiniteScrollDisabled) {
            this.setup();
        }
    }
    /**
     * @param {?} __0
     * @return {?}
     */
    ngOnChanges({ infiniteScrollContainer, infiniteScrollDisabled, infiniteScrollDistance }) {
        const /** @type {?} */ containerChanged = inputPropChanged(infiniteScrollContainer);
        const /** @type {?} */ disabledChanged = inputPropChanged(infiniteScrollDisabled);
        const /** @type {?} */ distanceChanged = inputPropChanged(infiniteScrollDistance);
        const /** @type {?} */ shouldSetup = (!disabledChanged && !this.infiniteScrollDisabled) ||
            (disabledChanged && !infiniteScrollDisabled.currentValue) || distanceChanged;
        if (containerChanged || disabledChanged || distanceChanged) {
            this.destroyScroller();
            if (shouldSetup) {
                this.setup();
            }
        }
    }
    /**
     * @return {?}
     */
    setup() {
        if (hasWindowDefined()) {
            this.zone.runOutsideAngular(() => {
                this.disposeScroller = createScroller({
                    fromRoot: this.fromRoot,
                    alwaysCallback: this.alwaysCallback,
                    disable: this.infiniteScrollDisabled,
                    downDistance: this.infiniteScrollDistance,
                    element: this.element,
                    horizontal: this.horizontal,
                    scrollContainer: this.infiniteScrollContainer,
                    scrollWindow: this.scrollWindow,
                    throttle: this.infiniteScrollThrottle,
                    upDistance: this.infiniteScrollUpDistance
                }).subscribe((payload) => this.zone.run(() => this.handleOnScroll(payload)));
            });
        }
    }
    /**
     * @param {?} __0
     * @return {?}
     */
    handleOnScroll({ type, payload }) {
        switch (type) {
            case InfiniteScrollActions.DOWN:
                return this.scrolled.emit(payload);
            case InfiniteScrollActions.UP:
                return this.scrolledUp.emit(payload);
            default:
                return;
        }
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this.destroyScroller();
    }
    /**
     * @return {?}
     */
    destroyScroller() {
        if (this.disposeScroller) {
            this.disposeScroller.unsubscribe();
        }
    }
}
InfiniteScrollDirective.decorators = [
    { type: Directive, args: [{
                selector: '[infiniteScroll], [infinite-scroll], [data-infinite-scroll]'
            },] },
];
/**
 * @nocollapse
 */
InfiniteScrollDirective.ctorParameters = () => [
    { type: ElementRef, },
    { type: NgZone, },
];
InfiniteScrollDirective.propDecorators = {
    'scrolled': [{ type: Output },],
    'scrolledUp': [{ type: Output },],
    'infiniteScrollDistance': [{ type: Input },],
    'infiniteScrollUpDistance': [{ type: Input },],
    'infiniteScrollThrottle': [{ type: Input },],
    'infiniteScrollDisabled': [{ type: Input },],
    'infiniteScrollContainer': [{ type: Input },],
    'scrollWindow': [{ type: Input },],
    'immediateCheck': [{ type: Input },],
    'horizontal': [{ type: Input },],
    'alwaysCallback': [{ type: Input },],
    'fromRoot': [{ type: Input },],
};

class InfiniteScrollModule {
}
InfiniteScrollModule.decorators = [
    { type: NgModule, args: [{
                declarations: [InfiniteScrollDirective],
                exports: [InfiniteScrollDirective],
                imports: [],
                providers: []
            },] },
];
/**
 * @nocollapse
 */
InfiniteScrollModule.ctorParameters = () => [];

/**
 * Angular library starter.
 * Build an Angular library compatible with AoT compilation & Tree shaking.
 * Written by Roberto Simonetti.
 * MIT license.
 * https://github.com/robisim74/angular-library-starter
 */
/**
 * Entry point for all public APIs of the package.
 */

/**
 * Generated bundle index. Do not edit.
 */

export { InfiniteScrollDirective, InfiniteScrollModule };
//# sourceMappingURL=ngx-infinite-scroll.js.map
