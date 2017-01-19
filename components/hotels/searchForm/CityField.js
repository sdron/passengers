'use strict';

import React from 'react';
import ReactMixin, { connectValidatorMixin } from 'mixins';

// Store
import { HotelsCityStore } from 'siteStores';

// Base Component
import SuggestField from 'site/components/_common/SearchForm/SuggestField/SearchFormSuggestField';

// Classes
const classes = {
  stationField: {
    name: 'HotelsSearchCityField'
  }
};

@ReactMixin.decorate(connectValidatorMixin)
export default class CityField extends SuggestField {

  constructor(props) {
    super(props);
    this.className = this.cx(classes.stationField);
  }

  validationRule(value) {
    if ( ! value) {
      throw new Error(this.gettext('Обязательное поле!'));
    }
  }

  renderSuggestion(suggestion) {
    return (
      <span>{suggestion.value}, {suggestion.country}</span>
    );
  }

  getSuggestionValue(suggestion) {
    return suggestion.value + ', '+suggestion.country;
  }

  searchSuggestions(term, callback) {
    HotelsCityStore.searchCitiesPromise(term)
      .tap((stations)=> callback(term, stations) );
  }

};
