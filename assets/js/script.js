// _______________________________________________________________________________________
// AUTHOR: ELISABETH SYKOROVA

// PROJECT NAME: UTOPIA - UI PROGRAMMING SEM1, 2024

// KNOWN ERRORS: When running the game locally, the browser restricts the music. For the background music to play, the published online version has to be run.

// NOTES: Should the project be developed further, I would focus on balancing out the difficulty of the game and the overal fun aspect, which is something
// the game currently lacks. I would also add more sprites for bigger defect diversity.
// _______________________________________________________________________________________





// setting up canvas--------------------------------------------------------------

const canvas = document.getElementById("the_canvas")
const context = canvas.getContext("2d");

document.getElementById( "the_canvas" ).onmousewheel = function(event){
    event.preventDefault(); // blocking scrolling
};


// canvas fills in the window
canvas.width = window.innerWidth * 0.99; // small edges on the side, looks better
canvas.height = window.innerHeight * 0.98;

context.shadowColor="black";
context.shadowBlur= 7;

// change canvas color
context.fillStyle = '#1d1d1d'; // dark gray
context.fillRect(0, 0, canvas.width, canvas.height);

// -------------------------------------------------------------------------------

// DECLARATION OF GAME VARIABLES ---------------------------------------------------------------------------------------------------------------------------------------

// collected name
let playerName = localStorage.getItem("username");

// booleans ----------------------------------------------------------------------

let gameOver = false; // boolean to stop updating when the game ends
let openingScreen = true; // if the player is in opening screen or not
let mouseOverPerson = false; // is mouse located on a person
let bgMusicPlaying = false;


// sanity level -----------------------------------------------

const MAX_SANITY = 100; // maximum value for sanity
let stabilityLevel = MAX_SANITY; // for sanity bar
let savedStability = localStorage.getItem("stability");

if (savedStability) // if the value has been saved in local storage, use that value
    {
        stabilityLevel = savedStability;
    }

let stabilityDecrease = 0.007; // decreases over time
let incorrectDetectDecrease = 10; // incorrect detect
let undetectedDecrease = 20; // undetected decrease
let correctDetectIncrease = 5; // increase when correct
// ------------------------------------------------------------



// counters for detection score -------------------------------

let detected = 0; // number of correctly detected abnormalities
if (localStorage.getItem("detected"))
    {
        detected = localStorage.getItem("detected"); // loading a value from storage
    }


let incorrectlyDetected = 0; // number of incorrect detects
if (localStorage.getItem("incorrectlyDetected"))
    {
        incorrectlyDetected = localStorage.getItem("incorrectlyDetected"); // loading a value from storage
    }


let undetected = 0; // number of undetected cases
if (localStorage.getItem("undetected"))
    { 
        undetected = localStorage.getItem("undetected"); // loading a value from storage
    }
// -----------------------------------------------------------


// MEDIA LOADING -----------------------------------------------------------------


// sound
let backgroundMusic = new Audio("assets/sound/background_music.wav"); // background music

let pageTurnSound = new Audio("assets/sound/pageTurn.wav"); // sound effect when starting a game (paper)
pageTurnSound.volume = 0.5;

let click2Sound = new Audio("assets/sound/click2.wav"); // sound effect when clicking in game
click2Sound.volume = 0.25;

let selectSound = new Audio("assets/sound/beep.wav"); // sound effect when hovering over suspects
selectSound.volume = 0.02;

// images

let dateSigned = new Date(); // get today's date

let personSpritesheet = new Image(); // spritesheet with people
personSpritesheet.src = "assets/images/SPRITESHEET_DONE.png";
personSpritesheet.onload = gameLoop;

let fullExample = new Image();
fullExample.src = "assets/images/fullExample.png";
let fullExampleScale = canvas.height/1200;

// document image and start screen variables
let documentImage = new Image(); // spritesheet with opening screen document
documentImage.src = "assets/images/DOCUMENT.png";
let documentScale = canvas.height/1200;
let heightLimit = 650;


// drawing variables
// opening screen image
let documentImageXpos = 0;
let documentImageYpos = 0;
let startTextY = 0;

// game stats
let statsX = 0;
let statsY = 0;

// -------------------------------------------------------------------------------


// PERSON VARIABLES
let personWidth = 190.5; // original image size width
let personHeight = 937.5375; // original image size height
let personScale = canvas.height / 1200; // changes responsively
let scaledPersonWidth = personWidth * personScale;
let scaledPersonHeight = personHeight * personScale;

