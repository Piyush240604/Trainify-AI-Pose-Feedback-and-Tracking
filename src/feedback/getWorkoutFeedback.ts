import { Keypoint } from "@tensorflow-models/pose-detection";
import { getAngle } from "../utils/getAngle";

// Main feedback logic for Jumping Jacks exercise
export const getWorkoutFeedback = (
  keypoints: Keypoint[],
  countRef: React.RefObject<number>,
  setCountRef: React.RefObject<boolean>,
  initialFlagRef: React.RefObject<boolean>
) => {
  // Get joints for both arms and legs
  const leftShoulder = keypoints[5];
  const leftElbow = keypoints[7];
  const leftWrist = keypoints[9];

  const rightShoulder = keypoints[6];
  const rightElbow = keypoints[8];
  const rightWrist = keypoints[10];

  const leftHip = keypoints[11];
  const leftAnkle = keypoints[15];

  const rightHip = keypoints[12];
  const rightAnkle = keypoints[16];

  // Calculate arm angles
  const leftElbowAngle = getAngle(leftShoulder, leftElbow, leftWrist);
  const rightElbowAngle = getAngle(rightShoulder, rightElbow, rightWrist);

  // Calculate shoulder angles
  const leftShoulderAngle = getAngle(leftHip, leftShoulder, leftElbow);
  const rightShoulderAngle = getAngle(rightHip, rightShoulder, rightElbow);

  // Get Leg Spread Ratio
  const legDistance = Math.abs(leftAnkle.x - rightAnkle.x);
  const shoulderDistance = Math.abs(leftShoulder.x - rightShoulder.x);
  const legSpreadRatio = legDistance / shoulderDistance; // Shoulder distance is always the same, so this provides a good ratio

  // Initialize incorrect pairs
  const incorrectPairs: number[][] = [];

  // Conditions for feedback and tracking
  let feedback = "Start Jumping Jacks!";
  const bottomStage = leftShoulderAngle && leftShoulderAngle < 60 && rightShoulderAngle && rightShoulderAngle < 60 && legSpreadRatio < 1;
  const topStage = leftShoulderAngle && leftShoulderAngle > 150 && rightShoulderAngle && rightShoulderAngle > 150 && legSpreadRatio > 1.5;

  if (bottomStage && initialFlagRef.current) {
    feedback = "Extend your Legs, and Bring your Arms Up!";
  }

  if (topStage) {
    initialFlagRef.current = false;
    setCountRef.current = false; // Only count when in the "top" stage
    feedback = "Great! Now jump down.";
  }

  if (bottomStage && !topStage) {
    if (!setCountRef.current) {
      countRef.current += 1;
      setCountRef.current = true; // Ensure the count only increases once
    }
    feedback = "Great! Now jump up.";
  }

  // Posture correction: Identify incorrect joints
  if (!bottomStage) {
    // Arms should be raised to a certain degree (typically above 150 degrees in top stage)
    incorrectPairs.push([5, 7], [6, 8]); // left arm and right arm aren't fully raised
  }

  if (!topStage && !bottomStage) {
    incorrectPairs.push([11, 13], [12, 14]); // legs are not sufficiently spread
  }

  return {
    feedback,
    count: countRef.current,
    incorrectPairs, // Return the list of incorrect body parts for drawing feedback
  };
};
