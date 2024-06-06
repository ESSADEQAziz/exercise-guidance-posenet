let capture;
let posenet;
let singlePose, skeleton;
let correctPosture = true;
let exercise = ''; // Current exercise

function setup() {
    let canvas = createCanvas(800, 500);
    canvas.id('canvas'); // Assign the ID to the created canvas
    canvas.parent('canvasWrapper');
    capture = createCapture(VIDEO);
    capture.size(800, 500);
    capture.hide();

    posenet = ml5.poseNet(capture, modelLoaded);
    posenet.on('pose', receivedPoses);
}

function receivedPoses(poses) {
    if (poses.length > 0) {
        singlePose = poses[0].pose;
        skeleton = poses[0].skeleton;
        checkPosture(singlePose);
    }
}

function modelLoaded() {
    console.log('Model has loaded');
}

function draw() {
    clear();
    image(capture, 0, 0, width, height);
    if (singlePose) {
        drawKeypoints(singlePose);
        drawSkeleton(skeleton);
        provideExerciseGuidance(singlePose);
    }
    displayAlert();
}

function drawKeypoints(pose) {
    for (let i = 0; i < pose.keypoints.length; i++) {
        let x = pose.keypoints[i].position.x;
        let y = pose.keypoints[i].position.y;
        fill(255, 0, 0);
        ellipse(x, y, 20);
    }
}

function drawSkeleton(skeleton) {
    stroke(255, 255, 255);
    strokeWeight(5);
    for (let j = 0; j < skeleton.length; j++) {
        let startX = skeleton[j][0].position.x;
        let startY = skeleton[j][0].position.y;
        let endX = skeleton[j][1].position.x;
        let endY = skeleton[j][1].position.y;
        line(startX, startY, endX, endY);
    }
}

function checkPosture(pose) {
    correctPosture = true; // Default to true, update based on posture checks

    if (exercise === 'hand-stretch') {
        let leftWrist = pose.keypoints[9].position;
        let rightWrist = pose.keypoints[10].position;
        let leftElbow = pose.keypoints[7].position;
        let rightElbow = pose.keypoints[8].position;

        // Check if arms are straight and stretched
        if (dist(leftWrist.x, leftWrist.y, leftElbow.x, leftElbow.y) < 100 || 
            dist(rightWrist.x, rightWrist.y, rightElbow.x, rightElbow.y) < 100) {
            correctPosture = false;
        }
    } else if (exercise === 'side-stretch') {
        let leftHip = pose.keypoints[11].position;
        let rightHip = pose.keypoints[12].position;
        let leftShoulder = pose.keypoints[5].position;
        let rightShoulder = pose.keypoints[6].position;

        // Check if body is leaning to one side
        if (leftShoulder.y > leftHip.y || rightShoulder.y > rightHip.y) {
            correctPosture = false;
        }
    } else if (exercise === 'wrist-rotation') {
        let leftWrist = pose.keypoints[9].position;
        let rightWrist = pose.keypoints[10].position;

        // Ensure wrists are rotating (this is simplified; actual rotation detection is complex)
        if (abs(leftWrist.y - rightWrist.y) < 20) {
            correctPosture = false;
        }
    } else if (exercise === 'squat') {
        let leftKnee = pose.keypoints[13].position;
        let rightKnee = pose.keypoints[14].position;
        let leftHip = pose.keypoints[11].position;
        let rightHip = pose.keypoints[12].position;
        let leftAngle = calculateAngle(leftHip, leftKnee);
        let rightAngle = calculateAngle(rightHip, rightKnee);

        if (leftAngle <= 90 || rightAngle <= 90) {
            correctPosture = false;
        }
    } else if (exercise === 'pushup') {
        let leftShoulder = pose.keypoints[5].position;
        let rightShoulder = pose.keypoints[6].position;
        let leftElbow = pose.keypoints[7].position;
        let rightElbow = pose.keypoints[8].position;

        if (leftShoulder.y > leftElbow.y || rightShoulder.y > rightElbow.y) {
            correctPosture = false;
        }
    } else if (exercise === 'jump') {
        let leftAnkle = pose.keypoints[15].position;
        let rightAnkle = pose.keypoints[16].position;
        let leftHip = pose.keypoints[11].position;
        let rightHip = pose.keypoints[12].position;

        if (leftAnkle.y > leftHip.y || rightAnkle.y > rightHip.y) {
            correctPosture = false;
        }
    } else if (exercise === 'lunge') {
        let leftKnee = pose.keypoints[13].position;
        let rightKnee = pose.keypoints[14].position;
        let leftHip = pose.keypoints[11].position;
        let rightHip = pose.keypoints[12].position;

        let leftAngle = calculateAngle(leftHip, leftKnee);
        let rightAngle = calculateAngle(rightHip, rightKnee);

        if (leftAngle <= 90 || rightAngle <= 90) {
            correctPosture = false;
        }
    }
}

function displayAlert() {
    let alertBox = select('#alerts');
    if (!correctPosture) {
        alertBox.html('Incorrect Posture! Please adjust your position.');
        alertBox.addClass('incorrect');
        alertBox.removeClass('correct');
        alertBox.style('display', 'block');
    } else {
        alertBox.html('Correct Posture!');
        alertBox.addClass('correct');
        alertBox.removeClass('incorrect');
        alertBox.style('display', 'block');
    }
}

function provideExerciseGuidance(pose) {
    // Functionality to provide visual feedback can be added here
}

function calculateAngle(p1, p2) {
    return degrees(atan2(p2.y - p1.y, p2.x - p1.x));
}

function setExercise(newExercise) {
    exercise = newExercise;
    select('#selectedExercise').html(`Selected Exercise: ${exercise}`);
}