let defaultY = canvas.height/8; // default setting for y pos
let randomType = 0; // generated randomly

const DEFAULT_TYPE = 0;

// adjusting distance between people
let minDistance = 150;
let distanceBetweenPeople = 0;
let calcDistance = Math.round(canvas.width / 7); // changes based on screen size
if (calcDistance > minDistance)
{
    distanceBetweenPeople = calcDistance;
}
else
{
    distanceBetweenPeople = minDistance; // minimum distance so they dont overlap
}


let people = []; // ARRAY FOR THE SUSPECTS/PEOPLE
let calculatedNoPeople = Math.round(canvas.width / distanceBetweenPeople) + 1 + 1; // the max of array items that will be spawning
let NUM_OF_PEOPLE = calculatedNoPeople; // NOTE: change based on screen size

let latestRespawn = -1; // tracks which person was last to respawn - to space out the different people consistently

let defectRarity = 5; // rarity of defects (ratio 1:x)

// speed and movement
let xSpeedIncrement = 0.03;
let speedUpEvery = 3;
let xSpeed = 0.7 * (screen.width/1920) + (xSpeedIncrement * detected/2); // stays the same across all devices (default speed 2 set on a 1920 width)
let shiftY = 15;
let ySpeed = 4;


// tracking mouse position to check boundaries when clicking people
let mouseX = 0;
let mouseY = 0;


// animation
let currentFrame = 0;
let frameIncrement = 0.008;
let frameLimit = 8;
const NUM_OF_TYPES = 16; // number of types of textures for people (number of rows in the spritesheet)

// text
context.font = "20px monospace";

// END OF DECLARATIONS -------------------------------------------------------------------------------------------------------------------------------



// CODE ----------------------------------------------------------------------------------------------------------------------------------------------

// game object class
function GameObject(spritesheet, x, y, width, height, type, clicked, number, currentFrame)
{
    this.spritesheet = spritesheet; // texture
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type; // type of texture/person (normal or different types of defects, random each respawn)
    this.clicked = clicked; // if the person was clicked/collided with mouse up
    this.number = number; // keeping the number in the list here
    this.currentFrame = currentFrame; // so everyone is not on the same frame (unnatural look)
}

for (i = 0; i < NUM_OF_PEOPLE; i++) // initiating people
    {
        randDefected = Math.floor(Math.random() * defectRarity); // picks a number from 0-defectRarity = ratio (default:defected - 1:defectRarity)
        
        if (randDefected != DEFAULT_TYPE) // if it isnt 0, it will be a random defected sprite
            {
                randomType = Math.floor(Math.random() * NUM_OF_TYPES - 1) + 1; // defected types randomized
            }
        else // it will be the default sprite
            {
                randomType = DEFAULT_TYPE; // first row of spritesheet = regular
            }

        people[i] = new GameObject(personSpritesheet,
                                    (0-scaledPersonWidth) - (i * distanceBetweenPeople), // spacing out everyone
                                    defaultY,
                                    scaledPersonWidth,
                                    scaledPersonHeight,
                                    randomType, // which sprite it will be (row in spritesheet)
                                    false, // bool to track if the person has been clicked or not
                                    i,
                                    0) // number in the list

        latestRespawn = i;
    }


function PlayerInput(input)
{
    this.action = input; // input held as string
}

let playerInput = new PlayerInput("None"); // initializing to none

// reacting to input
function input(event) // player inputs responses -------------------------------------------------------------------------------------------------------------------------------------------------------------------
{

    if (event.type == "mousemove")
    {
        mouseX = event.clientX; // record mouse position for collision checking
        mouseY = event.clientY;
        
        if (!gameOver) // if the game is still playing
        {
        // changing cursor based on whether it can click on a person or not
        for (i = 0; i < NUM_OF_PEOPLE; i++) 
            {
                    if (mouseX >= people[i].x && mouseX <= people[i].x + scaledPersonWidth &&
                        mouseY >= people[i].y && mouseY <= people[i].y + scaledPersonHeight)
                    {
                        canvas.style.cursor = 'pointer'; // set cursor to 'pointer' to indicate that the suspects are clickable
                        if (!(people[i].y <= defaultY - shiftY))
                        {
                            people[i].y = people[i].y - shiftY;
                            selectSound.play();
                        }
                        mouseOverPerson = true; // found a match
                        break; // exit the loop early
                    }
                    else if (!people[i].clicked)
                    {
                        people[i].y = defaultY; // after highlighting a person, return them back to default y when they are not selected anymore
                    }
            }
            if (!mouseOverPerson) {
                canvas.style.cursor = 'default'; // change mouse back to default cursor if it isnt intersecting any suspects
            }
        }
    }

    if (event.type == "mouseup")
    {
        if (!gameOver)
        {
            collisions(); // check collisions upon clicking
        }

        if(!openingScreen && !gameOver) // playing sound effects
        {
            click2Sound.play();
        }
        else if (!gameOver) // opening screen sound effects
        {
            pageTurnSound.play();
            click2Sound.play();
            openingScreen = false;
        }

    }

}
// end of input -------------------------------------------------------------------------------------------------------------------------------------------------------------------

