import { Audio } from "expo-av";

export const useDynamicSound = () => {
  const play = async (source: number) => {
    const { sound } = await Audio.Sound.createAsync(source);
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate(status => {
      if (!status.isLoaded || status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  };

  return { play };
};
