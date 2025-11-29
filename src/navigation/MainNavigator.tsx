import React from "react";
import { Text, Platform } from "react-native";
import { createNativeStackNavigator  } from "@react-navigation/native-stack";
import { HomeScreen } from "../components/HomeScreen";
import { GameScreen } from "../components/GameScreen";
import { TriviaScreen } from "../components/TriviaScreen";
import { NotJeopardyScreen } from "../components/NotJeopardyScreen";

const RootStack = createNativeStackNavigator({
    initialRouteName:'Home',
    screens: {
        Home: HomeScreen,
        HeadsUp: GameScreen,
        Trivia: TriviaScreen,
        Jeopardy: NotJeopardyScreen,
    }
});