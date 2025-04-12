import { Keypoint } from "@tensorflow-models/pose-detection";

export const drawPoseLandmarksAndConnections = (
    keypoints: Keypoint[],
    ctx: CanvasRenderingContext2D,
    incorrectPairs: number[][] = []
  ) => {
    const drawIndices = [
      5, 6, 7, 8, 9, 10, // shoulders → wrists
      11, 12, 13, 14, 15, 16, // hips → ankles
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
  
    const pairs = [
      [5, 7], [7, 9], [6, 8], [8, 10],
      [11, 13], [13, 15], [12, 14], [14, 16],
    ];
  
    pairs.forEach(([i, j]) => {
      const kp1 = keypoints[i];
      const kp2 = keypoints[j];
      if (kp1?.score && kp2?.score && kp1.score > 0.5 && kp2.score > 0.5) {
        ctx.beginPath();
        ctx.moveTo(kp1.x, kp1.y);
        ctx.lineTo(kp2.x, kp2.y);
        ctx.lineWidth = 4;
  
        // 🔴 Use red if this pair is in incorrectPairs
        const isIncorrect = incorrectPairs.some(([a, b]) =>
          (a === i && b === j) || (a === j && b === i)
        );
  
        ctx.strokeStyle = isIncorrect ? "red" : "lime";
        ctx.stroke();
      }
    });
  };
  