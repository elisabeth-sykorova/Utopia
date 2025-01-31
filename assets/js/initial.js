

let form = document.forms["nameForm"];
let modal = document.getElementById("modal");
let modalContent = document.getElementById("data-from-storage");
let validateButton = document.getElementsByClassName("saved-data-accept")[0];
let dismissButton = document.getElementsByClassName("saved-data-refusal")[0];

function validateForm(){ // form that collects player name

    let playerName = document.forms["nameForm"]["name"].value;

    if (playerName == "") {
        alert("Validation needed. ");
        event.preventDefault();
        return false;
    }
    else{
        localStorage.setItem("username", playerName);
    }
}


if(typeof(Storage) !== "undefined") {

    // getting the values to display
    const username = localStorage.getItem('username');
    const stabilityLevel = localStorage.getItem('stability');
    const detected = localStorage.getItem('detected');
    const incorrectlyDetected = localStorage.getItem('incorrectlyDetected');
    const undetected = localStorage.getItem('undetected');
    
    if (username){  // if the data is loaded (has been saved), display the data
        form.style.display = "none";
        modal.style.display = "block";
        modalContent.innerHTML = "Full name: " + username + "<br>" + "Stability level: "
        + Math.trunc(stabilityLevel) + "%" + "<br>" + "Detected: " + detected + "<br>" + "Incorrectly detected: " + undetected + "<br>" + "Undetected: " + undetected;
        //header.innerHTML = username;
    

        validateButton.onclick = function(){
            window.location.href = "gameplay.html"; // button that proceeds to the game
        }
        dismissButton.onclick = function(){ // button that goes back to form 
            modal.style.display = "none";
            form.style.display = "block";
            localStorage.clear(); // clear the data upon reset
        }
    }
    else{ // if no data was foun
        console.log("no data in localStorage, loading new session"); 
        modal.style.display = "none";
        form.style.display = "block";
    }
  } else {
    console.log("Local storage is not supported.");
    // if the condition isn't met, it means local storage isn't supported
  }
