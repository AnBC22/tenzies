import React from "react"
import Die from "./Die"
import {nanoid} from "nanoid"
import Confetti from "react-confetti"

export default function App() {
    const [dice, setDice] = React.useState(allNewDice())
    const [tenzies, setTenzies] = React.useState(false)
    const [numberOfRolls, setNumberOfRolls] = React.useState(0)
    const [isDisabled, setIsDisabled] = React.useState(true)
    const [startGame, setStartGame] = React.useState(false)
    //for styling only: 
    const [gameActivated, setGameActivated] = React.useState("time")
    React.useEffect(() => {
        setGameActivated(prev => startGame ? `${prev} activated` : prev)
    }, [startGame])
    //--------- To calculate the time displayed: 
    const startTime = React.useRef(new Date())
    const [currentTime, setCurrentTime] = React.useState(new Date())
    const timeOperation = new Date(currentTime - new Date(startTime.current))
    const [timeElapsed, setTimeElapsed] = React.useState(timeOperation)
    const [captureTimeElapsed, setCaptureTimeElapsed] = React.useState('')
    
    function displayTime(dateObj) { 
        const seconds = dateObj.getUTCSeconds()
        const minutes = dateObj.getUTCMinutes()
        return `${padZero(minutes)}:${padZero(seconds)}`
    }
    
    function padZero(value) { 
        return value < 10 ? `0${value}` : value
    }
    
    React.useEffect(function() { 
        const myInterval = setInterval(function() {
            setCurrentTime(new Date())
        }, 1000)
        
        if(tenzies || !startGame) {
            clearInterval(myInterval)
        }
        
        return () => {
            clearInterval(myInterval) 
        }
    }, [currentTime, startGame])
    
    React.useEffect(() => { 
        setTimeElapsed(displayTime(timeOperation))
    }, [currentTime]) 

//--------- To save the best time to local storage: 
    const [bestTime, setBestTime] = React.useState("00:00")
    
    function getTimeFromLocalStorage() {
        return JSON.parse(localStorage.getItem("bestTime"))
    }
    
    React.useEffect(() => {
        if(getTimeFromLocalStorage()) {
            setBestTime(getTimeFromLocalStorage())
        }
    }, [])
    
    function saveTimeToLocalStorage(time) {
        if(getTimeFromLocalStorage()) {
            const secondsFromLS = getTotalSeconds(getTimeFromLocalStorage().split(":"))
            const currentSeconds = getTotalSeconds(time.split(":"))
            setBestTime(getTimeFromLocalStorage())
            
            if(currentSeconds < secondsFromLS) {
                localStorage.setItem("bestTime", JSON.stringify(time))
                setBestTime(time)
            }
            
        } else {
            localStorage.setItem("bestTime", JSON.stringify(time))
            setBestTime(time)
        }
    }
    
    function getTotalSeconds(array) {
        const minutesToSeconds = Number(array[0]) * 60
        
        return minutesToSeconds + Number(array[1])
    }  
    
    //------------ game:

    function generateNewDie() {
        return {
            value: Math.ceil(Math.random() * 6),
            isHeld: false,
            id: nanoid()
        }
    }
    
    function allNewDice() {
        const newDice = []
        for (let i = 0; i < 10; i++) {
            newDice.push(generateNewDie())
        }
        return newDice
    }
    
    function buttonText() {
        if(startGame === true) {
           if(tenzies) {
               return "New Game"
           } else {
               return "Roll"
           }
        } else {
            return "Start"
        }
    }
    
    function handleStartGame() {
        setIsDisabled(false)
        startTime.current = new Date()
        setCurrentTime(new Date())
        setStartGame(prev => !prev)
    }
    
    function holdDice(id) {
        setDice(oldDice => oldDice.map(die => {
            /*
            return die.id === id ? 
                {...die, isHeld: !die.isHeld} :
                die */
            if (die.id === id) {
                return Object.assign({}, die, {isHeld: !die.isHeld});
            } else {
                return die;
            }
                }))
            }
    
    function rollDice() { 
        if(tenzies) {
            setIsDisabled(false)
            setTenzies(false)
            setDice(allNewDice())
            setCurrentTime(new Date())
            startTime.current = new Date()
            setNumberOfRolls(0)
            setCaptureTimeElapsed('')
            setBestTime(getTimeFromLocalStorage())
            
        } else {
            setNumberOfRolls(prevNumber => prevNumber + 1)
            setDice(oldDice => oldDice.map(die => {
                return die.isHeld ? 
                    die :
                    generateNewDie()
            }))
        }
    } 
    
    React.useEffect(() => {
        const allHeld = dice.every(die => die.isHeld)
        const firstValue = dice[0].value
        const allSameValue = dice.every(die => die.value === firstValue)
        if (allHeld && allSameValue) {
            setTenzies(true)
            setCaptureTimeElapsed(timeElapsed)
            setIsDisabled(true)
            saveTimeToLocalStorage(timeElapsed)
        }
    }, [dice])
    
    const diceElements = dice.map(die => (
        <Die 
            key={die.id} 
            value={die.value} 
            isHeld={die.isHeld} 
            holdDice={() => holdDice(die.id)}
            disabled={isDisabled}
        />
    ))
    
    return (
        <main>
            {tenzies && <Confetti />}
            <h1 className="title">Tenzies<span className="dark-green-text">!</span> 🎲</h1>
            <p className="instructions">When the game starts, roll until all dice are the same. 
            Click each die to freeze it at its current value between rolls. Do it in the shortest time possible.</p>
            <div className="game-stats">
                <div>
                    <h4 className="stat">Time elapsed</h4>
                    <h4 className={gameActivated}>{captureTimeElapsed.toString() || timeElapsed.toString()}</h4>
                </div>
                <div>
                    <h4 className="stat">Best time</h4>
                    <h4 className={startGame ? "time green-text activated" : 'time'}>{bestTime.toString()}</h4>
                </div>
                <div>
                    <h4 className="stat">Rolls</h4>
                    <h4 className={gameActivated}>{numberOfRolls}</h4>
                </div>
            </div>
            <div className="dice-container">
                {diceElements}
            </div>
            {startGame &&
            <button 
                className="game-btn activated" 
                onClick={rollDice}
            >
                {buttonText()}
            </button> ||
            <button 
                onClick={handleStartGame}
                className="game-btn start-btn" 
            >
                Start Game
            </button>}
        </main>
    )
}
