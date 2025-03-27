import { useRef, useState } from 'react';
import * as handPose from '@tensorflow-models/handpose';
import "@tensorflow/tfjs-backend-webgl"
import Webcam from 'react-webcam';
import * as fingerPose from 'fingerpose';

import victory from '../public/victory.png';
import thumbs_up from '../public/thumbs-up.png';
import { drawHand } from './utils';

function App() {
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [handPoseLoaded, setHandPoseLoaded] = useState(false);
  const [emoji, setEmoji] = useState("");
  const images = { thumbs_up, victory }

  const detect = async (net: handPose.HandPose) => {
    if (!webcamRef.current || !canvasRef.current) return
    const isWebcamReady = typeof webcamRef.current !== "undefined" && webcamRef.current !== null && webcamRef?.current?.video?.readyState === 4

    if (isWebcamReady) {
      // get video props
      const video = webcamRef?.current?.video
      const videoWidth = webcamRef?.current?.video?.videoWidth
      const videoHeight = webcamRef?.current?.video?.videoHeight

      // set video height and width
      if (webcamRef.current.video && videoHeight && videoWidth) {
        webcamRef.current.video.height = videoHeight;
        webcamRef.current.video.width = videoWidth;
      }

      // set canvas height and width
      if (canvasRef.current.width && canvasRef.current.height && videoWidth && videoHeight) {
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
      }

      if (video) {
        const hand = await net.estimateHands(video);
        const ctx = canvasRef.current.getContext('2d');

        if (hand.length > 0) {
          const GE = new fingerPose.GestureEstimator([
            fingerPose.Gestures.VictoryGesture,
            fingerPose.Gestures.ThumbsUpGesture
          ])

          const keyPoints3D = hand[0].landmarks
          const gesture = GE.estimate(keyPoints3D as [], 8)

          if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
            const confidence = gesture.gestures.map((prediction) => prediction.score)
            const maxConfidence = confidence.indexOf(Math.max.apply(null, confidence))
            setEmoji(gesture.gestures[maxConfidence].name)
          } else {
            setEmoji("")
          }
        }

        if (ctx) {
          drawHand(hand, ctx)
        }
      }
    }
  }

  const runHandPose = async () => {
    const net = await handPose.load();
    if (net) {
      setHandPoseLoaded(true)
    }

    setInterval(() => {
      detect(net);
    }, 2000)
  };

  runHandPose();

  return (
    <div>
      {handPoseLoaded && <h1>The model has been loaded. Now WAVE!</h1>}
      {handPoseLoaded && <h3>You can also do a finger pose, like thumbs up! Or victory sign!</h3>}

      <Webcam ref={webcamRef} className='webCamStyle' />
      <canvas ref={canvasRef} className='webCamStyle' />

      {emoji !== "" && <img className='fingerPose' src={images[emoji as keyof typeof images]} alt="emoji" />}
    </div>
  )
}


export default App;
