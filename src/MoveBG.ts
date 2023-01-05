function moveBG(bg: HTMLElement){
    const style = bg.style;

    let prevX = parseFloat(style.backgroundPositionX.replace('%', ''));
    let prevY = parseFloat(style.backgroundPositionY.replace('%', ''));

    if(prevX >= 100){
        prevX = prevX - 100;
    }

    if(prevY >= 100){
        prevY = prevY - 100;
    }

    style.backgroundPositionX = `${prevX + 0.02}%`;
    style.backgroundPositionY = `${prevY + 0.02}%`;
}

addEventListener("DOMContentLoaded", function(_){
    const bg = this.document.getElementById("repeating-bg");
    if(bg === null){return;}

    const style = bg.style;

    style.backgroundPositionX = "0%";
    style.backgroundPositionY = "0%";
    
    this.setInterval(() => moveBG(bg), 70);
})