function collisions() // -------------------------------------------------------------------------------------------------------------------------------------------------------------------
{

    for (i = 0; i < NUM_OF_PEOPLE; i++) // goes through the whole array to check for collisions w each person
    {
        if (mouseX >= people[i].x && mouseX <= people[i].x + scaledPersonWidth &&
            mouseY >= people[i].y && mouseY <= people[i].y + scaledPersonHeight)
        {
            if (people[i].type != DEFAULT_TYPE && !people[i].clicked)
                {
                    // if the person is intersected when clicked:
                    if (stabilityLevel < MAX_SANITY - correctDetectIncrease) // boundary checking so the level does not go over max value
                        {
                            stabilityLevel += correctDetectIncrease; // when the clicked person is defected = correct, add points to stability level
                        }
                    else
                        {
                            stabilityLevel = MAX_SANITY; // max out value
                        }

                    detected++; // inrease detected counter

                    // every few correctly detections, speed up the movement and the animation - higher difficulty
                    if (detected % speedUpEvery === 0)
                    {
                        xSpeed += xSpeedIncrement;
                    }
                }
            else if(!people[i].clicked) // if the person is clicked but is not defected = incorrect detect
                {
                    if (stabilityLevel > 0 + incorrectDetectDecrease) // boundary checking
                    {
                        stabilityLevel -= incorrectDetectDecrease; // when the person clicked is not defected = incorrect, decrease the stability level
                    }
                    else // if over boundary (so it does not go into negatives)
                    {
                        stabilityLevel = 0; // else goes to 0
                    }

                    incorrectlyDetected++; // counter 

                }

            people[i].clicked = true; // when a person is clicked, set this to true
        }
    }
}
// end of collisions -------------------------------------------------------------------------------------------------------------------------------------------------------------------

