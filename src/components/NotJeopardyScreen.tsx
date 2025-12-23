import React, { useState, useEffect } from 'react';  
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Image,
    ImageBackground, 
} from 'react-native';
import { ScoreManager } from '../services/scoreManager';

interface NotJeopardyScreenProps {
    roundDuration?: number;
    onRoundEnd?: (finalScore: number) => void;
}

export const NotJeopardyScreen: React.FC<NotJeopardyScreenProps> = ({
    roundDuration = 120,
    onRoundEnd,
}) => {
    const [pl1, setpl1] = useState(0);
    const [pl2, setpl2] = useState(0);
    const [pl3, setpl3] = useState(0);
    const [questionAmount, setQuestionAmount] = useState(0);
    const [doubleJeopardy, setDoubleJeopardy] = useState(false);
    const [dailyDouble, setDailyDouble] = useState(0);
    const [whichPlayer, setWhichPlayer] = useState(0);

    const dollarAmounts: number[] = [200, 400, 600, 800, 1000];

    useEffect(() => {
        const timer = setTimeout(() => {
          onRoundEnd && onRoundEnd(pl1 + pl2 + pl3);
        }, roundDuration * 1000);
    
        return () => clearTimeout(timer);
      }, [pl1, pl2, pl3, onRoundEnd, roundDuration]);

    const alterScore = (player: number, score:number) => {
        if(doubleJeopardy) {
            score *= 2;
        }
        switch (player) {
            case 1:
                setpl1(pl1 + score);
                break;
            case 2:
                setpl2(pl2 + score);
                break;
            case 3:
                setpl3(pl3 + score);
                break;
            default:
                break;
        }
    }

    // const doubleJeop = (player:number, score:number, double: boolean) => {
    //     alterScore(player, score * 2);
    // }

    // const dailyDouble = (player: number, score: number) => {
    //     alterScore(player, score);
    // }

    return(
        <ImageBackground source={require('../assets/torresTrivia.png')}>
            <View style={styles.container}>
                <View style={styles.rowContainer}>
                    <Text>Player 1: ${pl1}</Text>
                    <Text>Player 2: ${pl2}</Text>
                    <Text>Player 3: ${pl3}</Text>
                </View>
                <View style={styles.rowContainer}>
                    <Text>Select Dollar Amount:</Text>
                </View>
                <View style={styles.rowContainer}>
                    {dollarAmounts.map((amount, index) => (
                        <TouchableOpacity key={index} onPress={() => setQuestionAmount(amount)}>
                            <Text>{amount}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.rowContainer}>
                    <Text>Is it Double Jeopardy(Round 2)?</Text>
                    <TouchableOpacity onPress={() => setDoubleJeopardy(!doubleJeopardy)}>
                        <Text>{doubleJeopardy ? 'Yes' : 'No'}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.container}>
                    <Text>Question Selected: ${questionAmount}</Text>
                    <Text>Which Player is Answering?</Text>
                    <View style={styles.rowContainer}>
                        <TouchableOpacity onPress={() => setWhichPlayer(1)}>
                            <Text>Player 1</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setWhichPlayer(2)}>
                            <Text>Player 2</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setWhichPlayer(3)}>
                            <Text>Player 3</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.rowContainer}>
                    <TouchableOpacity onPress={() => alterScore(whichPlayer, questionAmount)}>
                        <Text>CORRECT!</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => alterScore(whichPlayer, -questionAmount)}>
                        <Text>WRONG!</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});