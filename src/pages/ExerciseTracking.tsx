import React, { useEffect, useRef, useState } from "react";
import "@tensorflow/tfjs-backend-webgl";
import * as tf from "@tensorflow/tfjs-core";
import * as posedetection from "@tensorflow-models/pose-detection";
import "../App.css";
import { Keypoint } from "@tensorflow-models/pose-detection";

const ExerciseTracking: React.FC = () => {
  const exercise = "Jumping Jacks"; // Change this to the desired exercise name
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [detector, setDetector] = useState<posedetection.PoseDetector | null>(null);
  const [isMobile, setIsMobile] = useState(true);

  const [feedback, setFeedback] = useState("Start Jumping Jacks!");
  const count = useRef(0);
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
    
    // Get angle of the 3 joints
    const getAngle = (a: Keypoint, b: Keypoint, c: Keypoint): number | null => {
      if (!a || !b || !c || a.score! < 0.5 || b.score! < 0.5 || c.score! < 0.5) return null;
    
      const radians =
        Math.atan2(c.y - b.y, c.x - b.x) -
        Math.atan2(a.y - b.y, a.x - b.x);
    
      let angle = Math.abs((radians * 180) / Math.PI);
    
      if (angle > 180) angle = 360 - angle;
    
      return angle;
    };

    // Detect pose and draw keypoints and skeleton
    const detectPose = async () => {
      const detect = async () => {
        const poses = await detector.estimatePoses(video);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (poses.length > 0) {
          const keypoints = poses[0].keypoints;

          const drawIndices = [
            5, 6, 7, 8, 9, 10, // shoulders → wrists (arms)
            11, 12, 13, 14, 15, 16, // hips → ankles (legs)
          ];

          drawIndices.forEach((index) => {
            const keypoint = keypoints[index];
            if (keypoint?.score && keypoint.score > 0.5) {
              ctx.beginPath();
              ctx.arc(keypoint.x, keypoint.y, 6, 0, 2 * Math.PI);
              ctx.fillStyle = "aqua";
              ctx.fill();
            }
          });
        
          // Arm and leg bone connections
          const relevantPairs = [
            // Arms
            [5, 7], [7, 9], // left_shoulder → left_elbow → left_wrist
            [6, 8], [8, 10], // right_shoulder → right_elbow → right_wrist
        
            // Legs
            [11, 13], [13, 15], // left_hip → left_knee → left_ankle
            [12, 14], [14, 16], // right_hip → right_knee → right_ankle
          ];
        
          relevantPairs.forEach(([i, j]) => {
            const kp1 = keypoints[i];
            const kp2 = keypoints[j];
            if (kp1?.score && kp2?.score && kp1.score > 0.5 && kp2.score > 0.5) {
              ctx.beginPath();
              ctx.moveTo(kp1.x, kp1.y);
              ctx.lineTo(kp2.x, kp2.y);
              ctx.lineWidth = 3;
              ctx.strokeStyle = "lime";
              ctx.stroke();
            }
          });

          // Get joints for both arms
          const leftShoulder = keypoints[5];
          const leftElbow = keypoints[7];
          const leftWrist = keypoints[9];

          const rightShoulder = keypoints[6];
          const rightElbow = keypoints[8];
          const rightWrist = keypoints[10];

          // Get joints for legs
          const leftHip = keypoints[11];
          const leftAnkle = keypoints[15];

          const rightHip = keypoints[12];
          const rightAnkle = keypoints[16];

          // Calculate arm angles
          const leftElbowAngle = getAngle(leftShoulder, leftElbow, leftWrist);
          const rightElbowAngle = getAngle(rightShoulder, rightElbow, rightWrist);

          // Calculate hip angle
          const leftShoulderAngle = getAngle(leftHip, leftShoulder, leftElbow);
          const rightShoulderAngle = getAngle(rightHip, rightShoulder, rightElbow);

          // Get Leg Spread Ratio
          const legDistance = Math.abs(leftAnkle.x - rightAnkle.x);
          const shoulderDistance = Math.abs(leftShoulder.x - rightShoulder.x);

          const legSpreadRatio = legDistance / shoulderDistance; // Shoulder distance is always the same, so this provides a good ratio

          // Check conditions
          if (
            leftShoulderAngle !== null &&
            rightShoulderAngle !== null &&
            leftElbowAngle !== null &&
            rightElbowAngle !== null
          ) {
            const bottomStage = leftShoulderAngle < 60 && rightShoulderAngle < 60 && legSpreadRatio < 1;
            const topStage = leftShoulderAngle > 150 && rightShoulderAngle > 150 && legSpreadRatio > 1.5;

           // Show initial guidance only once
          if (bottomStage && initialFlag.current) {
            setFeedback("Extend your Legs, and Bring your Arms Up!");
          }

          // If they extend their legs and arms
          else if (topStage) {
            initialFlag.current = false;
            setCount.current = false; // If you are in Upstage, then you are allowed to count
            setFeedback("Great! Now jump down.");
          }

          // If they're in bottomStage and just came from topStage
          else if (bottomStage) {
            if (!setCount.current) {
              count.current += 1;
              setCount.current = true; // Makes sure the count only increases once and not every frame
            }
            setFeedback("Great! Now jump up.");
          }}
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
      {/* Header */}
      <h2 className="text-xl font-semibold text-center mt-4 mb-2">
        🧍 MoveNet Pose Detection
      </h2>
  
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
