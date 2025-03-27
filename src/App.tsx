// Define references
// Load handpose
// Detect function
// Drawing utilities from tensorflow
// Draw functions
import { useRef } from 'react';
// import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import Webcam from 'react-webcam';

function App() {
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const detect = async (net: handpose.HandPose) => {

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
        console.log(hand);
      }
    }
  }

  const runHandPose = async () => {
    const net = await handpose.load();

    setInterval(() => {
      detect(net);
    },1000)
  };

  runHandPose();


  return (
    <div>
      <Webcam width={1920} height={1080} ref={webcamRef} className='webCamStyle' />

      <canvas ref={canvasRef} className='webCamStyle' />
    </div>
  )
}


export default App;
