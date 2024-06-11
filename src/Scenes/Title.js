class Title extends Phaser.Scene{
    constructor(){
        super("titleScreen"); 
        this.titleText; 
    }

    preload(){

    }

    create(){
        this.nextScene = this.input.keyboard.addKey("ENTER");

        this.titleText = this.add.text(200, 300, 'Reactor Havoc!', {fontSize:'30px', fill: '#000' });  
        this.titleText.setColor('#FFFFFF');

        document.getElementById('description').innerHTML = '<h2>Game4b</h2><br>Left: A // D: Right // Space: jump // S: Ground pound // Space while slding down wall: Wall jump //'
    }

    update(){
        if (Phaser.Input.Keyboard.JustDown(this.nextScene)) {
            this.scene.start("platformerScene");
        }
    }
}