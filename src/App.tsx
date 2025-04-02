import { useRef, useState, useEffect } from 'react';
import * as handPose from '@tensorflow-models/handpose';
import "@tensorflow/tfjs-backend-webgl";
import Webcam from 'react-webcam';
import * as fingerPose from 'fingerpose';

import victory from './victory.png';
import thumbs_up from './thumbs-up.png';
import { drawHand } from './utils';

function App() {
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [handPoseLoaded, setHandPoseLoaded] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const [emoji, setEmoji] = useState("");
  const images = { thumbs_up, victory };

  useEffect(() => {
    const runHandPose = async () => {
      // Load the HandPose model once
      const net = await handPose.load();
      setHandPoseLoaded(true);

      // Detection loop
      const detectLoop = async () => {
        if (
          webcamRef.current &&
          webcamRef.current.video?.readyState === 4 &&
          canvasRef.current
        ) {
          const video = webcamRef.current.video;
          const videoWidth = video.videoWidth;
          const videoHeight = video.videoHeight;

          // Set video and canvas dimensions
          video.width = videoWidth;
          video.height = videoHeight;
          canvasRef.current.width = videoWidth;
          canvasRef.current.height = videoHeight;

          // Perform hand detection
          const hand = await net.estimateHands(video);
          const ctx = canvasRef.current.getContext('2d');

          if (hand.length > 0) {
            const GE = new fingerPose.GestureEstimator([
              fingerPose.Gestures.VictoryGesture,
              fingerPose.Gestures.ThumbsUpGesture,
            ]);

            const keyPoints3D = hand[0].landmarks;
            const gesture = GE.estimate(keyPoints3D as [], 8);

            if (gesture.gestures?.length > 0) {
              setEmoji(gesture.gestures[0].name);
            } else {
              setEmoji("");
            }
          }

          if (ctx) {
            drawHand(hand, ctx);
          }
        }

        // Schedule the next frame
        requestAnimationFrame(detectLoop);
      };

      detectLoop(); // Start the detection loop
    };

    runHandPose();
  }, []); 

  return (
    <div>
      {!handPoseLoaded && <h1>Loading the model...</h1>}

      {handPoseLoaded && (
        <h1>
          The model has been loaded. {showWebcam && "Now WAVE!"}
        </h1>
      )}
      {handPoseLoaded && showWebcam && (
        <h3>
          You can also do a finger pose, like thumbs up! Or victory
          sign!
        </h3>
      )}

      {showWebcam ? (
        <Webcam mirrored={true} ref={webcamRef} className="webCamStyle" />
      ) : (
        handPoseLoaded && (
          <div className="buttonContainer">
            <button
              type="button"
              onClick={() => setShowWebcam(true)}
            >
              CLICK HERE TO START THE WEBCAM AND PLAY WITH THE HAND
              POSE MODEL
            </button>
          </div>
        )
      )}

      {showWebcam && <canvas ref={canvasRef} className="webCamStyle" />}

      {emoji !== "" && (
        <img
          className="fingerPose"
          src={images[emoji as keyof typeof images]}
          alt="emoji"
        />
      )}
    </div>
  );
}

export default App;