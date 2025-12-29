import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as ScreenOrientation from 'expo-screen-orientation';
import { HomeScreen } from "../components/HomeScreen";
import { GameScreen } from "../components/GameScreen";
import { TriviaScreen } from "../components/TriviaScreen";
import { NotJeopardyScreen } from "../components/NotJeopardyScreen";
import { PlayerSelectScreen } from "../components/PlayerSelectScreen";
import { TeamSelectScreen } from "../components/TeamSelectScreen";
import { JeopTriviaScreen } from "../components/JeopTriviaScreen";
import { AddTriviaQuestionScreen } from "../components/AddTriviaQuestionScreen";

export type RootStackParamList = {
  Home: undefined;
  HeadsUp: undefined;
  Trivia: undefined;
  Jeopardy: undefined;
  PlayerSelect: undefined;
  TeamSelect: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Home"
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="HeadsUp" 
        component={GameScreen}
      />
      <Stack.Screen 
        name="Trivia" 
        component={TriviaScreen}
      />
      <Stack.Screen 
        name="Jeopardy" 
        component={NotJeopardyScreen}
      />
      <Stack.Screen 
        name="PlayerSelect"
        component={PlayerSelectScreen}
      />
      <Stack.Screen 
        name="TeamSelect"
        component={TeamSelectScreen}
      />
      <Stack.Screen 
        name="JeopTriv"
        component={JeopTriviaScreen}
      />
      <Stack.Screen
        name="AddQuestion"
        component={AddTriviaQuestionScreen}
      />
    </Stack.Navigator>
  );
};