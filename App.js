import React, { useEffect, useState, } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity,TextInput, Button, Alert } from 'react-native';
import  Navigation from './components/Navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen from './screens/OnboardingScreen';
import Home from './screens/Home';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const AppStack = createNativeStackNavigator();

const App = () =>{
  const [phoneNumber, setPhoneNumber]= React.useState('');
  const [isFirstLaunch, setFirstLaunch] = React.useState(true);
  const [isLoggedIn,setIsLoggedIn] = React.useState(false);
  const [homeTodayScore, setHomeTodayScore] = React.useState(0);
  const [tempCode, setTempCode] = React.useState(null);

  useEffect(()=>{
    const getSessionToken = async() => {
      const sessionToken = await AsyncStorage.getItem('sessionToken');
      console.log('token from storage', sessionToken)
      const validateResponse = await fetch('https://dev.stedi.me/validate/' + sessionToken);

      if (validateResponse.status == 200){
        const userEmail = await validateResponse.text();
        await AsyncStorage.setItem('userName', userEmail);
        console.log('userEmail', userEmail);
        setIsLoggedIn(true);
      }
    
  }
  getSessionToken();
},[])

   if (isFirstLaunch == true &&! isLoggedIn){ 

return(
  <OnboardingScreen setFirstLaunch={setFirstLaunch}/>
 
);
  }else if(isLoggedIn){
    return <Navigation/>
  } else{
    return (
      <View>
        <TextInput 
          value = {phoneNumber}
          onChangeText={setPhoneNumber}
          style={styles.input}  
          placeholderTextColor='#4251f5' 
          placeholder='Cell Phone'>          
        </TextInput>
        <Button
          title='Send'
          style={styles.button}
          onPress={async()=>{
            console.log('Button was pressed')

            const sendTextResponse = await fetch(
              'https://dev.stedi.me/twofactorlogin/'+ phoneNumber,
              {
                method: 'POST',
                headers:{
                  'content-type' : 'application/text'
                }
              }
            )   
            if (sendTextResponse.status!=200){
              console.log('server send text response: '+sendTextResponse.status);
              Alert('Communication Error','Server responded to send text with status:'+sendTextResponse.status)
            }
          }}
        /> 
        <TextInput
  value={tempCode}
  onChangeText={setTempCode}
  style={styles.input2}
  placeholderTextColor='#4251f5'
  placeholder='enter code'>
</TextInput><Button
    title='Verify'
    style={styles.button}
    onPress={async () => {
      console.log('Button 2 was pressed');

      const loginResponse = await fetch(
        "https://dev.stedi.me/twofactorlogin",
        {
          method: "POST",
          headers: {
            "content-type": "application/text"
          },
          body: JSON.stringify({
            phoneNumber,
            oneTimePassword: tempCode
          })
        }
      )
      console.log("status",loginResponse.status)
      
      
      if(loginResponse.status == 200){
      
        const sessionToken = await loginResponse.text();
        console.log('Session Token', sessionToken)
        await AsyncStorage.setItem('sessionToken', sessionToken)
        setIsLoggedIn(true);
      }
      else{
        console.log('response status',loginResponse.status)
        Alert.alert('Invalid','Invalid login information')
        setIsLoggedIn(false)
      }
    } }
    />        
      </View>
    )
  }
}


    //this is where the button ends



    export default App;


    const styles = StyleSheet.create({
     container:{
         flex:1, 
         alignItems:'center',
         justifyContent: 'center'
     },
     input: { 
       height: 40,
       margin: 12,
       borderWidth: 1,
       padding: 10,
       marginTop: 350
     },
     input2: {
      height: 40,
      margin: 12,
      borderWidth: 1,
      padding: 10,
      marginTop: 50
    },
     margin:{
       marginTop:100
     },
     button: {
       alignItems: "center",
       backgroundColor: "#DDDDDD",
       padding: 10
     }    
    })