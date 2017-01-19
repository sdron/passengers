'use strict';

import React from 'react';
import moment from 'moment';
import ReactMixin, { storeMixin } from 'mixins';
import { serverDateFormat } from 'siteConfig';
import { AviaPassengerGender } from 'siteConstants';
import { PassengerTypes } from 'siteConstants';
import { PassengerStore, CountryStore } from 'siteStores';
import { Component, Flag, Icon, ButtonGroup, Button, FormInput, InfiniteScroll } from 'ui';
import { PassengerActions } from 'siteActions';
import { PassengerDocumentTypes } from 'siteConstants';
import Well from 'site/components/cabinet/Well/Well';
import Edit from '../Edit/Edit';
import Loading from 'site/components/cabinet/Loading/Loading';
import './List.scss';

const adultGenderIcons = {
  [AviaPassengerGender.MALE]: 'male',
  [AviaPassengerGender.FEMALE]: 'female'
};

const childGenderIcons = {
  [AviaPassengerGender.MALE]: 'child_male',
  [AviaPassengerGender.FEMALE]: 'child_female'
};

const infantGenderIcons = {
  [AviaPassengerGender.MALE]: 'infant',
  [AviaPassengerGender.FEMALE]: 'infant'
};

const genderIcons = {
  [ PassengerTypes.ADULT ]: adultGenderIcons,
  [ PassengerTypes.CHILD ]: childGenderIcons,
  [ PassengerTypes.INFANT ]: infantGenderIcons
};

const RESULTS_LIMIT = 10;

@ReactMixin.decorate(storeMixin)
export default class PassengersList extends Component {

  static classes = {
    ns: 'PassengersList',
    PassengersList: { ns: false },
    Passenger: {},
    Passenger__Title: {},
    Passenger__Content: {},
    Passenger__Row: {},
    Passenger__Column: { modifiers: ['name'] },
    Passenger__Controls: {},
    Passenger__Separator: {},
    Passenger__AddBtn: {},
    Filter:{}
  };

  static propTypes = {
    withAddBtn: React.PropTypes.bool
  };

  static defaultProps = {
    withAddBtn: false
  };

  constructor() {
    super();
    this.state = {
      showEditModal: false,
      editingPassengerIndex: null,
      showAll: false
    };
  }

  getStores() {
    return [ PassengerStore ];
  }

  getStateFromStores() {
    return {
      passengers : PassengerStore.getFilterList(),
      isLoading: PassengerStore.isLoading()
    };
  }

  handleRemovePassenger(passengerIndex, passengerId) {
    PassengerActions.removePassenger(passengerIndex, passengerId);
  }

  handleAddInForm(passengerIndex) {
    this.props.onSelect(passengerIndex);
  }

  handleEditPassenger(passengerIndex) {
    this.setState({ showEditModal: true, editingPassengerIndex: passengerIndex }) ;
  }

  handleEditModalClose() {
    this.setState({ showEditModal: false }) ;
  }

  handleFilter(fieldName, ev) {
    let value = ev.target.value;
    PassengerActions.filter(fieldName, value);
  }

  loadMore() {
    this.setState({ showAll: true });
  }

  hasMore() {
    return !this.state.showAll && this.state.passengers && this.state.passengers.length > RESULTS_LIMIT;
  }

  renderPassengerIcon(passenger) {
    const type = PassengerStore.getType(passenger.birthdate);

    return (
      <Icon name={genderIcons[type][passenger.gender]} spaceRight />
    );
  }

  renderPassengerTitle(passenger) {
    return (
      <div className={this.cx('Passenger__Title')}>
        { this.renderPassengerIcon(passenger) }
        { passenger.lastname } { passenger.firstname } {passenger.middlename}
      </div>
    );
  }

  renderBirthdate(passenger) {
    const age = PassengerStore.getAge(passenger.birthdate);
    const momentBirthdate = moment(passenger.birthdate, 'DD.MM.YYYY');
    const birthdateTitle = momentBirthdate.isValid() ? momentBirthdate.format('L') : '—';

    return (
      <div className={this.cx('Passenger__Column', { name: 'birthdate' })}>
        <Icon name='calendar' spaceRight />
        { birthdateTitle }
        { !!age &&
        <span>
            {' '}
          ({ this.ngettext('%% год', '%% года', '%% лет', age) })
          </span>
        }
      </div>
    );
  }

  renderCitizenship(passenger) {
    const country = CountryStore.getCountry(passenger.citizenship);

    return (
      <div className={this.cx('Passenger__Column', { name: 'citizenship' })}>
        <Flag name={country.code} spaceRight />
        { country.name }
      </div>
    );
  }

