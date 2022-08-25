type formSubmission={  
    "pomodoroBreaks":{"key":number}[],
     "selectedFont":number,
     "selectedColor":number
}
type breaksData={"minutes":string,"seconds":string,"text":string,"progressBar":number}[];

const pomodoroDashboard:HTMLDivElement=document.querySelector("#pomodoroDashboard")!;
const timeBreaks:NodeListOf<HTMLInputElement>=document.querySelectorAll("input[type='text']")!;
const fontButtons:NodeListOf<HTMLButtonElement>=document.querySelectorAll(".fonts button")!;
const colorButtons:NodeListOf<HTMLButtonElement>=document.querySelectorAll(".colors button")!;
const closeButton:HTMLButtonElement=document.querySelector(".btn-close")!;
const submitFormButton:HTMLButtonElement=document.querySelector(".applyButton")!;
const upArrows:NodeListOf<SVGElement>=document.querySelectorAll(".arrows svg:first-child")!;
const downArrows:NodeListOf<SVGElement>=document.querySelectorAll(".arrows svg:last-child")!;
const minutes:HTMLSpanElement=document.querySelector(".pomodoroTimer .minutes")!;
const seconds:HTMLSpanElement=document.querySelector(".pomodoroTimer .seconds")!;
const pomodoroController:HTMLParagraphElement=document.querySelector(".pomodoroController")!;
const settingsIcon:SVGElement=document.querySelector(".outerCircle + svg")!;
const pomodoroBreaks:NodeListOf<HTMLButtonElement>=document.querySelectorAll(".pomodoroBreaks button")!;
const pomodoroAudios:NodeListOf<HTMLAudioElement>=document.querySelectorAll("audio");
let submissionData:formSubmission={"pomodoroBreaks":[{"key":30},{"key":5},{"key":20}],"selectedFont":1,"selectedColor":1};
const circle:SVGCircleElement=document.querySelector(".progressCircle")!;
const circleStyles=getComputedStyle(circle);
const circleCircumference:number=+circleStyles.strokeDasharray.split("px")[0];
const innerCircle:HTMLDivElement=document.querySelector(".innerCircle")!;

let submissionStatus:boolean=false;
let pomodoroData:breaksData=[
    {"minutes":"30","seconds":"00","text":"Start","progressBar":circleCircumference},
    {"minutes":"5","seconds":"00","text":"Pending","progressBar":circleCircumference},
    {"minutes":"20","seconds":"00","text":"Pending","progressBar":circleCircumference}];
