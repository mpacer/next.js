import { interval } from "rxjs/observable/interval";
import { of } from "rxjs/observable/of"
import { takeUntil, map, mergeMap, catchError } from "rxjs/operators";
import { combineEpics, ofType } from "redux-observable";
import ajax from "universal-rx-request"; // because standard AjaxObservable only works in browser

import * as api from "./api";
import * as actions from "./actions";
import * as types from "./actionTypes";

export const fetchUserEpic = (action$, store) =>
  action$.pipe(
    ofType(types.START_FETCHING_CHARACTERS),
    mergeMap(action => {
      return interval(3000).pipe(
        mergeMap(x =>
          of(
            actions.fetchCharacter({
              isServer: store.getState().isServer
            })
          )
        ),
        takeUntil(action$.ofType(types.STOP_FETCHING_CHARACTERS))
      );
    })
  );

export const fetchCharacterEpic = (action$, store) =>
  action$.pipe(
    ofType(types.FETCH_CHARACTER),
    mergeMap(action =>
      ajax({
        url: `https://swapi.co/api/people/${store.getState().nextCharacterId}`
      }).pipe(
        mergeMap(response =>
          of(
            actions.fetchCharacterSuccess(
              response.body,
              store.getState().isServer
            )
          )
        ),
        catchError(error =>
          of(
            actions.fetchCharacterFailure(
              error.response.body,
              store.getState().isServer
            )
          )
        )
      )
    )
  );
