import React, { useEffect, useRef, useState } from "react";
import "@tensorflow/tfjs-backend-webgl";
import * as tf from "@tensorflow/tfjs-core";
import * as posedetection from "@tensorflow-models/pose-detection";
import "../App.css";
import { getWorkoutFeedback } from "../feedback/getWorkoutFeedback";
import { drawPoseLandmarksAndConnections } from "../utils/drawUtils";

const ExerciseTracking: React.FC = () => {
  const exercise = "Jumping Jacks"; // Change this to the desired exercise name
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [detector, setDetector] = useState<posedetection.PoseDetector | null>(null);
  const [isMobile, setIsMobile] = useState(true);

  const [feedback, setFeedback] = useState("Start Jumping Jacks!");
  const count = useRef<number>(0);
  const setCount = useRef(false);
  const initialFlag = useRef(true);

  // Handle screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's md breakpoint
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize TFJS + detector
  useEffect(() => {
    const init = async () => {
      await tf.setBackend("webgl");
      await tf.ready();

      const model = posedetection.SupportedModels.MoveNet;
      const detector = await posedetection.createDetector(model, {
        modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      });
      setDetector(detector);
    };

    init();

    return () => {
      if (detector) {
        detector.dispose();
      }
    };
  }, []);

  // Enable webcam and detect poses
  useEffect(() => {
    if (!detector || !isMobile) return;

    const video = videoRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const setupCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
        video.width = video.videoWidth;
        video.height = video.videoHeight;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        detectPose();
      };
    };

    // Detect pose and draw keypoints and skeleton
    const detectPose = async () => {
      const detect = async () => {
        const poses = await detector.estimatePoses(video);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (poses.length > 0) {
          const keypoints = poses[0].keypoints;

          // Get feedback and incorrect pairs based on keypoints
          const { feedback: newFeedback, incorrectPairs } = getWorkoutFeedback(
            keypoints,
            count,
            setCount,
            initialFlag
          );
          setFeedback(newFeedback);

          // Draw pose landmarks and connections with color correction for incorrect posture
          drawPoseLandmarksAndConnections(keypoints, ctx, incorrectPairs);
        }
        requestAnimationFrame(detect);
      };

      detect();
    };

    setupCamera();
  }, [detector, isMobile]);

  if (!isMobile) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <h1 className="text-white text-2xl md:text-3xl font-bold text-center px-6">
          This React Application is not yet responsive for PC Screens.
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen overflow-hidden bg-white flex flex-col items-center justify-start">
  
      {/* Feedback */}
      <div className="text-center mt-2 mb-4">
        <h3 className="text-lg font-bold text-blue-600">Exercise: {exercise}</h3>
        <h3 className="text-lg font-bold text-blue-600">Reps: {count.current}</h3>
        <h3 className="text-md font-medium text-gray-800">{feedback}</h3>
      </div>
  
      {/* Camera View */}
      <div className="relative w-full h-[calc(100vh-4.5rem)]">
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full transform -scale-x-100"
        />
        <video
          ref={videoRef}
          playsInline
          muted
          className="hidden"
        />
      </div>
    </div>
  );  
};

export default ExerciseTracking;