let singleSecondsCounter:number;
let tensSecondsCounter:number;
let minutesCounter:number;
let fillInterval:number;
let timerInterval:number;
let currentActiveIndex:number=0;
let turnIndex:number=0;
let barProgress:number=circleCircumference;
let barIncrementalVal:number;
//---------- validation ------------------
timeBreaks.forEach((ele)=>{
    ele.parentElement!.querySelector(".arrows svg:first-child")!.addEventListener("click",()=>{
        ele.value=incrementInput(ele.value);
        if(ele.value){
            ele.parentElement!.querySelector(".validation")!.classList.replace("active","idle");
        }
        compareBreaks(timeBreaks);
    })
    ele.parentElement!.querySelector(".arrows svg:last-child")!.addEventListener("click",()=>{
        ele.value=decrementInput(ele.value);
        compareBreaks(timeBreaks);
    })
    ele.addEventListener("keydown",(e)=>{
        submitFormButton.setAttribute("disabled","true");
      if(e.key==="ArrowUp"){
          if(ele.value==="" || ele.value==="0"){
              ele.parentElement!.querySelector(".validation")!.classList.replace("active","idle");
          }
        ele.value=incrementInput(ele.value);
        e.preventDefault();
        ele.setSelectionRange(ele.value.length,ele.value.length)
        ele.focus();
      }
      else if(e.key==="ArrowDown"){
          if(ele.value==="" || ele.value==="0"){
              ele.parentElement!.querySelector(".validation")!.classList.replace("active","idle");
          }
        ele.value=decrementInput(ele.value);
      }

      compareBreaks(timeBreaks);
    })
    ele.addEventListener("input",()=>{
        if(!ele.value){
            ele.parentElement!.querySelector(".validation")!.textContent="please fill this field.";
            ele.parentElement!.querySelector(".validation")!.classList.replace("idle","active");
        }
        else if(ele.value==="0"){
            ele.parentElement!.querySelector(".validation")!.textContent="value can't be zero";
            ele.parentElement!.querySelector(".validation")!.classList.replace("idle","active");
        }
        else{
            ele.parentElement!.querySelector(".validation")!.classList.replace("active","idle");
        }
        compareBreaks(timeBreaks);
      
    })
    ele.addEventListener("keyup",()=>{
        submitFormButton.removeAttribute("disabled");
        const myReg=/[0-9]/;
        const myReg2=/[1-9]/;
        if(ele.value.length>2){
            ele.value=ele.value.slice(0,2);
        }
        console.log(`keyup${ele.value.length}`)
         if(ele.value.length===1){
            console.log("ddd")
            if(!ele.value.match(myReg2)){
                if(ele.value!=="0"){ 
                    ele.value="";
                    ele.parentElement!.querySelector(".validation")!.textContent="please fill this field.";
                    ele.parentElement!.querySelector(".validation")!.classList.replace("idle","active");

                }
            }
        }
        else if(ele.value.length===2){
            console.log(`length:${ele.value.length}`)
            if(ele.value==="00"){
                ele.value="";
                ele.parentElement!.querySelector(".validation")!.textContent="please fill this field.";
                ele.parentElement!.querySelector(".validation")!.classList.replace("idle","active");
            }
            if(ele.value[1]){
                if(!ele.value[1].match(myReg)){
                   ele.value=ele.value[0];
                    if(ele.value==="0"){
                        ele.parentElement!.querySelector(".validation")!.textContent="value can't be zero";
                        ele.parentElement!.querySelector(".validation")!.classList.replace("idle","active");
                    }
                }
                else{
                    if(ele.value[0]==="0"){
                        ele.value=ele.value[1];
          
                    }
                }

            }

        }
        if(ele.value){
            if(!ele.value[0].match(myReg)){
                ele.value="";
                ele.parentElement!.querySelector(".validation")!.textContent="please fill this field.";
                ele.parentElement!.querySelector(".validation")!.classList.replace("idle","active");
            }

        }

        compareBreaks(timeBreaks);
      
    })

    
})
// ----- validation ----------
submitFormButton.addEventListener("click",()=>{
    submitForm();
    if(submissionStatus){
        hideModal();
    }
})
fontButtons.forEach((ele)=>{
    ele.addEventListener("click",()=>{
        if(ele.classList.toString().includes("idle")){
                toggleButtons(fontButtons);
                ele.classList.replace("idle","active");
        }

    })
})
colorButtons.forEach((ele)=>{
    ele.addEventListener("click",()=>{
        if(ele.classList.toString().includes("idle")){
                toggleButtons(colorButtons);
                ele.classList.replace("idle","active");
        }

    })
})
settingsIcon.addEventListener("click",()=>{
    showModal();
})
closeButton.addEventListener("click",()=>{
    hideModal();
})
pomodoroBreaks.forEach((ele:HTMLButtonElement,index:number)=>{
    ele.addEventListener("click",()=>{

        toggleButtons(pomodoroBreaks);
        ele.classList.replace("idle","active");
        currentActiveIndex=index;
        if(index===turnIndex || turnIndex===3){
            pomodoroController.classList.remove("pending");

        }
        else{
            pomodoroController.classList.add("pending");
 
        }

        // display data
        fillPomodoroData(index);

        // -----
        const cursor=getComputedStyle(pomodoroController).cursor;
        if(pomodoroController.classList.contains("pending")){
            innerCircle.classList.remove("pointer");
        }else{
            innerCircle.classList.add("pointer");
        }
    })
})
pomodoroController.addEventListener("click",(e)=>{
    // change button status start or pending or completed or restart
    e.stopPropagation();
    if(pomodoroController.textContent!.trim().toLowerCase()==="start"){

        if(turnIndex===currentActiveIndex){
        pomodoroData[turnIndex].text="Pause";
        fillPomodoroData(currentActiveIndex);
        timerInterval=setTimer(turnIndex);
         fillInterval=setInterval(()=>{
             fillPomodoroData(currentActiveIndex);
    
         },1000)
        }
        else{
         clearInterval(timerInterval);
         fillPomodoroData(currentActiveIndex);
 
        }

    }
    else if(pomodoroController.textContent!.trim().toLowerCase()==="pause"){
        pomodoroAudios[turnIndex].pause();
        pomodoroAudios[3].pause();
        if(turnIndex===currentActiveIndex){
            pomodoroData[turnIndex].text="Start";
            fillPomodoroData(turnIndex);
            clearInterval(timerInterval);  
            clearInterval(fillInterval); 
        }
    }
    else if(pomodoroController.textContent!.trim().toLowerCase()==="restart"){
  
        // call function Restart;
        pomodoroData=[
            {"minutes":submissionData.pomodoroBreaks[0].key+"","seconds":"00","text":"Start","progressBar":circleCircumference},
            {"minutes":submissionData.pomodoroBreaks[1].key+"","seconds":"00","text":"Pending","progressBar":circleCircumference},
            {"minutes":submissionData.pomodoroBreaks[2].key+"","seconds":"00","text":"Pending","progressBar":circleCircumference}];
        turnIndex=0;
        pomodoroBreaks[0].click();
    }

})
innerCircle.addEventListener("click",(e)=>{

    pomodoroController.click();

})
function incrementInput(val:string){
    let myval=+val;
    if(myval<99){
        ++myval
    }
    return myval+""
}
function decrementInput(val:string){
    let myval=+val;
    if(myval>1){
        --myval
    }
    return myval+""
}
function compareBreaks(timeBreaks:NodeListOf<HTMLInputElement>){
    const shortBreak=timeBreaks[1];
    const longBreak=timeBreaks[2];
    if(+shortBreak.value>=+longBreak.value){
    if(longBreak.value!==""){
        longBreak.parentElement!.querySelector(".validation")!.textContent="long break must be greater than short break";
    }
       longBreak.parentElement!.querySelector(".validation")!.classList.replace("idle","active");
    }
    else{
        longBreak.parentElement!.querySelector(".validation")!.classList.replace("active","idle");
    }
    return true
}
function submitForm(){
    const validaitonPopUps=document.querySelectorAll(".validation.active").length;
    if(validaitonPopUps===0){
        timeBreaks.forEach((ele,index)=>{
            submissionData.pomodoroBreaks[index].key=+ele.value;
            pomodoroData[index].minutes=ele.value;
            pomodoroData[index].seconds="00";
            pomodoroData[index].progressBar=circleCircumference;
            if(index===0){
                pomodoroData[index].text="Start";    
            }
            else{
                pomodoroData[index].text="Pending";

            }
        })
        fontButtons.forEach((ele,index)=>{
            if( ele.classList.toString().includes("active")){
                submissionData.selectedFont=index+1;
            }
        })
        colorButtons.forEach((ele,index)=>{
            if( ele.classList.toString().includes("active")){
                submissionData.selectedColor=index+1;
            }
        })
        console.log(submissionData)
        document.body.setAttribute("class",`font${submissionData.selectedFont}`);
        document.querySelector(".progressCircle")!.setAttribute("class",`progressCircle color${submissionData.selectedColor}`);
        pomodoroBreaks.forEach((ele)=>{
            let oldClass=ele.classList.toString().trim();
            const newClass=oldClass.slice(0,oldClass.length-1)+submissionData.selectedColor;
            ele.setAttribute("class",newClass);
        })
        resetAudios();
        submissionStatus=true;
        turnIndex=0;
        if(timerInterval){
            clearInterval(timerInterval);
        }
        if(fillInterval){
            clearInterval(fillInterval);
        }
        pomodoroBreaks[turnIndex].click();
        // nextTurnFunction
    }
    else{
        submissionStatus=false;
    }
  

}
function toggleButtons(collection:NodeListOf<Element>){
        collection.forEach((ele)=>{
            ele.classList.replace("active","idle");
        })
}
function hideModal(){
    pomodoroDashboard.classList.remove("show");
    pomodoroDashboard.classList.add("d-none");
}
function showModal(){
    pomodoroDashboard.classList.add("show");
    pomodoroDashboard.classList.remove("d-none");
}
function fillPomodoroData(currentActiveIndex:number){
    if(pomodoroData[currentActiveIndex].minutes.length<2){
        minutes.textContent="0"+pomodoroData[currentActiveIndex].minutes;
    }
    else{
        minutes.textContent=pomodoroData[currentActiveIndex].minutes;
    }
    seconds.textContent=pomodoroData[currentActiveIndex].seconds;
    pomodoroController.textContent=pomodoroData[currentActiveIndex].text;
    circle.style.strokeDasharray=pomodoroData[currentActiveIndex].progressBar+"px";
}

