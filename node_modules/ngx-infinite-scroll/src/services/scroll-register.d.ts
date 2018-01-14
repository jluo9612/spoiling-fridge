import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/sampleTime';
import { Observable } from 'rxjs/Observable';
import * as Models from '../models';
export declare function createScroller(config: Models.IScroller): Observable<Models.IInfiniteScrollAction>;
export declare function attachScrollEvent(options: Models.IScrollRegisterConfig): Observable<{}>;
export declare function toInfiniteScrollParams(lastScrollPosition: number, stats: Models.IPositionStats, distance: Models.IScrollerDistance): Models.IScrollParams;
export declare const InfiniteScrollActions: {
    DOWN: string;
    UP: string;
};
export declare function toInfiniteScrollAction(response: Models.IScrollParams): Models.IInfiniteScrollAction;
