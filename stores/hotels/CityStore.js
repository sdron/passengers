'use strict';

import update from 'react/lib/update';
import alt from 'root/alt';
import { HotelsCityActions } from 'siteActions';
import { createStore, bind } from 'alt/utils/decorators';
import Promise from 'bluebird';


@createStore(alt)
export default class HotelsCityStore {

  static displayName = 'HotelsCityStore';

  constructor() {
    this.state = {
      entities: {}
    };

    this.exportPublicMethods({
      searchCitiesPromise: this.searchCitiesPromise
    });
  }

  searchCitiesPromise(term) {
    if ( ! term ) {
      return Promise.resolve([]);
    }

    const returnDataAsPromise = ()=> {
      let data = this.state.entities[term];
      if (data._error) {
        return Promise.reject(data._error);
      }
      return Promise.resolve(data);
    };

    if (this.state.entities[term]) {
      return returnDataAsPromise();
    }
    else {
      return HotelsCityActions.searchCity(term).then(() => returnDataAsPromise(term));
    }
  }

  @bind(HotelsCityActions.searchCitySuccess)
  handleSearchCitySuccess([ term, data ]) {
    this.setState({
      entities: update(this.state.entities, { [term]:  {$set: data} })
    });
  }

  @bind(HotelsCityActions.searchCityFailure)
  handleSearchStationsFailure([ term, error ]) {
    this.setState({
      entities: update(this.state.entities, { [term]:  { _error: error } })
    });
  }
};
