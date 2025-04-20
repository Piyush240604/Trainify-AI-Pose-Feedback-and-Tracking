import { Keypoint } from "@tensorflow-models/pose-detection";
import { getAngle } from "../utils/getAngle";

// Main feedback logic for Squats exercise
export const getSquatFeedback = (
    keypoints: Keypoint[],
    countRef: React.RefObject<number>,
    setCountRef: React.RefObject<boolean>,
    initialFlagRef: React.RefObject<boolean>
  ) => {
    // Get joints for both arms and legs
    const leftHip = keypoints[11];
    const leftKnee = keypoints[13];
    const leftAnkle = keypoints[15];
  
    const rightHip = keypoints[12];
    const rightKnee = keypoints[14];
    const rightAnkle = keypoints[16];

    // Calculate angles
    const leftHipKneeAnkleAngle = getAngle(leftHip, leftKnee, leftAnkle);
    const rightHipKneeAnkleAngle = getAngle(rightHip, rightKnee, rightAnkle);

  
    // Normal Stage: Standing Straight
    const normalStage = leftHipKneeAnkleAngle && leftHipKneeAnkleAngle >= 150 && rightHipKneeAnkleAngle && rightHipKneeAnkleAngle >= 150 // legs straight
  
    // Squatted Stage: Deep Squat Position
    const squattedStage = leftHipKneeAnkleAngle && leftHipKneeAnkleAngle < 100 && rightHipKneeAnkleAngle && rightHipKneeAnkleAngle < 100 // legs squatted
  
    let feedback = "Start Squats";
    let incorrectPairs: number[][] = [];
  
    // Feedback logic
    if (normalStage && initialFlagRef.current) {
      feedback = "Good! Squat Down, Bring your arms parallel to Ground!";
    }
  
    else if (squattedStage) {
      initialFlagRef.current = false;
      setCountRef.current = false; // Only count when in squatted stage
      feedback = "Nice! Now come back up!";
    }
  
    else if (!squattedStage && normalStage) {
      if (!setCountRef.current) {
        countRef.current += 1;
        setCountRef.current = true;
      }
      feedback = "Great! Now Squat down.";
    }

    return {
      feedback,
      incorrectPairs, // Return the list of incorrect body parts for drawing feedback
    };
  };
  