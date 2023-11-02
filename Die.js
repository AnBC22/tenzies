import React from "react"

export default function Die(props) {
    const styles = {
        backgroundColor: props.isHeld ? "#59E391" : "white",
    }
    
    let dots = ''
                
    switch (props.value) {
        case 1:
            dots = "⚀";
            break;
        case 2:
            dots = "⚁";
            break;
        case 3:
            dots = "⚂";
            break;
        case 4:
            dots = "⚃";
            break;
        case 5:
            dots = "⚄";
            break;
        case 6:
            dots = "⚅";
            break;
        }
    
    return (
        <button 
            className="die-face" 
            style={styles}
            onClick={props.holdDice}
            disabled={props.disabled}
        >
            {dots}
        </button>
    )
}