function onDecrementTimer(index:number){
    let totalMinutes:string="";
    let totalSeconds:string="";
    minutesCounter=+pomodoroData[index].minutes;
    tensSecondsCounter=+pomodoroData[index].seconds.slice(0,1);
    singleSecondsCounter=+pomodoroData[index].seconds.slice(1);
    barProgress=+pomodoroData[index].progressBar;

    if((minutesCounter===0) &&(singleSecondsCounter===0) && (tensSecondsCounter===0)){
        clearInterval(timerInterval);
    }
    else{
        if((singleSecondsCounter>=0)){
            --singleSecondsCounter;
        }
        if(singleSecondsCounter===-1){
            if(tensSecondsCounter>0){
                singleSecondsCounter=9;
                --tensSecondsCounter;
            }
            else{
                    --minutesCounter;
            
                    singleSecondsCounter=9;
                    tensSecondsCounter=5;
                  
                
            }
    
        }
        if(minutesCounter<10){
           totalMinutes="0"+minutesCounter;
        }
        else{
            totalMinutes=minutesCounter+"";
        }
        totalSeconds=tensSecondsCounter+""+singleSecondsCounter;

        barProgress=barProgress+barIncrementalVal;
        if((minutesCounter===0) &&(singleSecondsCounter===3) && (tensSecondsCounter===0)){
            pomodoroAudios[turnIndex].pause();
            pomodoroAudios[3].play();
        }
        if((minutesCounter===0) &&(singleSecondsCounter===0) && (tensSecondsCounter===0)){
            pomodoroData[index].text="finished";
            pomodoroAudios[turnIndex].load();
            pomodoroAudios[turnIndex].pause();
            ++turnIndex;
            if(turnIndex<3){
                clearInterval(timerInterval);
                clearInterval(fillInterval);
                pomodoroBreaks[turnIndex].click();
                timerInterval=setTimer(turnIndex);
                fillInterval=setInterval(()=>{
                        fillPomodoroData(currentActiveIndex);
                },1000)
            }
            else{
                pomodoroData.forEach((ele)=>{
                    ele.text="Restart";
                })
                pomodoroBreaks[0].click();
            }
        }
        else{
            pomodoroData[index].text="Pause";
        }
        pomodoroData[index].minutes=totalMinutes;
        pomodoroData[index].seconds=totalSeconds;
        pomodoroData[index].progressBar=barProgress;
    }
}
function setTimer(turnIndex:number){
    if((+pomodoroData[turnIndex].minutes===0) &&(+pomodoroData[turnIndex].seconds<=3)){
        pomodoroAudios[3].play();
    }
    else{
        pomodoroAudios[turnIndex].play();
    }
    barIncrementalVal=circleCircumference/(+submissionData.pomodoroBreaks[turnIndex].key*60);
    let timer= setInterval(()=>{
         onDecrementTimer(turnIndex);
     },1000)
     return timer
}
function resetAudios(){
    pomodoroAudios.forEach((ele)=>{
        ele.load();
        ele.pause();
    })
}