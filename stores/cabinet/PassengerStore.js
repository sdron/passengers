'use strict';

import alt from 'root/alt';
import moment from 'moment';
import update from 'react/lib/update';
import { serverDateFormat } from 'siteConfig';
import { PassengerDocumentTypes, PassengerTypes } from 'siteConstants';
import { createStore, bind } from 'alt/utils/decorators';
import { SessionActions, PassengerActions } from 'siteActions';
import { SessionStore, CountryStore } from 'siteStores';
import _ from 'lodash';
import { StringUtils } from 'utils';

const DEFAULT_FILTER_PARAMS = {
  lastname: null
};

@createStore(alt)
export default class PassengerStore {

  static displayName = 'PassengerStore';

  constructor() {
    this.state = {
      passengers: null,
      request: null,
      filter: _.clone(DEFAULT_FILTER_PARAMS)
    };

    this.exportPublicMethods({
      getAvailableDocumentTypes: this.getAvailableDocumentTypes,
      getAvailableCitizenships: this.getAvailableCitizenships,
      isDocumentExpireEnabled: this.isDocumentExpireEnabled,
      getDefaultCitizenship: this.getDefaultCitizenship,
      isMiddlenameEnabled: this.isMiddlenameEnabled,
      getType: this.getType,
      getAge: this.getAge,
      getList: this.getList,
      isLoading: this.isLoading,
      getFilterList: this.getFilterList,
      getFilter: this.getFilter
    });
  }

  isLoading() {
    return this.state.request;
  }

  getFilter(){
    return this.state.filter;
  }

  // Private methods

  _buildPassengers() {
    var passengers;
    try {
      passengers = JSON.parse(SessionStore.getMe().data.passengers);
    }
    catch (e) {
      passengers = null;
    }
    this.setState({ passengers });
  }

  // Public methods

  getAvailableDocumentTypes(citizenship) {
    var documentTypes = [];

    if (citizenship !== 'ru') {
      documentTypes.push(PassengerDocumentTypes.FOREIGN_DOCUMENT);
    }
    else {
      documentTypes.push(PassengerDocumentTypes.RUSSIAN_PASSPORT, PassengerDocumentTypes.BIRTH_CERTIFICATE, PassengerDocumentTypes.INTERNATIONAL_PASSPORT);
      documentTypes.push(PassengerDocumentTypes.OFFICER);
      documentTypes.push(PassengerDocumentTypes.MILLTARY_ID);
      documentTypes.push(PassengerDocumentTypes.SEAMAN);
      documentTypes.push(PassengerDocumentTypes.LOST_PASPORT);
      documentTypes.push(PassengerDocumentTypes.RF_RETURN);
    }

    return documentTypes;
  }

  getAvailableCitizenships() {
    return CountryStore.getAllCountryCodes();
  }

  getDefaultCitizenship() {
    return CountryStore.getDefaultCountryCode();
  }

  isMiddlenameEnabled(documentType) {
    return documentType === PassengerDocumentTypes.RUSSIAN_PASSPORT
  }

  isDocumentExpireEnabled(documentType) {
    return [
        PassengerDocumentTypes.INTERNATIONAL_PASSPORT,
        PassengerDocumentTypes.FOREIGN_DOCUMENT
      ].indexOf(documentType) >=0
  }

  getType(birthdate) {
    const age = this.getAge(birthdate);

    if (!_.isNull(age)) {
      switch (true) {
        case age <= 2:
          return PassengerTypes.INFANT;
        case age <= 12:
          return PassengerTypes.CHILD;
      }
    }

    return PassengerTypes.ADULT;
  }

  getAge(birthdate) {
    const momentDate = moment(birthdate, 'DD.MM.YYYY');
    const now = moment();

    if (momentDate.isValid()) {
      let age = now.diff(momentDate, 'year');
      if (age <= 120 && age >= 0) {
        return age;
      }
    }

    return null;
  }

  getList() {
    if (!this.state.passengers && !this.state.request) {
      this.state.request = PassengerActions.getList();
    }
    return this.state.passengers;
  }

  getFilterList() {
    if (!this.state.passengers && !this.state.request) {
      this.state.request = PassengerActions.getList();
      return [];
    }
    const { filter, passengers } = this.state;

    let data = [];
    _.forEach(passengers, function (passenger) {
      if(filter.lastname) {
        if (passenger.lastname.toLowerCase().indexOf(filter.lastname.toLowerCase()) == -1){
          return;
        }
      }
      data.push(passenger);
    });
    return data;
  }

  _sortPassengers(passengers) {
    return _.sortBy(passengers, (p) => { return StringUtils.transliterate(p['lastname'][0]).charCodeAt(0) });
  }

  // Action handlers
  @bind(PassengerActions.getListSuccess)
  handleGetListSuccess(data) {
    this.setState({ passengers: this._sortPassengers(data.passengers), request: null });
  }

  @bind(SessionActions.logOutSuccess)
  handleLogOutSuccess() {
    if (this.state.request) {
      this.state.request.cancel();
    }
    this.setState({ passengers: null, request: null });
  }

  // Action handlers
  @bind(SessionActions.setValueSuccess)
  handleSetValueSuccess() {
    this.waitFor(SessionStore);
    this._buildPassengers();
  }

  // Action handlers
  @bind(PassengerActions.removePassengerSuccess)
  handleRemovePassengerSuccess(passengerIndex) {
    const passengers = update(this.state.passengers || [], {$splice: [[ passengerIndex, 1 ]] });
    this.setState({ passengers: passengers });
  }

  @bind(PassengerActions.filter)
  handleFilter([ fieldName, value ]) {
    this.setState({ filter : {[fieldName]: value} });
  }

  @bind(PassengerActions.clearFilter)
  handleClearFilter() {
    this.setState({ filter : _.clone(DEFAULT_FILTER_PARAMS) });
  }

};
