import React, {Component} from 'react';
import {StyleSheet, ScrollView, TouchableOpacity, Text} from 'react-native';
import {Button} from 'native-base';
import Vegetable from './Vegetable';
import {getAllKeys, _retrieveData, _storeData} from '../js/dataAcess';
import {LocalNotification} from '../js/pushNotificationService';
import {check, PERMISSIONS, RESULTS} from 'react-native-permissions';
import RNLocation from 'react-native-location';
import {
  createEventVegetable,
  removeAllEventCurrentCalendar,
} from '../js/calendarAccess';

export default class Subscriber extends Component {
  getAllVegetables() {
    _retrieveData('vegetables').then(
      (vegetables) => this.setState({vegetables: vegetables}),
      (reason) => console.warn('error retreive all vegetable : ', reason),
    );
  }

  setIsSubVegetable(isSub, name) {
    //erreur ici on en fait rien plutot utiliser un map
    console.log('set isSub vegetable : ', isSub, name);
    this.state.vegetables.forEach((v) => {
      if (v.name === name) {
        v.isSub = isSub;
      }
    });
  }

  majStoreddata() {
    _storeData('vegetables', JSON.stringify(this.state.vegetables));
    this.createAllEvent();
  }

  async createAllEvent() {
    //supp tous les events
    await removeAllEventCurrentCalendar();
    this.state.vegetables.forEach((v) => {
      if (v.isSub) {
        createEventVegetable(
          'semis des ' + v.name,
          {
            jour: v.dateDebSemisJour,
            mois: v.dateDebSemisMois,
          },
          {
            jour: v.dateFinSemisJour,
            mois: v.dateFinSemisMois,
          },
          'le moment est venu de commencer les semis de ' + v.name,
          'la saison des semis de ' +
            v.name +
            ' est bientôt terminée, dépechez-vous de semer ! ',
        );
      }
    });
  }

  getLocalisation() {
    check(PERMISSIONS.ACCESS_FINE_LOCATION)
      .then((result) => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            console.log(
              'This feature is not available (on this device / in this context)',
            );
            break;
          case RESULTS.DENIED:
            console.log(
              'The permission has not been requested / is denied but requestable',
            );
            break;
          case RESULTS.GRANTED:
            console.log('The permission is granted');
            RNLocation.getLatestLocation((info) => info);
            break;
          case RESULTS.BLOCKED:
            console.log('The permission is denied and not requestable anymore');
            break;
        }
      })
      .catch((error) => {
        console.log('error getLocalisation : ', error);
      });
  }

  componentDidMount() {
    this.getAllVegetables();
    //console.log('localisation : ', this.getLocalisation());
  }

  /**
   *
   * @param {*} props
   * state is used to avoid empty data with async function : here we need async function to get all keys and second async function to get all vegetables (first promise )
   */
  constructor(props) {
    super(props);
    this.state = {keys: [], vegetables: []};
  }

  render() {
    return (
      <ScrollView style={styles.container}>
        {this.state.vegetables.map((v) => (
          <Vegetable
            key={v.name}
            vegetable={v}
            majVegetable={(isSub) => this.setIsSubVegetable(isSub, v.name)}
          />
        ))}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            this.majStoreddata();
          }}>
          <Text style={styles.text}>Mettre à jour les abonnements</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  text: {
    color: '#5CB85C',
    margin: 10,
    alignItems: 'center',
    alignContent: 'center',
  },
  tinyLogo: {
    width: 50,
    height: 50,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    paddingTop: 0,
    paddingLeft: 25,
  },
  button: {
    flex: 1,
    backgroundColor: 'white',
    borderColor: '#5CB85C',
    borderRadius: 25,
    borderWidth: 2,
    alignItems: 'center',
    alignContent: 'center',
    marginBottom: 20,
    marginTop: 25,
    marginRight: 25,
  },
});