function draw() // -------------------------------------------------------------------------------------------------------------------------------------------------------------------
{
    // clear canvas
    context.clearRect(0,0,canvas.width, canvas.height);
    // color canvas change
    context.fillStyle = '#141414';
    context.fillRect(0,0,canvas.width, canvas.height);

    context.shadowColor="black";
    context.shadowBlur = 0;

    // animating and drawing suspects here:
    for (i = 0; i < NUM_OF_PEOPLE; i++)
        {
            animate(people[i]);
        }

    // gradient light
    context.shadowColor="rgba(181, 114, 27, 0.1)";
    context.shadowBlur = canvas.height;
    context.fillRect(0,0, canvas.width, canvas.width/29.2);

   // lighter borders (underneath)
    context.fillStyle = '#151515'; // Lighter shade
    // top border
    context.fillRect(0, 0, canvas.width, canvas.width / 29.2);
    // tottom border
    context.fillRect(0, canvas.height - canvas.width / 31.6, canvas.width, canvas.width / 31.6);
    // teft border
    context.fillRect(0, 0, canvas.width / 31.6, canvas.height);
    // tight border
    context.fillRect(canvas.width - canvas.width / 31.6, 0, canvas.width / 31.6, canvas.height);

    // darker borders (on top)
    context.fillStyle = '#101010'; // Darker shade
    // top border
    context.fillRect(0, 0, canvas.width, canvas.width / 34.5);
    // tottom border
    context.fillRect(0, canvas.height - canvas.width / 38, canvas.width, canvas.width / 38);
    // teft border
    context.fillRect(0, 0, canvas.width / 38, canvas.height);
    // tight border
    context.fillRect(canvas.width - canvas.width / 38, 0, canvas.width / 38, canvas.height);


// OPENING SCREEN DRAW ---------------------------------------------------------------------

    if (openingScreen)
    {
        // sheet/document
        context.shadowBlur = 7;
        context.shadowColor="black";
        context.fillStyle ='#101010';

        // minimum document scale for readability
        if (canvas.height <= heightLimit)
        {
            documentScale = 0.6;
        }

        // update value
        documentImageXpos = canvas.width / 2 - (documentScale * documentImage.width)/2; // center
        documentImageYpos = canvas.height * 0.5 - (documentScale * documentImage.height)/2;
        startTextY = canvas.height - canvas.height/6;

        // hard set minimum pos for readibility
        if (canvas.height <= heightLimit)
        {
            documentImageYpos = 0;
            startTextY = canvas.height - 20;
        }

        context.drawImage(  documentImage,
                            documentImageXpos,
                            documentImageYpos,
                            documentScale * documentImage.width,
                            documentScale * documentImage.height);

        // example image of defects
        context.drawImage(fullExample,
            documentImageXpos + 2.35*documentScale * documentImage.width/3,
            documentImageYpos + 1*documentScale * documentImage.height/3,
            fullExample.width * fullExampleScale * (documentScale / 2.5),
            fullExample.height * fullExampleScale * (documentScale / 2.5));

        // text written on the document from saved values
        context.fillStyle ='#A177CA';
        context.textAlign = "left";
        context.font = "16px monospace";
        // the player signature
        context.fillText(playerName,documentImageXpos + documentImage.width * documentScale / 5 * 1.15, 
                                    documentImageYpos + documentImage.height * documentScale / 5 * 2.27);
        // the date of signed
        context.fillText(dateSigned.getDate() + "/" + (dateSigned.getMonth() + 1) + "/" + dateSigned.getFullYear(), 
                                    documentImageXpos + documentImage.width * documentScale / 5.2,
                                    documentImageYpos + documentImage.height * documentScale / 5 * 2.65);
                                    // numbers included are responsive but positioned so they fit in the document image accurately
        // start message
        context.textAlign = "center"
        context.font = "24px monospace";
        context.fillText("<click to start>", canvas.width/2, startTextY);
        let openingDrawn = true;
    }

// IN GAME DRAW ---------------------------------------------------------------------

    if (!openingScreen)
    {

    // stability bar
        context.shadowBlur = 7;
        context.shadowColor="black";
        context.fillStyle ='#A177CA';
        context.fillRect(0, 0, canvas.width * stabilityLevel/100, 10); // changes based on the level
    
    // text
        context.shadowBlur=7;
        context.font = "20px monospace";
        context.textAlign = 'left';
        if (canvas.width <= 1000)
        {
            context.font = "14px monospace";
        }
        context.fillText("Stability of Utopia",10,35); // HARD CODED text

        statsX = canvas.width/2.5; 
        statsY = canvas.height - 15

        // stats display based on screen size
        if (canvas.width > 800)
        {
            context.font = "12px monospace";
            if (canvas.width >= 1300)
            {
                statsX = canvas.width/2; 
                context.font = "16px monospace";
                context.textAlign = 'center';
                context.fillText("<correctly detected: " + detected + "; incorrectly detected: " + incorrectlyDetected + "; undetected: " + undetected +">", statsX, statsY);
            }
            else
            {
                statsX =  canvas.width/2;
                context.textAlign = 'left';
                context.fillText("<detected: " + detected + "; falsely detected: " + incorrectlyDetected + "; undetected: " + undetected +">", statsX, statsY);
            }
        }

        // shows player name
        context.textAlign = 'left';
        context.font = "20px monospace";
        if (canvas.width < 1000)
        {
            context.font = "14px monospace";
        }
        context.fillText("Guard on Duty: " + playerName, 20, canvas.height - 15);
    }

    if (gameOver) // game over text
    {
        if (canvas.width > 900)
        {
            context.font = "100px monospace";
        }
        else
        {
            context.font = "50px monospace";
        }
        context.textAlign = 'center';
        context.fillText("Utopia Unstable", (canvas.width)/2, canvas.height/2);
    }
}
// draw end -------------------------------------------------------------------------------------------------------------------------------------------------------------------