  renderDocument(passenger) {
    const { document_expire, document_number, document_type } = passenger;
    const show = {
      expire: !!document_expire && PassengerStore.isDocumentExpireEnabled(document_type),
      number: !!document_number
    };

    return (
      <div className={this.cx('Passenger__Column', { name: 'document_type' })}>
        <Icon name='file' spaceRight />
        {  PassengerDocumentTypes.translate(document_type) }
        { (show.expire || show.number) &&
        <span>
            {' '}
          (
          { show.number && `№ ${document_number}` }
          { show.expire && show.number && ', ' }
          { show.expire && `${this.gettext('Срок действия')} ${document_expire}` }
          )
          </span>
        }
      </div>
    );
  }

  renderPlaceBird(passenger) {
    if(_.isEmpty(passenger['place_of_birth'])){
      return null;
    }
    return (
      <div className={this.cx('Passenger__Column', { name: 'place_of_birth' })}>
        {this.gettext('Место рождения')}: { passenger['place_of_birth'] }
      </div>
    );
  }

  renderPhone(passenger) {
    if(_.isEmpty(passenger['phone'])){
      return null;
    }
    return (
      <div className={this.cx('Passenger__Column', { name: 'phone' })}>
        {this.gettext('Телефон')}: { passenger['phone'] }
      </div>
    );
  }

  renderEmail(passenger) {
    if(_.isEmpty(passenger['email'])){
      return null;
    }
    return (
      <div className={this.cx('Passenger__Column', { name: 'email' })}>
        {this.gettext('Email')}: { passenger['email'] }
      </div>
    );
  }

  renderCard(passenger) {
    if(_.isEmpty(passenger['bonus_card'])){
      return null;
    }
    return (
      <div className={this.cx('Passenger__Column', { name: 'card' })}>
        Карта: { passenger['bonus_card'] }
      </div>
    );
  }

  renderControls(passengerIndex, passenger) {
    return (
      <div className={this.cx('Passenger__Controls')}>
        <ButtonGroup>
          <Button size='sm' onClick={this.handleEditPassenger.bind(this, passengerIndex)}>
            <Icon name={'pencil'} />
          </Button>

          <Button size='sm' onClick={this.handleRemovePassenger.bind(this, passengerIndex, passenger.id)}>
            <Icon name={'cross'} />
          </Button>
        </ButtonGroup>
      </div>
    );
  }

  renderAddBtn(passengerIndex) {
    return (
      <div className={this.cx('Passenger__AddBtn')}>
        <Button size='sm' onClick={this.handleAddInForm.bind(this, passengerIndex)}>
          <Icon name='plus' />
        </Button>
      </div>
    )
  }

  renderPassenger(passenger, index) {
    const { withAddBtn } = this.props;
    return (
      <Well
        key={index}
        className={this.cx('Passenger')} >

        <div className={this.cx('Passenger__Content')}>

          {withAddBtn && this.renderAddBtn(index)}

          <div className={this.cx('Passenger__Fields')}>
            { this.renderPassengerTitle(passenger) }

            <div className={this.cx('Passenger__Row')}>
              { this.renderBirthdate(passenger) }
              { this.renderCitizenship(passenger) }
              { this.renderDocument(passenger) }
              { this.renderPlaceBird(passenger) }
              { this.renderPhone(passenger) }
              { this.renderEmail(passenger) }
              { this.renderCard(passenger) }
            </div>
          </div>

          { this.renderControls(index, passenger) }
        </div>
      </Well>
    );
  }

  renderFilter() {
    return <div className={this.cx('Filter')}>
      <FormInput
        placeholder={this.gettext('Фамилия')}
        onChange={this.handleFilter.bind(this, 'lastname')} />
    </div>
  }

  render() {
    const { passengers, showEditModal, editingPassengerIndex, isLoading, showAll } = this.state;

    if (isLoading) {
      return (
        <Loading>
          { this.gettext('Загрузка') }
        </Loading>
      );
    }

    if(!passengers) {
      return (
        <div className={this.cx('PassengersList')}>
          {this.renderFilter()}
          { this.gettext('Нет данных') }
        </div>
      )
    }

    const chunk = showAll ? passengers : passengers.slice(0, RESULTS_LIMIT);

    return (
      <div className={this.cx('PassengersList')}>
        {this.renderFilter()}

        <Edit
          open={showEditModal}
          passengerIndex={editingPassengerIndex}
          onClose={::this.handleEditModalClose} />

        <InfiniteScroll loadMore={::this.loadMore} hasMore={this.hasMore()} threshold={0}>
          { chunk.map(::this.renderPassenger) }
        </InfiniteScroll>
      </div>
    );
  }

};
