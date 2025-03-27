// Define references
// Load handpose
// Detect function
// Drawing utilities from tensorflow
// Draw functions
import { useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import Webcam from 'react-webcam';

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  

  return (
    <div>
      <Webcam ref={webcamRef} className='webCamStyle' />

      <canvas ref={canvasRef} className='webCamStyle' />
    </div>
  )
}

export default App
