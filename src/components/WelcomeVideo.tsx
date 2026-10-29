import { useEventListener } from 'expo';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';

const source = require('../../assets/videos/itc-welcome-definitive-short.mp4');

/** A single silent playback, never a loop; a poster covers decoder startup. */
export function WelcomeVideo({ onComplete }: { onComplete: () => void }) {
  const [firstFrame, setFirstFrame] = useState(false);
  const player = useVideoPlayer(source, instance => {
    instance.loop = false;
    instance.muted = true;
    instance.play();
  });
  useEventListener(player, 'playToEnd', onComplete);
  useEventListener(player, 'statusChange', ({ status }) => {
    if (status === 'error') onComplete();
  });
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') player.play();
      else player.pause();
    });
    return () => subscription.remove();
  }, [player]);

  return <View style={StyleSheet.absoluteFill} pointerEvents="none" accessible={false}>
    <VideoView
      player={player}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      surfaceType="textureView"
      nativeControls={false}
      fullscreenOptions={{ enable: false }}
      allowsPictureInPicture={false}
      allowsVideoFrameAnalysis={false}
      playsInline
      onFirstFrameRender={() => setFirstFrame(true)}
    />
    {!firstFrame && <Image
      source={require('../../assets/videos/itc-welcome-definitive-short-first.jpg')}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      transition={0}
    />}
  </View>;
}