function animate(GameObject) // animating using frameIncrements
{
    if (!gameOver)
        {
        GameObject.currentFrame += frameIncrement; // frame increment added every update, when the number goes up ( e.g. 24.9->25), the frame switches

        if (GameObject.currentFrame >= frameLimit)
            {
                GameObject.currentFrame = 0;
            }
        }
        // draws the image on the current frame
        // frameIncrement increases the currentFrame, trunc gets rid of decimals, making the frames transition at a slower pace, not with every loop
        context.drawImage(  GameObject.spritesheet,
                            Math.trunc(GameObject.currentFrame) * personWidth,
                            GameObject.type * personHeight,
                            personWidth,
                            personHeight,
                            GameObject.x,
                            GameObject.y,
                            scaledPersonWidth,
                            scaledPersonHeight); // drawing people
}

function update() // updating position, counters and other values --------------------------------------------------------------------------------------------------
{

    for (i = 0; i < NUM_OF_PEOPLE; i++)
        {
            if (people[i].x < screen.width) // boundary
            {
                people[i].x += xSpeed; // movement on x axis
            }
            if(people[i].clicked) // once the person is clicked, it starts going up on the y axis 
            {
                if (people[i].y > 0 - people[i].height)
                {
                    people[i].y -= ySpeed; // moves up away from the screen when clicked
                }
            }

            if (people[i].x >= screen.width || people[i].y <= 0 - people[i].height)
            {
                reset(people[i]); // when off screen, reset
            }
        }

        updateStability(); // update level

        for (i = 0; i < NUM_OF_PEOPLE; i++) // natural looking difference between the animation frames on each subject
            {
                if (people[i].x < 0 - scaledPersonWidth)
                {
                    people[i].currentFrame = 0;
                }
            }

        mouseOverPerson = false; // reset value
}
// update end-------------------------------------------------------------------------------------------------------------------------------------------------------------------

function updateStability() // --------------------------------------------------------------------------------------------------------------------------------------
{
    if (stabilityLevel > 0 + stabilityDecrease) // check boundaries
        {
            stabilityLevel -= stabilityDecrease; // sanity level going down with time
        }
        else
        {
            stabilityLevel = 0; // boundary
        }

}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------------


function reset(GameObject) // used to respawn array people-----------------------------------------------------------------------------------------------------
{

    if (!GameObject.clicked && GameObject.type != DEFAULT_TYPE) // if the person was defected but not spotted (and respawned by going off screen), insanity level goes down
        {
            if (stabilityLevel > 0 + undetectedDecrease) // boundaries set so the value does not go into negatives
            {
                stabilityLevel -= undetectedDecrease;
            }
            else
            {
                stabilityLevel = 0; // minimum value
            }
            undetected++;
        }
    
    if (people[latestRespawn].x <= 0) // if the latest respawned person is not on the screen yet, create distance
    {
        GameObject.x = people[latestRespawn].x - distanceBetweenPeople; 
    }
    else // if it is on the screen, do a default respawn (just off the screen) - this can only be seen when the number of people does not fill the screen fully
    {
        GameObject.x = 0 - GameObject.width;
    }

    GameObject.y = defaultY; // back to default y pos
    GameObject.clicked = false; // reset clicked
    latestRespawn = GameObject.number; // update latest respawn

    // randomize if it will be defected or not again
    randDefected = Math.floor(Math.random() * defectRarity);

        if (randDefected != DEFAULT_TYPE)
            {
                GameObject.type = Math.floor(Math.random() * NUM_OF_TYPES - 1) + 1; // defected types randomized
            }
        else
            {
                GameObject.type = DEFAULT_TYPE; // first row of spritesheet = regular
            }

}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------------

function gameLoop() // game loop -------------------------------------------------------------------------------------------------------------------------------------
{
    if (bgMusicPlaying)
    {
        backgroundMusic.loop = true;
        backgroundMusic.play();
        bgMusicPlaying = true;
    }

    window.requestAnimationFrame(gameLoop);

    if (!gameOver && !openingScreen) // update as long as the game is not over
    {
        update();
        if (stabilityLevel == 0)
        {
            gameOver = true;
        }
    }

    draw(); // even when game is over, the images can stay in the bg
    
    // saving values to local storage
    localStorage.setItem("stability", stabilityLevel);
    localStorage.setItem("detected", detected);
    localStorage.setItem("incorrectlyDetected", incorrectlyDetected);
    localStorage.setItem("undetected", undetected);
}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------------

window.requestAnimationFrame(gameLoop);

// event Listeners
window.addEventListener('keydown', input);
window.addEventListener('keyup', input);
window.addEventListener('mousedown', input);
window.addEventListener('mouseup', input);
window.addEventListener('mousemove', input);

