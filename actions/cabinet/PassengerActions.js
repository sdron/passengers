'use strict';

import { APIUtils } from 'utils';
import { createActions } from 'alt/utils/decorators';
import alt from 'root/alt';
import update from 'react/lib/update';
import { PassengerStore } from 'siteStores';
import { SessionActions } from 'siteActions';
import { PassengerDocumentTypes, AviaPassengerGender } from 'siteConstants';
import moment from 'moment';

import Promise from 'bluebird';

const ServerDateFormat = 'DD.MM.YYYY HH:mm';

@createActions(alt)
export default class PassengerActions {


  constructor() {
    this.generateActions(
      'getListSuccess', 'getListFailure',
      'createPassengerSuccess', 'createPassengerFailure',
      'removePassengerSuccess', 'removePassengerFailure',
      'editPassengerSuccess', 'editPassengerFailure',
      'filter', 'clearFilter'
    );
  }

  getList() {
    return APIUtils.get({ urlPath: '/agent/passengers'})
      .tap((data)=> {
        data['passengers'] = [];
        // преобразуем в нужный формат
        for (let item of data.items) {

          if(!PassengerDocumentTypes.isValid(item['doc_type'])) {
            continue;
          }

          if(!item['docnum']) {
            item['docnum'] = '';
          }

          let gender = AviaPassengerGender.shortToFull(item['gender']);

          let docExpare = moment(item['doc_expire_date'], ServerDateFormat);
          if(!(docExpare.isValid() && docExpare.isAfter('2000-01-01'))) {
            docExpare = false;
          }

          let passenger = {
            birthdate: moment(item['birth_day'], ServerDateFormat).format('DD.MM.YYYY'), // "11.11.1987"
            place_of_birth: item['place_of_birth'],
            citizenship: item['country_id'] ? item['country_id'].toLowerCase() : 'ru',
            document_expire: docExpare ? docExpare.format('DD.MM.YYYY'): '',
            document_number: PassengerDocumentTypes.formatDocNumber(item['doc_type'], item['docnum']),
            document_type: item['doc_type'],
            firstname: item['first_name'],
            gender: gender,
            lastname: item['last_name'],
            middlename: item['patronymic'],
            id : item['id'],
            email: item['email'],
            phone: item['phone'],
            bonus_card: item['bonus_card']
          };
          data['passengers'].push(passenger);
        }
        this.actions.getListSuccess(data);
      })
      .catch((error)=> {
        this.actions.getListFailure(error);
        throw error;
      });
  }

  /**
   * Преборазовать для сохранения в бек
   * @param data
   * @returns {{last_name: *, first_name: *, birth_day: *, patronymic: *, docnum: *, doc_expire_date: string, gender: *, doc_type: *}}
     */
  getDataToSave(data) {
    const expDate = _.isUndefined(data['document_expire']) ? '' :  moment(data['document_expire'], 'DD.MM.YYYY').format('DD-MM-YYYY');
    return {
      last_name: data['lastname'],
      first_name: data['firstname'],
      birth_day: moment(data['birthdate'], 'DD.MM.YYYY').format('DD-MM-YYYY'),
      place_of_birth: data['place_of_birth'],
      patronymic: data['middlename'],
      docnum: data['document_number'].replace(/\s+/g, ''),
      doc_expire_date: expDate,
      gender: AviaPassengerGender.fullToShort(data['gender']),
      doc_type: data['document_type'],
      email: data['email'],
      phone: data['phone'],
      bonus_card: data['bonus_card'],
      country_id: data['citizenship']
    }
  }

  createPassenger(passenger, service = 'avia') {

    let params = {};

    if (service == 'railway'){
      params = {
        first_name: passenger['firstname'],
        last_name:passenger['lastname'],
        patronymic: passenger['middlename'],
        gender: passenger['gender'],
        doc_type: passenger['document_type'],
        docnum : passenger['document_number'],
        country_id : passenger['citizenship'],
        birth_day: moment(passenger['birthdate'], 'DD.MM.YYYY').format('DD-MM-YYYY'),
        doc_expire_date: passenger['document_expire'] ? moment(passenger['document_expire'], 'DD.MM.YYYY').format('DD-MM-YYYY') : null,
        service: service,
        email: passenger['email'],
        phone: passenger['phone'],
        bonus_card: passenger['bonus_card']
      };
    }
    else{
      params = {
        first_name: passenger['firstName'],
        last_name:passenger['lastName'],
        patronymic: passenger['middleName'],
        gender: passenger['gender'],
        doc_type: passenger['documentType'],
        docnum : passenger['documentNumber'],
        country_id : passenger['citizenship'],
        birth_day: moment(passenger['birthDate'], 'DD.MM.YYYY').format('DD-MM-YYYY'),
        doc_expire_date: passenger['documentValidThru'] ? moment(passenger['documentValidThru'], 'DD.MM.YYYY').format('DD-MM-YYYY') : null,
        service: service,
        email: passenger['email'],
        phone: passenger['phone'],
        bonus_card: passenger['bonus_card']
      };

      if (!_.isUndefined(passenger['birthPlace'])) {
        params['place_of_birth'] = passenger['birthPlace'];
      }
    }

    return APIUtils.post({ data: params , urlPath: '/agent/passengers'})
      .tap((data)=> {
        this.actions.getList();
        this.actions.createPassengerSuccess(data);
      })
      .catch((error)=> {
        this.actions.createPassengerFailure(error);
        throw error;
      });
  }

  addPassenger(data) {
    const params = this.actions.getDataToSave(data);
    return APIUtils.post({ data: params , urlPath: '/agent/passengers'})
      .tap((data)=> {
        this.actions.getList();
        this.actions.createPassengerSuccess(data);
      })
      .catch((error)=> {
        this.actions.createPassengerFailure(error);
        throw error;
      });
  }

  removePassenger(passengerIndex, passengerId) {
    return APIUtils.del({urlPath: `/agent/passengers/${passengerId}`})
      .tap((data)=> {
        this.actions.removePassengerSuccess(passengerIndex);
      })
      .catch((error)=> {
        this.actions.removePassengerFailure(error);
        throw error;
      });
  }

  updatePassenger(passengerId, data) {
    const params = this.actions.getDataToSave(data);

    return APIUtils.put({ data: params , urlPath: `/agent/passengers/${passengerId}`})
      .tap((data)=> {
        this.actions.getList();
        this.actions.editPassengerSuccess(data);
      })
      .catch((error)=> {
        this.actions.editPassengerFailure(error);
        throw error;
      });
  }

};
